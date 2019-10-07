package server

import (
	"encoding/json"
	"net/http"
	"os/exec"

	"GoSubTitleSearcher/spider"

	"GoSubTitleSearcher/config"

	"github.com/Andyfoo/go-xutils/xlog"
)

type InitDataS struct {
	MovFileInfo config.MovFileInfoS `json:"movFileInfo"`
	SearchParm  config.SearchParmS  `json:"searchParm"`
}
type SearchDataS struct {
	SearchParm config.SearchParmS `json:"searchParm"`
}
type DownDataS struct {
	Index    int              `json:"index"`
	DownParm config.DownParmS `json:"downParm"`
}

type ArchiveDownDataS struct {
	Filename string           `json:"filename"`
	DownParm config.DownParmS `json:"downParm"`
}
type ArchiveDownDataListS struct {
	ArchiveKey string             `json:"archiveKey"`
	Items      []ArchiveDownDataS `json:"items"`
}

type CallBack_SelectFile func() string

var (
	CB_SelectFile CallBack_SelectFile
)

func RegHandle_mainwin() {
	http.HandleFunc("/api/mainwin/init", h_api_mainwin_init)
	http.HandleFunc("/api/mainwin/open_path", h_api_mainwin_open_path)
	http.HandleFunc("/api/mainwin/sel_file", h_api_mainwin_sel_file)

	http.HandleFunc("/api/mainwin/search_list", h_api_mainwin_search_list)
	http.HandleFunc("/api/mainwin/down", h_api_mainwin_down)

	http.HandleFunc("/api/mainwin/down_archive", h_api_mainwin_down_archive)
	http.HandleFunc("/api/mainwin/del_archive", h_api_mainwin_del_archive)

}
func h_api_mainwin_init(w http.ResponseWriter, req *http.Request) {
	var initData InitDataS
	initData.MovFileInfo = config.MovFileInfo
	initData.SearchParm = config.SearchParm

	OutJson(w, req, 0, "ok", initData)

}
func h_api_mainwin_open_path(w http.ResponseWriter, req *http.Request) {
	exec.Command(`cmd`, `/c`, `explorer`, config.LastSelPath).Start()

	OutJson(w, req, 0, "ok")

}
func h_api_mainwin_sel_file(w http.ResponseWriter, req *http.Request) {
	var filepath = CB_SelectFile()
	if filepath == "error" {
		OutJson(w, req, 1, "文件操作失败")
		return
	} else if filepath == "cancel" || filepath == "" {
		OutJson(w, req, 2, "取消选择文件")
		return
	}
	OutJson(w, req, 0, "ok", config.MovFileInfo)

}
func h_api_mainwin_search_list(w http.ResponseWriter, req *http.Request) {
	data := req.FormValue("data")
	xlog.Info(data)
	if data == "" {
		OutJson(w, req, 1, "请求数据错误")
		xlog.Info("data is empty")
		return
	}
	searchData := SearchDataS{}
	err := json.Unmarshal([]byte(data), &searchData)
	if err != nil {
		OutJson(w, req, 1, "请求数据错误")
		xlog.Info(err)
		return
	}
	spider.SearchList(searchData.SearchParm)
	OutJson(w, req, 0, "ok", spider.AllSublist)

}
func h_api_mainwin_down(w http.ResponseWriter, req *http.Request) {
	data := req.FormValue("data")
	//xlog.Info(data)
	if data == "" {
		OutJson(w, req, 1, "请求数据错误")
		xlog.Info("data is empty")
		return
	}
	downData := DownDataS{}
	err := json.Unmarshal([]byte(data), &downData)
	if err != nil {
		OutJson(w, req, 1, "请求数据错误")
		xlog.Info(err)
		return
	}
	downResult := spider.Down(downData.Index, downData.DownParm)
	xlog.Info("downResult:", downResult)
	if downResult.DResult == 1 {
		OutJson(w, req, 1, "下载错误")
		return
	} else if downResult.DResult == 2 {
		OutJson(w, req, 2, downResult.DMessage, downResult)
		return
	}
	OutJson(w, req, downResult.DResult, downResult.DMessage)

}
func h_api_mainwin_down_archive(w http.ResponseWriter, req *http.Request) {
	data := req.FormValue("data")
	//xlog.Info(data)
	if data == "" {
		OutJson(w, req, 1, "请求数据错误")
		xlog.Info("data is empty")
		return
	}
	downData := ArchiveDownDataListS{}
	err := json.Unmarshal([]byte(data), &downData)
	if err != nil {
		OutJson(w, req, 1, "请求数据错误")
		xlog.Info(err)
		return
	}
	_, archiveKeyExists := spider.FileInfoMap[downData.ArchiveKey]
	if downData.ArchiveKey == "" || !archiveKeyExists {
		xlog.Info("data is empty")

		OutJson(w, req, 1, "请求数据错误")
		return
	}
	succCount := 0
	for _, item := range downData.Items {
		if !spider.DownArchive(downData.ArchiveKey, item.Filename, item.DownParm) {
			OutJson(w, req, 1, "处理压缩文件错误")
			xlog.Info("处理压缩文件错误")
			return
		}
		succCount++
	}
	if succCount > 0 {
		OutJson(w, req, 0, "OK")
	} else {
		OutJson(w, req, 1, "处理压缩文件为空")
	}

}
func h_api_mainwin_del_archive(w http.ResponseWriter, req *http.Request) {

	archiveKey := req.FormValue("archiveKey")
	_, archiveKeyExists := spider.FileInfoMap[archiveKey]
	if archiveKey == "" || !archiveKeyExists {
		OutJson(w, req, 1, "请求数据错误")
		xlog.Info("data is empty")
		return
	}
	OutJson(w, req, 1, "error")
}
