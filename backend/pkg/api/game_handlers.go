package api

import (
	"fmt"

	"github.com/gorilla/websocket"
	. "github.com/trinetco/pax-imperia-clone/pkg/models"
)

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
