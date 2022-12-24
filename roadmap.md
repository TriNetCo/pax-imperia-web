# Road Map

Here's where we describe what our vision, ambitions and next steps are for the project.

## Network/ Data Engineering Roadmap
- Add testing to the frontend
- Drive solar system contents off of JS data
- Define golang struct for solar system data
- Combine galactic view into system view
- Websockets
    - Listen for websocket connections from the frontend
    - Get two clients "chatting"
    - Communicate commands from frontend to backend
    - Transmit gametime to subscribed clients
    - Communicate positions with multiple clients
    - pump out solar system data to the backend over websocket

## Game Logic
- Figure out how gametime synchronization impacts the game?


## WebGL/ Canvas Graphics Roadmap
- Draw a pretty star instead of squares
- Create a ship you can control and move to planets


## HTML/ CSS UI Roadmap
- (CSS) Flesh out Main Menu links
- Flesh out HUD buttons


## Finished Stuff!
x Center rectangle of star
x Extract constellation algo into it's own module
x Set minimum distance between stars
x Connect systems to each other with a line
x Allow opening a system by clicking it
x Add stars to systems
x Add planets to systems
x Tech Debt: Load models cleanly
x Define database using sql