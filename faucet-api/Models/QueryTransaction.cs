 
   public class QueryTransaction
   {
      public string Symbol { get; set; }

      public string BlockHash { get; set; }

      public long? BlockIndex { get; set; }

      public long Timestamp { get; set; }

      public string TransactionId { get; set; }

      public int? TransactionIndex { get; set; }

      public long Confirmations { get; set; }

      public bool IsCoinbase { get; set; }

      public bool IsCoinstake { get; set; }

      public string LockTime { get; set; }

      public bool RBF { get; set; }

      public uint Version { get; set; }

      public int Size { get; set; }

      public int VirtualSize { get; set; }

      public int Weight { get; set; }

      public long Fee { get; set; }

      public bool HasWitness { get; set; }

      /// <summary>
      /// Gets or sets the transaction inputs.
      /// </summary>
      public IEnumerable<QueryTransactionInput> Inputs { get; set; }

      /// <summary>
      /// Gets or sets the transaction outputs.
      /// </summary>
      public IEnumerable<QueryTransactionOutput> Outputs { get; set; }
   }
 
