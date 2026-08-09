' VBS脚本生成工具
Set fso = CreateObject("Scripting.FileSystemObject")
Set file = fso.CreateTextFile("js\app.js", True)

' Write all lines
file.WriteLine "// === Pixel Tetsudo - Main App Logic (Fixed) ==="
file.WriteLine ""
file.WriteLine "(function(window) { "use strict";"
file.WriteLine ""
file.WriteLine "var fromInput = document.getElementById(""fromStation"");"
file.WriteLine "var toInput = document.getElementById(""toStation"");"
file.WriteLine "var fromSuggestions = document.getElementById(""fromSuggestions"");"
file.WriteLine "var toSuggestions = document.getElementById(""toSuggestions"");"
file.WriteLine "var searchBtn = document.getElementById(""searchButton"");"
' ... continue writing

file.Close
WScript.Echo "VBScript wrote file successfully!"
