# Character Service (.NET)

This is a minimal ASP.NET Core Web API providing CRUD operations for RPG characters.

## Endpoints

- `GET /characters` – list characters
- `GET /characters/{id}` – get one character
- `POST /characters` – create a character (JSON body)
- `PUT /characters/{id}` – update a character

Characters are stored in `data/characters.json`.

## Running the service

Requires the .NET 6 SDK or later.

```bash
cd api/dotnet-character-service
 dotnet run
```

The service listens on port 5000 by default.
