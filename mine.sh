#!/bin/bash
NBITS=${NBITS:-"1e0377ae"} #minimum difficulty in signet

# Wallet used for signet block signing and reward address lookups.
# When more than one wallet is loaded on the node (e.g. a faucet or Boltz wallet),
# bitcoin-cli wallet RPCs fail with error -19 unless -rpcwallet is specified,
# which silently stops block production.
MINEWALLET=${MINEWALLET:-"custom_signet"}
BITCOIN_CLI="bitcoin-cli -rpcwallet=${MINEWALLET}"

while true; do
    if [[ -f "${BITCOIN_DIR}/MINE_ADDRESS.txt" ]]; then
        ADDR=$(cat ~/.bitcoin/MINE_ADDRESS.txt)
    else
        ADDR=${MINETO:-$($BITCOIN_CLI getnewaddress)}
    fi
    if [[ -f "${BITCOIN_DIR}/BLOCKPRODUCTIONDELAY.txt" ]]; then
        BLOCKPRODUCTIONDELAY_OVERRIDE=$(cat ~/.bitcoin/BLOCKPRODUCTIONDELAY.txt)
        echo "Delay OVERRIDE before next block" $BLOCKPRODUCTIONDELAY_OVERRIDE "seconds."
        sleep $BLOCKPRODUCTIONDELAY_OVERRIDE
    else
        BLOCKPRODUCTIONDELAY=${BLOCKPRODUCTIONDELAY:="0"}
        if [[ BLOCKPRODUCTIONDELAY -gt 0 ]]; then
            echo "Delay before next block" $BLOCKPRODUCTIONDELAY "seconds."
            sleep $BLOCKPRODUCTIONDELAY
        fi
    fi
    echo "Mine To:" $ADDR
    miner --cli="$BITCOIN_CLI" generate --grind-cmd="bitcoin-util grind" --address=$ADDR --nbits=$NBITS --set-block-time=$(date +%s)
done
