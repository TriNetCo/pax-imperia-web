# ------------------------------------------------------------------------------
# These variables are specific to the static_asset_load_balaner... They can be
# extracted directly into that module, but I think I should leave them this way
# to potentially aid in development of the module.
# ------------------------------------------------------------------------------

variable "enable_http" {
  description = "Set to false to disable plain HTTP. Note that disabling http does not force SSL and/or redirect HTTP traffic. See https://issuetracker.google.com/issues/35904733."
  type        = bool
  default     = true
}

variable "enable_ssl" {
  description = "Set to true to enable SSL. If set to 'true', self-signed certificates are created for you."
  type        = bool
  default     = true
}

variable "enable_cdn" {
  description = "Set to true to enable SSL. If set to 'true', self-signed certificates are created for you."
  type        = bool
  default     = false
}

variable "create_dns_entry" {
  description = "If set to true, create a DNS A Record pointing to the LB IP in Cloud DNS using the domain name in var.website_domain_name."
  type        = bool
  default     = false
}

variable "dns_managed_zone_name" {
  description = "The name of the Cloud DNS Managed Zone in which to create the DNS A Record specified in var.website_domain_name. Only used if var.create_dns_entry is true."
  type        = string
  default     = "replace-me"
}

variable "dns_record_ttl" {
  description = "The time-to-live for the site CNAME record set (seconds)"
  type        = number
  default     = 60
}

variable "website_location" {
  description = "Location of the bucket that will store the static website. Once a bucket has been created, its location can't be changed. See https://cloud.google.com/storage/docs/bucket-locations"
  type        = string
  default     = "US"
}

variable "enable_versioning" {
  description = "Set to true to enable versioning. This means the website bucket will retain all old versions of all files. This is useful for backup purposes (e.g. you can rollback to an older version), but it may mean your bucket uses more storage."
  type        = bool
  default     = false
}

variable "index_page" {
  description = "Bucket's directory index"
  type        = string
  default     = "index.html"
}

variable "force_destroy_website" {
  description = "If set to true, this will force the delete of the website bucket when you run terraform destroy, even if there is still content in it. This is only meant for testing and should not be used in production."
  type        = bool
  default     = true
}

variable "force_destroy_access_logs_bucket" {
  description = "If set to true, this will force the delete of the access logs bucket when you run terraform destroy, even if there is still content in it. This is only meant for testing and should not be used in production."
  type        = bool
  default     = true
}

# Below are some configs for a PR that I might want to merge into my fork

variable "enable_signed_url" {
  type        = string
  description = "If set to true, this will enable signed urls. See https://cloud.google.com/cdn/docs/using-signed-urls"
  default     = false
}

variable "uniform_bucket_level_access" {
  type        = bool
  description = "If set to true, this will enable uniform_bucket_level_access. See https://cloud.google.com/storage/docs/uniform-bucket-level-access"
  default     = false
}

locals {
  # tflint-ignore: terraform_unused_declarations
  validate_signed_url_enables_cdn = ( var.enable_signed_url ? ( var.enable_cdn == false ? tobool("EXCUSE ME! MADAM OR SIRRRR! Ignore the outer error, I must implore you to heed this warning instead! You've set enable_signed_url to true, which require that you also set enable_cdn to true or things won't work good.  Ignore the rest of this error, it's a distraction.") : true ) : true )
}

locals {
  # tflint-ignore: terraform_unused_declarations
  validate_signed_url_enables_uniform_bucket_level_access = ( var.enable_signed_url ? ( var.uniform_bucket_level_access == false ? tobool("EXCUSE ME! MADAM OR SIRRRR! Ignore the outer error, I must implore you to heed this warning instead! You've set enable_signed_url to true, which require that you also set uniform_bucket_level_access to true or things won't work good.  Ignore the rest of this error, it's a distraction.") : true ) : true )
}
