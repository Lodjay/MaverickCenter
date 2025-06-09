# Maverick Center

This repository contains a basic micro‑service oriented project for a High Fantasy RPG site.

## Structure

- `api/character-service` – Node.js API exposing CRUD and search operations for characters. Uses a small JSON file as a database.
- `api/dotnet-character-service` – same API implemented with ASP.NET Core.
- `client` – placeholder for a future front‑end.

## Requirements

- Node.js runtime for the original service under `api/character-service` (no external modules).
- .NET 6 SDK or later for `api/dotnet-character-service`.

## Running the character service

```bash
cd api/character-service
npm start
```

The service will start on port 3000 by default.

### Running tests

```bash
cd api/character-service
npm test
```

This runs a small suite of unit tests using only Node's built-in modules.

## Running the .NET character service

```bash
cd api/dotnet-character-service
dotnet run
```

The service listens on port 5000 by default.

