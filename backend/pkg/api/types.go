package api

import "github.com/gorilla/websocket"

type Message struct {
	User    string                 `json:"user"`
	Command string                 `json:"command"`
	Payload map[string]interface{} `json:"payload"`
}

type ClientData struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Games    []Game `json:"games"`
}

type Game struct {
	Id string `json:"id"`
}

type ChatRoom struct {
	Name    string
	Clients map[*websocket.Conn]bool
}
