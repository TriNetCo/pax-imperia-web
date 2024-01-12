package util

import "math/rand"

var symbols = []rune("0123456789")

func GenerateRandomString(length int) string {
	b := make([]rune, length)
	for i := range b {
		b[i] = RandomSymbol()
	}
	return string(b)
}

func RandomSymbol() rune {
	return symbols[rand.Intn(len(symbols))]
}
