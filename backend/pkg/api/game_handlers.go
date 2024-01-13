package api

import (
	"fmt"

	. "github.com/trinetco/pax-imperia-clone/pkg/models"
)

func handleGetGameConfiguration(conn *WebSocketConnection, message Message) {
	chatRoom, exists := chatRooms[message.Payload["chatLobbyId"].(string)]
	if !exists {
		fmt.Println("Chat Room not found")
		return
	}

	var response = Message{
		Type:   "GET_GAME_CONFIGURATION_RESPONSE",
		Status: "success",
		Payload: map[string]interface{}{
			"systemsJson":  chatRoom.Game.SystemsJson,
			"seedOnServer": "abc",
			"time":         "5.00",
		},
	}
	(*conn).WriteJSON(response)
	fmt.Println("Game configuration sent")
}

func handleSetGameConfiguration(conn *WebSocketConnection, msg *[]byte) {

	// get chatroom from connection
	client := clients[conn]
	chatRoom, exists := chatRooms[client.ChatLobbyId]
	if !exists {
		fmt.Println("WARN: Set game data called by client with no chatRoom " + client.ChatLobbyId)
		return
	}

	// slurp up the data into the Game struct
	chatRoom.Game = Game{
		Id:          client.ChatLobbyId,
		SystemsJson: string((*msg)[1:]),
	}

	var response = Message{
		Type:   "SET_GAME_CONFIGURATION_RESPONSE",
		Status: "success",
		Payload: map[string]interface{}{
			"seedOnServer": "abc",
		},
	}
	(*conn).WriteJSON(response)

	fmt.Println("Game configuration set")
}
