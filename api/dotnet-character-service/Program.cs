using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

string dataFile = Path.Combine(AppContext.BaseDirectory, "data", "characters.json");

List<Character> ReadData()
{
    if (!File.Exists(dataFile))
        return new List<Character>();
    var json = File.ReadAllText(dataFile);
    return JsonSerializer.Deserialize<List<Character>>(json) ?? new List<Character>();
}

void WriteData(List<Character> data)
{
    Directory.CreateDirectory(Path.GetDirectoryName(dataFile)!);
    var json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
    File.WriteAllText(dataFile, json);
}

app.MapGet("/characters", () => Results.Json(ReadData()));

app.MapGet("/characters/{id:int}", (int id) =>
{
    var characters = ReadData();
    var character = characters.FirstOrDefault(c => c.Id == id);
    return character is not null ? Results.Json(character) : Results.NotFound();
});

app.MapPost("/characters", async (HttpRequest request) =>
{
    var characters = ReadData();
    var newCharacter = await request.ReadFromJsonAsync<Character>() ?? new Character();
    newCharacter.Id = characters.Count > 0 ? characters.Max(c => c.Id) + 1 : 1;
    characters.Add(newCharacter);
    WriteData(characters);
    return Results.Created($"/characters/{newCharacter.Id}", newCharacter);
});

app.MapPut("/characters/{id:int}", async (int id, HttpRequest request) =>
{
    var characters = ReadData();
    var idx = characters.FindIndex(c => c.Id == id);
    if (idx == -1) return Results.NotFound();
    var updated = await request.ReadFromJsonAsync<Character>() ?? new Character();
    updated.Id = id;
    characters[idx] = updated;
    WriteData(characters);
    return Results.Json(updated);
});

app.Run();

record Character
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Race { get; set; } = "";
    public string[] Classes { get; set; } = Array.Empty<string>();
    public string Magic { get; set; } = "";
}
