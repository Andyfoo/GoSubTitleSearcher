package server

import (
	"testing"
	"time"
)

func Test1(t *testing.T) {
	testStart()
}
func testStart() {
	Start()
	time.Sleep(time.Duration(20) * time.Second)
}
