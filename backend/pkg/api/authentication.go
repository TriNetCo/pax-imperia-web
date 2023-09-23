package api

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	firebase "firebase.google.com/go"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
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
		err = fmt.Errorf("error initializing app: %v", initErr)
		return
	}

	client, err := app.Auth(context.Background())
	if err != nil {
		err = fmt.Errorf("error getting Auth client: %v", err)
		return
	}

	validatedToken, err := client.VerifyIDToken(context.Background(), token)
	if err != nil {
		err = fmt.Errorf("error verifying ID token: %v", err)
		return
	}

	log.Printf("Verified ID token: %v", validatedToken)
	isValid = true
	email = validatedToken.Claims["email"].(string)
	uid = validatedToken.UID
	return
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

func doTest(c *gin.Context) {

	// sample token string taken from the New example
	// tokenString := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJuYmYiOjE0NDQ0Nzg0MDB9.u1riaD1rW97opCoAuRCTy4w58Br-Zk-bh7vLiRIsrpU"
	tokenString := "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiI0ZDJjM2M2YS05ZWEyLTRlMjgtYjBmNC02YzY1MjNhYzFlMzIiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vMGRhOGRlZWEtYTkzYi00ZWIxLTk3ZjQtMDdiMjY0ZDdkYzFlL3YyLjAiLCJpYXQiOjE2NzI1MzI1OTYsIm5iZiI6MTY3MjUzMjU5NiwiZXhwIjoxNjcyNTM2NDk2LCJhaW8iOiJBVlFBcS84VEFBQUFGTzR4SWFDSENNdDdLZWpaUTZ6czk3RHNHbzJzakdlVWdWcSszZ1NpU1laWHBrYmxYZ3RKQkpHSnJPMlRqWUpVaWJDZHg1SkZMK2lHVmdKNnNHejhwUnNzUHF0ckJvcndjS3dFRlFMUGJORT0iLCJlbWFpbCI6IlJvYmVydC5NYW5oYXR0b25AZGF1Z2hlcnR5LmNvbSIsIm5hbWUiOiJNYW5oYXR0b24sIFJvYiAoTVNQKSIsIm9pZCI6IjA5NmZmYTZjLTUzNjktNDRhZi1iNjU1LWQ3MjViODlhOTJmOSIsInByZWZlcnJlZF91c2VybmFtZSI6IlJvYmVydC5NYW5oYXR0b25AZGF1Z2hlcnR5LmNvbSIsInJoIjoiMC5BVmdBNnQ2b0RUdXBzVTZYOUFleVpOZmNIbW84TEUyaW5paE9zUFJzWlNPc0hqSllBT3MuIiwic3ViIjoiU2MxUjJlOURkN1dEZU5LUHlIMUpiX2xzYllsRDdBdDVrZi1WSUk0WlBOVSIsInRpZCI6IjBkYThkZWVhLWE5M2ItNGViMS05N2Y0LTA3YjI2NGQ3ZGMxZSIsInV0aSI6IlZ2WFh1R1d0TFVxNE1nbDhrcmZkQWciLCJ2ZXIiOiIyLjAifQ.ejb4H17Wuts1LmSRxjg-U-DjpSuV9tmXizaJHi_p_jscT4BWGxltV4tdiwf9kMhN6StP1ZIYZcduBD4L99_LKMjIdM7Oeyn0Lw8yjBz9GbceBtPvl0TQWJnTkMklISthqgBRXE515GYenFLXKll_ZqZEqx-ItFNCqz2BLreLzhOf6uJIirmY6--7hJf6IFOJle1yFEgQm-4cnXIZpxCam_GFP6HG8teka_2_3n1vLXKnKX--CIXn7L-qTYwoD5Oan4hp74DM7ZdUdp-lhX9yWKwrExKDhZUGDIAU5pq63mWUfG3ejZwdTbXwtom1_eG7VBce0CMsQg2kPFcojtzFwA"

	// Parse takes the token string and a function for looking up the key. The latter is especially
	// useful if you use multiple keys for your application.  The standard is to use 'kid' in the
	// head of the token to identify which key to use, but the parsed token (head and claims) is provided
	// to the callback, providing flexibility.
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Don't forget to validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		// hmacSampleSecret is a []byte containing your secret, e.g. []byte("my_secret_key")
		hmacSampleSecret := []byte("my_secret_key")
		return hmacSampleSecret, nil
	})

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		fmt.Println(claims["foo"], claims["nbf"])
	} else {
		fmt.Println(err)
	}

	fmt.Println("Testing")

}

