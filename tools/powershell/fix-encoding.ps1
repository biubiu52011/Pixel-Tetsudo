# ============================================================================
# 文件：fix-encoding.ps1
# 功能：running-status.js 编码修复脚本
# 描述：将 running-status.js 文件的编码从 Shift-JIS 转换为 UTF-8 No BOM
# 
# 此脚本是一个单一目的的工具，用于修复 running-status.js 的编码问题
# 它读取原文件、解码为字符串、然后用 UTF-8 重新写入
# 
# 使用方法：在 PowerShell 中执行：.\scripts\powershell\fix-encoding.ps1
# 
# 作者：Pixel Tetsudo 开发团队
# 日期：2026
# ============================================================================

指定要修复的文件路径
 = "C:\Users\80996\OneDrive\文档\微信小程序\像素鉄道\js\running-status.js"

# 读取原始字节
 = [System.IO.File]::ReadAllBytes()

# 使用 Shift-JIS (932) 编码解码为字符串
 = [System.Text.Encoding]::GetEncoding(932)
 = .GetString()

# 使用 UTF-8 编码写回文件
 = [System.Text.Encoding]::UTF8
[System.IO.File]::WriteAllText(, , )

# 输出信息
# 输出信息
Write-Host "Fixed running-status.js" -ForegroundColor Green
