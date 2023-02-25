# Roadmap

Here's where we describe what our vision, ambitions and next steps are for the project.  Everyone owns this file.  To make things visible and reduce work duplication, we've been tagging our name on items we're currently doing (or are working towards doing).

On Github, I've been testing out the latest GH project tracking features and basically implementing SAFe's agile definitions [explained and rebuttled here](https://insideproduct.co/themes-epics-features-user-stories/#:~:text=A%20feature%20is%20what%20everyone,broken%20down%20into%20user%20stories) but primarily defined [here](https://www.scaledagileframework.com/story/).  It's good to have both perspectives going in.  No one's agile is not perfect for every project.

This file is not the source of truth for work, it is copied from milestones after their agreed upon.

# Milestone: Single Player MVP ("extermination)

###### Must

- [ ] (L) Feature: Polish planet animations #51
  - [ ] Refactor the way planet animation algorithms exist outside of the planet class #52
  - [ ] Update the system generator to add some variance to planetary rotation and orbit speed #53
- [ ] Create view to start a new single player game #20
- [ ] Feature: Basic UI Navigation for Space View
  - [ ] Add unpolished wormhole graphics, and include adjacent system wormholes in every system
  - [ ] Space View UI - Enable changing systems by double clicking wormholes
  - [ ] Space View UI - Enable leaving the space view to see the main menu screen
- [ ] Feature: Basic ship controls #21
  - [ ] Create UI controls for ships #22
  - [ ] Enable moving a ship on the space view (scripting, UI button driven, and right click movement) #23
  - [ ] Enable moving a ship from one system to another system #24
  - [ ] Destroy an enemy battle ship #25
  - [ ] Destroy an enemy planet #26
- [ ] Feature: Setup automated browser testing infrastructure #27
  - [ ] Research Browser test frameworks and report options #28
  - [ ] Decide on which browser testing framework to support #29
  - [ ] Configure the browser testing framework and write a test for the Single Player MVP #30
  - [ ] Add controls, triggers, and observability for browser test automation #31
- [ ] Create test suite that validates the correctness of the Single Player MVP implementation #32
- [ ] Feature: Victory Conditions - total annihilation #33
  - [ ] Create view for Game Over - Victory page #34
  - [ ] Implement marking a colonizer as "eliminated" in data structure #35
  - [ ] Implement Victory Conditions wherein when all other players are eliminated, end the game #36
- [ ] Feature: Polish views for starting a new single player game #20
  - [ ] Rework the main menu's Single Player button to show sub-menu for "New Game" or "Load Game"
  - [ ] Implement "Species Selection" view, accessed by main menu -> Single Player -> "New Game"
  - [ ] Implement "Galaxy Generator" view, accessed by "New Game" bread crumbs

###### Should


