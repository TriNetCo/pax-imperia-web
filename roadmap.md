# Roadmap

Here's where we describe what our vision, ambitions and next steps are for the project.  Everyone owns this file.  To make things visible and reduce work duplication, we've been tagging our name on items we're currently doing (or are working towards doing).

On Github, I've been testing out the latest GH project tracking features and basically implementing SAFe's agile definitions [explained and rebuttled here](https://insideproduct.co/themes-epics-features-user-stories/#:~:text=A%20feature%20is%20what%20everyone,broken%20down%20into%20user%20stories) but primarily defined [here](https://www.scaledagileframework.com/story/).  It's good to have both perspectives going in.  No one's agile is not perfect for every project.

## Network/ Data Engineering Roadmap
m Add testing to the frontend
m Define golang struct for solar system data
m Combine galactic view into system view
m (R) Websockets
  x Listen for websocket connections from the frontend
  m Get two clients "chatting"
  m Ws: Communicate commands from frontend to backend (start new game command?)
  m Ws: Transmit gametime to multiple subscribed clients
  m Ws: Communicate positions of ships with multiple clients
  m Ws: pump out solar system data to the backend over websocket
m (R) Fix up database to use yaml and have pipeline build secrets and stuff
  m update the username stuff to have yaml
  m define pipeline/ script to perform database migration on cloud
m Figure out how gametime updates from the backend impact the game? (reworded as clock synchronization)

## Gameplay Logic and Design (GL&D)
- [ ] Colonizing planets
- [ ] Themes
  - [ ] Expansion
  - [ ] Exploration
  - [ ] Industry
  - [ ] Combat
  - [ ] Research
- [ ] Spaceships
- [ ] Different species with different histories


## WebGL/ Canvas Graphics Roadmap
m Galaxy Map Polish: Draw a pretty star instead of squares
m Draw orbits lines
m (P) Create a ship you can control and move to planets (in singleplayer mvp)

## Modeling
m (Q) Use blender to create something used in the game


## HTML/ CSS UI Roadmap
m (R) Add Login view
m Add NewGame view
m Flesh out Main Menu CSS
m Flesh out HUD buttons in System detail view

## Moved to GH


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
x (R) Host on-the-cheap using w/e my work is hosting with
x (R) Roll out firebase authentication
x (L) Define game data classes used in the space view
x (L) Generate System data in javascript instead of using sample data
x Make it so Galaxy is generated outside of the widget and passed in as a parameter for GalaxyWidget
x Make it so Galaxy is generated outside of the widget and passed in as a parameter for SpaceViewWidget
x Improve code quality of PlanetView stuff
