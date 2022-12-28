# Pax Imperia Clone

A clone of an old game


## Overview

This project was built with 3 main technologies:

- Golang (backend)      - Handles all of the communication between the frontend clients over http and websockets.
- Javascript (frontend) - Handles all of the graphics on the front end as well as plenty of game logic.
- Postgres   - Allows us to store data if the need should arise...

The backend's data models are created from the postgres database (resume driven design) using "Jet".

## Getting Started...

### ~~Build Database~~

go install github.com/go-jet/jet/v2/cmd/jet@latest

```
jet -source=postgres -host=localhost -port=5432 -user="${GO_DB_USER}" -password=ez -dbname=dbmodels -schema=pax -sslmode=disable
```

### Boot the GO App

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

### Setup the react app

###### For Windows
```
cd frontend
npm link
cd ../react-frontend
npm link pax-imperia-js
npm install
```

###### For Mac
```
cd react-frontend
npm install
```

### Run the react server

```
cd react-frontend
npm start
```


## References

- Three JS raycaster/ click detection stuff:
- Three JS Sprite stuff:  https://www.youtube.com/watch?v=pGO1Hm-JB90
- Restful GoLang (skipped):  https://go.dev/doc/tutorial/web-service-gin
- REST using Gin:  https://go.dev/doc/tutorial/web-service-gin
- GoLang Packages: https://go.dev/doc/code
- GoLang Project Layout... https://github.com/golang-standards/project-layout
- React + WebGL... http://www.petecorey.com/blog/2019/08/19/animating-a-canvas-with-react-hooks/
- React Context?? https://www.freecodecamp.org/news/react-context-for-beginners/#:~:text=React%20context%20caveats-,What%20is%20React%20context%3F,across%20our%20components%20more%20easily.