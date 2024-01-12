package util

import "math/rand"

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

func GenerateRandomString(length int) string {
	b := make([]rune, length)
	for i := range b {
		b[i] = RandomLetter()
	}
	return string(b)
}

func RandomLetter() rune {
	return letters[rand.Intn(len(letters))]
}
