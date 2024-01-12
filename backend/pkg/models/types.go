package models

import (
	"fmt"
)

type Message struct {
	User    string                 `json:"user"`
	Type    string                 `json:"type"`
	Status  string                 `json:"status"`
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
	Name        string                              `json:"name"`
	Clients     map[*WebSocketConnection]ClientData `json:"clients"`
	Game        Game                                `json:"game"`
	ChatLobbyId string                              `json:"chatLobbyId"`
	IsPrivate   bool                                `json:"isPrivate"`
	LobbyKing   *WebSocketConnection                `json:"lobbyKing"`
}

func MakeChatRoom(chatLobbyId string, isPrivate bool) ChatRoom {
	return ChatRoom{
		Name:        chatLobbyId,
		Clients:     make(map[*WebSocketConnection]ClientData),
		ChatLobbyId: chatLobbyId,
		IsPrivate:   isPrivate,
	}
}

func (h ChatRoom) RemoveClient(conn *WebSocketConnection) {
	fmt.Println("Removing client from chat room")
	delete(h.Clients, conn)
}

type ChatRoomJSON struct {
	Name        string   `json:"name"`
	Clients     []string `json:"clients"`
	ChatLobbyId string   `json:"chatLobbyId"`
	IsPrivate   bool     `json:"isPrivate"`
	LobbyKing   string   `json:"lobbyKing"`
}

func (chatRoom ChatRoom) ToJSON() ChatRoomJSON {
	tempRoom := ChatRoomJSON{
		Name:        chatRoom.Name,
		Clients:     make([]string, 0, len(chatRoom.Clients)),
		ChatLobbyId: chatRoom.ChatLobbyId,
		IsPrivate:   chatRoom.IsPrivate,
		LobbyKing:   fmt.Sprintf("%p", chatRoom.LobbyKing), // Convert pointer to string
	}

	for _, clientData := range chatRoom.Clients {
		tempRoom.Clients = append(tempRoom.Clients, clientData.DisplayName)
	}

	return tempRoom
}

type User struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
	Token string `json:"token"`
}
