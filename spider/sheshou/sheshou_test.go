package sheshou

import (
	"fmt"
	"testing"

	"github.com/Andyfoo/go-xutils/xlog"
)

func TestHttp(t *testing.T) {
	//testHash()
	testGetList()
}
func testHash() {
	var hash = ComputeFileHash("E:/_tmp/mov/downsizing.2017.720p.bluray.x264-geckos.mkv")
	fmt.Println(hash)
}

func testGetList() {
	var a, _ = GetList("E:/_tmp/mov/downsizing.2017.720p.bluray.x264-geckos.mkv")
	for k, v := range *a {
		xlog.Info(k, v)
	}
}
