resource "google_project" "project" {
  name       = var.project
  project_id = var.project

  labels = {
    "firebase" = "enabled"
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
