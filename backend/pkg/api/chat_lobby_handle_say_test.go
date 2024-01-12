package api

import (
	"encoding/json"
	"testing"

	. "github.com/trinetco/pax-imperia-clone/pkg/models"
	"github.com/trinetco/pax-imperia-clone/pkg/testutils"
)

func TestHandleSay(t *testing.T) {
	tests := []struct {
		name                string
		messagePayload      string
		mockWsResponse      Message
		putClientInChatRoom bool
		expectError         bool
	}{
		/////////////////////////
		// Test Definitions... //
		/////////////////////////
		{
			"valid say",
			`{"chatLobbyId": "1234", "message": "hello world", "user": "Its Me", "email": "me@example.com"}`,
			Message{Type: "SYSTEM_MESSAGE_NEW_MESSAGE", Payload: map[string]interface{}{"message": "hello world", "user": "Its Me", "email": "me@example.com"}},
			true,
			false,
		},
		{
			"invalid say, not in a chatroom",
			`{"chatLobbyId": "1234", "message": "hello world", "user": "Its Me", "email": "me@example.com"}`,
			Message{},
			false,
			true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			//
			// Setup Test
			//

			// Extract message to send from test definition
			var payload map[string]interface{} = make(map[string]interface{})
			json.Unmarshal([]byte(tt.messagePayload), &payload)
			message := Message{
				Type:    "NEW_MESSAGE",
				Payload: payload,
			}

			// Mock WebSocketConnection
			mockWsConn := testutils.MockWsConnection{}
			var conn WebSocketConnection = &mockWsConn
			if tt.mockWsResponse.Type != "" {
				mockWsConn.On("WriteJSON", tt.mockWsResponse).Return(nil)
			}

			chatLobbyId := payload["chatLobbyId"].(string)
			chatRoom := MakeChatRoom(chatLobbyId, false, &conn)

			// put client in chatRoom
			if tt.putClientInChatRoom {
				client := ClientData{}
				client.DisplayName = payload["user"].(string)
				client.Email = payload["email"].(string)
				chatRoom.Clients[&conn] = client
			}

			// Put chatRoom in chatRooms
			chatRooms[chatLobbyId] = chatRoom

			///////////////////////////////////////
			// Call the function being tested... //
			///////////////////////////////////////
			err := handleSay(&conn, message)

			//
			// Do validations
			//

			if tt.expectError && err == nil {
				t.Errorf("Expected an error, but got none")
			} else if !tt.expectError && err != nil {
				t.Errorf("Didn't expect an error, but got: %v", err)
			}

			mockWsConn.AssertExpectations(t)
		})
	}
}
