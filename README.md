# Bitcoin Custom Signet

A custom Bitcoin [Signet](https://en.bitcoin.it/wiki/Signet) built for the [Angor](https://angor.io) project. It provides a private, controlled test network with 30-second block times and includes a faucet for distributing test coins.

## Architecture

The system has three components:

- **Bitcoin Signet Node** -- Dockerized `bitcoind` with a custom block-signing challenge and an integrated miner that produces blocks every 30 seconds.
- **Faucet API** -- C#/.NET 8 ASP.NET Core Web API that talks directly to Bitcoin Core via JSON-RPC to send test coins.
- **Faucet Frontend** -- Angular 19 SPA with Tailwind CSS that provides a web interface for requesting coins.

## Network Details

| Parameter | Value |
|---|---|
| Signet challenge | `512102a3f8184701a033e5f8faa295647374b0bbc868082240d6e7ad8e9ecb0d86e6d451ae` |
| Genesis hash | `00000008819873e925422c1ff0f99f7cc9bbb232af63a077a480a3633bee1ef6` |
| Block interval | ~30 seconds |
| RPC port | 38332 |
| P2P port | 38333 |
| Known peer | `15.235.3.238:38333` |

## Running the Signet Node

```bash
docker-compose up -d
```

This builds and starts the Bitcoin Core signet node with the custom challenge, miner, and peer configuration. Chain data is persisted in the `btc-data` Docker volume.

To enable mining on the node, set `MINERENABLED=1`:

```bash
MINERENABLED=1 docker-compose up -d
```

## Faucet

The faucet allows anyone to request test BTC on the Angor signet. It is fully self-bootstrapping -- on first startup it automatically creates the Bitcoin Core wallet, imports the faucet address, and rescans the blockchain. No operator intervention is required.

### Faucet API

The API communicates directly with Bitcoin Core via JSON-RPC (no external indexer needed).

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/send/{address}/{amount?}` | Send test BTC to an address (default 0.001 BTC) |
| `POST` | `/api/send` | Send test BTC via JSON body (`{ "address": "...", "amount": 0.01 }`) |
| `GET` | `/api/network/status` | Network health: chain height, last block time, sync status |

**Running the Faucet API:**

```bash
docker-compose -f faucet-api/docker-compose.yml up -d
```

The API starts on port 5500. It requires the signet node to be running and accessible on the `btcnetwork` Docker network.

For local development without Docker:

```bash
dotnet run --project faucet-api/faucet-api.csproj
```

### Faucet Frontend

```bash
cd faucet
npm install
npm start
```

The dev server starts at `http://localhost:4200` and proxies `/api` requests to the faucet API.

## Configuration

The faucet API is configured via environment variables or `faucet-api/appsettings.json`:

| Variable | Default | Description |
|---|---|---|
| `Bitcoin__Mnemonic` | *(required)* | BIP39 mnemonic for the faucet wallet |
| `Bitcoin__Network` | `TestNet` | Bitcoin network (TestNet for signet) |
| `Bitcoin__FeeRate` | `10001` | Fee rate in satoshis per kilobyte |
| `Bitcoin__ChangeAddressIndex` | `0` | BIP84 derivation index (`m/84'/1'/0'/0/{index}`) |
| `Bitcoin__RpcUrl` | `http://localhost:38332` | Bitcoin Core RPC endpoint |
| `Bitcoin__RpcUser` | `rpcuser` | RPC username |
| `Bitcoin__RpcPassword` | `rpcpassword` | RPC password |
| `Bitcoin__RpcWallet` | `custom_signet` | Bitcoin Core wallet name |
