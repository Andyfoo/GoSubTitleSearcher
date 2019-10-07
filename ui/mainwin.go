package ui

import (
	"fmt"
	"runtime"
	"strings"
	"time"

	"strconv"
	//"time"

	//"fmt"

	"GoSubTitleSearcher/config"
	"GoSubTitleSearcher/server"

	"github.com/Andyfoo/go-xutils/xencode"
	"github.com/Andyfoo/go-xutils/xlog"

	"GoSubTitleSearcher/ui/upgrader"
	"GoSubTitleSearcher/utils/webview"
)

var (
	mw webview.WebView
)

func init() {
	//config.SetMovFile("E:/_tmp/mov/downsizing.2017.720p.bluray.x264-geckos.mkv")
}
func MainForm() {
	xlog.Info("MainForm")
	title := fmt.Sprintf("%s(%s) v%s", config.AppTitle, config.AppName, config.AppVer)
	if runtime.GOOS == "windows" {
		title = xencode.Utf8ToGbkStr(title)
	}

	go func() {
		upgrader.AutoCheckVersion(config.AppFileName, config.AppVer, config.AppPath, config.AppUpgradeUrl)
		time.Sleep(5 * time.Second)
		if upgrader.CheckNewVersion() {
			server.WsManager.BroadcastSend(server.WsManager.Data2Message("", "", "autocheck_version", 0, "ok"), nil)
		}
	}()
	webview.DropFilesCallbackFunc = func(w webview.WebView, data string) {
		//data = xencode.GbkToUtf8Str(data)
		xlog.Info("DropFilesCallbackFunc", data)
		if len(data) > 0 {
			config.SetMovFile(data)
			server.WsManager.BroadcastSend(server.WsManager.Data2Message("", "", "mov_file_change", 0, "ok", config.MovFileInfo), nil)
		}
	}
	serverUrl := server.ServerUrl + "/mainwin.html"
	xlog.Info("serverUrl:", serverUrl)
	mw = webview.New(webview.Settings{
		//Icon: "E:/workspace/go/_my_tools/GoSubTitleSearcher/res/icon/app.ico",
		IconId:                 11,
		Width:                  800,
		Height:                 600,
		Title:                  title,
		Resizable:              true,
		URL:                    serverUrl,
		ExternalInvokeCallback: handleRPC,
		Debug:                  false,
	})
	defer mw.Exit()

	//mw.SetIcon("E:/workspace/go/_my_tools/GoSubTitleSearcher/res/icon/app.ico")
	//mw.SetIconId(11)

	server.CB_SelectFile = func() string {
		var filepath = SelectFile()
		if len(filepath) > 0 && filepath != "error" && filepath != "cancel" {
			config.SetMovFile(filepath)
		}
		return filepath
	}

	server.CB_CopyClipboard = func(str string) {
		mw.CopyClipboard(str)
	}
	mw.Run()

}
func handleRPC(w webview.WebView, data string) {
	switch {
	case data == "close":
		w.Terminate()
	case data == "fullscreen":
		w.SetFullscreen(true)
	case data == "unfullscreen":
		w.SetFullscreen(false)
	case data == "open":
		xlog.Info("open", w.Dialog(webview.DialogTypeOpen, 0, "Open file", ""))
	case data == "opendir":
		xlog.Info("open", w.Dialog(webview.DialogTypeOpen, webview.DialogFlagDirectory, "Open directory", ""))
	case data == "save":
		xlog.Info("save", w.Dialog(webview.DialogTypeSave, 0, "Save file", ""))
	case data == "message":
		w.Dialog(webview.DialogTypeAlert, 0, "Hello", "Hello, world!")
	case data == "info":
		w.Dialog(webview.DialogTypeAlert, webview.DialogFlagInfo, "Hello", "Hello, info!")
	case data == "warning":
		w.Dialog(webview.DialogTypeAlert, webview.DialogFlagWarning, "Hello", "Hello, warning!")
	case data == "error":
		w.Dialog(webview.DialogTypeAlert, webview.DialogFlagError, "Hello", "Hello, error!")
	case strings.HasPrefix(data, "changeTitle:"):
		w.SetTitle(strings.TrimPrefix(data, "changeTitle:"))
	case strings.HasPrefix(data, "changeColor:"):
		hex := strings.TrimPrefix(strings.TrimPrefix(data, "changeColor:"), "#")
		num := len(hex) / 2
		if !(num == 3 || num == 4) {
			xlog.Info("Color must be RRGGBB or RRGGBBAA")
			return
		}
		i, err := strconv.ParseUint(hex, 16, 64)
		if err != nil {
			xlog.Info(err)
			return
		}
		if num == 3 {
			r := uint8((i >> 16) & 0xFF)
			g := uint8((i >> 8) & 0xFF)
			b := uint8(i & 0xFF)
			w.SetColor(r, g, b, 255)
			return
		}
		if num == 4 {
			r := uint8((i >> 24) & 0xFF)
			g := uint8((i >> 16) & 0xFF)
			b := uint8((i >> 8) & 0xFF)
			a := uint8(i & 0xFF)
			w.SetColor(r, g, b, a)
			return
		}
	}
}

func SelectFile() string {

	filepath := mw.Dialog(webview.DialogTypeOpen, 0, "选择视频文件", "视频文件 (*.mkv; *mp4)|*.mkv;*mp4;*.mov;*.avi;*.ts|所有文件 (*.*)|*.*")
	if filepath == "" {
		xlog.Error("Cancel")
		return "cancel"
	}
	return filepath
}
