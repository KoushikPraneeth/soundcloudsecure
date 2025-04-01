# SoundVaultPro Backend API

This is the Spring Boot backend service for the SoundVaultPro secure music player application. It integrates with Supabase for authentication and data storage.

## Technologies Used

- Java 17
- Spring Boot 3.2.3
- Spring Data JPA
- Spring Security
- Supabase (for authentication and data storage)
- H2 Database (for local development)
- Maven
- JWT for authentication

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── soundvaultpro/
│   │   │           └── api/
│   │   │               ├── config/       # Configuration classes
│   │   │               ├── controller/   # REST controllers
│   │   │               ├── dto/          # Data Transfer Objects
│   │   │               ├── model/        # JPA entities
│   │   │               ├── repository/   # JPA repositories
│   │   │               ├── service/      # Business logic
│   │   │               └── SoundVaultProApplication.java  # Main class
│   │   └── resources/
│   │       └── application.properties    # Application configuration
│   └── test/                             # Test classes
└── pom.xml                               # Maven configuration
```

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven
- PostgreSQL

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL script in `supabase-setup.sql` in the Supabase SQL Editor to set up the necessary tables
3. Update the Supabase configuration in `src/main/resources/application.properties` with your Supabase URL and API key

### Running the Application

From the project root directory, run:

```bash
mvn spring-boot:run -Dsupabase.url=YOUR_SUPABASE_URL -Dsupabase.key=YOUR_SUPABASE_KEY
```

Or set environment variables:

```bash
export SUPABASE_URL=YOUR_SUPABASE_URL
export SUPABASE_KEY=YOUR_SUPABASE_KEY
mvn spring-boot:run
```

The API will be available at `http://localhost:8080/api/`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register or update a user with Supabase credentials

### User Management

- `GET /api/users/{supabaseId}` - Get user information by Supabase ID
- `POST /api/users/{supabaseId}/keys` - Save user encryption keys

### Playlists

- `GET /api/playlists?supabaseId={supabaseId}` - Get all playlists for a user
- `POST /api/playlists?supabaseId={supabaseId}` - Create a new playlist
- `PUT /api/playlists/{playlistId}?supabaseId={supabaseId}` - Update a playlist
- `DELETE /api/playlists/{playlistId}?supabaseId={supabaseId}` - Delete a playlist

## Integration with Frontend

The backend is designed to integrate with the existing React frontend. The CORS configuration in `SecurityConfig.java` is set up to allow requests from the frontend running on `http://localhost:5173`.

To connect the frontend to the backend:

1. The frontend uses the API service in `src/utils/api.ts` to communicate with the backend
2. When a user authenticates with Supabase, their profile is also registered with the backend
3. The backend then uses Supabase to store and retrieve user data

## Security Features

- Spring Security configuration for securing endpoints
- CORS configuration for secure cross-origin requests
- Support for secure key storage for end-to-end encryption
- Integration with Supabase authentication
- Storage of encryption keys in Supabase database
