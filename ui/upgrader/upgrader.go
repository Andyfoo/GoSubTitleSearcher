package upgrader

import (
	"archive/zip"
	"bytes"
	"compress/gzip"
	"crypto/md5"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/Andyfoo/go-xutils/xencode"
	"github.com/Andyfoo/go-xutils/xlog"
)

//版本号大
const VersionBig = 1

//版本号小
const VersionSmall = 2

//版本号相等
const VersionEqual = 0

type Config struct {
	Version string `json:"version"`
	Desc    string `json:"desc"`
	Type    string `json:"type"`
	Sign    string `json:"sign"`
	Url     string `json:"url"`
}

var JsonConfig Config
var (
	UpgradeUrl string
	AppPath    string
	AppName    string
	AppVer     string
)

func AutoCheckVersion(_AppName, _AppVer, _AppPath, _UpgradeUrl string) {
	UpgradeUrl = _UpgradeUrl
	AppPath = _AppPath
	AppName = _AppName
	AppVer = _AppVer
	DownUpgradeData()
}

func DownUpgradeData() {
	removeTmpFile()
	dataBytes := httpGet(UpgradeUrl)
	if dataBytes == nil {
		xlog.Errorf("upgrade config data is null\n")
		return
	}
	xlog.Infof("JsonConfig: %v\n", string(dataBytes))
	err := json.Unmarshal(dataBytes, &JsonConfig)
	if err != nil {
		xlog.Errorf("data to json error: %v\n", err)
		return
	}
	verCheck := compareStrVer(JsonConfig.Version, AppVer)
	if verCheck == VersionBig {
		xlog.Infof("find new version: %v\n", JsonConfig.Version)
	} else {
		xlog.Infof("app no update:remote=%v, local=%v\n", JsonConfig.Version, AppVer)
	}
}
func CheckNewVersion() bool {
	verCheck := compareStrVer(JsonConfig.Version, AppVer)
	if verCheck == VersionBig {
		return true
	} else {
		return false
	}
}
func UpgradeApp() bool {
	AppPath = FormatPathSys(AppPath + "/")
	upgradePath := FormatPathSys(AppPath + "/upgrade")
	upgradeFile := FormatPathSys(AppPath + "/upgrade.bat")

	Mkdir(upgradePath)

	if !CheckNewVersion() {
		return false
	}
	xlog.Infof("download: %v\n", JsonConfig.Url)
	appData := httpGet(JsonConfig.Url)
	xlog.Infof("\ndownload finish: filesize=%v\n", SizeFormat(float64(len(appData))))

	md5 := Md5(appData)
	if md5 != JsonConfig.Sign {
		xlog.Errorf("appData hash error: %v != %v\n", md5, JsonConfig.Sign)
		return false
	}

	//killRun()
	upgradeStr := ""
	upgradeStr += fmt.Sprintf("TASKKILL /F /IM %s\r\n", AppName)
	upgradeStr += fmt.Sprintf("ping -n 3 127.0.0.1>nul\r\n")

	if JsonConfig.Type == "zip" {
		unzip(appData, upgradePath)
		upgradeStr += fmt.Sprintf("xcopy /Q /E /Y \"%s\\%s\\*\" \"%s\"\r\n", upgradePath, strings.TrimRight(AppName, ".exe"), AppPath)
	} else if JsonConfig.Type == "exe" {
		ioutil.WriteFile(upgradePath+"/"+AppName, appData, 0755)
		upgradeStr += fmt.Sprintf("copy /Y \"%s\\%s\" \"%s%s\"\r\n", upgradePath, AppName, AppPath, AppName)
	} else {
		xlog.Errorf("type is error: %v\n", JsonConfig.Type)
		return false
	}
	upgradeStr += fmt.Sprintf("start %s%s\r\n", AppPath, AppName)
	upgradeStr = xencode.Utf8ToGbkStr(upgradeStr)
	ioutil.WriteFile(upgradeFile, []byte(upgradeStr), 0755)
	//fmt.Println(upgradeStr)
	runBatFile(upgradeFile)
	xlog.Infof("upgrade finish\n")

	return true
}
func removeTmpFile() {
	os.RemoveAll(AppPath + "upgrade")
	os.Remove(AppPath + "upgrade.bat")
}

func FormatPathSys(path string) string {
	re, _ := regexp.Compile("[\\\\/]+")
	path = re.ReplaceAllString(path, string(os.PathSeparator))
	return path
}
func Mkdir(path string) bool {
	err := os.Mkdir(path, 777)
	if err == nil {
		return true
	}
	return false
}
func runBatFile(file string) {
	cmd := exec.Command("cmd", "/c", file)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	err := cmd.Start()
	if err != nil {
		fmt.Println(err)
		return
	}

}

// func killRun() {
// 	cmd := exec.Command("TASKKILL", "/F", "/IM", AppName)
// 	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
// 	out, err := cmd.Output()
// 	if err != nil {
// 		fmt.Println(err)
// 		return
// 	}
// 	out, err = ioutil.ReadAll(transform.NewReader(bytes.NewReader(out), simplifiedchinese.GBK.NewDecoder()))
// 	if err != nil {
// 		fmt.Println(err)
// 		return
// 	}
// 	outStr := string(out)
// 	fmt.Println("out=", outStr)
// }

