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
