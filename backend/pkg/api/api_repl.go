package api

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func StartRepl() {
	scanner := bufio.NewScanner(os.Stdin)
	lastCommand := ""
	secondToLastCommand := ""
	input := ""
	for {
		// read input from stdin
		fmt.Print("Enter command: ")
		scanner.Scan()

		input = scanner.Text()
		args := strings.Split(input, " ")

		if args[0] == "." { // repeat last command
			args = strings.Split(lastCommand, " ")
		} else if args[0] == ".." {
			args = strings.Split(secondToLastCommand, " ")
			lastCommand = secondToLastCommand
		} else { // repeat second to last command
			secondToLastCommand = lastCommand
			lastCommand = input
		}

		switch args[0] {

		case "quit", "q":
			fmt.Println("Exiting...")
			return

		case "ls":
			if len(args) < 2 {
				fmt.Println("API Objects:")
				fmt.Println("  chatrooms")
				fmt.Println("  users")
				fmt.Println("  games")
				break
			}

			// fmt.Println("listing...", args[1])

			switch args[1] {
			case "chatrooms", "c":
				nChatrooms := len(chatRooms)
				// Print how many chatrooms there are
				fmt.Println("There are", nChatrooms, "chatrooms")

				if nChatrooms == 0 {
					fmt.Println("")
					break
				}

				// Print the chatrooms
				fmt.Println("Chatrooms:")

				for _, chatroom := range chatRooms {
					fmt.Println(" - ", chatroom.Name)
					for _, client := range chatroom.Clients {
						fmt.Println("     <", client.DisplayName, ">")
					}
				}
				fmt.Println("")

			case "users":
				fmt.Println("TODO: list users")
			}

		case "clear", "c":
			for i := 0; i < 5; i++ {
				fmt.Println()
			}

		case "help":
			fmt.Println("Available commands:")
			fmt.Println(" - ls: lists api objects")
			fmt.Println(" - .: Repeats the last command")
			fmt.Println(" - ..: Repeats the second to last command and sets it to last command")
			fmt.Println(" - clear: enters 5 blank lines to help clear the screen")
			fmt.Println(" - quit: Exits the program")
			fmt.Println(" - help: Displays this help message")

		default:
			fmt.Println("Unknown command. Type 'help' for a list of commands.")
		}
	}
}
