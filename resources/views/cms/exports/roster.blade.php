<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>كشف أسماء الشعبة — {{ $schedule->subject?->name }}</title>
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
        .class-box {
            display: flex;
            flex-wrap: wrap;
            gap: 6px 24px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 12px;
            margin-bottom: 14px;
        }
        .class-box b {
            color: #1a237e;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11.5px;
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
        .sign-cell {
            height: 26px;
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
            <div class="inst">{{ $instituteNameAr }}</div>
            <div class="title">كشف أسماء الشعبة — {{ $schedule->subject?->name }}</div>
            <div class="meta">
                تاريخ الإصدار: {{ $exportedAt->format('d/m/Y H:i') }} | العدد الكلي: {{ $students->count() }}
            </div>
        </div>

        <div class="class-box">
            <span><b>المادة:</b> {{ $schedule->subject?->name }} ({{ $schedule->subject?->code }})</span>
            <span><b>الأستاذ:</b> {{ $schedule->teacher?->name ?? '—' }}</span>
            <span><b>الشعبة:</b> {{ $schedule->level?->department?->name }} — سنة {{ $schedule->level?->year }} / شعبة {{ $schedule->level?->section }}</span>
            <span><b>الموعد:</b> {{ $schedule->day }} {{ $schedule->start_time }}-{{ $schedule->end_time }} @if($schedule->room) ({{ $schedule->room }}) @endif</span>
            <span><b>الفصل:</b> {{ $schedule->academic_year }} — {{ ['first' => 'الأول', 'second' => 'الثاني', 'summer' => 'الصيفي'][$schedule->semester] ?? $schedule->semester }}</span>
        </div>

        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>رقم القيد</th>
                    <th>اسم الطالب</th>
                    <th>الهاتف</th>
                    <th style="width: 130px;">التوقيع</th>
                </tr>
            </thead>
            <tbody>
                @forelse($students as $index => $student)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $student->student_no }}</td>
                        <td>{{ $student->name }}</td>
                        <td>{{ $student->phone ?? '—' }}</td>
                        <td class="sign-cell"></td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 18px;">لا يوجد طلاب مسجلون في هذه الشعبة.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <div class="footer">
            <span>نظام إدارة الكلية — CMS</span>
            <span>إدارة الكلية</span>
        </div>
    </div>
</body>
</html>
