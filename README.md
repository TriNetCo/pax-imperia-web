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
- Tech Debt: Load models cleanly
  - Do I copy models after they're loaded?
- Flesh out HUD buttons
- Create a ship you can control and move to planets

## Getting Started

Run these commands to start the server
```
  go run main.go
```

Now navigate to [http://localhost:3000](http://localhost:3000) to play the game!

The main file to edit is of course `./public/index.html` for getting at the front end at the moment.  

## References

- Three JS raycaster/ click detection stuff:  
- Three JS Sprite stuff:  https://www.youtube.com/watch?v=pGO1Hm-JB90
- Restful GoLang:  https://go.dev/doc/tutorial/web-service-gin
