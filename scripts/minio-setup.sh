#!/bin/sh

# MinIO Setup Script
# This script initializes MinIO bucket and sets public policy

echo "Starting MinIO bucket setup..."

# Wait for MinIO to be ready
until mc alias set myminio http://minio:9000 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY; do
  echo "Waiting for MinIO to be ready..."
  sleep 5
done

echo "MinIO is ready. Creating bucket..."

# Create bucket (ignore if exists)
mc mb myminio/$BUCKET_NAME --ignore-existing

# Set public read policy
mc anonymous set public myminio/$BUCKET_NAME

echo "Bucket $BUCKET_NAME created and set to public read access"
echo "MinIO setup completed successfully!"