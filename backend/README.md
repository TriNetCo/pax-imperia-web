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
