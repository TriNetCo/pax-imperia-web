package api

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"sync"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/gorilla/websocket"
)

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

type album struct {
	ID     string  `json:"id"`
	Title  string  `json:"title"`
	Artist string  `json:"artist"`
	Price  float64 `json:"price"`
}

var albums = []album{
	{ID: "1", Title: "Blue Train", Artist: "John Coltrane", Price: 56.99},
	{ID: "2", Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99},
	{ID: "3", Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99},
}

// getAlbums responds with the list of all albums as JSON.
func getAlbums(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, albums)
}

var clients = make(map[*websocket.Conn]bool)
var clientsMux sync.Mutex

var wsupgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func wshandler(w http.ResponseWriter, r *http.Request) {
	wsupgrader.CheckOrigin = func(r *http.Request) bool { return true }
	conn, err := wsupgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Printf("Failed to set websocket upgrade: %+v", err)
		return
	}

	defer func() {
		clientsMux.Lock()
		delete(clients, conn)
		clientsMux.Unlock()
		conn.Close()
	}()

	clientsMux.Lock()
	// this map is kind of confusing, but we create a key for the client using the connection pointer, and set the value to true
	// we can access the connection pointer later to send messages to the client by iterating over the map
	// weird syntax, but it works
	// we could use an array of connections, but this is more efficient
	clients[conn] = true
	clientsMux.Unlock()

	for {
		messageType, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}
		fmt.Println("Received Message:", string(msg))
		// conn.WriteMessage(messageType, msg)  // this was how we originally just echoed back the message to the same client who sent it

		// broadcast message to all clients
		clientsMux.Lock()
		for client := range clients {
			if err := client.WriteMessage(messageType, msg); err != nil {
				log.Println(err)
				delete(clients, client)
			}
		}
		clientsMux.Unlock()
	}
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
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
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

func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "UP"})
}

func livenessCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "UP"})
}

func RunServer() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
		log.Printf("defaulting to port %s", port)
	}

	listenAddress := os.Getenv("LISTEN_ADDRESS")
	if listenAddress == "" {
		listenAddress = "localhost"
		log.Printf("defaulting to listenAddress %s", listenAddress)
	}

	// sc, err := subscription.GenerateSubscriptionController()

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{http.MethodGet, http.MethodPatch, http.MethodPost, http.MethodHead, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{"Content-Type", "X-XSRF-TOKEN", "Accept", "Origin", "X-Requested-With", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	router.NoRoute(gin.WrapH(http.FileServer(http.Dir("../pax-imperia-js"))))
	// router.GET("/auth_test", authTest)
	router.GET("/auth_test", handleAuthenticateUser)
	router.GET("/health", healthCheck)
	router.GET("/liveness", livenessCheck)
	router.GET("/albums", getAlbums)
	router.GET("/test", doTest)
	router.GET("/users", getUsers)
	router.GET("/users/", getUsers)
	router.DELETE("/users/:id", deleteUser)
	router.GET("/websocket", func(c *gin.Context) {
		wshandler(c.Writer, c.Request)
	})

	router.Run(listenAddress + ":" + port)
}
