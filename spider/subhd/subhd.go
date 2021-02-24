package subhd

import (
	"fmt"
	"net/url"
	"regexp"
	"strings"
	"sync"

	"GoSubTitleSearcher/utils"

	"github.com/Andyfoo/go-xutils/xarray"
	"github.com/Andyfoo/go-xutils/xfile"
	"github.com/Andyfoo/go-xutils/xhttp"
	"github.com/Andyfoo/go-xutils/xlog"
	"github.com/Andyfoo/go-xutils/xregex"
	"github.com/Andyfoo/go-xutils/xvar"

	"github.com/PuerkitoBio/goquery"
)

var (
	baseUrl  = "https://subhd.tv"
	cutStrs  = []string{".bluray", ".2160p", ".1080p", ".720p", ".480p", ".internal"}
	langList = []string{"双语", "简体", "繁体", "英文"}
)

type SubhdListItem struct {
	Url        string `json:"url"`
	BaseUrl    string `json:"baseUrl"`
	Title      string `json:"title"`
	Ext        string `json:"ext"`
	AuthorInfo string `json:"authorInfo"`
	Lang       string `json:"lang"`
	Rate       string `json:"rate"`
	DownCount  string `json:"downCount"`
}

type SubhdContent struct {
	Filename string `json:"filename"`
	Ext      string `json:"ext"`
	Data     []byte `json:"data"`
}

//下载列表
func DownList(fileName string) []SubhdListItem {
	var respLists = []SubhdListItem{}
	var mainList []string = getFuzzyPageList(fileName)
	for _, url := range mainList {
		if len(url) == 0 {
			continue
		}
		var detailList = getDetailList(url)
		if detailList != nil {
			respLists = append(respLists, detailList...)
		}
	}
	return respLists
}

//下载列表详细信息
func getDetailList(urlStr string) []SubhdListItem {
	var result = httpGet(fmt.Sprintf("%s%s", baseUrl, urlStr))
	if xvar.IsEmpty(result) {
		xlog.Error("result is null")
		return nil
	}
	//fmt.Println(result)
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(result))
	if err != nil {
		xlog.Error(err)
		return nil
	}
	var lists = []SubhdListItem{}
	doc.Find(".table-sm tr").Each(func(i int, tr *goquery.Selection) {
		if tr.Find("a.text-dark").Size() == 0 {
			return
		}
		downUrl, exists := tr.Find("a.text-dark").Eq(0).Attr("href")
		if !exists {
			return
		}
		html, err := tr.Html()
		if err != nil {
			xlog.Error(err)
			return
		}
		htmlLower := strings.ToLower(html)
		title := strings.TrimSpace(tr.Find("a.text-dark").Text())
		downCount := xregex.GetMatchStr(tr.Find("td.p-3").Eq(1).Text(), `([\d]+)`)
		ext := ""
		tr.Find(".text-secondary span").Each(func(a_i int, a_lb *goquery.Selection) {
			ext += a_lb.Text() + "，"
		})
		ext_len := len(ext)
		if len(ext) > 0 {
			ext = ext[0 : ext_len-3]
		}

		lang := ""
		for _, v := range langList {
			if strings.Contains(htmlLower, ">"+v+"<") {
				lang += v + "，"
			}
		}
		lang_len := len(lang)
		if lang_len > 0 {
			lang = lang[0 : lang_len-3]
		}
		authorInfo := tr.Find("a.text-dark").Eq(2).Text()

		rate := ""

		listitem := SubhdListItem{}
		listitem.Url = downUrl
		listitem.BaseUrl = baseUrl
		listitem.Title = title
		listitem.Ext = ext
		listitem.AuthorInfo = authorInfo
		listitem.Lang = lang
		listitem.Rate = rate
		listitem.DownCount = downCount

		lists = append(lists, listitem)
	})
	//fmt.Println(lists)
	return lists
}
func DownContent(url string) *SubhdContent {
	url = fmt.Sprintf("%s%s", baseUrl, url)
	var result = httpGet(url)
	if xvar.IsEmpty(result) {
		xlog.Error("result is null")
		return nil
	}
	//fmt.Println(result)
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(result))
	if err != nil {
		xlog.Error(err)
		return nil
	}
	matchList := doc.Find("#down")
	postData := make(map[string]string)
	sid, exists := matchList.Attr("sid")
	if !exists {
		xlog.Error("sid is null")
		return nil
	}
	postData["sub_id"] = sid
	dtoken, exists := matchList.Attr("dtoken")
	if !exists {
		xlog.Error("dtoken is null")
		return nil
	}
	postData["dtoken"] = dtoken
	url2 := fmt.Sprintf("%s%s", baseUrl, "/ajax/down_ajax")
	result = httpPost(url2, postData, url)
	if xvar.IsEmpty(result) || !strings.Contains(result, "true") {
		xlog.Error("result is null", result)
		return nil
	}
	downUrl := xregex.GetMatchStr(result, `"url":"([^"]+)"`)
	if xvar.IsEmpty(downUrl) {
		xlog.Error("downUrl is null")
		return nil
	}
	downUrl = strings.ReplaceAll(downUrl, "\\", "")
	fmt.Println("downUrl", downUrl)

	//xlog.Info(matched)
	var filename = xfile.BaseName(downUrl)
	var data []byte
	data, _ = utils.HUtil.DownFile(downUrl, xhttp.ReqParm{
		Referer: url,
	})
	//xlog.Info(filename, err, len(data))
	return &SubhdContent{
		Filename: filename,
		Ext:      strings.ToLower(xfile.ExtName(filename)),
		Data:     data,
	}
}

