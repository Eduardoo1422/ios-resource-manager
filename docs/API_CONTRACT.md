# API Contract (Backend <-> iOS)

| Endpoint | Método | Autenticação | Request Body | Response Body | Swift File |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | Nenhuma | `{ "email", "password" }` | `{ "token" }` | `APIClient` |
| `/api/activate` | POST | Nenhuma | `{ "key", "hardwareUuid", "deviceName" }` | `{ "token", "status" }` | `LicenseService` |
| `/api/resources` | GET | Bearer Token | N/A | `[Resource]` | `ResourceService` |
| `/api/resources/:id/download` | GET | Bearer Token | N/A | Binary/File | `ResourceService` |
