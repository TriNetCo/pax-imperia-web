provider "google" {
  credentials = file("${var.credentials_file}")
  project     = var.project
  region      = var.region
}

provider "google-beta" {
  credentials = file("${var.credentials_file}")
  project     = var.project
  region      = var.region
}
