go mod tidy
rem go build -ldflags="-H windowsgui" -o GoSubTitleSearcher.exe main.go 
rem rsrc -arch amd64 -ico res/icon/app.ico -manifest main.manifest -o rsrc.syso.x64
rsrc -arch 386 -ico res/icon/app.ico -manifest main.manifest -o rsrc.syso.x32

copy /Y rsrc.syso.x32 rsrc.syso
TASKKILL /F /IM GoSubTitleSearcher.exe
TASKKILL /F /IM GoSubTitleSearcher_x32.exe
rice embed-go -i GoSubTitleSearcher/server
set GOARCH=386
set GOOS=windows
set CGO_ENABLED=1
go build -ldflags="-H windowsgui -s -w" -o GoSubTitleSearcher_x32.exe
_bin\upx -9 GoSubTitleSearcher_x32.exe

copy /Y rsrc.syso.x64 rsrc.syso