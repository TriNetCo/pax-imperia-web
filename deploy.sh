
# Login
gcloud auth login

# Check login status
gcloud auth list

# Set Project
gcloud config set project pax-imeria-clone

# Set the region

gcloud config set run/region us-central1

# Enable Billing by clicking "Create a Storage Bucket" button on the gcloud console dashboard

# Docker Build
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=_VITE_PAX_ENV=dev,_SOCKET_URL=ws://localhost:3001,_BACKEND_URL=http://localhost:3001,_IMAGE_URL=gcr.io/pax-imeria-clone/react-frontend .

# Choose yes to prompt, enable cloudbuild.googleapis.com

# List the image you just made

gcloud container images list

gcloud container images list-tags gcr.io/pax-imeria-clone/react-frontend

#

# Run the image

gcloud run deploy react-frontend-dev --image=gcr.io/pax-imeria-clone/react-frontend --platform managed --region=us-central1 --allow-unauthenticated

# Choose yes to prompt, enable run.googleapis.com

# List the Cloud Run service you just created

gcloud run services list




# Delete the service

gcloud run services delete react-frontend-dev

# Delete the container image

gcloud container images  delete gcr.io/pax-imeria-clone/react-frontend

# Delete the cloud build logs

gsutil rm gs://pax-imeria-clone_cloudbuild/source/*.tgz






# Copy frontend files via bucket method
# ref: https://cloud.google.com/storage/docs/hosting-static-website#command-line

gsutil mkdir gs://pax-imeria-clone_static_assets/
gsutil cp -r react-frontend/build/* gs://pax-imeria-clone_static_assets/

# Configure For static content sharing

gcloud storage buckets add-iam-policy-binding  gs://pax-imeria-clone_static_asset --member=allUsers --role=roles/storage.objectViewer
gcloud storage buckets update gs://pax-imeria-clone_static_asset --web-main-page-suffix=index.html --web-error-page=404.html




