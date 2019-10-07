package sheshou

import (
	"GoSubTitleSearcher/utils"
	"crypto/md5"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/url"
	"os"

	"github.com/Andyfoo/go-xutils/xfile"
	"github.com/Andyfoo/go-xutils/xlog"
	"github.com/Andyfoo/go-xutils/xvar"
)

type Files struct {
	Ext  string `json:"ext"`
	Link string `json:"link"`
}
type Sublist struct {
	Desc  string  `json:"desc"`
	Delay int64   `json:"delay"`
	Files []Files `json:"files"`
}

func GetList(filePath string) (*[]Sublist, error) {
	var jsonList []Sublist

	var data = url.Values{}
	data.Set("filehash", ComputeFileHash(filePath))
	data.Set("pathinfo", xfile.BaseName(filePath))
	data.Set("format", "json")
	data.Set("lang", "Chn")
	if len(data.Get("filehash")) == 0 {
		xlog.Error("filehash is empty")
		return &jsonList, errors.New("filehash is empty")
	}
	var result = utils.HUtil.Post("https://www.shooter.cn/api/subapi.php", data)
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
	//fmt.Println(jsonList)
	// for k, v := range jsonList {
	// 	xlog.Info(k, v)
	// }
	return &jsonList, nil
}

func ComputeFileHash(filePath string) (hash string) {
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
	size := float64(stat.Size())
	if size < 0xF000 {
		return
	}
	sample_positions := [4]int64{
		4 * 1024,
		int64(math.Floor(size / 3 * 2)),
		int64(math.Floor(size / 3)),
		int64(size - 8*1024)}
	var samples [4][]byte
	for i, position := range sample_positions {
		samples[i] = make([]byte, 4*1024)
		fp.ReadAt(samples[i], position)
	}
	for _, sample := range samples {
		if len(hash) > 0 {
			hash += ";"
		}
		hash += fmt.Sprintf("%x", md5.Sum(sample))
	}

	return
}
