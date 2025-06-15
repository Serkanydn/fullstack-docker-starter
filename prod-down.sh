#!/bin/bash

set -e

echo "Starting backend..."
docker-compose -f ./backend/docker-compose.yml down

echo "Starting frontend..."
docker-compose -f ./frontend/docker-compose.yml down

echo "Starting reverse proxy..."
docker-compose -f ./nginx/docker-compose.yml down

echo "All services are down!"
