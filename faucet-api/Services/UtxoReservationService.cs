namespace BitcoinFaucetApi.Services
{
    public interface IUtxoReservationService
    {
        bool TryReserve(IEnumerable<Outpoint> outpoints);
        void Release(IEnumerable<Outpoint> outpoints);
        bool IsReserved(Outpoint outpoint);
        IEnumerable<UtxoData> FilterAvailable(IEnumerable<UtxoData> utxos);
    }

    public class UtxoReservationService : IUtxoReservationService
    {
        private readonly HashSet<Outpoint> _reservedOutpoints = [];
        private readonly object _lockObject = new();

        public bool TryReserve(IEnumerable<Outpoint> outpoints)
        {
            var outpointList = outpoints.Where(outpoint => outpoint != null).ToList();

            lock (_lockObject)
            {
                if (outpointList.Any(outpoint => _reservedOutpoints.Contains(outpoint)))
                {
                    return false;
                }

                foreach (var outpoint in outpointList)
                {
                    _reservedOutpoints.Add(outpoint);
                }

                return true;
            }
        }

        public void Release(IEnumerable<Outpoint> outpoints)
        {
            lock (_lockObject)
            {
                foreach (var outpoint in outpoints)
                {
                    _reservedOutpoints.Remove(outpoint);
                }
            }
        }

        public bool IsReserved(Outpoint outpoint)
        {
            lock (_lockObject)
            {
                return _reservedOutpoints.Contains(outpoint);
            }
        }

        public IEnumerable<UtxoData> FilterAvailable(IEnumerable<UtxoData> utxos)
        {
            lock (_lockObject)
            {
                return utxos.Where(utxo => utxo.outpoint != null && !_reservedOutpoints.Contains(utxo.outpoint)).ToList();
            }
        }
    }
}
