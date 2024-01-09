package api

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
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

func GetChatLobbyUsers(chatRoom ChatRoom) []string {
	displayNames := make([]string, 0)
	for client := range chatRoom.Clients {
		displayNames = append(displayNames, clients[client].DisplayName)
	}
	return displayNames
}

func SendMessageToAllChatroomParticipants(chatRoom ChatRoom, message Message) {
	for client := range chatRoom.Clients {
		if err := client.WriteJSON(message); err != nil {
			log.Println(err)
			cleanUpDeadConnection(client)
		}
	}
}

func SendMessageToAllButOneChatroomParticipant(chatRoom ChatRoom, message Message, excluded *websocket.Conn) {
	for client := range chatRoom.Clients {
		if client == excluded {
			continue
		}
		if err := client.WriteJSON(message); err != nil {
			log.Println(err)
			cleanUpDeadConnection(client)
		}
	}
}
