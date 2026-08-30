
public class BitcoinSettings
{
    public string Mnemonic { get; set; }
    public string Network { get; set; }
    public int FeeRate { get; set; }
    public int ChangeAddressIndex { get; set; }
    public bool ConsolidationEnabled { get; set; } = true;
    public int ConsolidationIntervalSeconds { get; set; } = 300;
    public int ConsolidationTriggerCount { get; set; } = 100;
    public int ConsolidationInputCount { get; set; } = 25;
    public int ConsolidationFetchCount { get; set; } = 150;
    public int ConsolidationMinInputCount { get; set; } = 20;
    public int ConsolidationMinPoolSize { get; set; } = 40;
    public long ConsolidationMaxInputValueSats { get; set; } = 200000;

    // Bitcoin Core RPC settings
    public string RpcUrl { get; set; }
    public string RpcUser { get; set; }
    public string RpcPassword { get; set; }
    public string RpcWallet { get; set; }
}
