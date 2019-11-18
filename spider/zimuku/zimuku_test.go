package zimuku

import (
	"fmt"
	"testing"
)

func Test1(t *testing.T) {
	fmt.Println("test")
	//testGetPageList()
	//testGetFuzzyPageList()
	//testGetDetailList()
	//testDownList()

	fmt.Println(DownContent("/detail/101144.html"))
}

func testGetPageList() {
	getPageList("downsizing.2017")
	//myhttp.Get(fmt.Sprintf("%s/search?q=%s", baseUrl, url.QueryEscape("asdf")))
}
func testGetFuzzyPageList() {
	fmt.Println(getFuzzyPageList("From.Beijing.with.Love.1994.720p.BluRay.x264-WiKi.mkv"))
}
func testGetDetailList() {
	getDetailList("/subs/36321.html")
}

func testDownList() {
	//var a = DownList("From.Beijing.with.Love.1994.720p.BluRay.x264-WiKi.mkv")
	var a = DownList("downsizing.2017.720p.bluray.x264-geckos.mkv")

	fmt.Println(a)
}
