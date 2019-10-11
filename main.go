package main

import (
	"GoSubTitleSearcher/config"
	"GoSubTitleSearcher/ui"
	"fmt"
	"os"

	"GoSubTitleSearcher/server"

	"github.com/Andyfoo/go-xutils/xlog"
)

func init() {
	//config.DisplayUrl = false

}
func main() {
	lf := xlog.OpenFile(config.AppPath + "/logs.txt")
	if lf == nil {
		fmt.Errorf("Failed to open log file")
		return
	}
	defer lf.Close()

	defer xlog.Init("APP", true, false, lf).Close()
	xlog.Info("############################ start app ################################")

	// if config.IsDebug {
	// 	xlog.Std = xlog.NewFile(config.AppPath+"/logs.txt", "", xlog.Ldefault)
	// }
	xlog.Infof("start...[%d]", os.Getpid())
	//当前目录 os.Getwd()
	if len(os.Args) > 1 {
		config.SetMovFile(os.Args[1])
	}
	server.Start()

	ui.MainForm()
}
func exitTask() {
	os.RemoveAll(config.TmpDataPath)
}
