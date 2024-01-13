package api

import (
	"fmt"
	"strings"

	. "github.com/trinetco/pax-imperia-clone/pkg/models"
	"github.com/trinetco/pax-imperia-clone/pkg/util"
)

var chatRoomIdLength = 6

// ChatLobbyErrorSlice type to hold a slice of error strings.
type ChatLobbyErrorSlice []string

// Error implements the error interface for ChatLobbyErrorSlice.
func (e ChatLobbyErrorSlice) Error() string {
	return strings.Join(e, "; ")
}

func HandleCreateChatLobby(conn *WebSocketConnection, message Message) error {

	// Handle input validation
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
	chatRoom, err := CreateChatRoom(chatLobbyId, isPrivate, conn)
	if err != nil {
		fmt.Println(err)
		return err
	}
	chatRooms[chatLobbyId] = chatRoom

	// Join the client to the chat room
	JoinClientToChatRoom(conn, chatRoom)

	// Fire back response to client
	respondSuccessToJoiner(conn, chatRoom)

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

func CreateChatRoom(chatLobbyId string, isPrivate bool, conn *WebSocketConnection) (*ChatRoom, error) {
	if _, exists := chatRooms[chatLobbyId]; exists {
		msg := "a ChatRoom with that chatLobbyId already exists"
		return &ChatRoom{}, fmt.Errorf(msg)
	}

	fmt.Printf("Creating lobby: %s\n", chatLobbyId)

	chatRoom := MakeChatRoom(chatLobbyId, isPrivate, conn)
	return chatRoom, nil
}

func generateChatLobbyId() (string, error) {

	// this loop is to make sure we don't generate a chatLobbyId that already exists
	maxTries := 10
	for i := 0; i < maxTries; i++ {
		chatLobbyId := util.GenerateRandomString(chatRoomIdLength)

		if _, exists := chatRooms[chatLobbyId]; !exists {
			return chatLobbyId, nil
		}
	}

	return "", fmt.Errorf("failed to generate a unique chatLobbyId after %d tries... weird", maxTries)
}
