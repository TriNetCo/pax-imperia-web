package server

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"github.com/trinetco/pax-imperia-clone/pkg/api"
)

func Run() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
		log.Printf("defaulting to port %s", port)
	}

	listenAddress := os.Getenv("LISTEN_ADDRESS")
	if listenAddress == "" {
		listenAddress = "localhost"
		log.Printf("defaulting to listenAddress %s", listenAddress)
		log.Println("AppEnv: ", getAppEnv())
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
	router.GET("/auth_test", api.HandleAuthenticateUser)
	router.GET("/health", healthCheck)
	router.GET("/liveness", livenessCheck)
	router.GET("/albums", api.GetAlbums)
	router.GET("/test", api.DoTest)
	router.GET("/users", api.GetUsers)
	router.GET("/users/", api.GetUsers)
	router.GET("/lobbies", api.GetChatRooms)
	router.GET("/lobbies/", api.GetChatRooms)
	router.DELETE("/users/:id", api.DeleteUser)
	router.GET("/websocket", func(c *gin.Context) {
		wshandler(c.Writer, c.Request)
	})

	// Run this in it's own thread thingy
	go func() {
		router.Run(listenAddress + ":" + port)
	}()

	time.Sleep(1 * time.Second)

	api.StartRepl()
}

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

	api.ListenToClientMessages(conn)
}

func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "UP"})
}

func livenessCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "UP"})
}

func getAppEnv() (appEnv string) {
	if rpm_env := os.Getenv("PAX_APP_ENV_GOLANG"); rpm_env != "" {
		return rpm_env
	}
	return "local-dev"
}
