# Pax Backend

### Setup the Datamodels

This step requires the database running...

go install github.com/go-jet/jet/v2/cmd/jet@latest

```
jet -source=postgres -host=localhost -port=5432 -user="${GO_DB_USER}" -password=ez -dbname=dbmodels -schema=pax -sslmode=disable
```

### Setup the GoLang Backend

Run these commands to start the server

Prerequisite on Macbook:

```
cd frontend
npm install
```

```
cd backend
go run cmd/pax.go
```

Now navigate to [http://localhost:3000](http://localhost:3000) to play the game!

The main file to edit is of course `./public/index.html` for getting at the front end at the moment.


### Run the Tests

```bash
go test ./...
```

### Docker build

```bash
docker build . -t pax-imperia-clone/backend
```

### Deploying to k8s

Instead of helm I figured I'd try kustomize since that's invented now.  Don't forget to push the container image.

```bash
# Skim the outputs
kubectl kustomize k8s/prod/

# Deploy it
kubectl apply -k k8s/prod

# Check deployment
kubectl get -k k8s/prod

# Tare down
kubectl destroy -k k8s/prod
```

### Deploying to GCP

I tore down GCP, might bring it up again if my local k8s isn't performing well.
