# Roadmap

Here's where we describe what our vision, ambitions and next steps are for the project.  Everyone owns this file.  To make things visible and reduce work duplication, we've been tagging our name on items we're currently doing (or are working towards doing).

On Github, I've been testing out the latest GH project tracking features and basically implementing SAFe's agile definitions [explained and rebuttled here](https://insideproduct.co/themes-epics-features-user-stories/#:~:text=A%20feature%20is%20what%20everyone,broken%20down%20into%20user%20stories) but primarily defined [here](https://www.scaledagileframework.com/story/).  It's good to have both perspectives going in.  No one's agile is not perfect for every project.

## Network/ Data Engineering Roadmap
- (LAUREN) Define game data classes used in the space view
- (LAUREN) Generate System data in javascript instead of using sample data
- (ROB) Roll out firebase authentication
  - Get UI to show profile pic
  - Make sure final bugfixes are correct
- Make it so Galaxy is generated outside of the widget and passed in as a parameter for GalaxyWidget
- Make it so Galaxy is generated outside of the widget and passed in as a parameter for SpaceViewWidget
- Improve code quality of PlanetView stuff
- Add testing to the frontend
- Define golang struct for solar system data
- Combine galactic view into system view
- (ROB) Websockets
  x Listen for websocket connections from the frontend
  - Get two clients "chatting"
  - Communicate commands from frontend to backend (start new game command?)
  - pump out solar system data to the backend over websocket
  - Transmit gametime to multiple subscribed clients
  - Communicate positions of ships with multiple clients
- (ROB) Fix up database to use yaml and have pipeline build secrets and stuff
  - update the username stuff to have yaml
  - define pipeline/ script to perform database migration on cloud

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
- (ROB) Add Login view
- Add NewGame view
- Flesh out Main Menu CSS
- Flesh out HUD buttons in System detail view


## Finished Stuff!
x Drive Space View contents off of JSON sample data
x Get System Detail view to work in React
x Center rectangle of star
x Extract constellation algo into it's own module
x Set minimum distance between stars
x Connect systems to each other with a line
x Allow opening a system by clicking it
x Add stars to systems
x Add planets to systems
x Tech Debt: Load models cleanly
x Define database using sql
x (ROB) Host on-the-cheap using w/e my work is hosting with