func unzip(zipData []byte, destDir string) error {
	//ioutil.WriteFile(destDir+"/a.zip", zipData, 0755)
	byteReader := bytes.NewReader(zipData)
	fmt.Println("unzip", byteReader.Len(), len(zipData))
	zipReader, err := zip.NewReader(byteReader, int64(byteReader.Len()))
	if err != nil {
		xlog.Error(err)
		return err
	}
	//defer zipReader.Close()

	for _, f := range zipReader.File {
		fpath := filepath.Join(destDir, f.Name)
		if f.FileInfo().IsDir() {
			os.MkdirAll(fpath, os.ModePerm)
		} else {
			if err = os.MkdirAll(filepath.Dir(fpath), os.ModePerm); err != nil {
				return err
			}

			inFile, err := f.Open()
			if err != nil {
				return err
			}
			defer inFile.Close()

			outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
			if err != nil {
				return err
			}
			defer outFile.Close()

			_, err = io.Copy(outFile, inFile)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

//计算md5
func Md5(buf []byte) string {
	hash := md5.New()
	hash.Write(buf)
	return fmt.Sprintf("%X", hash.Sum(nil))
}

//格式化大小
func SizeFormat(size float64) string {
	units := []string{"Byte", "KB", "MB", "GB", "TB"}
	n := 0
	for size > 1024 {
		size /= 1024
		n += 1
	}

	return fmt.Sprintf("%.2f %s", size, units[n])
}

func httpGet(urlStr string) []byte {
	urlStr += "?t=" + strconv.FormatInt(time.Now().UnixNano(), 10)
	xlog.Infof("get %s\n", urlStr)

	client := &http.Client{Transport: httpGetTransport()}
	req, err := http.NewRequest("GET", urlStr, nil)
	if err != nil {
		xlog.Errorf("http.NewRequest error: %v\n", err)
		return nil
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36")
	req.Header.Set("Referer", urlStr)
	resp, err := client.Do(req)
	if err != nil {
		xlog.Errorf("client.Do: %v\n", err)
		return nil
	}

	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		xlog.Errorf("http status error: %s,%d\n", resp.Status, resp.StatusCode)
		return nil
	}
	body := resp.Body
	if resp.Header.Get("Content-Encoding") == "gzip" {
		body, err = gzip.NewReader(resp.Body)
		if err != nil {
			xlog.Errorf("http resp unzip is failed,err: %v\n", err)
			return nil
		}
	}
	//fmt.Println("Content-Length", resp.Header.Get("Content-Length"))
	data, err := ioutil.ReadAll(body)
	if err != nil {
		xlog.Errorf("ioutil.ReadAll: %v\n", err)
		return nil
	}
	return data
}
func httpGetTransport() *http.Transport {
	return &http.Transport{
		TLSClientConfig:       &tls.Config{InsecureSkipVerify: true},
		Dial:                  httpTimeoutDialer(120*time.Second, 120*time.Second),
		TLSHandshakeTimeout:   120 * time.Second,
		ResponseHeaderTimeout: 120 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}
}
func httpTimeoutDialer(cTimeout time.Duration, rwTimeout time.Duration) func(net, addr string) (c net.Conn, err error) {
	return func(netw, addr string) (net.Conn, error) {
		conn, err := net.DialTimeout(netw, addr, cTimeout)
		if err != nil {
			return nil, err
		}
		conn.SetDeadline(time.Now().Add(rwTimeout))
		return conn, nil
	}
}
func compareStrVer(verA, verB string) int {

	verStrArrA := spliteStrByNet(verA)
	verStrArrB := spliteStrByNet(verB)

	lenStrA := len(verStrArrA)
	lenStrB := len(verStrArrB)

	if lenStrA != lenStrB {
		panic("版本号格式不一致")

	}

	return compareArrStrVers(verStrArrA, verStrArrB)
}

// 比较版本号字符串数组
func compareArrStrVers(verA, verB []string) int {

	for index, _ := range verA {

		littleResult := compareLittleVer(verA[index], verB[index])

		if littleResult != VersionEqual {
			return littleResult
		}
	}

	return VersionEqual
}

//
// 比较小版本号字符串
//
func compareLittleVer(verA, verB string) int {

	bytesA := []byte(verA)
	bytesB := []byte(verB)

	lenA := len(bytesA)
	lenB := len(bytesB)
	if lenA > lenB {
		return VersionBig
	}

	if lenA < lenB {
		return VersionSmall
	}

	//如果长度相等则按byte位进行比较

	return compareByBytes(bytesA, bytesB)
}

// 按byte位进行比较小版本号
func compareByBytes(verA, verB []byte) int {

	for index, _ := range verA {
		if verA[index] > verB[index] {
			return VersionBig
		}
		if verA[index] < verB[index] {
			return VersionSmall
		}

	}

	return VersionEqual
}

// 按“.”分割版本号为小版本号的字符串数组
func spliteStrByNet(strV string) []string {

	return strings.Split(strV, ".")
}
