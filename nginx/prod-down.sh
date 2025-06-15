#!/bin/bash

echo "===================================="
echo "🔧 Production Deployment Başlıyor..."
echo "===================================="

# Common Network
if ! docker network inspect $NETWORK_NAME >/dev/null 2>&1; then
    echo "Creating shared network: $NETWORK_NAME"
    docker network create $NETWORK_NAME
fi

# # Docker Hub image tag
# IMAGE_NAME="serkanydn/dreamchat:proxy"

# echo "🔨 Image build ediliyor: $IMAGE_NAME"
# docker build -t $IMAGE_NAME .

# echo "📤 Docker Hub’a push ediliyor..."
# docker push $IMAGE_NAME

echo "📦 docker-compose.yml ile sistem başlatılıyor..."
docker-compose down


echo "✅ Deployment tamamlandı."
