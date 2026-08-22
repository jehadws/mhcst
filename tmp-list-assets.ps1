Get-ChildItem -Path "c:\Users\jehad\Desktop\projects\mhcst\public" -Recurse -File |
    Sort-Object Length -Descending |
    Select-Object -First 30 |
    ForEach-Object {
        "{0,10:N1} KB  {1}" -f ($_.Length / 1KB), $_.FullName.Replace("c:\Users\jehad\Desktop\projects\mhcst\public", "")
    }