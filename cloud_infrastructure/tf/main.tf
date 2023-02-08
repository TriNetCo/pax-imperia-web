resource "google_project" "project" {
  name       = var.project
  project_id = var.project

  labels = {
    "firebase" = "enabled"
  }
}

# ------------------------------------------------------------------------------
# CREATE BUCKET FOR TERRAFORM STATE FILE BACKEND
# ------------------------------------------------------------------------------
resource "random_id" "bucket_prefix" {
  byte_length = 8
}

resource "google_storage_bucket" "terraform_backend_bucket" {
  name          = "${random_id.bucket_prefix.hex}-bucket-tfstate"
  force_destroy = false
  location      = "US"
  storage_class = "STANDARD"
  versioning {
    enabled = false
  }
}

# ------------------------------------------------------------------------------
# CREATE THE STATIC SITE WHERE THE FRONTEND DEPLOYS TO
# Note: see static_asset_load_balancer.tf for related resources yet to be modularized
# ------------------------------------------------------------------------------
module "static_site" {
  source = "github.com/gruntwork-io/terraform-google-static-assets.git//modules/http-load-balancer-website?ref=v0.6.0"

  project = var.project

  website_domain_name = var.website_domain_name
  website_location    = var.website_location

  force_destroy_access_logs_bucket = var.force_destroy_access_logs_bucket
  force_destroy_website            = var.force_destroy_website

  create_dns_entry      = var.create_dns_entry
  dns_record_ttl        = var.dns_record_ttl
  dns_managed_zone_name = var.dns_managed_zone_name

  enable_versioning = var.enable_versioning

  index_page     = var.index_page
  not_found_page = var.index_page

  enable_cdn  = false
  enable_ssl  = var.enable_ssl
  enable_http = var.enable_http

  ssl_certificate = join("", google_compute_ssl_certificate.certificate.*.self_link)
}


# ------------------------------------------------------------------------------
# CREATE A CLOUD SQL SERVICE
# ------------------------------------------------------------------------------
resource "random_id" "db_name_suffix" {
  byte_length = 4
}

locals {
  onprem = ["${var.allowed_ip}"]
}

resource "google_sql_database_instance" "postgres" {
  name             = "postgres-instance-${random_id.db_name_suffix.hex}"
  database_version = "POSTGRES_14"

  settings {
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled    = true
      # private_network = google_compute_network.private_network.id

      dynamic "authorized_networks" {
        for_each = local.onprem
        iterator = onprem

        content {
          name  = "onprem-${onprem.key}"
          value = onprem.value
        }
      }


    }
  }
}

resource "google_sql_database" "database" {
  name     = "dbmodels"
  instance = google_sql_database_instance.postgres.name
}

resource "google_secret_manager_secret" "db_app_user_pass" {
  secret_id = "DB_APP_USER_PASS"
  replication {
    automatic = true
  }
}

# # Note, you can create this once here, and then run
# # terraform state rm google_secret_manager_secret_version.db_app_user_pass
# # then comment the below section of code.
# # The below steps are able to pull the secret data out for use in terraform
# resource "google_secret_manager_secret_version" "db_app_user_pass" {
#   secret = google_secret_manager_secret.db_app_user_pass.id
#   secret_data = "example"
# }

data "google_secret_manager_secret_version" "db_app_user_pass" {
  provider = google-beta
  secret   = google_secret_manager_secret.db_app_user_pass.id
}

output "db_app_user_pass" {
  value = data.google_secret_manager_secret_version.db_app_user_pass.secret_data
  sensitive = true
}

resource "google_sql_user" "users" {
  name     = "app_rpm"
  password = data.google_secret_manager_secret_version.db_app_user_pass.secret_data
  instance = google_sql_database_instance.postgres.name
}

output "db_connection_string" {
  value = "jdbc:postgresql://${google_sql_database_instance.postgres.public_ip_address}:5432/dbmodels"
}
