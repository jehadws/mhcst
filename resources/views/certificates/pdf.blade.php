<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>شهادة إتمام - {{ $certificate->certificate_number }}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
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
            background-color: #f8fafc;
            color: #0f172a;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .cert-container {
            width: 100%;
            max-width: 1050px;
            height: 720px;
            background: #ffffff;
            border: 12px solid #0f172a;
            outline: 3px solid #d97706;
            outline-offset: -10px;
            position: relative;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
        }
        .institute-title {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
        }
        .sub-title {
            font-size: 13px;
            color: #64748b;
            margin-top: 4px;
        }
        .cert-badge {
            background: #fef3c7;
            color: #b45309;
            padding: 6px 16px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: 700;
            border: 1px solid #fde68a;
        }
        .body {
            text-align: center;
            padding: 30px 20px;
        }
        .cert-heading {
            font-size: 34px;
            font-weight: 900;
            color: #1e3a8a;
            letter-spacing: -0.5px;
            margin-bottom: 15px;
        }
        .cert-text {
            font-size: 16px;
            color: #475569;
            margin-bottom: 10px;
        }
        .student-name {
            font-size: 32px;
            font-weight: 800;
            color: #0f172a;
            margin: 15px 0;
            padding-bottom: 5px;
            border-bottom: 2px dashed #cbd5e1;
            display: inline-block;
            min-width: 320px;
        }
        .course-name {
            font-size: 24px;
            font-weight: 700;
            color: #0284c7;
            margin-top: 10px;
        }
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-top: 2px solid #e2e8f0;
            padding-top: 20px;
        }
        .meta-item {
            font-size: 13px;
            color: #64748b;
        }
        .meta-value {
            font-weight: 700;
            color: #0f172a;
            font-size: 14px;
            margin-top: 2px;
        }
        .signature-box {
            text-align: center;
        }
        .signature-line {
            width: 160px;
            border-top: 1.5px dashed #94a3b8;
            margin-top: 35px;
            padding-top: 5px;
            font-size: 13px;
            font-weight: 600;
            color: #334155;
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
            background-color: #0f172a;
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
        .btn:hover {
            background-color: #1e293b;
        }
    </style>
</head>
<body>
    <div className="actions no-print" style="position: fixed; top: 20px; left: 20px; display: flex; gap: 10px; z-index: 9999;">
        <button onclick="window.print()" class="btn">🖨️ طباعة / حفظ PDF</button>
        <a href="javascript:history.back()" class="btn" style="background-color: #64748b;">رجوع</a>
    </div>

    <div class="cert-container">
        <div class="header">
            <div>
                <div class="institute-title">المعهد الحديث العالي للعلوم والتكنولوجيا</div>
                <div class="sub-title">Modern Higher Institute for Science & Technology (MHCST)</div>
            </div>
            <div class="cert-badge">شهادة معتمدة</div>
        </div>

        <div class="body">
            <div class="cert-heading">شهادة إتمام دورة تدريبية</div>
            <div class="cert-text">يشهد المعهد الحديث العالي للعلوم والتكنولوجيا بأن المتدرب/ة:</div>
            <div class="student-name">{{ $certificate->student?->full_name ?? 'متدرب المعهد' }}</div>
            <div class="cert-text" style="margin-top: 15px;">قد أتم بنجاح كافة متطلبات الدورة التدريبية:</div>
            <div class="course-name">{{ $certificate->course?->title_ar ?? $certificate->course?->title_en }}</div>
        </div>

        <div class="footer">
            <div>
                <div class="meta-item">رقم الشهادة: <span class="meta-value" dir="ltr">{{ $certificate->certificate_number }}</span></div>
                <div class="meta-item" style="margin-top: 4px;">تاريخ الإصدار: <span class="meta-value">{{ optional($certificate->issued_at)->format('Y-m-d') }}</span></div>
                <div class="meta-item" style="margin-top: 4px;">التحقق: <span class="meta-value" dir="ltr">{{ url('/verify-certificate?number='.$certificate->certificate_number) }}</span></div>
            </div>

            <div class="signature-box">
                <div class="signature-line">إدارة المعهد</div>
            </div>
        </div>
    </div>
</body>
</html>
