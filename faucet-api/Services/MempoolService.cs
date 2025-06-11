
using System.Text.Json;
using Microsoft.Extensions.Options;
using NBitcoin;
using NBitcoin.DataEncoders;

namespace BitcoinFaucetApi.Services
{
    public class MempoolService : IIndexerService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<MempoolService> _logger;
        private readonly string _indexerUrl;
        private string MempoolApiRoute = "/api";
        public MempoolService(HttpClient httpClient, ILogger<MempoolService> logger, IOptions<BitcoinSettings> bitcoinSettings)
        {
            _httpClient = httpClient;
            _logger = logger;
            if (string.IsNullOrEmpty(bitcoinSettings.Value.IndexerUrl))
            {
                throw new ArgumentException("IndexerUrl is not configured in appsettings.json.");
            }
            _indexerUrl = bitcoinSettings.Value.IndexerUrl.TrimEnd('/');
        }
        public async Task<(bool IsOnline, string? GenesisHash)> CheckIndexerNetwork()
        {
            try
            {
                var url = $"{_indexerUrl}{MempoolApiRoute}/block-height/0";

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

        public async Task<List<UtxoData>?> FetchUtxoAsync(string address, int offset, int limit)
        {
            var txsUrl = $"{_indexerUrl}{MempoolApiRoute}/address/{address}/txs";

            var response = await _httpClient.GetAsync(txsUrl);

            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException(response.ReasonPhrase);

            var trx = await response.Content.ReadFromJsonAsync<List<MempoolTransaction>>(new JsonSerializerOptions()
            { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower });

            var utxoDataList = new List<UtxoData>();

            foreach (var mempoolTransaction in trx)
            {
                if (mempoolTransaction.Vout.All(v => v.ScriptpubkeyAddress != address))
                {
                    // this trx has no outputs with the requested address.
                    continue;
                }

                var outspendsUrl = $"{MempoolApiRoute}/tx/" + mempoolTransaction.Txid + "/outspends";

                var resultsOutputs = await _httpClient.GetAsync(_indexerUrl + outspendsUrl);

                var spentOutputsStatus = await resultsOutputs.Content.ReadFromJsonAsync<List<Outspent>>(new JsonSerializerOptions()
                { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower });

                for (int index = 0; index < mempoolTransaction.Vout.Count; index++)
                {
                    var vout = mempoolTransaction.Vout[index];

                    if (vout.ScriptpubkeyAddress == address)
                    {
                        if (mempoolTransaction.Status.Confirmed && spentOutputsStatus![index].Spent)
                        {
                            continue;
                        }

                        var data = new UtxoData
                        {
                            address = vout.ScriptpubkeyAddress,
                            scriptHex = vout.Scriptpubkey,
                            outpoint = new Outpoint(mempoolTransaction.Txid, index),
                            value = vout.Value,
                        };

                        if (mempoolTransaction.Status.Confirmed)
                        {
                            data.blockIndex = mempoolTransaction.Status.BlockHeight;
                        }

                        if (spentOutputsStatus![index].Spent)
                        {
                            data.PendingSpent = true;
                        }

                        utxoDataList.Add(data);
                    }
                }
            }

            return utxoDataList;
        }

        public async Task<AddressBalance[]> GetAdressBalancesAsync(List<AddressInfo> data, bool includeUnconfirmed = false)
        {
            var urlBalance = $"{MempoolApiRoute}/address/";

            var tasks = data.Select(x =>
            {
                return _httpClient.GetAsync(_indexerUrl + urlBalance + x.Address);
            });

            var results = await Task.WhenAll(tasks);

            var response = new List<AddressBalance>();

            foreach (var apiResponse in results)
            {
                if (!apiResponse.IsSuccessStatusCode)
                    throw new InvalidOperationException(apiResponse.ReasonPhrase);

                var addressResponse = await apiResponse.Content.ReadFromJsonAsync<AddressResponse>(new JsonSerializerOptions()
                { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower });

                if (addressResponse != null && (addressResponse.ChainStats.TxCount > 0 || addressResponse.MempoolStats.TxCount > 0))
                {
                    response.Add(new AddressBalance
                    {
                        address = addressResponse.Address,
                        balance = addressResponse.ChainStats.FundedTxoSum - addressResponse.ChainStats.SpentTxoSum,
                        pendingReceived = addressResponse.MempoolStats.FundedTxoSum - addressResponse.MempoolStats.SpentTxoSum
                    });
                }
            }

            return response.ToArray();
        }

        public async Task<FeeEstimations?> GetFeeEstimationAsync(int[] confirmations)
        {
            var url = $"{MempoolApiRoute}/fees/recommended";

            var response = await _httpClient.GetAsync(_indexerUrl + url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"Error code {response.StatusCode}, {response.ReasonPhrase}");
                return null;
            }

            var feeEstimations = await response.Content.ReadFromJsonAsync<RecommendedFees>(new JsonSerializerOptions()
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            return new FeeEstimations
            {
                Fees = new List<FeeEstimation>
            {
                new() { FeeRate = feeEstimations.FastestFee * 1100, Confirmations = 1 }, //TODO this is an estimation
                new() { FeeRate = feeEstimations.HalfHourFee * 1100, Confirmations = 3 },
                new() { FeeRate = feeEstimations.HourFee * 1100, Confirmations = 6 },
                new() { FeeRate = feeEstimations.EconomyFee * 1100, Confirmations = 18 }, //TODO this is an estimation
            }
            };
        }

        public async Task<string> GetTransactionHexByIdAsync(string transactionId)
        {
            var url = $"{MempoolApiRoute}/tx/{transactionId}/hex";

            var response = await _httpClient.GetAsync(_indexerUrl + url);

            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException(response.ReasonPhrase);

            return await response.Content.ReadAsStringAsync();
        }

        public async Task<QueryTransaction?> GetTransactionInfoByIdAsync(string transactionId)
        {
            var url = $"{MempoolApiRoute}/tx/{transactionId}";

            var response = await _httpClient.GetAsync(_indexerUrl + url);

            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException(response.ReasonPhrase);

            var options = new JsonSerializerOptions()
            {
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
            };

            var trx = await response.Content.ReadFromJsonAsync<MempoolTransaction>(options);

            var urlSpent = $"{MempoolApiRoute}/tx/{transactionId}/outspends";

            var responseSpent = await _httpClient.GetAsync(_indexerUrl + urlSpent);

            if (!responseSpent.IsSuccessStatusCode)
                throw new InvalidOperationException(responseSpent.ReasonPhrase);

            var spends = await responseSpent.Content.ReadFromJsonAsync<List<Outspent>>(options);

            await PopulateSpentMissingData(spends, trx);

            return MapToQueryTransaction(trx, spends);
        }
        private QueryTransaction MapToQueryTransaction(MempoolTransaction x, List<Outspent>? spends = null)
        {
            return new QueryTransaction
            {
                BlockHash = x.Status.BlockHash,
                BlockIndex = x.Status.BlockHeight,
                Size = x.Size,
                // Confirmations = null,
                Fee = x.Fee,
                // HasWitness = null,
                Inputs = x.Vin.Select((vin, i) => new QueryTransactionInput
                {
                    // CoinBase = null,
                    InputAddress = vin.Prevout.ScriptpubkeyAddress,
                    InputAmount = vin.Prevout.Value,
                    InputIndex = vin.Vout,
                    InputTransactionId = vin.Txid,
                    WitScript = new WitScript(vin.Witness.Select(s => Encoders.Hex.DecodeData(s)).ToArray()).ToScript()
                        .ToHex(),
                    SequenceLock = vin.Sequence.ToString(),
                    ScriptSig = vin.Scriptsig,
                    ScriptSigAsm = vin.Asm
                }).ToList(),
                LockTime = x.Locktime.ToString(),
                Outputs = x.Vout.Select((vout, i) =>
                    new QueryTransactionOutput
                    {
                        Address = vout.ScriptpubkeyAddress,
                        Balance = vout.Value,
                        Index = i,
                        ScriptPubKey = vout.Scriptpubkey,
                        OutputType = vout.ScriptpubkeyType,
                        ScriptPubKeyAsm = vout.ScriptpubkeyAsm,
                        SpentInTransaction = spends?.ElementAtOrDefault(i)?.Txid ?? string.Empty
                    }).ToList(),
                Timestamp = x.Status.BlockTime,
                TransactionId = x.Txid,
                TransactionIndex = null,
                Version = (uint)x.Version,
                VirtualSize = x.Size,
                Weight = x.Weight
            };
        }
        private async Task PopulateSpentMissingData(List<Outspent> outspents, MempoolTransaction mempoolTransaction)
        {
            for (int index = 0; index < outspents.Count; index++)
            {
                var outspent = outspents[index];

                if (outspent.Spent && outspent.Txid == null)
                {
                    var output = mempoolTransaction.Vout[index];
                    if (output != null && !string.IsNullOrEmpty(output.ScriptpubkeyAddress))
                    {
                        var txsUrl = $"{MempoolApiRoute}/address/{output.ScriptpubkeyAddress}/txs";

                        var response = await _httpClient.GetAsync(_indexerUrl + txsUrl);

                        if (!response.IsSuccessStatusCode)
                            throw new InvalidOperationException(response.ReasonPhrase);

                        var trx = await response.Content.ReadFromJsonAsync<List<MempoolTransaction>>(new JsonSerializerOptions()
                        { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower });

                        bool found = false;
                        foreach (var transaction in trx)
                        {
                            var vinIndex = 0;
                            foreach (var vin in transaction.Vin)
                            {
                                if (vin.Txid == mempoolTransaction.Txid && vin.Vout == index)
                                {
                                    outspent.Txid = transaction.Txid;
                                    outspent.Vin = vinIndex;

                                    found = true;
                                    break;
                                }

                                vinIndex++;
                            }

                            if (found) break;
                        }
                    }
                }
            }
        }

        public async Task<string> PublishTransactionAsync(string trxHex)
        {
            var response = await _httpClient.PostAsync($"{_indexerUrl}{MempoolApiRoute}/tx", new StringContent(trxHex));

            if (response.IsSuccessStatusCode)
            {
                var txId = await response.Content.ReadAsStringAsync(); //The txId
                _logger.LogInformation("trx " + txId + "posted ");
                return string.Empty;
            }

            var content = await response.Content.ReadAsStringAsync();

            return response.ReasonPhrase + content;
        }

        public bool ValidateGenesisBlockHash(string fetchedHash, string expectedHash)
        {
            return fetchedHash.StartsWith(expectedHash, StringComparison.OrdinalIgnoreCase) || string.IsNullOrEmpty(fetchedHash);
        }
    }
}