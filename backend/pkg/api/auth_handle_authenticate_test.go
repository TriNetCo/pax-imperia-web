package api

import (
	"encoding/json"
	"testing"

	. "github.com/trinetco/pax-imperia-clone/pkg/models"
	. "github.com/trinetco/pax-imperia-clone/pkg/testutils"
)

func TestHandleAuthenticate(t *testing.T) {
	tests := []struct {
		name           string
		messagePayload string
		mockWsResponse Message
		expectError    bool
	}{
		/////////////////////////
		// Test Definitions... //
		/////////////////////////
		{
			"valid authentication",
			`{"displayName": "Alice", "email": "alice@example.com", "token": "valid_token"}`,
			Message{Type: "AUTHENTICATE_RESPONSE", Payload: map[string]interface{}{"authStatus": "AUTHENTICATED"}},
			false,
		},
		{
			"invalid authentication, missing token",
			`{"displayName": "Bob", "email": "bob@example.com", "token": "invalid_token"}`,
			Message{Type: "AUTHENTICATE_RESPONSE", Payload: map[string]interface{}{"authStatus": "UNAUTHENTICATED"}},
			true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockWsConn := &MockWsConnection{}
			mockWsConn.On("WriteJSON", tt.mockWsResponse).Return(nil)
			conn := WebSocketConnection(mockWsConn)

			client := ClientData{}

			var payload map[string]interface{}
			json.Unmarshal([]byte(tt.messagePayload), &payload)
			message := Message{
				Type:    "AUTHENTICATE",
				Payload: payload,
			}

			///////////////////////////////////////
			// Call the function being tested... //
			///////////////////////////////////////
			err := handleAuthenticate(&conn, client, message)

			if tt.expectError && err == nil {
				t.Errorf("Expected an error, but got none")
			} else if !tt.expectError && err != nil {
				t.Errorf("Didn't expect an error, but got: %v", err)
			}
			mockWsConn.AssertExpectations(t)
		})
	}
}
