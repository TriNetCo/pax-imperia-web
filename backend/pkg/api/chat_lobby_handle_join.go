package api

import (
	"fmt"

	. "github.com/trinetco/pax-imperia-clone/pkg/models"
	"github.com/trinetco/pax-imperia-clone/pkg/util"
)

func HandleJoinChatLobby(conn *WebSocketConnection, message Message) {
	// fmt.Println("Chat Room ID:", chatLobbyId)
	chatLobbyId, err := validateInputs(message)
	if err != nil {
		fmt.Println(err)
		return
	}

	chatRoom, err := findChatRoom(chatLobbyId, conn)
	if err != nil {
		fmt.Println(err)
		respondFailToJoiner(conn)
		return
	}

	// Check if the client has already joined the lobby
	if _, clientFound := chatRoom.Clients[conn]; clientFound {
		fmt.Println("Warn: Client attempted to join lobby but was already there")
		return
	}

	JoinClientToChatRoom(conn, chatRoom)

	respondSuccessToJoiner(conn, chatRoom)

	announceUserJoinedChat(conn, chatRoom)

	fmt.Printf("Client joined lobby: %s -> %s\n", clients[conn].DisplayName, chatLobbyId)
}

func validateInputs(message Message) (string, error) {
	chatLobbyId, ok := message.Payload["chatLobbyId"].(string)

	if !ok {
		msg := "Error: Chat Room ID not found or not a string"
		return "", fmt.Errorf(msg)
	}

	return chatLobbyId, nil
}

func findChatRoom(chatLobbyId string, conn *WebSocketConnection) (*ChatRoom, error) {
	chatRoom, exists := chatRooms[chatLobbyId]

	if !exists {
		msg := "Error: Chat Room not found"
		return chatRoom, fmt.Errorf(msg)
	}

	return chatRoom, nil
}

func respondSuccessToJoiner(conn *WebSocketConnection, chatRoom *ChatRoom) {
	var response = Message{
		Type: "JOIN_CHAT_LOBBY_RESPONSE",
		Payload: map[string]interface{}{
			"chatLobbyId":    chatRoom.ChatLobbyId,
			"chatLobbyUsers": GetChatLobbyUsers(chatRoom),
		},
	}

	if serverConfiguration.VerboseMode {
		util.DebugPrintStruct(response)
	}

	(*conn).WriteJSON(response)
}

func respondFailToJoiner(conn *WebSocketConnection) {
	var response = Message{
		Type: "JOIN_CHAT_LOBBY_RESPONSE",
		Payload: map[string]interface{}{
			"chatLobbyId": "lobby_not_found",
		},
	}

	(*conn).WriteJSON(response)
}

func announceUserJoinedChat(conn *WebSocketConnection, chatRoom *ChatRoom) {
	var userJoinAnnouncement = &Message{
		Type: "SYSTEM_MESSAGE_USER_JOINED_CHAT",
		Payload: map[string]interface{}{
			"status":      "success",
			"chatLobbyId": chatRoom.ChatLobbyId,
			"displayName": clients[conn].DisplayName,
			"email":       clients[conn].Email,
		},
	}

	SendMessageToAllButOneChatroomParticipant(chatRoom, userJoinAnnouncement, conn)
}
