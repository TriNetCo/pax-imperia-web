terraform {
  required_version = ">= 0.12.26"

  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 3.50.0"
    }
  }

  backend "gcs" {
    bucket  = "b4e94ce8317d0897-bucket-tfstate"
    prefix  = "terraform/state"
    credentials = "../../backend/secrets/serviceAccountKey.json"
  }
}
