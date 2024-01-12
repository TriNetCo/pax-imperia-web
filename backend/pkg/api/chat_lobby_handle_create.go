package api

import (
	"fmt"
	"strings"

	. "github.com/trinetco/pax-imperia-clone/pkg/models"
	"github.com/trinetco/pax-imperia-clone/pkg/util"
)

// ChatLobbyErrorSlice type to hold a slice of error strings.
type ChatLobbyErrorSlice []string

// Error implements the error interface for ChatLobbyErrorSlice.
func (e ChatLobbyErrorSlice) Error() string {
	return strings.Join(e, "; ")
}

func HandleCreateChatLobby(conn WebSocketConnection, message Message) error {
	isPrivate, err := validateCreateChatLobbyInputs(message)
	if err != nil {
		fmt.Println(err)
		return err
	}

	// Determine next chatroomId
	chatLobbyId, err := generateChatLobbyId()
	if err != nil {
		fmt.Println(err)
		return err
	}

	// Create the chat room
	chatRoom, err := CreateChatRoom(chatLobbyId, isPrivate)
	if err != nil {
		fmt.Println(err)
		return err
	}

	// Add the joining client to the chat room
	chatRoom.Clients[conn] = clients[conn]
	chatRooms[chatLobbyId] = chatRoom

	// Fire back response to client
	respondToJoiner(conn, chatRoom)

	fmt.Printf("Client created lobby: %s -> %s\n", clients[conn].DisplayName, chatLobbyId)
	return nil
}

func validateCreateChatLobbyInputs(message Message) (isPrivate bool, e error) {
	isPrivateStr, ok := message.Payload["isPrivate"].(string)

	if !ok {
		return
	}

	if isPrivateStr == "true" {
		isPrivate = true
	}

	return
}

func CreateChatRoom(chatLobbyId string, isPrivate bool) (ChatRoom, error) {
	if _, exists := chatRooms[chatLobbyId]; exists {
		msg := "a ChatRoom with that chatLobbyId already exists"
		return ChatRoom{}, fmt.Errorf(msg)
	}

	fmt.Printf("Creating lobby: %s\n", chatLobbyId)

	chatRoom := MakeChatRoom(chatLobbyId, isPrivate)
	return chatRoom, nil
}

func generateChatLobbyId() (string, error) {

	// this loop is to make sure we don't generate a chatLobbyId that already exists
	maxTries := 10
	for i := 0; i < maxTries; i++ {
		chatLobbyId := util.GenerateRandomString(20)

		if _, exists := chatRooms[chatLobbyId]; !exists {
			return chatLobbyId, nil
		}
	}

	return "", fmt.Errorf("failed to generate a unique chatLobbyId after %d tries... weird", maxTries)
}
