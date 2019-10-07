package server

import (
	"GoSubTitleSearcher/config"
	"net"

	//"fmt"
	"encoding/json"
	"io"
	"net/http"

	"GoSubTitleSearcher/server/fileserver"

	"github.com/Andyfoo/go-xutils/xencode"
	"github.com/Andyfoo/go-xutils/xfile"
	"github.com/Andyfoo/go-xutils/xlog"

	"github.com/GeertJohan/go.rice"
)

var ServerUrl string

type ResponseResult struct {
	Result  int         `json:"result"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func Start() {
	ServerUrl = startHttpServer()
	xlog.Info(ServerUrl)
}
func h_index(w http.ResponseWriter, req *http.Request) {
	io.WriteString(w, "app")

}
func h_app_info(w http.ResponseWriter, req *http.Request) {
	appInfo := make(map[string]string)
	appInfo["appVer"] = config.AppVer
	appInfo["appPubDate"] = config.AppPubDate
	appInfo["appName"] = config.AppName
	appInfo["appTitle"] = config.AppTitle
	appInfo["appExeName"] = xfile.BaseName(xfile.SelfPath())
	OutJson(w, req, 0, "OK", appInfo)
}
func h_res_logo(w http.ResponseWriter, req *http.Request) {
	//http.ServeFile(w, r, imgpath)
	w.Header().Set("Content-Type", "image/png")

	w.Write(xencode.Base64Decode([]byte(config.RES_IMG_LOGO)))

}
func startHttpServer() string {
	var ln net.Listener
	var err error
	if config.IsDebug {
		ln, err = net.Listen("tcp", "127.0.0.1:8080")
	} else {
		ln, err = net.Listen("tcp", "127.0.0.1:0")
	}

	if err != nil {
		xlog.Fatal(err)
	}
	//defer ln.Close()
	go func() {
		if xfile.FileIsExist("res/html/") {
			http.Handle("/", fileserver.FileServer(http.Dir(config.AppPath+"res/html/")))
		} else {
			http.Handle("/", fileserver.FileServer(rice.MustFindBox("../res/html/").HTTPBox()))
		}
		//http.HandleFunc("/", h_index)
		http.HandleFunc("/res/logo", h_res_logo)
		http.HandleFunc("/app_info", h_app_info)
		RegHandle_api()
		RegHandle_websocket()
		RegHandle_mainwin()
		xlog.Fatal(http.Serve(ln, nil))
	}()
	return "http://" + ln.Addr().String()
}
func OutJson(w http.ResponseWriter, req *http.Request, result int, message string, data ...interface{}) {
	var respResult ResponseResult
	if data != nil && len(data) > 0 {
		respResult.Data = data[0]
	}

	respResult.Result = result
	respResult.Message = message
	dataB, err := json.Marshal(respResult)
	if err != nil {
		xlog.Error(err)
		return
	}

	WriteJson(w, req, dataB)
}
func WriteJson(w http.ResponseWriter, req *http.Request, data []byte) {
	w.Header().Set("Content-Type", "application/json;charset=utf-8")
	io.WriteString(w, string(data))
}
func WriteHtml(w http.ResponseWriter, req *http.Request, data string) {
	w.Header().Set("Content-Type", "text/html;charset=utf-8")
	io.WriteString(w, string(data))
}
