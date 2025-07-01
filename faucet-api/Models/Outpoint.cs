public class Outpoint 
{
    public string transactionId { get; set; }
    public int outputIndex { get; set; }

    public Outpoint(){ } //Required for JSON serializer
    
    public Outpoint(string trxid, int index)
    {
        outputIndex = index; transactionId = trxid;
    }
    
    public override string ToString()
    {
        return $"{transactionId}-{outputIndex}";
    }

    public override bool Equals(object? obj)
    {
        if (obj is not Outpoint other)
            return false;

        return string.Equals(this.transactionId, other.transactionId, StringComparison.Ordinal) 
               && this.outputIndex == other.outputIndex;
    }

    public override int GetHashCode()
    {
        // Combine hash codes of transactionId and outputIndex
        return HashCode.Combine(transactionId, outputIndex);
    }
}