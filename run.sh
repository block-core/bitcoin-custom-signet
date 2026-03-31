#!/bin/bash

set -eo pipefail

bitcoind_pid=""
miner_pid=""

shutdown_gracefully() {
    if [[ -n "$miner_pid" ]]; then
        kill "$miner_pid" || true
    fi

    bitcoin-cli stop || true

    if [[ -n "$bitcoind_pid" ]]; then
        wait "$bitcoind_pid" || true
    fi
}

trap shutdown_gracefully SIGTERM SIGHUP SIGQUIT SIGINT

# run bitcoind in the foreground so the container exits if it does
bitcoind -daemon=0 -printtoconsole &
bitcoind_pid=$!

echo "get magic"
while [[ ! -f /root/.bitcoin/signet/debug.log ]]; do
    sleep 1
done

magic=""
while [[ -z "$magic" ]]; do
    magic=$(grep -m1 magic /root/.bitcoin/signet/debug.log || true)
    if [[ -z "$magic" ]]; then
        sleep 1
    fi
done

magic=${magic:(-8)}
echo "$magic" > /root/.bitcoin/MAGIC.txt

# if in mining mode
if [[ "$MINERENABLED" == "1" ]]; then
    mine.sh &
    miner_pid=$!
fi

wait "$bitcoind_pid"
