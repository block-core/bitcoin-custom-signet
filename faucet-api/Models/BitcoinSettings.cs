
public class BitcoinSettings
{
    public string Mnemonic { get; set; }
    public string Network { get; set; }
    public int FeeRate { get; set; }
    public int ChangeAddressIndex { get; set; }

    // Bitcoin Core RPC settings
    public string RpcUrl { get; set; }
    public string RpcUser { get; set; }
    public string RpcPassword { get; set; }
    public string RpcWallet { get; set; }
}
