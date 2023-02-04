# Pax Terraform

Terraform uses the configurations generated from the below stuff for interacting with GCP when GCP is setup as the backend I guess...  If you get permissions errors, please re-login.

```
gcloud auth application-default login
```

###### refs
- [getting started](https://registry.terraform.io/providers/hashicorp/google/latest/docs/guides/getting_started#using-terraform-cloud-as-the-backend) (skimmed...)
- [init backend](https://cloud.google.com/docs/terraform/resource-management/store-state) to use GCP storage
