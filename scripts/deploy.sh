#!/bin/bash

set -e

ENVIRONMENT=${1:-development}
IMAGE_NAME="ai-test-api"
IMAGE_TAG=""

case "$ENVIRONMENT" in
  development|dev)
    ENV="dev"
    PORT=3000
    CONTAINER_NAME="${IMAGE_NAME}-dev"
    ENV_FILE="/opt/ai-test-dev/.env"
    ;;
  uat)
    ENV="uat"
    PORT=3001
    CONTAINER_NAME="${IMAGE_NAME}-uat"
    ENV_FILE="/opt/ai-test-uat/.env"
    ;;
  production|prod)
    ENV="prod"
    PORT=3010
    CONTAINER_NAME="${IMAGE_NAME}-prod"
    ENV_FILE="/opt/ai-test/.env"
    ;;
  *)
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "Usage: $0 [development|uat|production]"
    exit 1
    ;;
esac

if [ -f "image.tar.gz" ]; then
  echo "📦 Loading Docker image..."
  docker load < image.tar.gz
  
  IMAGE_TAG=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep "^${IMAGE_NAME}:" | head -1)
  
  if [ -z "$IMAGE_TAG" ]; then
    echo "❌ Failed to load image"
    exit 1
  fi
  
  echo "🛑 Stopping existing container..."
  docker stop $CONTAINER_NAME 2>/dev/null || true
  docker rm $CONTAINER_NAME 2>/dev/null || true
  
  echo "🚀 Starting new container..."
  docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p $PORT:3000 \
    -e NODE_ENV=$ENVIRONMENT \
    -e PORT=3000 \
    --env-file $ENV_FILE \
    $IMAGE_TAG
  
  echo "🧹 Cleaning up..."
  docker image prune -f
  rm -f image.tar.gz
  
  echo "⏳ Waiting for container to be ready..."
  sleep 5
  
  echo "🏥 Health check..."
  if curl -f http://localhost:$PORT/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
    echo "🌐 Service available at http://localhost:$PORT"
  else
    echo "❌ Health check failed!"
    docker logs $CONTAINER_NAME
    exit 1
  fi
else
  echo "❌ image.tar.gz not found"
  exit 1
fi

