package api

import (
	"fmt"

	. "github.com/trinetco/pax-imperia-clone/pkg/models"
)

func HandleLeaveChatLobby(conn *WebSocketConnection) {
	client := clients[conn]

	if client.ChatLobbyId == "" {
		fmt.Println("WARN: ChatLobbyId not found, can't leave")
		return
	}

	var userLeaveAnnouncement = &Message{
		Type: "SYSTEM_MESSAGE_USER_LEFT_CHAT",
		Payload: map[string]interface{}{
			"status":      "success",
			"chatLobbyId": client.ChatLobbyId,
			"displayName": client.DisplayName,
			"email":       client.Email,
		},
	}

	chatRoom := RemoveClientFromCurrentChatRoom(conn)

	SendMessageToAllChatroomParticipants(chatRoom, userLeaveAnnouncement)
}
