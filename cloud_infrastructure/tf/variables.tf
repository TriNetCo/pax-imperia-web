# ---------------------------------------------------------------------------------------------------------------------
# REQUIRED PARAMETERS
# These variables are expected to be passed in by the operator
# ---------------------------------------------------------------------------------------------------------------------

variable "project" {
  description = "The project ID to host the site in."
  type        = string
  default     = "pax-imeria-clone"
}

variable "region" {
  type = string
  default = "us-central1"
  description = "Region of GCP project"
}

variable "credentials_file" {
  type = string
  default = "../../backend/secrets/serviceAccountKey.json"
  description = "Path to credentials file for service account"
}

variable "website_domain_name" {
  description = "The name of the website and the Cloud Storage bucket to create (e.g. static.foo.com)."
  type        = string
  default     = "pax.njax.org"
}

variable "pax_ms_client_id" {
  description = "The client ID for the microsoft OAUTH IDP connection."
  type        = string
}

variable "pax_ms_client_secret" {
  description = "The client secret for the microsoft OAUTH IDP connection."
  type        = string
}
