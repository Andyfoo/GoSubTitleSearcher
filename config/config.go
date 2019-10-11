package config

import (
	"strings"

	"github.com/Andyfoo/go-xutils/xfile"

	"github.com/Andyfoo/go-xutils/xarchive/x7zip/x7zip_file"

	"github.com/Andyfoo/go-xutils/xarchive/x7zip"
)

var (
	AppName    = "GoSubTitleSearcher"
	AppTitle   = "字幕下载"
	AppVer     = "1.0.2"
	AppPubDate = "2019-10-11"

	AppUpgradeUrl = "https://raw.githubusercontent.com/Andyfoo/my-apps/master/go/tools/GoSubTitleSearcher/last"

	AppFileName string
	AppPath     string
	LastSelPath string
	TmpDataPath string
	SubExtNames []string

	IsDebug    = false
	DisplayUrl = false
)

func init() {
	//fmt.Println(xfile.GetCurrentPath())
	//fmt.Println(xfile.BaseName(xfile.SelfPath()))
	//fmt.Println(xfile.SelfDir())
	AppFileName = xfile.BaseName(xfile.SelfPath())
	AppPath = xfile.FormatPath(xfile.GetCurrentPath())
	TmpDataPath = xfile.FormatPath(AppPath + "/tmpData/")
	if !xfile.FileIsExist(TmpDataPath) {
		xfile.Mkdir(TmpDataPath)
	}
	x7zip_file.Init7zBin(AppPath + "/bin/")
	x7zip.BinPath = AppPath + "/bin/7z.exe"
	SubExtNames = []string{"sup", "srt", "ass", "ssa"}

	if xfile.FileIsExist(".debug") {
		IsDebug = true
		DisplayUrl = true
	}

}
func IsSubFile(filename string) bool {
	extName := xfile.ExtName(filename)
	extName = strings.ToLower(extName)
	for _, v := range SubExtNames {
		if extName == v {
			return true
		}
	}
	return false
}
