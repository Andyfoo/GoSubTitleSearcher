set appver=1.0.1
set appdesc=修改部分问题



set upgradeurl=https://github.com/Andyfoo/my-apps/raw/master/go/tools/GoSubTitleSearcher/GoSubTitleSearcher_%appver%.exe
set appname=GoSubTitleSearcher
set appfile=E:\workspace\_me\github\my-apps\go\tools\GoSubTitleSearcher\GoSubTitleSearcher_%appver%.exe
set savefile=E:\workspace\_me\github\my-apps\go\tools\GoSubTitleSearcher\last

del E:\workspace\_me\github\my-apps\go\tools\GoSubTitleSearcher\GoSubTitleSearcher*.*
copy /Y GoSubTitleSearcher_x64.exe %appfile%
copy /Y _publish\GoSubTitleSearcher_x64.zip _publish\GoSubTitleSearcher_x64_%appver%.zip
_bin\app_upgrade_config -savefile=%savefile% -appver=%appver% -appname=%appname% -appdesc="%appdesc%" -appfile=%appfile% -upgradeurl=%upgradeurl%
E:\workspace\_me\github\my-apps_commit.bat


