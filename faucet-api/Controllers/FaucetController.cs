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
        private readonly IIndexerService _indexerService;

        public FaucetController(IOptions<BitcoinSettings> bitcoinSettings, IIndexerService indexerService)
        {
            if (bitcoinSettings == null || bitcoinSettings.Value == null)
            {
                throw new ArgumentNullException(nameof(bitcoinSettings), "Bitcoin settings are not configured.");
            }

            _bitcoinSettings = bitcoinSettings.Value;

            if (string.IsNullOrEmpty(_bitcoinSettings.IndexerUrl))
            {
                throw new ArgumentException("IndexerUrl is not configured in appsettings.json.", nameof(_bitcoinSettings.IndexerUrl));
            }

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

            _indexerService = indexerService ?? throw new ArgumentNullException(nameof(indexerService), "IndexerService is not provided.");
        }

        [HttpGet("send/{address}/{amount?}")]
        public async Task<IActionResult> SendFunds(string address, long? amount)
        {
            return await SendFunds(new SendRequest {ToAddress = address, Amount = amount ?? 20});
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

                var utxos = await _indexerService.FetchUtxoAsync(fromAddress.ToString(), 0, 20);
                if (utxos == null || !utxos.Any())
                {
                    return BadRequest("No UTXOs available for the address.");
                }

                var coins = utxos.Select(utxo =>
                {
                    var outPoint = new OutPoint(uint256.Parse(utxo.outpoint.transactionId), utxo.outpoint.outputIndex);
                    return new Coin(outPoint, new TxOut(Money.Satoshis(utxo.value), fromAddress.ScriptPubKey));
                }).Take(2).ToList();

                var txBuilder = _network.CreateTransactionBuilder();
                var tx = txBuilder
                    .AddCoins(coins)
                    .AddKeys(privateKey)
                    .Send(toAddress, amount)
                    .Send(toAddress, amount)
                    .SetChange(fromAddress)
                    .SendFees(Money.Satoshis(_bitcoinSettings.FeeRate))
                    .BuildTransaction(true);

                if (!txBuilder.Verify(tx))
                {
                    return StatusCode(500, "Transaction validation failed.");
                }

                string transactionHex = tx.ToHex();
                var broadcastResult = await _indexerService.PublishTransactionAsync(transactionHex);

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

        [HttpGet("address/balance")]
        public async Task<IActionResult> GetAddressBalance([FromQuery] string address, [FromQuery] bool includeUnconfirmed = false)
        {
            try
            {
                var balances = await _indexerService.GetAdressBalancesAsync(new List<AddressInfo> { new AddressInfo { Address = address } }, includeUnconfirmed);
                return Ok(balances);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        [HttpGet("utxos")]
        public async Task<IActionResult> GetUnspentTransactions([FromQuery] string address, [FromQuery] int offset = 0, [FromQuery] int limit = 20)
        {
            try
            {
                var utxos = await _indexerService.FetchUtxoAsync(address, offset, limit);
                return Ok(utxos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        [HttpGet("transaction/hex/{transactionId}")]
        public async Task<IActionResult> GetTransactionHex([FromRoute] string transactionId)
        {
            try
            {
                var hex = await _indexerService.GetTransactionHexByIdAsync(transactionId);
                return Ok(new { Hex = hex });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        [HttpGet("transaction/info/{transactionId}")]
        public async Task<IActionResult> GetTransactionInfo([FromRoute] string transactionId)
        {
            try
            {
                var transactionInfo = await _indexerService.GetTransactionInfoByIdAsync(transactionId);
                return Ok(transactionInfo);
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
                var (isOnline, genesisHash) = await _indexerService.CheckIndexerNetwork();
                return Ok(new { IsOnline = isOnline, GenesisHash = genesisHash });
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
