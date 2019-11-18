package utils

import (
	"github.com/Andyfoo/go-xutils/xhttp"
)

var HUtil = xhttp.NewDefaultHttpUtil()

func init() {
	HUtil.UseCookie = true
}
