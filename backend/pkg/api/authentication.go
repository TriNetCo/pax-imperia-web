package api

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"

	firebase "firebase.google.com/go"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"google.golang.org/api/option"
)

type AuthenticationResponse struct {
	Authenticated bool `json:"authenticated"`
}

func handleAuthenticateUser(c *gin.Context) {
	token := strings.Replace(c.Request.Header["Authorization"][0], "Bearer ", "", 1)
	log.Printf("Recieved Authorization: %s", token)

	isValid, _, _, err := validateToken(token)
	if err != nil {
		log.Warn().Msg(err.Error())
	}

	if isValid {
		c.JSON(http.StatusOK, gin.H{"Authenticated": true})
		return
	}

	c.JSON(http.StatusOK, gin.H{"Authenticated": false})
	return
}

func validateToken(token string) (isValid bool, email string, uid string, err error) {
	if isFirebaseAuthDisabled() {
		log.Printf("Bypassing Token Varification per ENV RPM_FIREBASE_AUTH_DISABLED")
		isValid = true
		email = "fakeemail@daugherty.com"
		uid = "1234"
		return
	}

	app, initErr := initFirebaseApp()
	if initErr != nil {
		err = fmt.Errorf("error initializing app: %v\n", initErr)
		return
	}

	client, err := app.Auth(context.Background())
	if err != nil {
		err = fmt.Errorf("error getting Auth client: %v\n", err)
		return
	}

	validatedToken, err := client.VerifyIDToken(context.Background(), token)
	if err != nil {
		err = fmt.Errorf("error verifying ID token: %v\n", err)
		return
	}

	log.Printf("Verified ID token: %v", validatedToken)
	isValid = true
	email = validatedToken.Claims["email"].(string)
	uid = validatedToken.UID
	return
}

func getAppEnv() (appEnv string) {
	if rpm_env := os.Getenv("PAX_APP_ENV_GOLANG"); rpm_env != "" {
		return rpm_env
	}
	return "local-dev"
}

func isFirebaseAuthDisabled() (isFirebaseAuthEnabled bool) {
	if env_var := os.Getenv("PAX_FIREBASE_AUTH_DISABLED"); env_var != "" {
		return true
	}
	return false
}

// This function will instantiate firebase app using configFile if it exists,
// or without it (on gcp, firebase will look the configurations up from the
// cloud automatically)
func initFirebaseApp() (app *firebase.App, initErr error) {
	configFilePath := "secrets/serviceAccountKey.json"
	if _, er := os.Stat(configFilePath); er == nil {
		log.Print(configFilePath + " file detected, using it for firebase configurations.")
		opt := option.WithCredentialsFile(configFilePath)
		app, initErr = firebase.NewApp(context.Background(), nil, opt)
	} else {
		log.Print(configFilePath + " not found, using environment for firebase configurations.")
		app, initErr = firebase.NewApp(context.Background(), nil)
	}
	return
}
