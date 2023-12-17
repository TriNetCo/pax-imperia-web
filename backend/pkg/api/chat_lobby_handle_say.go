package api

import (
	"fmt"

	"github.com/gorilla/websocket"
	. "github.com/trinetco/pax-imperia-clone/pkg/models"
)

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

	SendMessageToAllChatroomParticipants(chatRoom, message)
}
