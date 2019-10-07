package server

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/Andyfoo/go-xutils/xlog"

	"github.com/gorilla/websocket"
)

type WsClientManager struct {
	clients    map[*WsClient]bool
	broadcast  chan []byte
	register   chan *WsClient
	unregister chan *WsClient
}
type WsClient struct {
	id     string
	socket *websocket.Conn
	send   chan []byte
}

type WsMessage struct {
	Sender    string `json:"sender,omitempty"`
	Recipient string `json:"recipient,omitempty"`

	Cmd     string      `json:"cmd,omitempty"`
	Result  int         `json:"result,omitempty"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

var WsManager = WsClientManager{
	broadcast:  make(chan []byte),
	register:   make(chan *WsClient),
	unregister: make(chan *WsClient),
	clients:    make(map[*WsClient]bool),
}

func (WsManager *WsClientManager) start() {
	for {
		select {
		case conn := <-WsManager.register:
			WsManager.clients[conn] = true
			WsManager.BroadcastSend(WsManager.Data2Message("", "", "message", 0, "A new socket has connected"), conn)

			xlog.Infof("new connected: client.id=%v", conn.id)
		case conn := <-WsManager.unregister:
			if _, ok := WsManager.clients[conn]; ok {
				close(conn.send)
				delete(WsManager.clients, conn)
				WsManager.BroadcastSend(WsManager.Data2Message("", "", "message", 0, "A socket has disconnected"), conn)
				xlog.Infof("disconnected: client.id=%v", conn.id)
			}
		case message := <-WsManager.broadcast:
			for conn := range WsManager.clients {
				select {
				case conn.send <- message:
				default:
					close(conn.send)
					delete(WsManager.clients, conn)
				}
			}
		}
	}
}

func (WsManager *WsClientManager) BroadcastSend(message []byte, ignore *WsClient) {
	for conn := range WsManager.clients {
		if conn != ignore {
			conn.send <- message
		}
	}
}

func (WsManager *WsClientManager) Data2Message(sender string, recipient string, cmd string, result int, message string, data ...interface{}) []byte {
	var wsMessage WsMessage
	if data != nil && len(data) > 0 {
		wsMessage.Data = data[0]
	}
	wsMessage.Sender = sender
	wsMessage.Recipient = recipient
	wsMessage.Cmd = cmd
	wsMessage.Result = result
	wsMessage.Message = message
	dataB, err := json.Marshal(wsMessage)
	if err != nil {
		xlog.Error(err)
		return []byte{}
	}
	return dataB
}

func (c *WsClient) read() {
	defer func() {
		WsManager.unregister <- c
		c.socket.Close()
	}()

	for {
		_, message, err := c.socket.ReadMessage()
		if err != nil {
			WsManager.unregister <- c
			c.socket.Close()
			break
		}
		xlog.Infof("read message: client.id=%v, message=%v", c.id, string(message))
		jsonMessage := WsManager.Data2Message(c.id, "", "message", 0, "ok", message)
		WsManager.broadcast <- jsonMessage
	}
}

func (c *WsClient) write() {
	defer func() {
		c.socket.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.socket.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			c.socket.WriteMessage(websocket.TextMessage, message)

			xlog.Infof("write message: client.id=%v, message=%v", c.id, string(message))
		}
	}
}

var wsUpgrader = websocket.Upgrader{
	// 解决跨域问题
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func RegHandle_websocket() {
	go WsManager.start()
	http.HandleFunc("/api/ws", h_api_ws)

}

func h_api_ws(res http.ResponseWriter, req *http.Request) {
	conn, error := wsUpgrader.Upgrade(res, req, nil)
	if error != nil {
		http.NotFound(res, req)
		return
	}
	client := &WsClient{
		id:     strconv.FormatInt(time.Now().UnixNano(), 10),
		socket: conn,
		send:   make(chan []byte),
	}
	xlog.Info("client.id=", client.id)

	WsManager.register <- client

	go client.read()
	go client.write()

}
