package zimuku

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
	"github.com/Andyfoo/go-xutils/xvar"

	"github.com/PuerkitoBio/goquery"
)

var (
	baseUrl = "https://www.zimuku.la"
	cutStrs = []string{".bluray", ".2160p", ".1080p", ".720p", ".480p", ".internal"}
)

type ZimukuListItem struct {
	Url        string `json:"url"`
	Title      string `json:"title"`
	Ext        string `json:"ext"`
	AuthorInfo string `json:"authorInfo"`
	Lang       string `json:"lang"`
	Rate       string `json:"rate"`
	DownCount  string `json:"downCount"`
}

type ZimukuContent struct {
	Filename string `json:"filename"`
	Ext      string `json:"ext"`
	Data     []byte `json:"data"`
}

//下载列表
func DownList(fileName string) []ZimukuListItem {
	var respLists = []ZimukuListItem{}
	var mainList []string = getFuzzyPageList(fileName)
	for _, url := range mainList {
		if len(url) < 1 {
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
func getDetailList(urlStr string) []ZimukuListItem {
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
	var lists = []ZimukuListItem{}
	doc.Find("#subtb tbody tr").Each(func(i int, tr *goquery.Selection) {
		href, exists := tr.Find("a").Attr("href")
		if !exists {
			return
		}
		title, exists := tr.Find("a").Attr("title")
		if !exists {
			return
		}
		ext := tr.Find(".label-info").Text()
		authorInfos := tr.Find(".gray")
		authorInfo := ""
		authorInfos.Each(func(a_i int, a_lb *goquery.Selection) {
			authorInfo += a_lb.Text() + "，"
		})
		authorInfo_len := len(authorInfo)
		if authorInfo_len > 0 {
			authorInfo = authorInfo[0 : authorInfo_len-3]
		}

		lang, exists := tr.Find("img").First().Attr("alt")
		if !exists {
			lang = ""
		}
		rate, exists := tr.Find(".rating-star").First().Attr("title")
		if !exists {
			rate = ""
		}
		rate = strings.Replace(rate, "字幕质量:", "", -1)
		downCount := tr.Find("td").Eq(3).Text()

		var listitem ZimukuListItem
		listitem.Url = href
		listitem.Title = title
		listitem.Ext = ext
		listitem.AuthorInfo = authorInfo
		listitem.Lang = lang
		listitem.Rate = rate
		listitem.DownCount = downCount

		lists = append(lists, listitem)

		//fmt.Printf("Review %d: %s - %s\n", i, href, downCount)
	})
	//fmt.Println(lists)
	return lists
}
func DownContent(url string) *ZimukuContent {
	url = fmt.Sprintf("%s%s", baseUrl, url)
	var result = httpGet(url)
	if xvar.IsEmpty(result) {
		xlog.Error("result is null")
		return nil
	}
	//fmt.Println(result)
	re := regexp.MustCompile(`<a\s+id="down1"\s+href="(/dld/[\w]+\.html)"`)
	matched := re.FindAllStringSubmatch(result, -1)
	if matched == nil || len(matched) == 0 || len(matched[0]) == 0 {
		return nil
	}
	url = fmt.Sprintf("%s%s", baseUrl, matched[0][1])
	result = httpGet(url)
	if xvar.IsEmpty(result) {
		xlog.Error("result is null")
		return nil
	}
	re = regexp.MustCompile(`<li><a\s+rel="nofollow"\s+href="([^"]*/download/[^"]+)"`)
	matched = re.FindAllStringSubmatch(result, -1)
	if matched == nil || len(matched) == 0 || len(matched[0]) == 0 {
		return nil
	}
	//xlog.Info(matched)
	var filename string
	var data []byte
	for i := 0; i < len(matched); i++ {
		data, filename = utils.HUtil.DownFile(addBaseUrl(matched[i][1]), xhttp.ReqParm{
			Referer: url,
		})
		if data != nil {
			break
		}
	}

	//xlog.Info(filename, err, len(data))

	return &ZimukuContent{
		Filename: filename,
		Ext:      strings.ToLower(xfile.ExtName(filename)),
		Data:     data,
	}
}
func addBaseUrl(url string) string {
	if strings.Contains(url, "://") {
		return url
	}
	return fmt.Sprintf("%s%s", baseUrl, url)
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
	var result = httpGet(fmt.Sprintf("%s/search?q=%s", baseUrl, url.QueryEscape(title)))
	if xvar.IsEmpty(result) {
		xlog.Error("result is null")
		return nil
	}
	//fmt.Println(result)
	re := regexp.MustCompile(`<p\s+class="tt\s+clearfix"><a\s+href="(/subs/[\w]+\.html)"\s+target="_blank"><b>(.*?)</b></a></p>`)
	matched := re.FindAllStringSubmatch(result, -1)
	// for _, match := range matched {
	// 	fmt.Printf("%s, %s, %s\n", match[0], match[1], match[2])
	// }
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
	var result = utils.HUtil.Get(urlStr)
	if xvar.IsEmpty(result) {
		xlog.Error("result is null")
		return result
	}
	if strings.Count(result, "url") > 10 && strings.Contains(result, "<script") {
		xlog.Error("result is script confusion")
		fmt.Println(result)
	}
	return result
}
