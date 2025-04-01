#!/bin/bash

# SoundVault Pro Deployment Script
# This script helps with building and deploying the application

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   SoundVault Pro Deployment Script     ${NC}"
echo -e "${GREEN}=========================================${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating from example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env file with your actual configuration values.${NC}"
    exit 1
fi

# Function to display usage
usage() {
    echo -e "Usage: $0 [option]"
    echo -e "Options:"
    echo -e "  ${GREEN}build${NC}       - Build both backend and frontend"
    echo -e "  ${GREEN}docker${NC}      - Build and run with Docker Compose"
    echo -e "  ${GREEN}docker-build${NC} - Build Docker images without running"
    echo -e "  ${GREEN}backend${NC}     - Build and run backend only"
    echo -e "  ${GREEN}frontend${NC}    - Build and run frontend only"
    echo -e "  ${GREEN}clean${NC}       - Clean build artifacts"
    echo -e "  ${GREEN}help${NC}        - Display this help message"
    exit 1
}

# Check command line arguments
if [ $# -eq 0 ]; then
    usage
fi

# Build backend
build_backend() {
    echo -e "${GREEN}Building backend...${NC}"
    cd backend
    ./mvnw clean package -DskipTests
    cd ..
    echo -e "${GREEN}Backend build complete!${NC}"
}

# Build frontend
build_frontend() {
    echo -e "${GREEN}Building frontend...${NC}"
    cd frontend
    npm ci
    npm run build
    cd ..
    echo -e "${GREEN}Frontend build complete!${NC}"
}

# Run backend
run_backend() {
    echo -e "${GREEN}Starting backend...${NC}"
    cd backend
    ./mvnw spring-boot:run
}

# Run frontend
run_frontend() {
    echo -e "${GREEN}Starting frontend...${NC}"
    cd frontend
    npm run dev
}

# Docker Compose build and run
docker_compose_up() {
    echo -e "${GREEN}Building and starting Docker containers...${NC}"
    docker-compose up -d
    echo -e "${GREEN}Containers are running!${NC}"
    echo -e "${GREEN}Frontend: http://localhost${NC}"
    echo -e "${GREEN}Backend API: http://localhost:8080/api${NC}"
}

# Docker Compose build only
docker_compose_build() {
    echo -e "${GREEN}Building Docker images...${NC}"
    docker-compose build
    echo -e "${GREEN}Docker images built successfully!${NC}"
}

# Clean build artifacts
clean() {
    echo -e "${GREEN}Cleaning build artifacts...${NC}"
    cd backend
    ./mvnw clean
    cd ../frontend
    rm -rf node_modules dist
    cd ..
    echo -e "${GREEN}Clean complete!${NC}"
}

# Process command line arguments
case "$1" in
    build)
        build_backend
        build_frontend
        ;;
    docker)
        docker_compose_up
        ;;
    docker-build)
        docker_compose_build
        ;;
    backend)
        build_backend
        run_backend
        ;;
    frontend)
        build_frontend
        run_frontend
        ;;
    clean)
        clean
        ;;
    help|*)
        usage
        ;;
esac

exit 0
