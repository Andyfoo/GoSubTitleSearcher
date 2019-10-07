package spider

import (
	"GoSubTitleSearcher/spider/subhd"
	"GoSubTitleSearcher/utils"
	"bytes"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
	"sync"

	"github.com/Andyfoo/go-xutils/xarchive/x7zip"
	"github.com/Andyfoo/go-xutils/xtime"

	"GoSubTitleSearcher/config"

	"GoSubTitleSearcher/spider/sheshou"
	"GoSubTitleSearcher/spider/xunlei"

	"GoSubTitleSearcher/spider/zimuku"

	"github.com/Andyfoo/go-xutils/xlog"

	"github.com/Andyfoo/go-xutils/xencode/zh_s2t"
	"github.com/Andyfoo/go-xutils/xfile"

	"golang.org/x/text/encoding/simplifiedchinese"
	"golang.org/x/text/encoding/traditionalchinese"
	"golang.org/x/text/transform"
)

type AllSublistS struct {
	From  string      `json:"from"`
	Title string      `json:"title"`
	Ext   string      `json:"ext"`
	Rate  string      `json:"rate"`
	Data  interface{} `json:"data"`
}

type DownResultS struct {
	DResult  int    `json:"dResult"`
	DMessage string `json:"dMessage"`

	ArchiveKey      string `json:"archiveKey"`
	ArchiveFilename string `json:"archiveFilename"`
	ArchiveExt      string `json:"archiveExt"`
	ArchiveSize     int64  `json:"archiveSize"`

	ArchiveFilelist []FileInfoS `json:"archiveFilelist"`
}

type FileInfoS struct {
	Filepath string `json:"filepath"`
	Filename string `json:"filename"`
	Ext      string `json:"ext"`
	Size     int64  `json:"size"`
	Time     string `json:"time"`

	ZimuIndex    int    `json:"zimuIndex"`
	SaveFilepath string `json:"saveFilepath"`
}

var (
	AllSublist  = []AllSublistS{}
	FileInfoMap = make(map[string][]FileInfoS)
)

//下载指定字幕,downResult=0失败，1成功，2压缩文件
func Down(index int, downParm config.DownParmS) DownResultS {
	downResult := DownResultS{}
	if len(AllSublist) < index {
		xlog.Error("AllSublist 长度小于下载列表索引")
		downResult.DResult = 0
		downResult.DMessage = "长度小于下载列表索引"
		return downResult
	}
	sublistRow := AllSublist[index]
	from := sublistRow.From
	data := sublistRow.Data
	filepath := config.MovFileInfo.Filepath
	//filenameStr := config.MovFileInfo.Basename
	filenameBase := config.MovFileInfo.Title
	if from == "sheshou" {
		fileRow := data.(sheshou.Sublist)
		link := fileRow.Files[0].Link
		ext := fileRow.Files[0].Ext
		downResult = downAndSave(index, filepath+"/"+filenameBase, ext, link, downParm)
	} else if from == "xunlei" {
		fileRow := data.(xunlei.Sublist)
		link := fileRow.Surl
		ext := sublistRow.Ext
		downResult = downAndSave(index, filepath+"/"+filenameBase, ext, link, downParm)
	} else if from == "zimuku" {
		fileRow := data.(zimuku.ZimukuListItem)
		link := fileRow.Url
		downResult = downAndSaveZimuku(index, sublistRow, filepath+"/"+filenameBase, link, downParm)
	} else if from == "subhd" {
		fileRow := data.(subhd.SubhdListItem)
		link := fileRow.Url
		downResult = downAndSaveSubhd(index, sublistRow, filepath+"/"+filenameBase, link, downParm)
	}

	return downResult

}

