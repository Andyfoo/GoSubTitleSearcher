set appver=1.1.0
set appdesc=ÐÞ¸Ä×ÖÄ»¿âÍøÖ·


md _publish\upgrade

set upgradeurl=http://upgrade.res.pslib.com/my-apps/go/tools/GoSubTitleSearcher/GoSubTitleSearcher_x64_%appver%.exe
set appname=GoSubTitleSearcher_x64
set appfile=E:\workspace\go\_my_tools\GoSubTitleSearcher\_publish\upgrade\GoSubTitleSearcher_x64_%appver%.exe
set savefile=E:\workspace\go\_my_tools\GoSubTitleSearcher\_publish\upgrade\last

del E:\workspace\go\_my_tools\GoSubTitleSearcher\_publish\upgrade\GoSubTitleSearcher*.*
copy /Y GoSubTitleSearcher_x64.exe %appfile%
copy /Y _publish\GoSubTitleSearcher_x64.zip _publish\GoSubTitleSearcher_x64_%appver%.zip
_bin\app_upgrade_config -savefile=%savefile% -appver=%appver% -appname=%appname% -appdesc="%appdesc%" -appfile=%appfile% -upgradeurl=%upgradeurl%


