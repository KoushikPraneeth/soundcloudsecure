# SoundVault Pro

SoundVault Pro is a secure music streaming platform built with Spring Boot and React. It features Supabase integration for authentication and storage, along with Genius API integration for lyrics.

## Features

- User authentication via Supabase
- Music streaming with playlist management
- Lyrics display using Genius API integration
- Secure file uploads and downloads
- Responsive design for desktop and mobile

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.x
- Spring Security
- Supabase (Authentication and Storage)
- Maven

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase Client

## Prerequisites

- Java 17+
- Node.js 18+
- Maven 3.8+
- Docker and Docker Compose (for containerized deployment)

## Local Development Setup

### Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your API keys and configuration values in the `.env` file

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build the application:
   ```bash
   ./mvnw clean install
   ```

3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

The backend API will be available at http://localhost:8080/api

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend application will be available at http://localhost:5173

## Docker Deployment

### Using Docker Compose

1. Make sure Docker and Docker Compose are installed on your system

2. Create a `.env` file with your Supabase and API credentials:
   ```bash
   ./setup-env.sh
   ```

3. Build and start all services:
   ```bash
   docker-compose up -d
   ```

4. To stop all services:
   ```bash
   docker-compose down
   ```

### Individual Container Deployment

#### Backend

```bash
cd backend
docker build -t soundvault-api .
docker run -p 8080:8080 --env-file ../.env soundvault-api
```

#### Frontend

```bash
cd frontend
docker build -t soundvault-frontend .
docker run -p 80:80 -e API_URL=http://your-backend-url soundvault-frontend
```

## Cloud Deployment Options

### Heroku

1. Create a Heroku account and install the Heroku CLI
2. Create a new Heroku app:
   ```bash
   heroku create soundvault-api
   ```
3. Set environment variables:
   ```bash
   heroku config:set SPRING_PROFILES_ACTIVE=prod
   heroku config:set SUPABASE_URL=your-supabase-url
   heroku config:set SUPABASE_KEY=your-supabase-key
   heroku config:set LYRICS_API_KEY=your-key
   heroku config:set GENIUS_ACCESS_TOKEN=your-token
   # Add other environment variables as needed
   ```
4. Deploy the application:
   ```bash
   git push heroku main
   ```

### AWS Elastic Beanstalk

1. Create an Elastic Beanstalk environment for Java
2. Configure environment variables in the Elastic Beanstalk console
3. Deploy the application using the AWS CLI or Elastic Beanstalk CLI

## API Documentation

API documentation is available at http://localhost:8080/api/swagger-ui.html when running locally.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
