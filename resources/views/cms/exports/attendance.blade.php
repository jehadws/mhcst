<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 14mm;
        }
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .no-print {
                display: none !important;
            }
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f1f5f9;
            color: #0f172a;
            padding: 24px;
        }
        .page {
            max-width: 190mm;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            padding: 22px 26px;
            box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.1);
        }
        .actions {
            position: fixed;
            top: 20px;
            left: 20px;
            display: flex;
            gap: 10px;
            z-index: 9999;
        }
        .btn {
            background-color: #1a237e;
            color: #ffffff;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .btn.secondary {
            background-color: #64748b;
        }
        .report-header {
            text-align: center;
            border-bottom: 2px solid #1a237e;
            padding-bottom: 12px;
            margin-bottom: 14px;
        }
        .report-header .inst {
            font-size: 16px;
            font-weight: 800;
            color: #1a237e;
        }
        .report-header .title {
            font-size: 20px;
            font-weight: 900;
            margin-top: 4px;
        }
        .report-header .meta {
            font-size: 11px;
            color: #64748b;
            margin-top: 4px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5px;
        }
        thead th {
            background-color: #1a237e;
            color: #ffffff;
            padding: 7px 8px;
            font-weight: 700;
            text-align: right;
        }
        tbody td {
            padding: 6px 8px;
            border-bottom: 0.5px solid #e2e8f0;
        }
        tbody tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .footer {
            margin-top: 16px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="actions no-print">
        <button onclick="window.print()" class="btn">🖨️ طباعة / حفظ PDF</button>
        <a href="javascript:history.back()" class="btn secondary">رجوع</a>
    </div>

    <div class="page">
        <div class="report-header">
            <div class="inst">المعهد الحديث العالي للعلوم والتكنولوجيا</div>
            <div class="title">{{ $title }}</div>
            <div class="meta">التاريخ: {{ $date }} | تاريخ الإصدار: {{ $exportedAt->format('d/m/Y H:i') }} | عدد القيود: {{ $enrollments->count() }}</div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>رقم القيد</th>
                    <th>اسم الطالب</th>
                    <th>المواد</th>
                    <th>حالة الحضور</th>
                </tr>
            </thead>
            <tbody>
                @foreach($enrollments as $index => $enrollment)
                    @php
                        $record = $enrollment->attendance->first();
                        $status = match ($record?->status) {
                            'present' => 'حاضر',
                            'absent' => 'غائب',
                            'late' => 'متأخر',
                            'excused' => 'معذور',
                            default => '—',
                        };
                    @endphp
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $enrollment->student?->student_no ?? '—' }}</td>
                        <td>{{ $enrollment->student?->name ?? '—' }}</td>
                        <td>{{ $enrollment->subject?->code ?? '—' }} - {{ $enrollment->subject?->name ?? '' }}</td>
                        <td>{{ $status }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="footer">
            <span>{{ $enrollments->count() === 0 ? 'لا توجد بيانات للتصدير.' : 'نظام إدارة الكلية — MHCST CMS' }}</span>
            <span>إدارة المعهد</span>
        </div>
    </div>
</body>
</html>