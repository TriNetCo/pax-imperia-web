# Roadmap

Here's where we describe what our vision, ambitions and next steps are for the project.

## Network/ Data Engineering Roadmap
- Make it so Galaxy is generated outside of the widget and passed in as a parameter for GalaxyWidget
- Make it so Galaxy is generated outside of the widget and passed in as a parameter for SpaceViewWidget
- Improve code quality of PlanetView stuff
- (ROB) Get System Detail view to work in React
- Add testing to the frontend
x Drive Space View contents off of JSON sample data
- (LAUREN) Define game data classes used in the space view
- (LAUREN) Generate System data in javascript instead of using sample data
- Define golang struct for solar system data
- Combine galactic view into system view
- (ROB) Websockets
    - Listen for websocket connections from the frontend
    - Get two clients "chatting"
    - Communicate commands from frontend to backend (start new game command?)
    - pump out solar system data to the backend over websocket
    - Transmit gametime to multiple subscribed clients
    - Communicate positions of ships with multiple clients


## Gameplay Logic and Design
- (PAT) Create a ship you can control and move to planets
- Figure out how gametime updates from the backend impact the game?


## Design
- Colonizing planets
- Themes
    - Expansion
    - Exploration
    - Industry
    - Combat
    - Research
- Spaceships
- Different species with different histories


## WebGL/ Canvas Graphics Roadmap
- Draw a pretty star instead of squares
- Draw orbits
- (QUINN) Use blender to create something used in the game


## HTML/ CSS UI Roadmap
- Add Login view
- Add NewGame view
- Flesh out Main Menu CSS
- Flesh out HUD buttons in System detail view


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
