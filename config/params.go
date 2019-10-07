package config

import (
	"strings"

	"github.com/Andyfoo/go-xutils/xfile"
	"github.com/Andyfoo/go-xutils/xlog"
)

type MovFileInfoS struct {
	Filename string `json:"filename"`
	Filepath string `json:"filepath"`
	Basename string `json:"basename"`
	Title    string `json:"title"`
}
type SearchParmS struct {
	From_sheshou bool `json:"from_sheshou"`
	From_xunlei  bool `json:"from_xunlei"`
	From_zimuku  bool `json:"from_zimuku"`
	From_subhd   bool `json:"from_subhd"`
}

type DownParmS struct {
	FilenameType int    `json:"filenameType"`
	Simplified   bool   `json:"simplified"`
	Charset      string `json:"charset"`
}

/**
 * 文件名规则
 * 0=与视频同名
 * 1=与视频同名后再追加chn数字
 */
const (
	FilenameType_DEF = 0
	FilenameType_BAT = 1
)

var (
	MovFileInfo MovFileInfoS
	SearchParm  SearchParmS
)

func init() {
	SearchParm.From_sheshou = true
	SearchParm.From_xunlei = true
	SearchParm.From_zimuku = true
	SearchParm.From_subhd = false

}
func SetMovFile(filepath string) {
	if !xfile.FileIsExist(filepath) {
		xlog.Error("file no exists:", filepath)
		return
	}
	MovFileInfo.Filename = filepath
	MovFileInfo.Filepath = xfile.DirName(filepath)
	MovFileInfo.Basename = xfile.BaseName(filepath)
	MovFileInfo.Title = MovFileInfo.Basename
	if strings.Contains(MovFileInfo.Basename, ".") {
		MovFileInfo.Title = MovFileInfo.Basename[0:strings.LastIndex(MovFileInfo.Basename, ".")]
	}

	LastSelPath = MovFileInfo.Filepath

	xlog.Info(filepath)
}
