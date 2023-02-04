# ------------------------------------------------------------------------------
# TODO: (Much of) the below stuff should be refactored to variables in the
# related module so it's cleaner and one isn't tempted to move all this junk
# it's a seperate tf file to keep it all modualized.
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# CREATE DEFAULT PAGES
# ------------------------------------------------------------------------------

#
resource "google_storage_bucket_object" "confirm_deploy" {
  name    = "confirm_deploy.html"
  content = "Bucket provisioning complete"
  bucket  = module.static_site.website_bucket_name
}

resource "google_storage_object_acl" "confirm_deploy_acl" {
  bucket      = module.static_site.website_bucket_name
  object      = google_storage_bucket_object.confirm_deploy.name
  role_entity = ["READER:allUsers"]
}

# ------------------------------------------------------------------------------
# CREATE A CORRESPONDING GOOGLE CERTIFICATE THAT WE CAN ATTACH TO THE LOAD BALANCER
# ------------------------------------------------------------------------------

resource "google_compute_ssl_certificate" "certificate" {
  count = var.enable_ssl ? 1 : 0

  project  = var.project
  provider = google-beta

  name_prefix = "petri-test"
  description = "SSL Certificate for ${var.website_domain_name}"
  private_key = file("../../secrets/privkey.pem")
  certificate = file("../../secrets/fullchain.pem")

  lifecycle {
    create_before_destroy = true
  }
}

# NOTE: the auth stuff is incomplete, see https://github.com/hashicorp/terraform-provider-google/issues/8510.
# Authorized domains are not defined and must be entered manually.  Additionally, the redirect URL needs to be
# copy pasted into the MS Azure ID side of things.
resource "google_identity_platform_default_supported_idp_config" "microsoft" {
  enabled       = true
  idp_id        = "microsoft.com"
  client_id     = var.pax_ms_client_id
  client_secret = var.pax_ms_client_secret
  project       = var.project
}
