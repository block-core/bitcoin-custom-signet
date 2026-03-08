using BitcoinFaucetApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using NBitcoin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BitcoinFaucetApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FaucetController : ControllerBase
    {
        private readonly BitcoinSettings _bitcoinSettings;
        private readonly Network _network;
        private readonly Mnemonic _mnemonic;
        private readonly ExtKey _masterKey;
        private readonly IBitcoinRpcService _rpcService;
        private static readonly HashSet<UtxoData> _utxoPool = [];
        private static readonly HashSet<UtxoData> _utxoUsed = [];
        private static readonly object _lockObject = new();
        private static readonly int _poolThreshold = 20;
        private static bool _poolIsReplenishing = false;

        public FaucetController(IOptions<BitcoinSettings> bitcoinSettings, IBitcoinRpcService rpcService)
        {
            if (bitcoinSettings == null || bitcoinSettings.Value == null)
            {
                throw new ArgumentNullException(nameof(bitcoinSettings), "Bitcoin settings are not configured.");
            }

            _bitcoinSettings = bitcoinSettings.Value;

            _network = Network.GetNetwork(_bitcoinSettings.Network.ToLower());
            if (_network == null)
            {
                throw new InvalidOperationException($"The specified network '{_bitcoinSettings.Network}' is invalid or not supported.");
            }

            if (string.IsNullOrEmpty(_bitcoinSettings.Mnemonic))
            {
                throw new ArgumentException("Mnemonic is not configured in appsettings.json.", nameof(_bitcoinSettings.Mnemonic));
            }

            try
            {
                _mnemonic = new Mnemonic(_bitcoinSettings.Mnemonic);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Failed to initialize mnemonic. Please check the provided mnemonic phrase.", ex);
            }

            try
            {
                _masterKey = _mnemonic.DeriveExtKey();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Failed to derive the master key from the mnemonic.", ex);
            }

            _rpcService = rpcService ?? throw new ArgumentNullException(nameof(rpcService), "BitcoinRpcService is not provided.");
        }

        [HttpGet("send/{address}/{amount?}")]
        public async Task<IActionResult> SendFunds(string address, decimal? amount)
        {
            return await SendFunds(new SendRequest {ToAddress = address, Amount = amount ?? 0.001m});
        }

        private async Task ReplenishUtxoPool(BitcoinAddress fromAddress)
        {
            try
            {
                if (_poolIsReplenishing == false) return; // what triggered this?
                if (_utxoPool.Count >= _poolThreshold) { return; }

                // Use Bitcoin Core RPC (listunspent) instead of electrs for UTXO fetching.
                // The faucet address has ~748k UTXOs which exceeds electrs's ability to return efficiently.
                var utxos = await _rpcService.ListUnspentAsync(fromAddress.ToString(), 50);

                lock (_lockObject)
                {
                    _utxoUsed.IntersectWith(utxos);
                    _utxoPool.UnionWith(utxos.Except(_utxoUsed));
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            finally
            {
                _poolIsReplenishing = false;
            }
        }

        private async Task<List<UtxoData>> GetPoolUtxos(int count, BitcoinAddress fromAddress)
        {
            bool needsSyncReplenish = false;

            lock (_lockObject)
            {
                if (_utxoPool.Count < count)
                {
                    // Pool doesn't have enough UTXOs — need a synchronous replenish
                    needsSyncReplenish = true;
                }
                else if (_utxoPool.Count < _poolThreshold && !_poolIsReplenishing)
                {
                    // Pool is getting low — kick off async background replenish
                    _poolIsReplenishing = true;
                    Task.Run(() => { ReplenishUtxoPool(fromAddress); });
                }
            }

            if (needsSyncReplenish)
            {
                // Wait for replenishment before continuing
                if (!_poolIsReplenishing)
                {
                    _poolIsReplenishing = true;
                    await ReplenishUtxoPool(fromAddress);
                }
                else
                {
                    // Another thread is replenishing — wait briefly for it
                    for (int i = 0; i < 50 && _poolIsReplenishing; i++)
                    {
                        await Task.Delay(100);
                    }
                }
            }

            lock (_lockObject)
            {
                var utxosToUse = _utxoPool.Take(count).ToList();
                _utxoPool.ExceptWith(utxosToUse);
                _utxoUsed.UnionWith(utxosToUse);
                return utxosToUse;
            }
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendFunds([FromBody] SendRequest request)
        {
            try
            {
                // Validate the input
                if (request.Amount <= 0)
                    return BadRequest("Amount must be greater than 0.");

                var toAddress = BitcoinAddress.Create(request.ToAddress, _network);
                var amount = Money.Coins(request.Amount);

                var keyPath = new KeyPath($"m/84'/1'/0'/0/{_bitcoinSettings.ChangeAddressIndex}");
                var privateKey = _masterKey.Derive(keyPath).PrivateKey;
                var fromAddress = privateKey.PubKey.GetAddress(ScriptPubKeyType.Segwit, _network);

                var utxos = await GetPoolUtxos(2, fromAddress);
                if (utxos == null || !utxos.Any())
                {
                    return StatusCode(503, "No UTXOs available for the address, try again later.");
                }

                var coins = utxos.Select(utxo =>
                {
                    var outPoint = new OutPoint(uint256.Parse(utxo.outpoint.transactionId), utxo.outpoint.outputIndex);
                    return new Coin(outPoint, new TxOut(Money.Satoshis(utxo.value), fromAddress.ScriptPubKey));
                }).ToList();

                var txBuilder = _network.CreateTransactionBuilder();
                var tx = txBuilder
                    .AddCoins(coins)
                    .AddKeys(privateKey)
                    .Send(toAddress, amount)
                    .SetChange(fromAddress)
                    .SendFees(Money.Satoshis(_bitcoinSettings.FeeRate))
                    .BuildTransaction(true);

                if (!txBuilder.Verify(tx))
                {
                    return StatusCode(500, "Transaction validation failed.");
                }

                string transactionHex = tx.ToHex();
                var broadcastResult = await _rpcService.SendRawTransactionAsync(transactionHex);

                if (!string.IsNullOrEmpty(broadcastResult))
                {
                    return StatusCode(500, $"Failed to broadcast transaction: {broadcastResult}");
                }

                return Ok(new { TransactionId = tx.GetHash().ToString() });
            }
            catch (FormatException ex)
            {
                return BadRequest($"Invalid input: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        [HttpGet("network/status")]
        public async Task<IActionResult> CheckNetworkStatus()
        {
            try
            {
                var info = await _rpcService.GetBlockchainInfoAsync();
                var blockTime = DateTimeOffset.FromUnixTimeSeconds(info.Time);
                var age = DateTimeOffset.UtcNow - blockTime;
                var isOnline = age.TotalMinutes <= 30;

                return Ok(new
                {
                    IsOnline = isOnline,
                    Chain = info.Chain,
                    Height = info.Height,
                    BestBlockHash = info.BestBlockHash,
                    LastBlockTime = blockTime.UtcDateTime,
                    LastBlockAgeMins = Math.Round(age.TotalMinutes, 1),
                    InitialBlockDownload = info.InitialBlockDownload
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        public class SendRequest
        {
            public string ToAddress { get; set; }
            public decimal Amount { get; set; }
        }
    }
}
