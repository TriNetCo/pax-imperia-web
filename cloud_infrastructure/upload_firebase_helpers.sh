#!/usr/bin/env bash

echo "uploading firebase helper things..."

gsutil -m -h "Content-Type:text/html" cp signin_helpers/* gs://pax-njax-org/__/auth/