// func newAttempt(c *gin.Context) {

// 	// Get the JWKS URL.
// 	jwksURL := "https://login.microsoftonline.com/common/discovery/v2.0/keys"

// 	// Create a context that, when cancelled, ends the JWKS background refresh goroutine.
// 	ctx, cancel := context.WithCancel(context.Background())

// 	// Create the keyfunc options. Use an error handler that logs. Refresh the JWKS when a JWT signed by an unknown KID
// 	// is found or at the specified interval. Rate limit these refreshes. Timeout the initial JWKS refresh request after
// 	// 10 seconds. This timeout is also used to create the initial context.Context for keyfunc.Get.
// 	options := keyfunc.Options{
// 		Ctx: ctx,
// 		RefreshErrorHandler: func(err error) {
// 			log.Printf("There was an error with the jwt.Keyfunc\nError: %s", err.Error())
// 		},
// 		RefreshInterval:   time.Hour,
// 		RefreshRateLimit:  time.Minute * 5,
// 		RefreshTimeout:    time.Second * 10,
// 		RefreshUnknownKID: true,
// 	}

// 	// Create the JWKS from the resource at the given URL.
// 	jwks, err := keyfunc.Get(jwksURL, options)
// 	if err != nil {
// 		log.Fatalf("Failed to create JWKS from resource at the given URL.\nError: %s", err.Error())
// 	}

// 	// Get a JWT to parse.
// 	//
// 	// This wasn't signed by Azure AD.
// 	jwtB64 := "eyJraWQiOiJlZThkNjI2ZCIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJXZWlkb25nIiwiYXVkIjoiVGFzaHVhbiIsImlzcyI6Imp3a3Mtc2VydmljZS5hcHBzcG90LmNvbSIsImlhdCI6MTYzMTM2OTk1NSwianRpIjoiNDY2M2E5MTAtZWU2MC00NzcwLTgxNjktY2I3NDdiMDljZjU0In0.LwD65d5h6U_2Xco81EClMa_1WIW4xXZl8o4b7WzY_7OgPD2tNlByxvGDzP7bKYA9Gj--1mi4Q4li4CAnKJkaHRYB17baC0H5P9lKMPuA6AnChTzLafY6yf-YadA7DmakCtIl7FNcFQQL2DXmh6gS9J6TluFoCIXj83MqETbDWpL28o3XAD_05UP8VLQzH2XzyqWKi97mOuvz-GsDp9mhBYQUgN3csNXt2v2l-bUPWe19SftNej0cxddyGu06tXUtaS6K0oe0TTbaqc3hmfEiu5G0J8U6ztTUMwXkBvaknE640NPgMQJqBaey0E4u0txYgyvMvvxfwtcOrDRYqYPBnA"

// 	// Parse the JWT.
// 	var token *jwt.Token
// 	if token, err = jwt.Parse(jwtB64, jwks.Keyfunc); err != nil {
// 		log.Fatalf("Failed to parse the JWT.\nError: %s", err.Error())
// 	}

// 	// Check if the token is valid.
// 	if !token.Valid {
// 		log.Fatalf("The token is not valid.")
// 	}
// 	log.Println("The token is valid.")

// 	// End the background refresh goroutine when it's no longer needed.
// 	cancel()

// 	// This will be ineffectual because the line above this canceled the parent context.Context.
// 	// This method call is idempotent similar to context.CancelFunc.
// 	jwks.EndBackground()
// }

type user struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
	Token string `json:"token"`
}

var users = []user{
	{ID: 1, Name: "John Doe", Email: "John@example.com", Role: "admin", Token: "blah"},
	{ID: 2, Name: "Jane Doe", Email: "jane@example.com", Role: "user", Token: "blahblah"},
}

func getUsers(c *gin.Context) {
	c.JSON(http.StatusOK, users)
	// c.JSON(http.StatusOK, gin.H{
	// 	"code":    http.StatusOK,
	// 	"message": users})
}

func deleteUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		fmt.Println("param 'id' was not an int")
	}

	var deletedId user
	deletedId.ID = id

	c.JSON(http.StatusOK, deletedId)
}
