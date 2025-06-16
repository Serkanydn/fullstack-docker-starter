#!/bin/bash

set -e

NETWORK_NAME="dreamchat-network"

# Common Network
if ! docker network inspect $NETWORK_NAME >/dev/null 2>&1; then
    echo "Creating shared network: $NETWORK_NAME"
    docker network create $NETWORK_NAME
fi

echo "Starting backend..."
docker-compose -f ./backend/docker-compose.yml up --build -d

echo "Starting frontend..."
docker-compose -f ./frontend/docker-compose.yml up --build -d

echo "Starting admin..."
docker-compose -f ./admin/docker-compose.yml up --build -d

echo "Starting reverse proxy..."
docker-compose -f ./nginx/docker-compose.yml up --build -d

echo "All services are up!"
