<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إيصال تسجيل المواد — {{ $student->name }}</title>
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
        .student-box {
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
        .student-box b {
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
        .status-active { color: #166534; font-weight: 700; }
        .status-pending { color: #b45309; font-weight: 700; }
        .status-completed { color: #1e40af; font-weight: 700; }
        .footer {
            margin-top: 16px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #64748b;
        }
        .signatures {
            margin-top: 36px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
        }
        .signatures span {
            border-top: 1px dashed #94a3b8;
            padding-top: 6px;
            min-width: 160px;
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
        <div class="report-header">
            <div class="inst">{{ $instituteNameAr }}</div>
            <div class="title">إيصال تسجيل المواد الدراسية</div>
            <div class="meta">
                العام الدراسي: {{ $academicYear ?: '—' }} —
                الفصل: {{ ['first' => 'الأول', 'second' => 'الثاني', 'summer' => 'الصيفي'][$semester] ?? $semester }}
                @if($enrollments->isEmpty())
                — لا توجد مواد مسجلة لهذا الفصل
                @endif
            </div>
        </div>

        <div class="student-box">
            <span><b>الطالب:</b> {{ $student->name }}</span>
            <span><b>رقم القيد:</b> {{ $student->student_no }}</span>
            <span><b>القسم:</b> {{ $student->level?->department?->name ?? '—' }}</span>
            <span><b>المستوى:</b> {{ $student->level ? 'سنة '.$student->level->year.' - شعبة '.$student->level->section : '—' }}</span>
        </div>

        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>رمز المادة</th>
                    <th>اسم المادة</th>
                    <th>حالة التسجيل</th>
                    <th>تاريخ التسجيل</th>
                </tr>
            </thead>
            <tbody>
                @forelse($enrollments as $index => $enrollment)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $enrollment->subject?->code ?? '—' }}</td>
                        <td>{{ $enrollment->subject?->name ?? '—' }}</td>
                        <td class="status-{{ $enrollment->status }}">
                            {{ ['pending' => 'قيد الاعتماد', 'active' => 'مُعتمدة', 'completed' => 'مكتملة'][$enrollment->status] ?? $enrollment->status }}
                        </td>
                        <td>{{ optional($enrollment->enrollment_date)->format('d/m/Y') ?? '—' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 18px;">لا توجد مواد مسجلة لهذا الفصل الدراسي.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <div class="signatures">
            <span>توقيع الطالب</span>
            <span>الملف الأكاديمي</span>
            <span>ختم الكلية</span>
        </div>

        <div class="footer">
            <span>تاريخ الإصدار: {{ $exportedAt->format('d/m/Y H:i') }}</span>
            <span>نظام إدارة الكلية — CMS</span>
        </div>
    </div>
</body>
</html>
