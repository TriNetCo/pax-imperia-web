// api_test.go
package api

import (
	"testing"

	. "github.com/trinetco/pax-imperia-clone/pkg/testutils"
)

func TestHandleAuthenticate(t *testing.T) {
	mockConn := &MockWsConnection{}
	client := ClientData{}
	message := Message{
		Payload: map[string]interface{}{
			"displayName": "testUser",
			"email":       "test@example.com",
			"token":       "sampleToken",
		},
	}

	handleAuthenticate(mockConn, client, message)

	response, ok := mockConn.LastWrittenMessage.(Message)
	if !ok {
		t.Fatal("Expected a Message to be written to the connection")
	}

	if status, exists := response.Payload["status"]; !exists || status != "AUTHENTICATED" {
		t.Errorf("Expected status to be 'AUTHENTICATED', got %v", status)
	}
}
