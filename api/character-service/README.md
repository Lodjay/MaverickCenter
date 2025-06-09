# Character Service

This microservice exposes a small HTTP API for managing RPG characters.

## Endpoints

- `GET /characters` – list characters (use `?name=foo` to search by name)
- `GET /characters/:id` – get one character
- `POST /characters` – create a character (JSON body)
- `PUT /characters/:id` – update a character
- `DELETE /characters/:id` – remove a character

Data is stored in `data/characters.json` for now.

Run the service with:

```bash
npm start
```
