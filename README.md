# Pax Imperia Clone

A clone of an old game


## TODO Generic Frontend
- Sprinkle in react to make it a SPA
- Add testing to the frontend

## TODO Galactic View
- Draw a pretty star instead of squares
- Center rectangle of star
- Extract constellation algo into it's own module
- Set minimum distance between stars
x Connect systems to each other with a line
x Allow opening a system by clicking it
- (CSS) Flesh out Main Menu links

## TODO System View
x Add stars to systems
x Add planets to systems
x Tech Debt: Load models cleanly
- Drive solar system contents off of JS data
- Communicate positions with multiple clients
- Combine galactic view into system view
- Flesh out HUD buttons
- Create a ship you can control and move to planets

## TODO Backend
x Define database using sql
- Listen for websocket connections from the frontend
- Transmit gametime to subscribed clients
- Get two clients chatting
- Communicate commands from frontend to backend
- Define golang struct for solar system data
- pump out solar system data to the backend over websocket

## Overview

This project was built with 3 main technologies:

- Golang (backend)      - Handles all of the communication between the frontend clients over http and websockets.
- Javascript (frontend) - Handles all of the graphics on the front end as well as plenty of game logic.
- Postgres   - Allows us to store data if the need should arise...

The backend's data models are created from the postgres database (resume driven design) using "Jet".

## Getting Started...

### Build Database

go install github.com/go-jet/jet/v2/cmd/jet@latest

```
jet -source=postgres -host=localhost -port=5432 -user="${GO_DB_USER}" -password=ez -dbname=dbmodels -schema=pax -sslmode=disable
```

### Boot the App

Run these commands to start the server
```
  cd backend
  go run cmd/pax.go
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
- React + WebGL... http://www.petecorey.com/blog/2019/08/19/animating-a-canvas-with-react-hooks/
