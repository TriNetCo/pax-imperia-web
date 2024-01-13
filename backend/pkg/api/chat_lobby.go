package api

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	. "github.com/trinetco/pax-imperia-clone/pkg/models"
)

// This function converts the chatRooms to a good json
// that can be send to the client
func GetChatRooms(c *gin.Context) {
	c.JSON(http.StatusOK, ChatRoomsToJSON())
}

// Returns the JSON representation of the chatRooms
func ChatRoomsToJSON() []ChatRoomJSON {
	tempChatRooms := make([]ChatRoomJSON, 0, len(chatRooms))
	for _, room := range chatRooms {
		tempChatRooms = append(tempChatRooms, room.ToJSON())
	}
	return tempChatRooms
}

func GetChatLobbyUsers(chatRoom *ChatRoom) []string {
	displayNames := make([]string, 0)
	for client := range chatRoom.Clients {
		displayNames = append(displayNames, clients[client].DisplayName)
	}
	return displayNames
}

func SendMessageToAllChatroomParticipants(chatRoom *ChatRoom, message *Message) {
	for client := range chatRoom.Clients {
		if err := (*client).WriteJSON(message); err != nil {
			log.Println(err)
			cleanUpDeadConnection(client)
		}
	}
}

func SendMessageToAllButOneChatroomParticipant(chatRoom *ChatRoom, message *Message, excluded *WebSocketConnection) {
	for client := range chatRoom.Clients {
		if client == excluded {
			continue
		}
		if err := (*client).WriteJSON(message); err != nil {
			log.Println(err)
			cleanUpDeadConnection(client)
		}
	}
}

func RemoveClientFromCurrentChatRoom(conn *WebSocketConnection) *ChatRoom {

	// Check if the client is in a chatRoom
	if clients[conn].ChatLobbyId == "" {
		return nil
	}

	// get the client's chatRoom
	chatRoom, exists := chatRooms[clients[conn].ChatLobbyId]
	if !exists {
		return nil
	}

	chatRoom.RemoveClient(conn)

	// delete the chatRoom if the chatRoom is now empty
	if len(chatRoom.Clients) == 0 {
		delete(chatRooms, chatRoom.ChatLobbyId)
		return nil
	}

	return chatRoom
}

func JoinClientToChatRoom(conn *WebSocketConnection, chatRoom *ChatRoom) {

	// Remove client from their current lobby if applicable
	RemoveClientFromCurrentChatRoom(conn)

	client := clients[conn]
	client.ChatLobbyId = chatRoom.ChatLobbyId
	chatRoom.Clients[conn] = client

	fmt.Println("Client joined chat room " + client.ChatLobbyId)
}
