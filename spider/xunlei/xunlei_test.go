package xunlei

import (
	"fmt"
	"testing"
)

func TestHttp(t *testing.T) {
	testGetCid()
	//testGetList()
}

func testGetList() {
	var a, _ = GetList("E:/_tmp/mov/downsizing.2017.720p.bluray.x264-geckos.mkv")

	fmt.Println(a)
}
func testGetCid() {
	var hash = getCid("E:/_tmp/mov/downsizing.2017.720p.bluray.x264-geckos.mkv")
	hash = getCid("D:/_win10/Users/FH/Documents/downsizing.2017.720p.bluray.x264-geckos.mkv")

	fmt.Println(hash)
}
