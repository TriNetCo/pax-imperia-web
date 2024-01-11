package api

import (
	"fmt"

	. "github.com/trinetco/pax-imperia-clone/pkg/models"
)

func handleSay(conn WebSocketConnection, message Message) error {
	chatLobbyId, ok := tryExtractFromPayload(message.Payload, "chatLobbyId")
	if !ok {
		return fmt.Errorf("failed to extract chatLobbyId from payload")
	}

	chatRoom, exists := chatRooms[chatLobbyId]
	if !exists {
		return fmt.Errorf("Error: Chat Room not found, %s", chatLobbyId)
	}

	// Ensure this user is in the chatRoom
	sender := chatRoom.Clients[conn]
	if sender.DisplayName == "" {
		return fmt.Errorf("Error: Sender attempted to send to a chatRoom they're not in, %s", sender.Email)
	}

	// Ensure no one is spoofing their name
	message.Payload["user"] = sender.DisplayName
	message.Type = "SYSTEM_MESSAGE_NEW_MESSAGE"

	SendMessageToAllChatroomParticipants(chatRoom, message)
	return nil
}
