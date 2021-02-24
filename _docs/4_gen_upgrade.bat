set appver=1.0.8
set appdesc=修改SubHD不能下载问题



rem set upgradeurl=https://github.com/Andyfoo/my-apps/raw/master/go/tools/GoSubTitleSearcher/GoSubTitleSearcher_%appver%.exe
set upgradeurl=http://upgrade.res.pslib.com/my-apps/go/tools/GoSubTitleSearcher/GoSubTitleSearcher_%appver%.exe
set appname=GoSubTitleSearcher
set appfile=E:\workspace\_me\gitee\my-apps\go\tools\GoSubTitleSearcher\GoSubTitleSearcher_%appver%.exe
set savefile=E:\workspace\_me\gitee\my-apps\go\tools\GoSubTitleSearcher\last

del E:\workspace\_me\github\my-apps\go\tools\GoSubTitleSearcher\GoSubTitleSearcher*.*
copy /Y GoSubTitleSearcher_x64.exe %appfile%
copy /Y _publish\GoSubTitleSearcher_x64.zip _publish\GoSubTitleSearcher_x64_%appver%.zip
_bin\app_upgrade_config -savefile=%savefile% -appver=%appver% -appname=%appname% -appdesc="%appdesc%" -appfile=%appfile% -upgradeurl=%upgradeurl%
rem E:\workspace\_me\gitee\my-apps_commit.bat


