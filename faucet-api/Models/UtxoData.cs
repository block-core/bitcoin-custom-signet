public class UtxoData
{
    public Outpoint outpoint { get; set; }
    public string address { get; set; }
    public string scriptHex { get; set; }
    public long value { get; set; }
    public int blockIndex { get; set; }
    public bool PendingSpent { get; set; }

    public override bool Equals(object? obj)
    {
        if (obj is not UtxoData other)
            return false;

        // Compare outpoint for equality (null-safe)
        return Equals(this.outpoint, other.outpoint);
    }

    public override int GetHashCode()
    {
        // Use outpoint's hash code, handle null
        return outpoint?.GetHashCode() ?? 0;
    }
}

public class UtxoDataWithPath
{
    public UtxoData UtxoData { get; set; }
    public string HdPath { get; set; }
}