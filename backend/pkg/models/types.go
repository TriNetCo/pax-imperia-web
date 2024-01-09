package models

import (
	"fmt"

	"github.com/gorilla/websocket"
)

type Message struct {
	User    string                 `json:"user"`
	Command string                 `json:"command"`
	Payload map[string]interface{} `json:"payload"`
}

type ClientData struct {
	DisplayName string `json:"displayName"`
	Email       string `json:"email"`
	Token       string `json:"token"`
	AuthStatus  string `json:"authStatus"`
}

type Game struct {
	Id          string `json:"id"`
	SystemsJson string `json:"systemsJson"`
}

type ChatRoom struct {
	Name        string                         `json:"name"`
	Clients     map[*websocket.Conn]ClientData `json:"clients"`
	Game        Game                           `json:"game"`
	ChatLobbyId string                         `json:"chatLobbyId"`
	LobbyKing   *websocket.Conn                `json:"lobbyKing"`
}

type ChatRoomJSON struct {
	Name        string   `json:"name"`
	Clients     []string `json:"clients"`
	ChatLobbyId string   `json:"chatLobbyId"`
	LobbyKing   string   `json:"lobbyKing"`
}

func (chatRoom ChatRoom) ToJSON() ChatRoomJSON {
	tempRoom := ChatRoomJSON{
		Name:        chatRoom.Name,
		Clients:     make([]string, 0, len(chatRoom.Clients)),
		ChatLobbyId: chatRoom.ChatLobbyId,
		LobbyKing:   fmt.Sprintf("%p", chatRoom.LobbyKing), // Convert pointer to string
	}

	for _, clientData := range chatRoom.Clients {
		tempRoom.Clients = append(tempRoom.Clients, clientData.DisplayName)
	}

	return tempRoom

}

// runMethod is a method for the Hello struct
func (h ChatRoom) RemoveClient(conn *websocket.Conn) {
	fmt.Println("Removing client from chat room")
	delete(h.Clients, conn)
}

type User struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
	Token string `json:"token"`
}
