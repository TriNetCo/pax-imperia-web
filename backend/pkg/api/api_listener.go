package api

import (
	"encoding/json"
	"fmt"
	"sync"

	"github.com/gorilla/websocket"
	. "github.com/trinetco/pax-imperia-clone/pkg/models"
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
func ListenToClientMessages(conn *websocket.Conn) {
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
			HandleJoinChatLobby(conn, message)
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

// This method is called when a client disconnects from the server.
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
		fmt.Printf("Payload: %+v\n", payload)
	}
	return value, ok
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