//下载压缩文件中的字幕
func DownArchive(archiveKey string, downFilename string, downParm config.DownParmS) bool {
	fileinfolist, archiveKeyExists := FileInfoMap[archiveKey]
	if archiveKey == "" || !archiveKeyExists {
		xlog.Info("data is empty")
		return false
	}

	for index, fileinfo := range fileinfolist {
		if fileinfo.Filename == downFilename {
			zimuIndex := fileinfo.ZimuIndex
			filename := fileinfo.SaveFilepath
			if downParm.FilenameType == config.FilenameType_BAT {
				filename += fmt.Sprintf(".chn%d&%d.%s", zimuIndex+1, index+1, fileinfo.Ext)
			} else {
				filename += "." + fileinfo.Ext
			}

			if downParm.Simplified {
				xlog.Info("encode " + downParm.Charset)
				data, err := ioutil.ReadFile(fileinfo.Filepath)
				if err != nil {
					xlog.Error(err)
					return false
				}
				if downParm.Charset == "GBK" {
					data, err = ioutil.ReadAll(transform.NewReader(bytes.NewReader(data), simplifiedchinese.GBK.NewDecoder()))
				} else if downParm.Charset == "Big5" {
					data, err = ioutil.ReadAll(transform.NewReader(bytes.NewReader(data), traditionalchinese.Big5.NewDecoder()))
				} else {

				}
				if err != nil {
					xlog.Error("encode error")
					return false
				}
				dataStr := zh_s2t.ToSimp(string(data))
				xlog.Infof("save file:%s", filename)
				if ioutil.WriteFile(filename, []byte(dataStr), 0644) != nil {
					xlog.Error("写入文件失败:", filename)
					return false
				}
				return true
			} else {
				xlog.Infof("save file:%s", filename)
				r := xfile.CopyFile(fileinfo.Filepath, filename)
				if r == 0 {
					xlog.Error("copy fail")
					return false
				}
				return true
			}

		}
	}
	return false
}

func downAndSaveZimuku(index int, sublistRow AllSublistS, filename string, url string, downParm config.DownParmS) DownResultS {
	con := zimuku.DownContent(url)
	var err error
	if con == nil || len(con.Data) < 100 {
		return DownResultS{
			DResult:  1,
			DMessage: "下载数据为空",
		}
	}
	ext := con.Ext
	if con.Ext == "zip" || con.Ext == "rar" || con.Ext == "7z" {
		//"GoSubTitleSearcher/config"
		filelist := x7zip.UnRar(con.Ext, con.Data, config.TmpDataPath)
		//fmt.Println(filelist)
		fileinfolist := []FileInfoS{}
		for _, filepath := range filelist {
			filestat, err := os.Stat(filepath)
			if err != nil {
				xlog.Error("archive file error")
				return DownResultS{
					DResult:  1,
					DMessage: "压缩文件操作错误",
				}
			}
			if !config.IsSubFile(filestat.Name()) {
				continue
			}
			fileinfo := FileInfoS{}
			fileinfo.Filename = xfile.BaseName(filestat.Name())
			fileinfo.Ext = xfile.ExtName(filestat.Name())
			fileinfo.Filepath = filepath
			fileinfo.Size = filestat.Size()

			fileinfo.Time = xtime.CustomTime(filestat.ModTime()).DateTimeStr()

			fileinfo.ZimuIndex = index
			fileinfo.SaveFilepath = filename

			fileinfolist = append(fileinfolist, fileinfo)
		}
		archivekey := xtime.Now().PFormat("YmdHis")
		FileInfoMap[archivekey] = fileinfolist

		return DownResultS{
			DResult:         2,
			DMessage:        "压缩文件",
			ArchiveKey:      archivekey,
			ArchiveFilename: sublistRow.Title,
			ArchiveExt:      con.Ext,
			ArchiveSize:     int64(len(con.Data)),
			ArchiveFilelist: fileinfolist,
		}
	} else {
		if downParm.FilenameType == config.FilenameType_BAT {
			filename += fmt.Sprintf(".chn%d.%s", index+1, ext)
		} else {
			filename += "." + ext
		}
		xlog.Info("Simplified ", downParm)
		data := con.Data
		if downParm.Simplified {
			xlog.Info("encode " + downParm.Charset)
			if downParm.Charset == "GBK" {
				data, err = ioutil.ReadAll(transform.NewReader(bytes.NewReader(data), simplifiedchinese.GBK.NewDecoder()))
			} else if downParm.Charset == "Big5" {
				data, err = ioutil.ReadAll(transform.NewReader(bytes.NewReader(data), traditionalchinese.Big5.NewDecoder()))
			} else {

			}
			if err != nil {
				xlog.Error("encode error")
				return DownResultS{
					DResult:  1,
					DMessage: "编码异常",
				}
			}
			dataStr := zh_s2t.ToSimp(string(data))
			if ioutil.WriteFile(filename, []byte(dataStr), 0644) == nil {
				xlog.Info("写入文件成功:", filename)
				return DownResultS{
					DResult:  0,
					DMessage: "ok",
				}
			}

		} else {
			//fmt.Println(filename)
			if ioutil.WriteFile(filename, data, 0644) == nil {
				xlog.Info("写入文件成功:", filename)
				return DownResultS{
					DResult:  0,
					DMessage: "ok",
				}
			}
		}
	}

	return DownResultS{
		DResult:  1,
		DMessage: "下载失败",
	}
}

