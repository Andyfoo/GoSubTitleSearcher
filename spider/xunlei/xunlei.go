package xunlei

import (
	"GoSubTitleSearcher/utils"
	"crypto/sha1"
	"errors"
	"fmt"
	"os"

	"encoding/json"
	"math"

	"github.com/Andyfoo/go-xutils/xlog"
	"github.com/Andyfoo/go-xutils/xvar"
)

type Sublist struct {
	Scid     string `json:"scid"`
	Sname    string `json:"sname"`
	Language string `json:"language"`
	Rate     string `json:"rate"`
	Surl     string `json:"surl"`
	Svote    int64  `json:"svote"`
	Roffset  int64  `json:"roffset"`
}

type SublistSlice struct {
	Sublist []Sublist
}

func GetList(filePath string) (*SublistSlice, error) {
	cid := getCid(filePath)
	var jsonList SublistSlice
	if len(cid) == 0 {
		xlog.Error("cid is empty")
		return &jsonList, errors.New("cid is empty")
	}
	var result = utils.HUtil.Get(fmt.Sprintf("http://sub.xmp.sandai.net:8000/subxl/%s.json", cid))
	if xvar.IsEmpty(result) {
		xlog.Error("result is null")
		return &jsonList, errors.New("result is null")
	}
	//xlog.Info(result)

	err := json.Unmarshal([]byte(result), &jsonList)
	if err != nil {
		xlog.Error(err)
		return &jsonList, err
	}
	//fmt.Println(jsonList.Sublist[0])
	newSublist := []Sublist{}
	for _, v := range jsonList.Sublist {
		if len(v.Scid) > 0 {
			newSublist = append(newSublist, v)
		}

	}
	jsonList.Sublist = newSublist
	//fmt.Println("jsonList=", newSublist)
	return &jsonList, nil
}

func getCid(filePath string) (hash string) {
	hash = ""
	sha1Ctx := sha1.New()

	fp, err := os.Open(filePath)
	if err != nil {
		xlog.Error(err)
		return
	}
	defer fp.Close()
	stat, err := fp.Stat()
	if err != nil {
		xlog.Error(err)
		return
	}
	fileLength := int64(stat.Size())
	if fileLength < 0xF000 {
		// var buffer = make([]byte, 0xF000)
		// fp.Seek(0, os.SEEK_SET)
		// fp.Read(buffer)
		// hash = fmt.Sprintf("%x", sha1Ctx.Sum(buffer))
		return
	}
	bufferSize := int64(0x5000)
	positions := []int64{0, int64(math.Floor(float64(fileLength) / 3)), fileLength - bufferSize}
	for _, position := range positions {
		var buffer = make([]byte, bufferSize)
		fp.Seek(position, os.SEEK_SET)
		fp.Read(buffer)
		sha1Ctx.Write(buffer)
	}

	hash = fmt.Sprintf("%X", sha1Ctx.Sum(nil))
	return
}
