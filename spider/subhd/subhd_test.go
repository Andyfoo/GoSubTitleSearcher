package subhd

import (
	"fmt"
	"testing"
)

func Test1(t *testing.T) {
	fmt.Println("test")
	//testGetPageList()
	testGetFuzzyPageList()
	//testGetDetailList()
	//testDownList()

	//fmt.Println(DownContent("/ar0/378333"))
	//DownContent("/ar0/377264")
}

func testGetPageList() {
	fmt.Println(getPageList("downsizing.2017"))
	//myhttp.Get(fmt.Sprintf("%s/search?q=%s", baseUrl, url.QueryEscape("asdf")))
}
func testGetFuzzyPageList() {
	//fmt.Println(getFuzzyPageList("downsizing.2017.720p.bluray.x264-geckos.mkv"))
	fmt.Println(getFuzzyPageList("Men.in.Black.International.2019.2160p.BluRay.REMUX.HEVC.DTS-HD.MA.TrueHD.7.1.Atmos-FGT.mkv"))
}
func testGetDetailList() {
	//fmt.Println(getDetailList("/do0/1307739"))
	getDetailList("/d/3578939")
}

func testDownList() {
	//var a = DownList("From.Beijing.with.Love.1994.720p.BluRay.x264-WiKi.mkv")
	var a = DownList("downsizing.2017.720p.bluray.x264-geckos.mkv")

	fmt.Println(a)
}