func downAndSaveSubhd(index int, sublistRow AllSublistS, filename string, url string, downParm config.DownParmS) DownResultS {

	con := subhd.DownContent(url)
	var err error
	if con == nil || len(con.Data) < 100 {
		return DownResultS{
			DResult:  1,
			DMessage: "下载数据为空",
		}
	}
	ext := con.Ext
	fmt.Println("downAndSaveSubhd", ext)
	if con.Ext == "zip" || con.Ext == "rar" || con.Ext == "7z" {
		//"GoSubTitleSearcher/config"
		filelist := x7zip.UnRar(con.Ext, con.Data, config.TmpDataPath)
		//fmt.Println(filelist)
		fileinfolist := []FileInfoS{}
		for _, filepath := range filelist {
			filestat, err := os.Stat(filepath)
			if err != nil {
				xlog.Error("archive file error")
				return DownResultS{
					DResult:  1,
					DMessage: "压缩文件操作错误",
				}
			}
			if !config.IsSubFile(filestat.Name()) {
				continue
			}
			fileinfo := FileInfoS{}
			fileinfo.Filename = xfile.BaseName(filestat.Name())
			fileinfo.Ext = xfile.ExtName(filestat.Name())
			fileinfo.Filepath = filepath
			fileinfo.Size = filestat.Size()

			fileinfo.Time = xtime.CustomTime(filestat.ModTime()).DateTimeStr()

			fileinfo.ZimuIndex = index
			fileinfo.SaveFilepath = filename

			fileinfolist = append(fileinfolist, fileinfo)
		}
		archivekey := xtime.Now().PFormat("YmdHis")
		FileInfoMap[archivekey] = fileinfolist

		return DownResultS{
			DResult:         2,
			DMessage:        "压缩文件",
			ArchiveKey:      archivekey,
			ArchiveFilename: sublistRow.Title,
			ArchiveExt:      con.Ext,
			ArchiveSize:     int64(len(con.Data)),
			ArchiveFilelist: fileinfolist,
		}
	} else {
		if downParm.FilenameType == config.FilenameType_BAT {
			filename += fmt.Sprintf(".chn%d.%s", index+1, ext)
		} else {
			filename += "." + ext
		}
		xlog.Info("Simplified ", downParm)
		data := con.Data
		if downParm.Simplified {
			xlog.Info("encode " + downParm.Charset)
			if downParm.Charset == "GBK" {
				data, err = ioutil.ReadAll(transform.NewReader(bytes.NewReader(data), simplifiedchinese.GBK.NewDecoder()))
			} else if downParm.Charset == "Big5" {
				data, err = ioutil.ReadAll(transform.NewReader(bytes.NewReader(data), traditionalchinese.Big5.NewDecoder()))
			} else {

			}
			if err != nil {
				xlog.Error("encode error")
				return DownResultS{
					DResult:  1,
					DMessage: "编码异常",
				}
			}
			dataStr := zh_s2t.ToSimp(string(data))
			if ioutil.WriteFile(filename, []byte(dataStr), 0644) == nil {
				xlog.Info("写入文件成功:", filename)
				return DownResultS{
					DResult:  0,
					DMessage: "ok",
				}
			}

		} else {
			//fmt.Println(filename)
			if ioutil.WriteFile(filename, data, 0644) == nil {
				xlog.Info("写入文件成功:", filename)
				return DownResultS{
					DResult:  0,
					DMessage: "ok",
				}
			}
		}
	}

	return DownResultS{
		DResult:  1,
		DMessage: "下载失败",
	}
}
func downAndSave(index int, filename string, ext string, url string, downParm config.DownParmS) DownResultS {
	data := utils.HUtil.GetBytes(url)
	if data == nil || len(data) == 0 {
		xlog.Error("data is null")
		return DownResultS{
			DResult:  1,
			DMessage: "下载失败",
		}
	}
	if data == nil || len(data) < 100 {
		xlog.Error("data is empty")
		return DownResultS{
			DResult:  1,
			DMessage: "下载数据异常",
		}
	}

	if downParm.FilenameType == config.FilenameType_BAT {
		filename += fmt.Sprintf(".chn%d.%s", index+1, ext)
	} else {
		filename += "." + ext
	}
	xlog.Info("Simplified ", downParm)
	var err error
	if downParm.Simplified {
		xlog.Info("encode " + downParm.Charset)
		if downParm.Charset == "GBK" {
			data, err = ioutil.ReadAll(transform.NewReader(bytes.NewReader(data), simplifiedchinese.GBK.NewDecoder()))
		} else if downParm.Charset == "Big5" {
			data, err = ioutil.ReadAll(transform.NewReader(bytes.NewReader(data), traditionalchinese.Big5.NewDecoder()))
		} else {

		}
		if err != nil {
			xlog.Error("encode error")
			return DownResultS{
				DResult:  1,
				DMessage: "编码异常",
			}
		}
		dataStr := zh_s2t.ToSimp(string(data))
		if ioutil.WriteFile(filename, []byte(dataStr), 0644) == nil {
			xlog.Info("写入文件成功:", filename)
			return DownResultS{
				DResult:  0,
				DMessage: "ok",
			}
		}

	} else {
		if ioutil.WriteFile(filename, data, 0644) == nil {
			xlog.Info("写入文件成功:", filename)
			return DownResultS{
				DResult:  0,
				DMessage: "ok",
			}
		}
	}

	return DownResultS{
		DResult:  1,
		DMessage: "下载失败",
	}
}

