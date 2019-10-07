package spider

import (
	"fmt"
	"testing"

	"GoSubTitleSearcher/config"
	//"GoSubTitleSearcher/spider/sheshou"
	//"GoSubTitleSearcher/utils/log"
)

func Test1(t *testing.T) {
	config.SetMovFile("E:/_tmp/mov/downsizing.2017.720p.bluray.x264-geckos.mkv")
	// var a, _ = sheshou.GetList("E:/_tmp/mov/downsizing.2017.720p.bluray.x264-geckos.mkv")
	// for k, v := range *a {
	// 	log.Info(k, v)
	// }
	testSearchList()

}
func testSearchList() {
	searchParm := config.SearchParmS{false, false, true, false}
	SearchList(searchParm)
	//GBK Big5 UTF-8
	//Down(1, config.DownParmS{config.FilenameType_DEF, true, "UTF-8"})
	downResult := Down(2, config.DownParmS{config.FilenameType_DEF, false, "UTF-8"})
	DownArchive(downResult.ArchiveKey, downResult.ArchiveFilelist[0].Filename, config.DownParmS{})

	fmt.Println(downResult)
}
