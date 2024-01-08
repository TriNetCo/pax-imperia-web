# Networking - Chat

###### Outbound Messages: Client
- [x] AUTHENTICATE
- [x] NEW_MESSAGE
- [x] JOIN_CHAT_LOBBY
- [ ] LEAVE_CHAT_LOBBY
- [x] GET_GAME_CONFIGURATION

###### Outbound Messages: Server
- [x] SYSTEM_MESSAGE_USER_JOINED_CHAT
- [x] SYSTEM_MESSAGE_USER_LEFT_CHAT
- [x] SYSTEM_MESSAGE_CHAT_USER_LIST
- [x] NEW_MESSAGE_FROM_SERVER


## ChatLobby

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
    s-)a:  JOIN_CHAT_LOBBY_RESPONSE
    deactivate s

    b->>s: JOIN_CHAT_LOBBY
    activate s
    note over s: Joins Client B to lobby
    s-)b: JOIN_CHAT_LOBBY_RESPONSE
    s-)a: SYSTEM_MESSAGE_USER_JOINED_CHAT
    deactivate s

    note over s: Client B's connection is lost
    activate s


    deactivate s

```
