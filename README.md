# Pax Imperia Clone

A clone of an old game

## TODO Galactic View
- Draw a pretty star instead of squares
- Extract constellation algo into it's own module
- Set minimum distance between stars
x Connect systems to each other with a line
x Allow opening a system by clicking it
- Flesh out Main Menu links

## TODO System View
x Add stars to systems
x Add planets to systems
x Tech Debt: Load models cleanly
- Drive solar system contents off of JS data
- Flesh out HUD buttons
- Create a ship you can control and move to planets

## TODO Backend
- Define database using sql
- Define golang struct for solar system data
- pump out solar system data to the backend

## Getting Started...

### Build Database

go install github.com/go-jet/jet/v2/cmd/jet@latest

```
jet -source=postgres -host=localhost -port=5432 -user="${GO_DB_USER}" -password=ez -dbname=dbmodels -schema=pax -sslmode=disable
```

### Boot the App

Run these commands to start the server
```
  go run main.go
```

Now navigate to [http://localhost:3000](http://localhost:3000) to play the game!

The main file to edit is of course `./public/index.html` for getting at the front end at the moment.

## References

- Three JS raycaster/ click detection stuff:
- Three JS Sprite stuff:  https://www.youtube.com/watch?v=pGO1Hm-JB90
- Restful GoLang (skipped):  https://go.dev/doc/tutorial/web-service-gin
- REST using Gin:  https://go.dev/doc/tutorial/web-service-gin
- GoLang Packages: https://go.dev/doc/code
- GoLang Project Layout... https://github.com/golang-standards/project-layout
