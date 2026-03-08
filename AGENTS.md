# AGENTS.md

This file provides guidance for AI coding agents working in this repository.

## Project Overview

Custom Bitcoin Signet (testnet) infrastructure with three components:
- **Bitcoin signet node** - Dockerized bitcoind with custom miner (shell/Python scripts, root directory)
- **Faucet API** - C#/.NET 8 ASP.NET Core Web API (`faucet-api/`)
- **Faucet Frontend** - Angular 19 SPA with Tailwind CSS (`faucet/`)

The system is used by the Angor project (Blockcore) for test environment Bitcoin distribution.

## Build Commands

### Faucet API (C#/.NET 8)
```bash
dotnet restore faucet-api/faucet-api.sln
dotnet build faucet-api/faucet-api.csproj -c Release
dotnet publish faucet-api/faucet-api.csproj -c Release -r linux-x64 -o ./bin/publish
# Run locally:
dotnet run --project faucet-api/faucet-api.csproj    # Starts on http://localhost:5500
```

### Faucet Frontend (Angular 19)
```bash
cd faucet
npm install
npm start          # ng serve (dev server at localhost:4200, proxies /api)
npm run build      # Production build to dist/
npm run watch      # Dev build with watch mode
```

### Docker (Full Stack)
```bash
docker-compose build chain    # Build signet node image
docker-compose up -d          # Start all services (chain, indexer, mongo, explorer)
```

## Test Commands

### Frontend Tests (Karma + Jasmine)
```bash
cd faucet
npm test                                     # Run all tests
npx ng test --include='**/app.component.spec.ts'   # Run a single test file
```
To focus a single test within a file, use Jasmine's `fdescribe()` or `fit()` instead of `describe()`/`it()`. Remember to remove the `f` prefix before committing.

Test files are co-located with source: `*.spec.ts` next to the corresponding `*.ts` file.

### Backend Tests
There is no test project for the faucet-api. If adding tests, use xUnit with a `faucet-api.Tests/` project.

### Python / Shell Scripts
No tests exist for the miner or shell scripts.

## Lint / Format

No linters or formatters are configured project-wide. The only style config is `faucet/.editorconfig`:
- UTF-8 encoding, LF line endings, final newline, trim trailing whitespace
- 2-space indentation for TypeScript/JSON/HTML/SCSS
- Single quotes in TypeScript

Follow existing code style conventions described below.

## Code Style: C# (faucet-api)

### Naming
- **Namespaces**: `BitcoinFaucetApi.Controllers`, `BitcoinFaucetApi.Services`
- **Classes/Interfaces**: PascalCase (`FaucetController`, `IIndexerService`)
- **Public properties**: PascalCase (`IndexerUrl`, `Mnemonic`) on config/domain classes; camelCase on JSON-serialized models (`address`, `value`, `outpoint`)
- **Private fields**: `_camelCase` with underscore prefix (`_bitcoinSettings`, `_network`)
- **Methods**: PascalCase (`SendBitcoinAsync`, `GetUtxosAsync`)
- **Local variables/parameters**: camelCase

### Imports
- `ImplicitUsings` is enabled; most model files omit `using` statements
- Order: System namespaces, then Microsoft, then third-party (NBitcoin), then project namespaces

### Patterns
- Dependency injection via constructor with `IOptions<T>` for configuration
- Interface-based services (`IIndexerService` / `IndexerService`)
- Controllers return `IActionResult` (`Ok()`, `BadRequest()`, `StatusCode(500, ...)`)
- `HttpClient` registered via `AddHttpClient<TInterface, TImpl>()` in `Program.cs`
- Swagger/OpenAPI enabled with `[SwaggerOperation]` annotations on endpoints
- CORS policy: `AllowAnyOrigin`, `AllowAnyMethod`, `AllowAnyHeader`

### Error Handling
- Constructor validation: throw `ArgumentNullException`, `ArgumentException`, `InvalidOperationException`
- Controller actions: wrap in try/catch, return appropriate HTTP status codes
- Services: throw `InvalidOperationException` on HTTP failures
- Use `_logger.LogError()` and `_logger.LogWarning()` with string interpolation

### Thread Safety
- Static `HashSet<UtxoData>` pool with `lock(_lockObject)` for concurrent access
- Background pool replenishment via `Task.Run()`

## Code Style: TypeScript/Angular (faucet)

### Naming
- **Files**: kebab-case (`api.service.ts`, `claim.component.ts`, `app.config.ts`)
- **Classes**: PascalCase (`ApiService`, `ClaimComponent`)
- **Variables/Properties**: camelCase (`baseUrl`, `isSubmitting`)
- **Interfaces**: PascalCase (`ClaimResponse`)
- **Component prefix**: `app` (per angular.json)

### Component Patterns
- All components use `standalone: true`
- Inline templates (`template: \`...\``) - no external HTML files
- Tailwind CSS utility classes for styling (no external style files)
- Angular Signals API (`signal()`, `computed()`) for reactive state
- SCSS as style preprocessor

### Service Patterns
- `ApiService` is a generic HTTP wrapper with `get<T>`, `post<T>`, `put<T>`, `delete<T>`
- Error handling via RxJS `catchError` operator
- All services use `providedIn: 'root'`

### TypeScript Config
- Strict mode enabled (`strict: true`)
- `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noImplicitOverride`
- Target: ES2022, module resolution: bundler
- `experimentalDecorators: true`

## Code Style: Python (miner)

- Functions: `snake_case` (`do_generate`, `next_block_delta`, `finish_block`)
- Classes: PascalCase (`PSBTMap`, `PSBT`)
- Constants: `UPPER_CASE` (`SIGNET_HEADER`, `PSBT_SIGNET_BLOCK`)
- No type hints used
- Logging via `logging.basicConfig()` with `%(asctime)s %(levelname)s %(message)s`
- CLI parsing with `argparse`
- Python 3 (no Python 2 compatibility needed)

## Code Style: Shell Scripts

- Shebang: `#!/bin/bash`
- Use `set -eo pipefail` in entrypoint scripts
- Environment variable defaults: `${VAR:-default}` pattern
- Variable names: UPPER_CASE (`BITCOIN_DIR`, `PRIVKEY`, `SIGNETCHALLENGE`)
- Bitcoin CLI calls via `bitcoin-cli -signet` or `bitcoin-cli -conf=...`

## CI/CD

### Build Workflow (`.github/workflows/build.yml`)
- Triggers on push to `main` or manual dispatch
- Matrix: windows, ubuntu, macos with Node 18 and .NET 8
- Builds and publishes faucet-api for each platform
- Creates draft GitHub release with artifacts

### Release Workflow (`.github/workflows/release.yml`)
- Triggers on GitHub release publish/prerelease
- Builds Docker image from `faucet-api/Dockerfile.Release`
- Pushes to Docker Hub as `blockcore/faucet-api:{version}` and `:latest`

## Version Management

Version is maintained in two files (keep in sync):
- `package.json` (root) - `version` field
- `faucet-api/Directory.Build.props` - `<Version>` element

## Key Architecture Notes

- API key derivation path: `m/84'/1'/0'/0/{ChangeAddressIndex}` (BIP84 SegWit testnet)
- Frontend proxies `/api` to `https://faucettmp.angor.io` in dev mode
- Frontend environment config: `faucet/src/environment.ts`
- API config: `faucet-api/appsettings.json` (network, indexer URL, fee rate, mnemonic)
- Docker secrets (mnemonics, private keys) in docker-compose are intentional for testnet
- The miner uses a custom Bitcoin Core build from `benthecarman/bitcoin` with 30-second block times
