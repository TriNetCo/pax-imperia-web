package models

import (
	"github.com/gorilla/websocket"
)

type WebSocketConnection interface {
	WriteJSON(v interface{}) error
	Close() error
	ReadMessage() (messageType int, p []byte, err error)
	GetConn() *websocket.Conn
}

type WebSocketConnAdapter struct {
	Conn *websocket.Conn
}

// The rest of the junk in this file makes it so the websocket code can
// be tested without having to actually use websockets wich smell like cheese.

func (adapter *WebSocketConnAdapter) WriteJSON(v interface{}) error {
	return adapter.Conn.WriteJSON(v)
}

func (adapter *WebSocketConnAdapter) Close() error {
	return adapter.Conn.Close()
}

func (adapter *WebSocketConnAdapter) ReadMessage() (messageType int, p []byte, err error) {
	return adapter.Conn.ReadMessage()
}

func (adapter *WebSocketConnAdapter) GetConn() *websocket.Conn {
	return adapter.Conn
}
