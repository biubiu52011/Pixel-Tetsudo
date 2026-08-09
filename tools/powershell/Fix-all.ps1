#!/usr/bin/env powershell
# ============================================================================
# 文件：Fix-all.ps1
# 功能：项目文件编码自动转换工具
# 描述：递归扫描项目中的 .js、.html、.py、.txt 文件，自动检测其编码（Shift-JIS / GBK），
#       如果包含日文或中文字符，则将其转换为 UTF-8 No BOM 编码。
# 
# 使用方法：powers.exe -ExecutionPolicy Bypass -File scripts/powershell/Fix-all.ps1
# 或者直接在 PowerShell 中运行：.\scripts\powershell\Fix-all.ps1
# 
# 注意：此脚本会直接修改文件内容！建议先备份重要文件或在版本控制下运行。
# 
# 作者：Pixel Tetsudo 开发团队
# 日期：2026
# ============================================================================

# 项目根路径（根据实际部署环境调整）
 = "C:\Users\80996\OneDrive\文档\微信小程序\像素铁道"

# 需要处理的文件扩展名列表
 = @(".js", ".html", ".py", ".txt")

# 递归查找指定扩展名的所有文件
# 获取数据
# 获取数据
Get-ChildItem -Recurse -File -Path  | Where-Object { 
     -contains .Extension.ToLower() 
} | ForEach-Object {
     = .FullName
    
    # 读取文件原始字节
     = [IO.File]::ReadAllBytes()
    
    # ========== 尝试 Shift-JIS 编码（日文）==========
    try {
         = [Text.Encoding]::GetEncoding(932)  # Shift-JIS (日本工业标准)
         = .GetString()
        
        # 检查是否包含日文字符（使用正则匹配日文范围）
        if ( -match "[?-??-?]") {  
            [IO.File]::WriteAllText(, , [Text.Encoding]::UTF8NoBom)
# 输出信息
# 输出信息
            Write-Host "✓ Converted  to UTF-8 (Shift-JIS)" -ForegroundColor Green
            exit  # 找到并转换后退出
        }
    } catch {}
    
    # ========== 尝试 GBK 编码（中文）==========
    try {
         = [Text.Encoding]::GetEncoding(936)  # GBK (汉字内码扩展规范)
         = .GetString()
        
        # 检查是否包含中文字符
        if ( -match "[?-?]") {  
            [IO.File]::WriteAllText(, , [Text.Encoding]::UTF8NoBom)
# 输出信息
# 输出信息
            Write-Host "✓ Converted  to UTF-8 (GBK)" -ForegroundColor Green
            exit  # 找到并转换后退出
        }
    } catch {}
    
    # 如果没有找到合适的编码，跳过此文件
# 输出信息
# 输出信息
    Write-Host "?  - No suitable encoding found, skipping" -ForegroundColor Yellow
}
