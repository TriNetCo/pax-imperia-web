package api

import (
	"fmt"

	. "github.com/trinetco/pax-imperia-clone/pkg/models"
)

func handleAuthenticate(conn WebSocketConnection, client ClientData, message Message) error {
	keys := []string{"displayName", "email", "token"}
	values, ok := extractFromPayload(message.Payload, keys...)
	if !ok {
		return fmt.Errorf("failed to extract values from payload")
	}

	authStatus := simpleValidateToken(values["token"])

	client.DisplayName = values["displayName"]
	client.Email = values["email"]
	client.Token = values["token"]
	client.AuthStatus = authStatus
	clients[conn.GetConn()] = client

	var response = Message{
		Command: "AUTHENTICATE_RESPONSE",
		Payload: map[string]interface{}{
			"status": authStatus,
		},
	}

	conn.WriteJSON(response)

	if authStatus == "UNAUTHENTICATED" {
		fmt.Printf("Client failed to authenticate: %s\n", values["displayName"])
		return fmt.Errorf("failed to authenticate")
	}

	fmt.Printf("Client authenticated: %s\n", values["displayName"])
	return nil
}

// TODO: check authentication.go for a better implementation
func simpleValidateToken(token string) string {
	if token == "invalid_token" {
		return "UNAUTHENTICATED"
	}
	return "AUTHENTICATED"
}
