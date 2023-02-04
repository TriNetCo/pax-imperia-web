# ------------------------------------------------------------------------------
# CONFIGURE Service Account for terraform to use
# (must be bootstrapped with super user credentials)
# ------------------------------------------------------------------------------

resource "google_service_account" "sa" {
  account_id   = "my-service-account"
  display_name = "A service account for terraform"
  project = var.project
}

# DEVELOPMENT NOTES:
# This is a good refereces for basic roles, as well as predefined roles: https://cloud.google.com/iam/docs/understanding-roles#project-roles
# In addition to that, going to IAM -> Roles...
# will show you a table which can be filtered by 'permission' when debugging why an terraform/ gcloud command didn't work
resource "google_project_iam_member" "member-role" {
  for_each = toset([
    "roles/viewer",
    "roles/iam.serviceAccountUser",
    "roles/cloudsql.admin",
    "roles/secretmanager.secretAccessor",
    "roles/datastore.owner",
    "roles/storage.admin",
    "roles/cloudbuild.builds.builder",
    "roles/cloudbuild.serviceAgent",
    "roles/logging.admin",
    "roles/run.admin",
  ])
  role = each.key
  member = "serviceAccount:${google_service_account.sa.email}"
  project = var.project
}

resource "google_service_account_key" "mykey" {
  service_account_id = google_service_account.sa.name
  public_key_type    = "TYPE_X509_PEM_FILE"
}

resource "local_file" "service_account_private_key" {
    content  = base64decode(google_service_account_key.mykey.private_key)
    filename = "../../secrets/terraform_sa_key.json"
    file_permission = "0664"
}
