package testutils

import (
	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/mock"
)

type MockWsConnection struct {
	mock.Mock
	LastWrittenMessage interface{}
	Conn               *websocket.Conn
}

func (m *MockWsConnection) WriteJSON(v interface{}) error {
	args := m.Called(v)
	return args.Error(0)
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