//获取所有字幕列表
func SearchList(searchParm config.SearchParmS) {
	AllSublist = []AllSublistS{}
	allSublistCh := make(chan AllSublistS, 4)
	var waitGroup sync.WaitGroup
	if searchParm.From_sheshou {
		waitGroup.Add(1)
		go func() {
			defer waitGroup.Done()
			sublist, err := sheshou.GetList(config.MovFileInfo.Filename)
			if err != nil {
				xlog.Error(err)
			}
			//fmt.Println(sublist)

			for _, v := range *sublist {
				//xlog.Info(k, v)
				allSublistCh <- AllSublistS{"sheshou", config.MovFileInfo.Title + "." + v.Files[0].Ext, v.Files[0].Ext, "-", v}

			}
		}()
	}
	if searchParm.From_xunlei {
		waitGroup.Add(1)
		go func() {
			defer waitGroup.Done()
			sublistSlice, err := xunlei.GetList(config.MovFileInfo.Filename)
			if err != nil {
				xlog.Error(err)
			}
			//fmt.Println(sublistSlice)
			for _, v := range sublistSlice.Sublist {
				ext := v.Surl[strings.LastIndex(v.Surl, ".")+1:]
				title := v.Sname
				if len(title) == 0 {
					title = config.MovFileInfo.Title + "." + ext
				}
				rate := "-"
				if len(v.Rate) > 0 {
					rate = v.Rate + "星"
				}

				allSublistCh <- AllSublistS{"xunlei", title, ext, rate, v}
			}
		}()
	}
	if searchParm.From_zimuku {
		waitGroup.Add(1)
		go func() {
			defer waitGroup.Done()
			sublist := zimuku.DownList(config.MovFileInfo.Basename)
			//fmt.Println(sublist)
			for _, v := range sublist {
				ext := v.Ext
				title := v.Title

				rate := "-"
				if len(v.Rate) > 0 {
					rate = v.Rate
				}
				allSublistCh <- AllSublistS{"zimuku", title, ext, rate, v}
			}

		}()
	}
	if searchParm.From_subhd {
		waitGroup.Add(1)
		go func() {
			defer waitGroup.Done()
			sublist := subhd.DownList(config.MovFileInfo.Basename)
			//fmt.Println(sublist)
			for _, v := range sublist {
				ext := v.Ext
				title := v.Title

				rate := "-"
				if len(v.Rate) > 0 {
					rate = v.Rate
				}
				allSublistCh <- AllSublistS{"subhd", title, ext, rate, v}
			}

		}()
	}
	go func() {
		waitGroup.Wait()
		//xlog.Info("finish")
		close(allSublistCh)
	}()
	for data := range allSublistCh {
		AllSublist = append(AllSublist, data)
	}

	for k, v := range AllSublist {
		xlog.Infof("k=%v,v=%v\n", k, v)
	}
}
