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
			`{"chatLobbyId": "1234", "message": "hello world", "user": "Its Me", "Email": "me@example.com"}`,
			Message{Command: "NEW_MESSAGE", Payload: map[string]interface{}{"chatLobbyId": "1234", "message": "hello world", "user": "Its Me", "Email": "me@example.com"}},
			true,
			false,
		},
		{
			"invalid say, not in a chatroom",
			`{"chatLobbyId": "1234", "message": "hello world", "user": "Its Me", "Email": "me@example.com"}`,
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

			mockWsConn := testutils.MockWsConnection{}
			var wsConn WebSocketConnection = &mockWsConn

			if tt.mockWsResponse.Command != "" {
				mockWsConn.On("WriteJSON", tt.mockWsResponse).Return(nil)
			}

			chatLobbyId := "1234"
			chatRoom := MakeChatRoom(chatLobbyId)

			// put client in chatRoom
			if tt.putClientInChatRoom {
				client := ClientData{}
				client.DisplayName = "Its Me"
				chatRoom.Clients[wsConn] = client
			}

			// Put chatRoom in chatRooms
			chatRooms[chatLobbyId] = chatRoom

			var payload map[string]interface{} = make(map[string]interface{})
			json.Unmarshal([]byte(tt.messagePayload), &payload)
			message := Message{
				Command: "NEW_MESSAGE",
				Payload: payload,
			}

			///////////////////////////////////////
			// Call the function being tested... //
			///////////////////////////////////////
			err := handleSay(wsConn, message)

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
