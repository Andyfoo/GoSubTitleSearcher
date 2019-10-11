# GoSubTitleSearcher
字幕搜索查询(go语言版)，支持4k 2160p,1080p,720p视频字幕搜索，集合了字幕库、迅雷、射手、SubHD查询接口。

**Go语言版本：**
https://gitee.com/andyfoo/GoSubTitleSearcher
https://github.com/Andyfoo/GoSubTitleSearcher

**Java版本在此，不打算更新了：**
https://gitee.com/andyfoo/SubTitleSearcher
https://github.com/Andyfoo/SubTitleSearcher

**设计思路：**
- 个人精力有限，本程序仅支持windows，不考虑其它系统。
- go语言启动web server 实现业务处理。
- go语言实现webview（ie）外壳打开html界面，js调用http和websocket与go交互。
- 编译后的exe文件使用upx压缩。
- 使用了go-xutils集成了自己写的和第三方的常用函数。
- 在线升级使用github.com库中放文件来检测下载。



**可以拖动视频或选择视频开始搜索字幕**
![可以拖动视频或选择视频开始搜索字幕](https://raw.githubusercontent.com/Andyfoo/GoSubTitleSearcher/master/_docs/screenshot/p1.png)

**可以单独或批量下载字幕，可复制标题文字**
![可以单独或批量下载字幕，可复制标题文字](https://raw.githubusercontent.com/Andyfoo/GoSubTitleSearcher/master/_docs/screenshot/p2.png)


**第三方依赖**
>https://github.com/Andyfoo/go-xutils
>https://github.com/GeertJohan/go.rice
>https://github.com/PuerkitoBio/goquery
>https://github.com/gorilla/websocket
>https://golang.org/x/text
>https://golang.org/x/sys
>https://github.com/akavel/rsrc
>https://gitter.im/zserge/webview
>https://github.com/google/logger
>...