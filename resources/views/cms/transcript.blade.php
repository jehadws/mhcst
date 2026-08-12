<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>كشف درجات رسمي - {{ $student->student_no }}</title>
    <style>
        @page { size: A4; margin: 14mm; }
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
            .page { box-shadow: none !important; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f1f5f9;
            color: #0f172a;
            padding: 24px;
        }
        .actions {
            position: fixed; top: 20px; left: 20px;
            display: flex; gap: 10px; z-index: 9999;
        }
        .btn {
            background: #1a237e; color: #fff;
            padding: 10px 20px; border-radius: 8px;
            text-decoration: none; font-size: 14px; font-weight: 600;
            border: none; cursor: pointer;
        }
        .btn.secondary { background: #64748b; }
        .page {
            max-width: 210mm; margin: 0 auto;
            background: #fff; border-radius: 12px;
            padding: 24px 28px;
            box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #1a237e;
            padding-bottom: 14px;
            margin-bottom: 18px;
        }
        .header .inst-ar { font-size: 17px; font-weight: 800; color: #1a237e; }
        .header .inst-en { font-size: 11px; color: #64748b; margin-top: 2px; }
        .header .doc-title {
            font-size: 22px; font-weight: 900;
            margin-top: 10px; color: #0f172a;
        }
        .student-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 24px;
            font-size: 12px;
            margin-bottom: 18px;
            padding: 12px 14px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .meta-row { display: flex; justify-content: space-between; gap: 12px; }
        .meta-row .label { color: #64748b; font-weight: 600; }
        .meta-row .value { font-weight: 700; }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 16px;
        }
        th, td {
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            text-align: center;
        }
        th {
            background: #1a237e;
            color: #fff;
            font-weight: 700;
        }
        tbody tr:nth-child(even) { background: #f8fafc; }
        .summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: #eef2ff;
            border: 1px solid #c7d2fe;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
        }
        .summary .gpa { font-size: 18px; color: #1a237e; }
        .footer {
            margin-top: 28px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #64748b;
        }
        .sig-line {
            width: 160px;
            border-top: 1px solid #334155;
            margin-top: 36px;
            padding-top: 6px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="actions no-print">
        <button onclick="window.print()" class="btn">🖨️ طباعة / حفظ PDF</button>
        <a href="javascript:history.back()" class="btn secondary">رجوع</a>
    </div>

    <div class="page">
        <div class="header">
            <div class="inst-ar">{{ $instituteNameAr }}</div>
            <div class="inst-en">{{ $instituteNameEn }}</div>
            <div class="doc-title">كشف درجات رسمي / Official Academic Transcript</div>
        </div>

        <div class="student-meta">
            <div class="meta-row">
                <span class="label">اسم الطالب</span>
                <span class="value">{{ $student->name }}</span>
            </div>
            <div class="meta-row">
                <span class="label">رقم القيد</span>
                <span class="value">{{ $student->student_no }}</span>
            </div>
            <div class="meta-row">
                <span class="label">القسم</span>
                <span class="value">{{ $student->level?->department?->name ?? '—' }}</span>
            </div>
            <div class="meta-row">
                <span class="label">السنة / الشعبة</span>
                <span class="value">السنة {{ $student->level?->year ?? '—' }} — شعبة {{ $student->level?->section ?? '—' }}</span>
            </div>
            <div class="meta-row">
                <span class="label">تاريخ الإصدار</span>
                <span class="value">{{ $issuedAt->format('d/m/Y') }}</span>
            </div>
            <div class="meta-row">
                <span class="label">الحالة</span>
                <span class="value">{{ $student->status }}</span>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>رمز المادة</th>
                    <th>اسم المادة</th>
                    <th>العام الدراسي</th>
                    <th>الفصل</th>
                    <th>الساعات</th>
                    <th>المجموع</th>
                    <th>التقدير</th>
                </tr>
            </thead>
            <tbody>
                @forelse($enrollments as $enrollment)
                    <tr>
                        <td>{{ $enrollment->subject?->code ?? '—' }}</td>
                        <td>{{ $enrollment->subject?->name ?? '—' }}</td>
                        <td>{{ $enrollment->academic_year }}</td>
                        <td>{{ $enrollment->semester }}</td>
                        <td>{{ $enrollment->subject?->credits ?? '—' }}</td>
                        <td>{{ $enrollment->grade?->total ?? '—' }}</td>
                        <td>{{ $enrollment->grade?->grade_letter ?? '—' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7">لا توجد مواد مسجّلة</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <div class="summary">
            <span>المعدل العام / Cumulative Average</span>
            <span class="gpa">{{ $gpa !== null ? number_format($gpa, 2) : '—' }}</span>
        </div>

        <div class="footer">
            <div>
                <div class="sig-line">توقيع مسؤول الشؤون الأكاديمية</div>
            </div>
            <div>
                <div class="sig-line">ختم الكلية</div>
            </div>
        </div>
    </div>
</body>
</html>
