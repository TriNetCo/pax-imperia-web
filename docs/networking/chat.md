# Networking - Chat

## 1. Chat lobby formation to Game Launch

###### Outbound Messages: Client
- [x] AUTHENTICATE
- [x] NEW_MESSAGE
- [x] JOIN_CHAT_LOBBY
- [x] LEAVE_CHAT_LOBBY
- [x] SET_GAME_CONFIGURATION
- [x] GET_GAME_CONFIGURATION
- [ ] REQUEST_LAUNCH_GAME

###### Outbound Messages: Server
- [x] SYSTEM_MESSAGE_USER_JOINED_CHAT
- [x] SYSTEM_MESSAGE_USER_LEFT_CHAT
- [x] SYSTEM_MESSAGE_CHAT_USER_LIST
- [x] SYSTEM_MESSAGE_NEW_MESSAGE
- [ ] SYSTEM_MESSAGE_LAUNCH_GAME

A user (Client A) hosts a game.  Client B joins the game.  Then Client B leaves the game.  Client C joins, and then Client A launches both players inot the game.

```mermaid
sequenceDiagram
    participant a as Client A
    participant s as Server
    participant b as Client B

    a->>s: AUTHENTICATE
    s-->>a: AUTHENTICATE_RESPONSE!

    note over a: Generates Lobby UUID
    a->>s: JOIN_CHAT_LOBBY
    activate s
    note over s: Creates new lobby (if none exists) <br> and puts client into lobby
    s-->>a:  JOIN_CHAT_LOBBY_RESPONSE
    deactivate s
    a->>s: SET_GAME_CONFIGURATION
    note over s: Server sets game configuration

    b->>s: JOIN_CHAT_LOBBY
    activate s
    note over s: Joins Client B to lobby
    s-)b: JOIN_CHAT_LOBBY_RESPONSE
    s-)a: SYSTEM_MESSAGE_USER_JOINED_CHAT
    deactivate s

    b->>s: GET_GAME_CONFIGURATION
    s-->>b: GET_GAME_CONFIGURATION_RESPONSE
    note over b: Client B's game state now matches Client A

    note over s: Client B's connection is lost
    activate s
    s-)a: SYSTEM_MESSAGE_USER_LEFT_CHAT
    deactivate s

    b->>s: JOIN_CHAT_LOBBY
    activate s
    note over s: Joins Client B to lobby
    s-)a: SYSTEM_MESSAGE_USER_JOINED_CHAT
    deactivate s

    b->>s: GET_GAME_CONFIGURATION
    s-->>b: GET_GAME_CONFIGURATION_RESPONSE

    a->>s: REQUEST_LAUNCH_GAME
    s-)a: SYSTEM_MESSAGE_LAUNCH_GAME
    s-)b: SYSTEM_MESSAGE_LAUNCH_GAME

    note over s: The clients now start their game clocks at roughly the same time from identical states.
```


## 2. Game launch to player movements

###### Outbound Messages: Client
- [ ] MOVE_SHIP
- [ ]
- [ ]


```mermaid
sequenceDiagram
    participant a as Client A
    participant s as Server
    participant b as Client B

    s-)a: SYSTEM_MESSAGE_LAUNCH_GAME
    s-)b: SYSTEM_MESSAGE_LAUNCH_GAME

    note over a: A Moves their ship to a planet.
    a->>s: MOVE_SHIP: <br/> startPos, destinationPos, timestamp
    s->>b: MOVE_SHIP
    note over b: B accounts for latencey by <br> fast moving the ship to where player A would currently see it <br> (plus the fast move trip duration) <br> and then continues the ship movement from the position is synced
```

###### Server Validations:
- If the timestap is too old, the server discards the message and logs an attempted timestamp back-dating

###### Client Validations:
- If the starting position is incongruent from player B's perspective, the client sends an INVALID_COMMAND to the server, the server logs the invalid command.  If the client is "trusted" (an official referee, non-player client) or if all other players agree INVALID_COMMAND, the game is halted due to someone cheating.  Cheating can be allowed by players.


## 3. Periodic clock synchronization

```mermaid

```
