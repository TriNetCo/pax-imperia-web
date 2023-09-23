package api

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

type ServerConfiguration struct {
	VerboseMode bool `json:"verboseMode"`
}

var serverConfiguration = ServerConfiguration{}
var clients = make(map[*websocket.Conn]ClientData)
var chatRooms = make(map[string]ChatRoom)
var dataMux sync.Mutex

/* This is the main websocket handler for the server.  Whenever a message
 * comes into the server, this function will be called.
 */
func listenToClientMessages(conn *websocket.Conn) {
	fmt.Print("Client connected: ", &conn, "\n")

	defer func() {
		dataMux.Lock()
		cleanUpDeadConnection(conn)
		dataMux.Unlock()
		conn.Close()
	}()

	dataMux.Lock()

	// this map is kind of confusing, but we create a key for the client using the connection pointer, and
	// set the value to true a struct containing the client's email and display name
	// we can access the connection pointer later to send messages to the client by iterating over the map
	// weird syntax, but it works
	// we could use an array of connections, but this is more efficient???
	var client = ClientData{}
	clients[conn] = client
	dataMux.Unlock()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Client disconnected")
			fmt.Println(err)
			break
		}
		// fmt.Println("Received Message:", string(msg))

		// We need to parse the json message into a struct
		var message Message
		err = json.Unmarshal(msg, &message)
		if err != nil {
			fmt.Println("error:", err)
		}
		// fmt.Println("Client email: ", client.Email)
		// fmt.Println("Message: ", message.Command)
		// fmt.Println("Payload: ", message.Payload)

		dataMux.Lock()

		switch message.Command {
		case "AUTHENTICATE":
			var newConn WebSocketConnection = &WebSocketConnAdapter{Conn: conn}
			handleAuthenticate(newConn, client, message)
		case "JOIN_CHAT_LOBBY":
			handleJoinChatLobby(conn, message)
		case "NEW_MESSAGE":
			handleSay(conn, message)
		case "SET_GAME_CONFIGURATION":
			// message = { "systems": "systemData..." }
			handleSetGameConfiguration(conn, message)
		case "GET_GAME_CONFIGURATION":
			handleGetGameConfiguration(conn, message)
		default:
			fmt.Println("ERROR: Unknown command, " + message.Command)
		}

		dataMux.Unlock()
	}
}

func handleGetGameConfiguration(conn *websocket.Conn, message Message) {
	// The client will request the game configuration from the server
	// The server will send the game configuration to the client
	// The client will then display the game configuration to the user

	chatRoom, exists := chatRooms[message.Payload["chatLobbyId"].(string)]
	if !exists {
		fmt.Println("Chat Room not found")
		return
	}

	var response = Message{
		Command: "GET_GAME_CONFIGURATION_RESPONSE",
		Payload: map[string]interface{}{
			"status":      "success",
			"systemsJson": chatRoom.Game.SystemsJson,
			"time":        "5.00",
		},
	}
	conn.WriteJSON(response)
	fmt.Println("Game configuration sent")
}

func handleSetGameConfiguration(conn *websocket.Conn, message Message) {
	// The client will generate the game configuration and send it to the server
	// We will need to store that configuration in the chat room
	// The server will then send the game configuration to all other clients in the chat room
	chatLobbyId := message.Payload["chatLobbyId"].(string)

	chatRoom, exists := chatRooms[chatLobbyId]
	if !exists {
		fmt.Println("Chat Room not found")
		return
	}

	systemsJson, ok := tryExtractFromPayload(message.Payload, "systemsJson")
	if !ok {
		return
	}

	chatRoom.Game = Game{
		Id:          chatLobbyId,
		SystemsJson: systemsJson,
	}

	chatRooms[chatLobbyId] = chatRoom

	fmt.Println("Game configuration set")
}

func extractFromPayload(payload map[string]interface{}, keys ...string) (map[string]string, bool) {
	values := make(map[string]string)

	for _, key := range keys {
		value, ok := payload[key].(string)
		if !ok {
			return nil, false
		}
		values[key] = value
	}

	return values, true
}