//处理文件名中的内容方便搜索更多的字幕数据
func getFuzzyPageList(title string) []string {
	title = strings.ToLower(title)
	pos := strings.LastIndex(title, ".")
	if pos > 0 {
		title = title[0:pos]
	}
	var list = make([]string, 0)

	waitGroup := sync.WaitGroup{}
	ch1 := make(chan []string, 2)

	waitGroup.Add(1)
	go func(title string) {
		defer waitGroup.Done()
		list := getPageList(title)
		if len(list) == 0 {
			return
		}
		ch1 <- list
	}(title)
	for _, cutStr := range cutStrs {
		if strings.Contains(title, cutStr) {
			pos = strings.LastIndex(title, cutStr)
			title2 := title[0:pos] //+len(cutStr)
			waitGroup.Add(1)
			go func(title string) {
				defer waitGroup.Done()
				list := getPageList(title)
				if len(list) == 0 {
					return
				}
				ch1 <- list
			}(title2)
		}
	}
	go func() {
		waitGroup.Wait()
		close(ch1)
	}()
	for data := range ch1 {
		list = append(list, data...)
	}
	list2 := make([]string, 0)
	for _, url := range list {
		if xarray.InStrArray(url, list2) {
			continue
		}
		list2 = append(list2, url)
	}

	return list2
}

//获取标题下的文件列表
func getPageList(title string) []string {
	var result = httpGet(fmt.Sprintf("%s/search0/%s", baseUrl, url.QueryEscape(title)))
	//fmt.Println(result)
	if xvar.IsEmpty(result) {
		xlog.Error("result is null")
		return nil
	}
	//fmt.Println(result)
	re := regexp.MustCompile(`<a\shref="(/d/[\w]+)"><img`)
	matched := re.FindAllStringSubmatch(result, -1)
	lists := make([]string, 0)
	for _, match := range matched {
		if xarray.InStrArray(match[1], lists) {
			continue
		}
		lists = append(lists, match[1])
		//fmt.Printf("%s, %s\n", match[0], match[1])
	}

	return lists
}

//处理GET请求，并判断如果是js混淆的则解析js后再处理
func httpGet(urlStr string) string {
	reqParm := xhttp.ReqParm{}
	reqParm.Referer = urlStr
	var result = utils.HUtil.Get(urlStr, reqParm)
	//搜索验证 点击继续搜索
	if strings.Contains(result, "搜索验证") {
		xlog.Error("搜索验证 reload")
		return httpGet(urlStr)
	}
	if xvar.IsEmpty(result) {
		xlog.Error("result is null")
		return result
	}
	return result
}
func httpPost(urlStr string, postData map[string]string, referer string) string {
	reqParm := xhttp.ReqParm{}
	reqParm.Referer = referer
	xlog.Info("#######")
	var result = utils.HUtil.PostMap(urlStr, postData, reqParm)

	if xvar.IsEmpty(result) {
		xlog.Error("result is null")
		return result
	}
	return result
}
