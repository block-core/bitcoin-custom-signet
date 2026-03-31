using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using NBitcoin;

namespace BitcoinFaucetApi.Services
{
    public class UtxoConsolidationService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<UtxoConsolidationService> _logger;
        private readonly BitcoinSettings _bitcoinSettings;
        private readonly IUtxoReservationService _utxoReservationService;

        public UtxoConsolidationService(
            IServiceProvider serviceProvider,
            ILogger<UtxoConsolidationService> logger,
            IOptions<BitcoinSettings> bitcoinSettings,
            IUtxoReservationService utxoReservationService)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _bitcoinSettings = bitcoinSettings.Value;
            _utxoReservationService = utxoReservationService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_bitcoinSettings.ConsolidationEnabled)
            {
                _logger.LogInformation("Background UTXO consolidation is disabled");
                return;
            }

            var interval = TimeSpan.FromSeconds(Math.Max(30, _bitcoinSettings.ConsolidationIntervalSeconds));

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await TryConsolidateAsync(stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"Background UTXO consolidation skipped: {ex.Message}");
                }

                await Task.Delay(interval, stoppingToken);
            }
        }

        private async Task TryConsolidateAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var rpcService = scope.ServiceProvider.GetRequiredService<IBitcoinRpcService>();

            var network = Network.GetNetwork(_bitcoinSettings.Network.ToLower());
            if (network == null)
            {
                throw new InvalidOperationException($"Unsupported network '{_bitcoinSettings.Network}'");
            }

            var mnemonic = new Mnemonic(_bitcoinSettings.Mnemonic);
            var keyPath = new KeyPath($"m/84'/1'/0'/0/{_bitcoinSettings.ChangeAddressIndex}");
            var privateKey = mnemonic.DeriveExtKey().Derive(keyPath).PrivateKey;
            var faucetAddress = privateKey.PubKey.GetAddress(ScriptPubKeyType.Segwit, network);

            var blockchainInfo = await rpcService.GetBlockchainInfoAsync();
            if (blockchainInfo.InitialBlockDownload)
            {
                _logger.LogInformation("Skipping UTXO consolidation while node is in initial block download");
                return;
            }

            var smallUtxos = await rpcService.ListWalletUnspentAsync(
                _bitcoinSettings.ConsolidationFetchCount,
                _bitcoinSettings.ConsolidationMaxInputValueSats,
                minConfirmations: 1);

            var candidates = smallUtxos
                .Where(utxo => string.Equals(utxo.address, faucetAddress.ToString(), StringComparison.Ordinal))
                .Where(utxo => !string.IsNullOrEmpty(utxo.outpoint?.transactionId))
                .OrderBy(utxo => utxo.value)
                .ToList();

            if (candidates.Count < _bitcoinSettings.ConsolidationTriggerCount)
            {
                _logger.LogInformation($"Skipping UTXO consolidation, only {candidates.Count} small faucet UTXOs found");
                return;
            }

            if (candidates.Count <= _bitcoinSettings.ConsolidationMinPoolSize)
            {
                _logger.LogInformation($"Skipping UTXO consolidation to preserve faucet pool, available UTXOs: {candidates.Count}");
                return;
            }

            var inputsToUse = candidates
                .Take(Math.Min(_bitcoinSettings.ConsolidationInputCount, candidates.Count - _bitcoinSettings.ConsolidationMinPoolSize))
                .ToList();

            if (inputsToUse.Count < _bitcoinSettings.ConsolidationMinInputCount)
            {
                _logger.LogInformation($"Skipping UTXO consolidation, only {inputsToUse.Count} candidates available after pool reservation");
                return;
            }

            if (!_utxoReservationService.TryReserve(inputsToUse.Select(utxo => utxo.outpoint)))
            {
                _logger.LogInformation("Skipping UTXO consolidation because selected UTXOs are already reserved");
                return;
            }

            try
            {
                var totalInputValue = inputsToUse.Sum(utxo => utxo.value);
                var fee = Math.Max((long)_bitcoinSettings.FeeRate, 1L);
                var outputValue = totalInputValue - fee;

                if (outputValue <= 0)
                {
                    _logger.LogWarning($"Skipping UTXO consolidation because calculated output value is non-positive: {outputValue}");
                    return;
                }

                var coins = inputsToUse.Select(utxo =>
                    new Coin(
                        new OutPoint(uint256.Parse(utxo.outpoint.transactionId), utxo.outpoint.outputIndex),
                        new TxOut(Money.Satoshis(utxo.value), faucetAddress.ScriptPubKey)))
                    .ToList();

                var txBuilder = network.CreateTransactionBuilder();
                var tx = txBuilder
                    .AddCoins(coins)
                    .AddKeys(privateKey)
                    .Send(faucetAddress, Money.Satoshis(outputValue))
                    .SendFees(Money.Satoshis(fee))
                    .SetChange(faucetAddress)
                    .BuildTransaction(true);

                if (!txBuilder.Verify(tx))
                {
                    throw new InvalidOperationException("Background UTXO consolidation transaction failed validation");
                }

                var txHex = tx.ToHex();
                var broadcastResult = await rpcService.SendRawTransactionAsync(txHex);
                if (!string.IsNullOrEmpty(broadcastResult))
                {
                    throw new InvalidOperationException($"Background UTXO consolidation broadcast failed: {broadcastResult}");
                }

                _logger.LogInformation(
                    $"Broadcast background UTXO consolidation with {inputsToUse.Count} inputs totaling {totalInputValue} sats to {faucetAddress}");
            }
            finally
            {
                _utxoReservationService.Release(inputsToUse.Select(utxo => utxo.outpoint));
            }
        }
    }
}
