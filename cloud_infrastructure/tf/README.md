# Pax Terraform

This folder contains all our terraform markup that lets us codify all the cloud resources we're using in GCP.

## Getting Started

Terraform uses the configurations generated from the below stuff for interacting with GCP when GCP is setup as the backend I guess...  If you get permissions errors, please re-login.

```
gcloud auth application-default login
```

## Caching issues

It's not supposed to do any caching.  It does caching.  Try `gcloud compute target-https-proxies list` and delete it along with the http one and the re-apply.

###### refs
- [getting started](https://registry.terraform.io/providers/hashicorp/google/latest/docs/guides/getting_started#using-terraform-cloud-as-the-backend) (skimmed...)
- [init backend](https://cloud.google.com/docs/terraform/resource-management/store-state) to use GCP storage
