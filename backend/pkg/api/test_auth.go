package api

import (
	"context"
	"fmt"
	"log"

	firebase "firebase.google.com/go"
)

func TestAuthStuff() {
	// https://firebase.google.com/docs/admin/setup#go
	// https://firebase.google.com/docs/auth/admin/verify-id-tokens#go
	// opt := option.WithCredentialsFile("secrets/pax-imeria-clone-firebase-adminsdk-b7dfw-1c36eb54cd.json")
	app, err := firebase.NewApp(context.Background(), nil)
	if err != nil {
		fmt.Errorf("error initializing app: %v", err)
		return
	}

	fmt.Print(app)

	client, err := app.Auth(context.Background())
	if err != nil {
		log.Fatalf("error getting Auth client: %v\n", err)
	}

	/*
		Ok... I have it working so that an OAuth thing is created via the web app,
		but when I try to validate it, it says it isn't valid to my configs.

		I need to read this next:  https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-create-new-tenant
	*/

	idToken := "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijg3NTNiYmFiM2U4YzBmZjdjN2ZiNzg0ZWM5MmY5ODk3YjVjZDkwN2QiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiciBtIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL3BheC1pbWVyaWEtY2xvbmUiLCJhdWQiOiJwYXgtaW1lcmlhLWNsb25lIiwiYXV0aF90aW1lIjoxNjcyNjE1NzgyLCJ1c2VyX2lkIjoiblBkN0RUMFkxV1ZVdlc3Y2NWNHl2QWNjOWFyMSIsInN1YiI6Im5QZDdEVDBZMVdWVXZXN2NjVjR5dkFjYzlhcjEiLCJpYXQiOjE2NzI2MTU3ODUsImV4cCI6MTY3MjYxOTM4NSwiZW1haWwiOiJ3YXN0eXhAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Im1pY3Jvc29mdC5jb20iOlsiMWM0YTMxZGU5OTQwNTkyNSJdLCJlbWFpbCI6WyJ3YXN0eXhAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoibWljcm9zb2Z0LmNvbSJ9fQ.gHWtdO-RkvCL7B-DVKu8fLpDTnT3WKGT3AbelSpGdCz9T1O-j6V2vD5QqSOUYAui_PpiyYqjzJ3GiMU3vjYmT14YdXwdc7be3uXY3LZ_venkx25imm_2PBIhDMV5yF8w6Pn8vRdEQQnFTQ4QaBFUZmcnAFK4-Emg8wxUESiNtY_67ocDK47BHDr7mIjwUkQH_EWz16u62WZYpoV_-G-5zzJhkyIpEhnhgUJaD5M0nY4ZQTNLQm6draYzB50ctpX8LyYRXDb1lGwYJpBhj9ebk-ujlyPhG1FTfxZpNzNQvfy9R-tyuBhZPQSYQ9CnGS0l0sunZeD7oOMhLft7_zBNOg"

	token, err := client.VerifyIDToken(context.Background(), idToken)
	if err != nil {
		log.Fatalf("error verifying ID token: %v\n", err)
	}

	email := token.Claims["email"]

	log.Printf("Verified ID token: %v\n", token)
	log.Printf("Email: %v\n", email)
}
