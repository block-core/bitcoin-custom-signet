using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BitcoinFaucetApi.Services
{
    public interface IIndexerService
    {
        Task<string> PublishTransactionAsync(string trxHex);
        Task<AddressBalance[]> GetAdressBalancesAsync(List<AddressInfo> data, bool includeUnconfirmed = false);
        Task<List<UtxoData>?> FetchUtxoAsync(string address, int offset, int limit);
        Task<FeeEstimations?> GetFeeEstimationAsync(int[] confirmations);
        Task<string> GetTransactionHexByIdAsync(string transactionId);
        Task<QueryTransaction?> GetTransactionInfoByIdAsync(string transactionId);
        Task<(bool IsOnline, string? GenesisHash)> CheckIndexerNetwork();
        bool ValidateGenesisBlockHash(string fetchedHash, string expectedHash);
    }

    public class IndexerService : IIndexerService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<IndexerService> _logger;
        private readonly string _indexerUrl;

        public IndexerService(HttpClient httpClient, ILogger<IndexerService> logger, IOptions<BitcoinSettings> bitcoinSettings)
        {
            _httpClient = httpClient;
            _logger = logger;

            // Validate and retrieve indexer URL from settings
            if (string.IsNullOrEmpty(bitcoinSettings.Value.IndexerUrl))
            {
                throw new ArgumentException("IndexerUrl is not configured in appsettings.json.");
            }
            _indexerUrl = bitcoinSettings.Value.IndexerUrl.TrimEnd('/');
        }

        public async Task<string> PublishTransactionAsync(string trxHex)
        {
            var url = $"{_indexerUrl}/api/command/send";
 
            var response = await _httpClient.PostAsync(url, new StringContent(trxHex));

            if (response.IsSuccessStatusCode)
            {
                return string.Empty;
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            _logger.LogError($"Failed to publish transaction. Response: {responseBody}");
            return $"{response.ReasonPhrase}: {responseBody}";
        }

        public async Task<AddressBalance[]> GetAdressBalancesAsync(List<AddressInfo> data, bool includeUnconfirmed = false)
        {
            var url = $"{_indexerUrl}/api/query/addresses/balance?includeUnconfirmed={includeUnconfirmed}";
            var addressList = data.Select(addr => addr.Address).ToArray();

            var response = await _httpClient.PostAsJsonAsync(url, addressList);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"Failed to fetch address balances. Reason: {response.ReasonPhrase}");
                throw new InvalidOperationException($"Error fetching balances: {response.ReasonPhrase}");
            }

            return (await response.Content.ReadFromJsonAsync<AddressBalance[]>()) ?? Array.Empty<AddressBalance>();
        }

        public async Task<List<UtxoData>?> FetchUtxoAsync(string address, int offset, int limit)
        {
            var url = $"{_indexerUrl}/api/query/address/{address}/transactions/unspent?confirmations=0&offset={offset}&limit={limit}";

            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"Failed to fetch UTXOs for {address}. Reason: {response.ReasonPhrase}");
                throw new InvalidOperationException($"Error fetching UTXOs: {response.ReasonPhrase}");
            }

            return await response.Content.ReadFromJsonAsync<List<UtxoData>>();
        }

        public async Task<FeeEstimations?> GetFeeEstimationAsync(int[] confirmations)
        {
            var queryString = string.Join("&", confirmations.Select(block => $"confirmations={block}"));
            var url = $"{_indexerUrl}/api/stats/fee?{queryString}";

            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning($"Failed to fetch fee estimation. Reason: {response.ReasonPhrase}");
                return null;
            }

            return await response.Content.ReadFromJsonAsync<FeeEstimations>();
        }

        public async Task<string> GetTransactionHexByIdAsync(string transactionId)
        {
            var url = $"{_indexerUrl}/api/query/transaction/{transactionId}/hex";

            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"Failed to fetch transaction hex for {transactionId}. Reason: {response.ReasonPhrase}");
                throw new InvalidOperationException($"Error fetching transaction hex: {response.ReasonPhrase}");
            }

            return await response.Content.ReadAsStringAsync();
        }

        public async Task<QueryTransaction?> GetTransactionInfoByIdAsync(string transactionId)
        {
            var url = $"{_indexerUrl}/api/query/transaction/{transactionId}";

            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"Failed to fetch transaction info for {transactionId}. Reason: {response.ReasonPhrase}");
                throw new InvalidOperationException($"Error fetching transaction info: {response.ReasonPhrase}");
            }

            return await response.Content.ReadFromJsonAsync<QueryTransaction>();
        }

        public async Task<(bool IsOnline, string? GenesisHash)> CheckIndexerNetwork()
        {
            try
            {
                var url = $"{_indexerUrl}/api/query/block/index/0";

                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning($"Failed to fetch genesis block from: {url}");
                    return (false, null);
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var blockData = JsonSerializer.Deserialize<JsonElement>(responseContent);

                if (blockData.TryGetProperty("blockHash", out var blockHashElement))
                {
                    return (true, blockHashElement.GetString());
                }

                _logger.LogWarning("blockHash not found in the response.");
                return (true, null);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error during indexer network check: {ex.Message}");
                return (false, null);
            }
        }

        public bool ValidateGenesisBlockHash(string fetchedHash, string expectedHash)
        {
            return fetchedHash.StartsWith(expectedHash, StringComparison.OrdinalIgnoreCase) || string.IsNullOrEmpty(fetchedHash);
        }
    }
}
