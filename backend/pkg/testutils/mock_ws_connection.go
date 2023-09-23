package testutils

import "github.com/gorilla/websocket"

type MockWsConnection struct {
	LastWrittenMessage interface{}
	Conn               *websocket.Conn
}

func (m *MockWsConnection) WriteJSON(v interface{}) error {
	m.LastWrittenMessage = v
	return nil
}

func (m *MockWsConnection) Close() error {
	return nil
}

func (m *MockWsConnection) ReadMessage() (messageType int, p []byte, err error) {
	return 0, nil, nil
}

func (m *MockWsConnection) GetConn() *websocket.Conn {
	return m.Conn
}
