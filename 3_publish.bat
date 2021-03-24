rd /s /q _publish\GoSubTitleSearcher

md _publish

md _publish\GoSubTitleSearcher

del /q _publish\GoSubTitleSearcher_x32.zip
del /q _publish\GoSubTitleSearcher_x64.zip

copy /Y GoSubTitleSearcher_x32.exe _publish\GoSubTitleSearcher\GoSubTitleSearcher_x32.exe
cd _publish
..\_bin\zip.exe -r GoSubTitleSearcher_x32.zip GoSubTitleSearcher
cd..

del /F _publish\GoSubTitleSearcher\GoSubTitleSearcher_x32.exe

copy /Y GoSubTitleSearcher_x64.exe _publish\GoSubTitleSearcher\GoSubTitleSearcher_x64.exe

cd _publish
..\_bin\zip.exe -b GoSubTitleSearcher -r  GoSubTitleSearcher_x64.zip GoSubTitleSearcher
cd..
rd /s /q _publish\GoSubTitleSearcher