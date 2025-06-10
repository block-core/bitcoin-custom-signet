using BitcoinFaucetApi.Services;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddCommandLine(args);
builder.Services.Configure<BitcoinSettings>(builder.Configuration.GetSection("Bitcoin"));

builder.Services.AddControllers();

var bitcoinSettings = new BitcoinSettings();
builder.Configuration.GetSection("Bitcoin").Bind(bitcoinSettings);
if (bitcoinSettings.Indexer == "Mempool")
{
    builder.Services.AddHttpClient<IIndexerService, MempoolService>(client =>
    {
        var indexerUrl = builder.Configuration.GetSection("Bitcoin")["IndexerUrl"];
        if (string.IsNullOrEmpty(indexerUrl))
        {
            throw new ArgumentException("IndexerUrl is not configured in appsettings.json.");
        }
        client.BaseAddress = new Uri(indexerUrl);
    });
}
else
{
    builder.Services.AddHttpClient<IIndexerService, IndexerService>(client =>
    {
        var indexerUrl = builder.Configuration.GetSection("Bitcoin")["IndexerUrl"];
        if (string.IsNullOrEmpty(indexerUrl))
        {
            throw new ArgumentException("IndexerUrl is not configured in appsettings.json.");
        }
        client.BaseAddress = new Uri(indexerUrl);
    });
}

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    string assemblyVersion = typeof(Program).Assembly.GetName().Version?.ToString() ?? "1.0.0";

    options.SwaggerDoc("api", new OpenApiInfo
    {
        Title = "Bitcoin Faucet Api",
        Version = assemblyVersion,
        Description = "Claim free Bitcoin instantly with your Testnet wallet address. Simple and secure!",
        Contact = new OpenApiContact
        {
            Name = "Bitcoin Faucet",
            Url = new Uri("https://faucet.angor.io/")
        }
    });

    options.EnableAnnotations();
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseSwagger(c =>
{
    c.RouteTemplate = "docs/{documentName}/openapi.json";
});
app.UseSwaggerUI(c =>
{
    c.RoutePrefix = "docs";
    c.SwaggerEndpoint("/docs/api/openapi.json", "Bitcoin Faucet Api");
});

app.UseCors("AllowAll");

app.MapControllers();

app.Run();
