package server

import (
	"GoSubTitleSearcher/ui/upgrader"
	"net/http"
	"os/exec"
	"syscall"

	"github.com/Andyfoo/go-xutils/xencode"
	"github.com/Andyfoo/go-xutils/xlog"
)

type CallBack_CopyClipboard func(string)

var (
	CB_CopyClipboard CallBack_CopyClipboard
)

func RegHandle_api() {
	http.HandleFunc("/api/copy_clipboard", h_api_copy_clipboard)
	http.HandleFunc("/api/open_url", h_api_open_url)

	http.HandleFunc("/api/check_version", h_api_check_version)
	http.HandleFunc("/api/upgrade_version", h_api_upgrade_version)

}
func h_api_copy_clipboard(w http.ResponseWriter, req *http.Request) {
	data := req.FormValue("data")
	xlog.Info("copy_clipboard", data)

	CB_CopyClipboard(xencode.Utf8ToGbkStr(data))
	OutJson(w, req, 0, "ok")
}

func h_api_open_url(w http.ResponseWriter, req *http.Request) {
	url := req.FormValue("url")
	xlog.Info(url)

	cmd := exec.Command("cmd", "/c", "start", url)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	xlog.Info(cmd.Start())
	OutJson(w, req, 0, "ok")
}

func h_api_check_version(w http.ResponseWriter, req *http.Request) {
	if upgrader.CheckNewVersion() {
		OutJson(w, req, 0, "发现新版本", upgrader.JsonConfig)
	} else {
		OutJson(w, req, 1, "没有新版本")
	}

}

func h_api_upgrade_version(w http.ResponseWriter, req *http.Request) {
	if !upgrader.CheckNewVersion() {
		OutJson(w, req, 1, "没有新版本")
		return
	}
	if upgrader.UpgradeApp() {
		OutJson(w, req, 0, "升级成功")
	} else {
		OutJson(w, req, 1, "升级失败")
	}

}
