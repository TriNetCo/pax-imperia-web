package api

import (
	"fmt"

	"github.com/gorilla/websocket"
	. "github.com/trinetco/pax-imperia-clone/pkg/models"
)

func HandleJoinChatLobby(conn *websocket.Conn, message Message) {
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

		//
		// Respond to the joiner with the chat lobby users
		//

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

		conn.WriteJSON(response)

		//
		// Announce to all users that a new user joined the chat
		//

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