func handleAuthenticate(conn WebSocketConnection, client ClientData, message Message) error {
	keys := []string{"displayName", "email", "token"}
	values, ok := extractFromPayload(message.Payload, keys...)
	if !ok {
		return fmt.Errorf("failed to extract values from payload")
	}

	authStatus := simpleValidateToken(values["token"])

	client.DisplayName = values["displayName"]
	client.Email = values["email"]
	client.Token = values["token"]
	client.AuthStatus = authStatus
	clients[conn.GetConn()] = client

	var response = Message{
		Command: "AUTHENTICATE_RESPONSE",
		Payload: map[string]interface{}{
			"status": authStatus,
		},
	}

	conn.WriteJSON(response)

	if authStatus == "UNAUTHENTICATED" {
		fmt.Printf("Client failed to authenticate: %s\n", values["displayName"])
		return fmt.Errorf("failed to authenticate")
	}

	fmt.Printf("Client authenticated: %s\n", values["displayName"])
	return nil
}

// TODO: check authentication.go for a better implementation
func simpleValidateToken(token string) string {
	if token == "invalid_token" {
		return "UNAUTHENTICATED"
	}
	return "AUTHENTICATED"
}

func handleSay(conn *websocket.Conn, message Message) {
	chatLobbyId, ok := tryExtractFromPayload(message.Payload, "chatLobbyId")
	if !ok {
		return
	}

	chatRoom, exists := chatRooms[chatLobbyId]
	if !exists {
		fmt.Println("Error: Chat Room not found, ", chatLobbyId)
		return
	}

	message.Payload["user"] = clients[conn].DisplayName

	sendMessageToAllChatroomParticipants(chatRoom, message)
}

func handleJoinChatLobby(conn *websocket.Conn, message Message) {
	if chatLobbyId, ok := message.Payload["chatLobbyId"].(string); ok {
		// fmt.Println("Chat Room ID:", chatLobbyId)

		chatRoom, exists := chatRooms[chatLobbyId]
		if !exists {
			fmt.Printf("Creating lobby: %s\n", chatLobbyId)

			chatRoom = ChatRoom{
				Name:    chatLobbyId,
				Clients: make(map[*websocket.Conn]ClientData),
			}
		}

		// Check if the client has already joined the lobby
		if _, exists := chatRoom.Clients[conn]; exists {
			fmt.Println("Error: Client already in lobby")
			return
		}

		var chatLobbyUsers = getChatLobbyUsers(chatRoom)

		chatRoom.Clients[conn] = clients[conn]
		chatRooms[chatLobbyId] = chatRoom

		var response = Message{
			Command: "JOIN_CHAT_LOBBY_RESPONSE",
			Payload: map[string]interface{}{
				"status":         "success",
				"chatLobbyId":    chatLobbyId,
				"chatLobbyUsers": chatLobbyUsers,
				"message":        "Joined chat lobby",
			},
		}

		if serverConfiguration.VerboseMode {
			debugPrintStruct(response)
		}

		// Announce user joined to all members of the chatroom
		var userJoinAnnouncement = Message{
			Command: "SYSTEM_MESSAGE_USER_JOINED_CHAT",
			Payload: map[string]interface{}{
				"status":      "success",
				"chatLobbyId": chatLobbyId,
				"displayName": clients[conn].DisplayName,
				"email":       clients[conn].Email,
			},
		}

		sendMessageToAllChatroomParticipants(chatRoom, userJoinAnnouncement)
		fmt.Printf("Client joined lobby: %s -> %s\n", clients[conn].DisplayName, chatLobbyId)
	} else {
		fmt.Println("Chat Room ID not found or not a string")
	}
}

func debugPrintStruct(response Message) {
	responseJson, _ := json.Marshal(response)
	fmt.Println("JOIN_CHAT_LOBBY_RESPONSE:\n", string(responseJson))
}

// Private-ish methods...

func getChatLobbyUsers(chatRoom ChatRoom) []string {
	displayNames := make([]string, 0)
	for client := range chatRoom.Clients {
		displayNames = append(displayNames, clients[client].DisplayName)
	}
	return displayNames
}

func sendMessageToAllChatroomParticipants(chatRoom ChatRoom, message Message) {
	for client := range chatRoom.Clients {
		if err := client.WriteJSON(message); err != nil {
			log.Println(err)
			cleanUpDeadConnection(client)
		}
	}
}

func cleanUpDeadConnection(client *websocket.Conn) {
	delete(clients, client)
	for _, chatRoom := range chatRooms {
		delete(chatRoom.Clients, client)
	}
}

func tryExtractFromPayload(payload map[string]interface{}, key string) (string, bool) {
	value, ok := payload[key].(string)
	if !ok {
		fmt.Printf("%s not found or not a string\n", key)
	}
	return value, ok
}
