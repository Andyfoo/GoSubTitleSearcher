package upgrader

import (
	"fmt"
	"testing"
)

func Test1(t *testing.T) {
	UpgradeUrl = "https://raw.githubusercontent.com/Andyfoo/my-apps/master/go/tools/GoSubTitleSearcher/last"
	AppPath = "E:/_tmp/test"
	AppName = "GoSubTitleSearcher.exe"
	AppVer = "1.0.0"

	fmt.Println("AppName", AppName)

	AutoCheckVersion(AppName, AppVer, AppPath, UpgradeUrl)

	//DownUpgradeData()
	fmt.Println("CheckNewVersion", CheckNewVersion())
	fmt.Println("UpgradeApp", UpgradeApp())
}
