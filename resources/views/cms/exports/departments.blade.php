<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        @page { size: A4 landscape; margin: 12mm; }
        @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f1f5f9; padding: 24px; color: #0f172a; }
        .page { max-width: 277mm; margin: 0 auto; background: #fff; padding: 22px 26px; border-radius: 12px; }
        .header { text-align: center; border-bottom: 2px solid #1a237e; padding-bottom: 12px; margin-bottom: 16px; }
        .header h1 { font-size: 18px; color: #1a237e; }
        .header p { font-size: 11px; color: #64748b; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: center; }
        th { background: #1a237e; color: #fff; }
        tbody tr:nth-child(even) { background: #f8fafc; }
        .btn { background: #1a237e; color: #fff; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; margin-left: 8px; }
    </style>
</head>
<body>
    <div class="no-print" style="margin-bottom: 16px;">
        <button onclick="window.print()" class="btn">طباعة / PDF</button>
        <a href="javascript:history.back()" class="btn" style="background:#64748b;text-decoration:none;display:inline-block;">رجوع</a>
    </div>
    <div class="page">
        <div class="header">
            <div style="font-weight:800;color:#1a237e;">{{ $instituteNameAr }}</div>
            <div style="font-size:10px;color:#64748b;">{{ $instituteNameEn }}</div>
            <h1>{{ $title }}</h1>
            <p>{{ $exportedAt->format('d/m/Y H:i') }}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>القسم</th>
                    <th>رئيس القسم</th>
                    <th>الصفوف</th>
                    <th>المواد</th>
                    <th>الطلاب</th>
                    <th>المعلمون</th>
                </tr>
            </thead>
            <tbody>
                @foreach($departments as $dept)
                    <tr>
                        <td style="text-align:right;font-weight:700;">{{ $dept['name'] }}</td>
                        <td>{{ $dept['head_name'] ?? '—' }}</td>
                        <td>{{ $dept['levels_count'] }}</td>
                        <td>{{ $dept['subjects_count'] }}</td>
                        <td>{{ $dept['students_count'] }}</td>
                        <td>{{ $dept['teachers_count'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</body>
</html>
