gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=_VITE_PAX_ENV=dev,_SOCKET_URL=ws://localhost:3001,_BACKEND_URL=http://localhost:3001 .
