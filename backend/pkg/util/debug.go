package util

import (
	"encoding/json"
	"fmt"

	"github.com/trinetco/pax-imperia-clone/pkg/models"
)

func DebugPrintStruct(response models.Message) {
	responseJson, _ := json.Marshal(response)
	fmt.Println("JOIN_CHAT_LOBBY_RESPONSE:\n", string(responseJson))
}
