package models

import "github.com/gorilla/websocket"

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
	Name    string                         `json:"name"`
	Clients map[*websocket.Conn]ClientData `json:"clients"`
	Game    Game                           `json:"game"`
}

type User struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
	Token string `json:"token"`
}
