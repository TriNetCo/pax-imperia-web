# These are just notes on google cloud, using the CLI and in some places point to how to see it in their webui which sucks to look at
# It turned out deploying a static site over https was a LOT of commands so I switched over to terraform... not sure where to keep notes now...

# Login
gcloud auth login

# Check login status
gcloud auth list

# Set Project
gcloud config set project pax-imeria-clone

# Set the region
gcloud config set run/region us-central1

# List ALL resources scoped under this project
gcloud asset search-all-resources

# Enable Billing by clicking "Create a Storage Bucket" button on the gcloud console dashboard

# Setup a budget for the project
# Gcloud console -> Billing -> Budgets & Alerts
# Set a budget of all projects to be something like $5 per month so you never get slammed like how AWS k8s works

# Enable IAM API in gcloud console

# https://console.cloud.google.com/net-services/loadbalancing/advanced/forwardingRules/list?project=pax-imeria-clone

# Setup a service account
## Ref: https://gcloud.devoteam.com/blog/a-step-by-step-guide-to-set-up-a-gcp-project-to-start-using-terraform/

export PROJECT_ID=pax-imeria-clone

gcloud iam service-accounts create sa-pax-tf-sbx \
  --description="Terraform Service account for Pax, Sandbox Environment" \
  --display-name="Terraform Service Account"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:sa-pax-tf-sbx@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/editor"


# Enable login via MS button using Google Identity Platform
# Enable it and view it on the web UI here https://console.cloud.google.com/customer-identity/providers?project=pax-imeria-clone

# This functionality can be managed by terraform using this reference: https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/identity_platform_oauth_idp_config







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


# Configure the loadbalancer to allow serving static content over SSL
## ref: https://cloud.google.com/iap/docs/load-balancer-howto#gcloud_1

### Configure the load balancers backend?

gcloud compute instance-templates create TEMPLATE_NAME \
   --region=us-central1 \
   --network=default \
   --subnet=default \
   --tags=allow-health-check \
   --image-family=debian-10 \
   --image-project=debian-cloud \
   --metadata=startup-script='#! /bin/bash
     sudo apt-get update
     sudo apt-get install apache2 -y
     sudo a2ensite default-ssl
     sudo a2enmod ssl
     vm_hostname="$(curl -H "Metadata-Flavor:Google" \
   http://metadata.google.internal/computeMetadata/v1/instance/name)"
   sudo echo "Page served from: $vm_hostname" | \
   tee /var/www/html/index.html
   sudo systemctl restart apache2'

gcloud compute instance-groups managed create lb-backend-example \
  --template=TEMPLATE_NAME --size=2 --zone=us-central1-b

gcloud compute instance-groups set-named-ports lb-backend-example \
    --named-ports http:80 \
    --zone us-central1-b

gcloud compute firewall-rules create fw-allow-health-check \
    --network=default \
    --action=allow \
    --direction=ingress \
    --source-ranges=130.211.0.0/22,35.191.0.0/16 \
    --target-tags=allow-health-check \
    --rules=tcp:80

###### Reserve IP Address for load balancer
gcloud compute addresses create lb-ipv4-1 \
    --ip-version=IPV4 \
    --network-tier=STANDARD \
    --global

###### Check IP for load balancer
gcloud compute addresses describe lb-ipv4-1 \
    --format="get(address)" \
    --global

### Configure the load balancer's frontend?


gcloud compute health-checks create http http-basic-check \
    --port 80


gcloud compute backend-services create web-backend-service \
      --load-balancing-scheme=EXTERNAL \
      --protocol=HTTP \
      --port-name=http \
      --health-checks=http-basic-check \
      --global


###### Attach backend service...

gcloud compute backend-services add-backend web-backend-service \
      --instance-group=lb-backend-example \
      --instance-group-zone=us-east1-b \
      --global


gcloud compute url-maps create web-map-http \
      --default-service web-backend-service


gcloud compute url-maps create web-map-https \
      --default-service web-backend-service

### Configure the frontend???





# Terraform Route
## https://github.com/terraform-google-modules/terraform-google-lb-http/blob/HEAD/examples/multi-backend-multi-mig-bucket-https-lb/main.tf

