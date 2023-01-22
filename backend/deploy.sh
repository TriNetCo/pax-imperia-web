#!/usr/bin/env bash

echo "deploying backend to google cloud"
IMAGE="gcr.io/${PROJECT_ID}/backend"

# Login
gcloud auth activate-service-account --key-file=../secrets/terraform_sa_key.json --project=${PROJECT_ID}

# Docker Build and Push
gcloud builds submit --tag ${IMAGE}

# Image Cleanup
gcloud container images list-tags ${IMAGE} --filter='-tags:*' --format='get(digest)' --limit=unlimited |\
  xargs -I {arg} gcloud container images delete  "${IMAGE}@{arg}" --quiet

# Deploy to Google Cloud Run
gcloud run deploy pax-backend-dev --image=$IMAGE --platform managed --region=us-central1 --allow-unauthenticated

