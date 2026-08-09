# ============================================================================
# 文件：fix.js.ps1
# 功能：JS 文件编码自动修复脚本（多编码检测）
# 描述：自动检测 JS 文件的编码（GBK 或 Shift-JIS），如果检测到中文字符则使用 GBK，
#       如果检测到日文字符则使用 Shift-JIS，然后转换为 UTF-8 No BOM 格式。
# 
# 工作流程：
#   1. 读取文件字节数据
#   2. 首先尝试用 GBK 解码，如果包含"正常"等中文字符则确认是 GBK
#   3. 否则用 Shift-JIS 解码，如果包含"運行"等日文字符则确认是 Shift-JIS
#   4. 用转换后的字符串以 UTF-8 编码重新写入文件
# 
# 使用方法：在 PowerShell 中执行：.\scripts\powershell\fix.js.ps1
# 
# 注意：此脚本会直接修改目标文件，请谨慎使用！建议先备份。
# 
# 作者：Pixel Tetsudo 开发团队
# 日期：2026
# ============================================================================

# 指定要修复的文件路径
 = 'C:\Users\80996\OneDrive\文档\微信小程序\像素鉄道\js\running-status.js'

# 读取原始字节
 = [System.IO.File]::ReadAllBytes()

# Try GBK first (Chinese encoding)
 = [System.Text.Encoding]::GetEncoding(936)
 = .GetString()

if ( -match "正常") {  # Check for Chinese characters
# 输出信息
# 输出信息
    Write-Host "Using GBK encoding detected"
     = [System.Text.Encoding]::UTF8
    [System.IO.File]::WriteAllText(, , )
} else {
    # Try Shift-JIS (Japanese encoding)
     = [System.Text.Encoding]::GetEncoding(932)
     = .GetString()
# 输出信息
# 输出信息
    Write-Host "Using Shift-JIS encoding detected"
     = [System.Text.Encoding]::UTF8
    [System.IO.File]::WriteAllText(, , )
}
