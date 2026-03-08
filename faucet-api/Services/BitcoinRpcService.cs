using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BitcoinFaucetApi.Services
{
    public class BlockchainInfo
    {
        public int Height { get; set; }
        public long Time { get; set; }
        public string BestBlockHash { get; set; } = string.Empty;
        public string Chain { get; set; } = string.Empty;
        public int Headers { get; set; }
        public bool InitialBlockDownload { get; set; }
    }

    public interface IBitcoinRpcService
    {
        /// <summary>
        /// Fetches UTXOs for a given address using Bitcoin Core's listunspent RPC.
        /// Requires the address to be imported into the wallet.
        /// </summary>
        Task<List<UtxoData>> ListUnspentAsync(string address, int maxCount = 50);

        /// <summary>
        /// Broadcasts a raw transaction via Bitcoin Core's sendrawtransaction RPC.
        /// </summary>
        Task<string> SendRawTransactionAsync(string txHex);

        /// <summary>
        /// Gets the block hash at the given height via Bitcoin Core's getblockhash RPC.
        /// </summary>
        Task<string> GetBlockHashAsync(int height);

        /// <summary>
        /// Gets blockchain info including latest block height, time, and best block hash.
        /// </summary>
        Task<BlockchainInfo> GetBlockchainInfoAsync();

        /// <summary>
        /// Ensures the wallet exists, is loaded, and the faucet address is imported.
        /// Safe to call multiple times — idempotent.
        /// </summary>
        Task EnsureWalletSetupAsync(string address);
    }

    public class BitcoinRpcService : IBitcoinRpcService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<BitcoinRpcService> _logger;
        private readonly string _rpcUrl;
        private readonly string _rpcWallet;
        private int _requestId;

        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public BitcoinRpcService(HttpClient httpClient, ILogger<BitcoinRpcService> logger, IOptions<BitcoinSettings> bitcoinSettings)
        {
            _httpClient = httpClient;
            _logger = logger;

            var settings = bitcoinSettings.Value;

            if (string.IsNullOrEmpty(settings.RpcUrl))
                throw new ArgumentException("RpcUrl is not configured.", nameof(settings.RpcUrl));
            if (string.IsNullOrEmpty(settings.RpcUser))
                throw new ArgumentException("RpcUser is not configured.", nameof(settings.RpcUser));
            if (string.IsNullOrEmpty(settings.RpcPassword))
                throw new ArgumentException("RpcPassword is not configured.", nameof(settings.RpcPassword));

            _rpcUrl = settings.RpcUrl.TrimEnd('/');
            _rpcWallet = settings.RpcWallet ?? "custom_signet";

            // Set Basic auth header
            var authBytes = Encoding.ASCII.GetBytes($"{settings.RpcUser}:{settings.RpcPassword}");
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", Convert.ToBase64String(authBytes));
        }

        private string GetWalletUrl()
        {
            return $"{_rpcUrl}/wallet/{_rpcWallet}";
        }

        private async Task<JsonElement> RpcCallAsync(string method, object?[]? parameters = null, bool useWalletEndpoint = true)
        {
            var requestId = Interlocked.Increment(ref _requestId);
            var request = new
            {
                jsonrpc = "1.0",
                id = requestId,
                method = method,
                @params = parameters ?? Array.Empty<object?>()
            };

            var json = JsonSerializer.Serialize(request, _jsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var url = useWalletEndpoint ? GetWalletUrl() : _rpcUrl;
            var response = await _httpClient.PostAsync(url, content);
            var responseBody = await response.Content.ReadAsStringAsync();

            // Bitcoin Core returns HTTP 500 for RPC-level errors (e.g. wallet already loaded).
            // Parse the JSON body first to get the actual RPC error message.
            using var doc = JsonDocument.Parse(responseBody);
            var root = doc.RootElement.Clone();

            if (root.TryGetProperty("error", out var error) && error.ValueKind != JsonValueKind.Null)
            {
                var errorMessage = error.TryGetProperty("message", out var msg) ? msg.GetString() : error.GetRawText();
                throw new InvalidOperationException($"RPC error ({method}): {errorMessage}");
            }

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"RPC call {method} failed: HTTP {response.StatusCode} - {responseBody}");
                throw new InvalidOperationException($"RPC call {method} failed: {response.ReasonPhrase} - {responseBody}");
            }

            if (root.TryGetProperty("result", out var result))
            {
                return result.Clone();
            }

            throw new InvalidOperationException($"RPC response for {method} missing 'result' field.");
        }

        public async Task<List<UtxoData>> ListUnspentAsync(string address, int maxCount = 50)
        {
            _logger.LogInformation($"Fetching up to {maxCount} UTXOs for {address} via Bitcoin Core RPC");

            // listunspent minconf maxconf [addresses] include_unsafe query_options
            // query_options: { "maximumCount": N }
            var queryOptions = new Dictionary<string, object>
            {
                { "maximumCount", maxCount }
            };

            var result = await RpcCallAsync("listunspent", new object?[]
            {
                1,                          // minconf
                9999999,                    // maxconf
                new[] { address },          // addresses
                true,                       // include_unsafe
                queryOptions                // query_options
            });

            var utxos = new List<UtxoData>();

            if (result.ValueKind == JsonValueKind.Array)
            {
                foreach (var utxo in result.EnumerateArray())
                {
                    var txid = utxo.GetProperty("txid").GetString()!;
                    var vout = utxo.GetProperty("vout").GetInt32();
                    var amountBtc = utxo.GetProperty("amount").GetDecimal();
                    var valueSats = (long)(amountBtc * 100_000_000m);
                    var confirmations = utxo.GetProperty("confirmations").GetInt32();

                    utxos.Add(new UtxoData
                    {
                        address = address,
                        outpoint = new Outpoint(txid, vout),
                        value = valueSats,
                        blockIndex = confirmations > 0 ? 1 : 0, // We don't get exact block height from listunspent
                        PendingSpent = false
                    });
                }
            }

            _logger.LogInformation($"ListUnspentAsync: found {utxos.Count} UTXOs for {address}");
            return utxos;
        }

        public async Task<string> SendRawTransactionAsync(string txHex)
        {
            _logger.LogInformation("Broadcasting transaction via Bitcoin Core RPC");

            try
            {
                var result = await RpcCallAsync("sendrawtransaction", new object?[] { txHex });
                var txId = result.GetString()!;
                _logger.LogInformation($"Transaction {txId} broadcast successfully via RPC");
                return string.Empty; // Empty string means success
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError($"Failed to broadcast transaction via RPC: {ex.Message}");
                return ex.Message;
            }
        }

        public async Task<string> GetBlockHashAsync(int height)
        {
            var result = await RpcCallAsync("getblockhash", new object?[] { height });
            return result.GetString()!;
        }

        public async Task<BlockchainInfo> GetBlockchainInfoAsync()
        {
            var result = await RpcCallAsync("getblockchaininfo", useWalletEndpoint: false);
            return new BlockchainInfo
            {
                Height = result.GetProperty("blocks").GetInt32(),
                Headers = result.GetProperty("headers").GetInt32(),
                Time = result.GetProperty("time").GetInt64(),
                BestBlockHash = result.GetProperty("bestblockhash").GetString()!,
                Chain = result.GetProperty("chain").GetString()!,
                InitialBlockDownload = result.GetProperty("initialblockdownload").GetBoolean()
            };
        }

        public async Task EnsureWalletSetupAsync(string address)
        {
            // Step 1: Try to load the wallet (it may exist on disk but not be loaded)
            try
            {
                await RpcCallAsync("loadwallet", new object?[] { _rpcWallet }, useWalletEndpoint: false);
                _logger.LogInformation($"Wallet '{_rpcWallet}' loaded successfully");
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("already loaded") || ex.Message.Contains("already exists"))
            {
                _logger.LogInformation($"Wallet '{_rpcWallet}' is already loaded");
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found") || ex.Message.Contains("does not exist"))
            {
                // Wallet doesn't exist — create it as a legacy (non-descriptor) wallet
                _logger.LogInformation($"Wallet '{_rpcWallet}' not found, creating...");
                try
                {
                    // createwallet "wallet_name" disable_private_keys blank passphrase avoid_reuse descriptors
                    // We need descriptors=false for importaddress to work
                    await RpcCallAsync("createwallet", new object?[] { _rpcWallet, true, false, "", false, false }, useWalletEndpoint: false);
                    _logger.LogInformation($"Wallet '{_rpcWallet}' created successfully");
                }
                catch (Exception createEx)
                {
                    _logger.LogError($"Failed to create wallet '{_rpcWallet}': {createEx.Message}");
                    throw;
                }
            }

            // Step 2: Import the faucet address as watch-only (rescan=false for instant import)
            try
            {
                // importaddress "address" "label" rescan p2sh
                await RpcCallAsync("importaddress", new object?[] { address, "faucet", false });
                _logger.LogInformation($"Address {address} imported into wallet '{_rpcWallet}'");
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("already") || ex.Message.Contains("exists"))
            {
                _logger.LogInformation($"Address {address} is already imported in wallet '{_rpcWallet}'");
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"importaddress returned: {ex.Message} (may already be imported)");
            }

            // Step 3: Check if a rescan is needed by looking for UTXOs.
            // After a fresh import with rescan=false, historical UTXOs won't be visible.
            try
            {
                var utxos = await RpcCallAsync("listunspent", new object?[]
                {
                    1, 9999999, new[] { address }, true, new Dictionary<string, object> { { "maximumCount", 1 } }
                });

                if (utxos.ValueKind == JsonValueKind.Array && utxos.GetArrayLength() == 0)
                {
                    _logger.LogInformation("No UTXOs found for faucet address — running rescanblockchain to index historical UTXOs...");
                    var sw = System.Diagnostics.Stopwatch.StartNew();
                    var result = await RpcCallAsync("rescanblockchain");
                    sw.Stop();
                    var startHeight = result.GetProperty("start_height").GetInt32();
                    var stopHeight = result.GetProperty("stop_height").GetInt32();
                    _logger.LogInformation($"rescanblockchain completed in {sw.Elapsed.TotalSeconds:F1}s (blocks {startHeight} to {stopHeight})");
                }
                else
                {
                    _logger.LogInformation("UTXOs already available — skipping rescan");
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Rescan check failed: {ex.Message} (faucet may have no UTXOs until next block)");
            }
        }
    }
}
