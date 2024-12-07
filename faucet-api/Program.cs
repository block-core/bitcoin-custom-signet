using BitcoinFaucetApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<BitcoinSettings>(builder.Configuration.GetSection("Bitcoin"));
builder.Services.AddControllers();

 builder.Services.AddHttpClient<IIndexerService, IndexerService>(client =>
{
    var indexerUrl = builder.Configuration.GetSection("Bitcoin")["IndexerUrl"];
    if (string.IsNullOrEmpty(indexerUrl))
    {
        throw new ArgumentException("IndexerUrl is not configured in appsettings.json.");
    }

    client.BaseAddress = new Uri(indexerUrl);
});

 builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

 if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
