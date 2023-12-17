package api

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func StartRepl() {
	scanner := bufio.NewScanner(os.Stdin)
	for {
		// read input from stdin
		fmt.Print("Enter command: ")
		scanner.Scan()

		input := scanner.Text()
		args := strings.Split(input, " ")

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

			fmt.Println("listing...", args[1])

			if args[1] == "chatrooms" {
				nChatrooms := len(chatRooms)
				// Print how many chatrooms there are
				fmt.Println("There are", nChatrooms, "chatrooms")

				if nChatrooms == 0 {
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
			} else if args[1] == "users" {
				fmt.Println("TODO: list users")
			}
		case "help":
			fmt.Println("Available commands:")
			fmt.Println(" - ls: lists api objects")
			fmt.Println(" - hello: Prints 'hello world'")
			fmt.Println(" - quit: Exits the program")
			fmt.Println(" - help: Displays this help message")
		case "hello":
			fmt.Println("hello world")
		default:
			fmt.Println("Unknown command. Type 'help' for a list of commands.")
		}
	}
}
