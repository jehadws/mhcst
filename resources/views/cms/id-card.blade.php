<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>البطاقة الأكاديمية - {{ $student->student_no }}</title>
    <style>
        @page {
            size: 85.6mm 54mm;
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
            .card {
                box-shadow: none !important;
                border-radius: 8px;
            }
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Segoe UI', Tahoma, 'Arial', sans-serif;
            background-color: #e2e8f0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            color: #0f172a;
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
        .btn:hover {
            background-color: #3949ab;
        }
        .btn.secondary {
            background-color: #64748b;
        }
        .card {
            width: 85.6mm;
            height: 54mm;
            background: linear-gradient(135deg, #ffffff 0%, #f1f5ff 100%);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.2);
            display: flex;
            flex-direction: column;
            position: relative;
        }
        .card::after {
            content: '';
            position: absolute;
            inset: 0;
            border: 0.6mm solid #1a237e;
            border-radius: 7px;
            pointer-events: none;
        }
        .card-header {
            display: flex;
            align-items: center;
            gap: 3mm;
            background: #1a237e;
            color: #ffffff;
            padding: 2.2mm 3.5mm;
        }
        .card-header .logo img {
            height: 9mm;
            max-width: 18mm;
            object-fit: contain;
            background: #ffffff;
            border-radius: 2mm;
            padding: 0.6mm;
        }
        .card-header .logo .logo-fallback {
            width: 12mm;
            height: 9mm;
            background: #ffffff;
            color: #1a237e;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 11px;
            border-radius: 2mm;
        }
        .card-header .titles {
            flex: 1;
            line-height: 1.25;
        }
        .card-header .titles .inst-ar {
            font-size: 9.5px;
            font-weight: 800;
        }
        .card-header .titles .inst-en {
            font-size: 6.5px;
            opacity: 0.85;
        }
        .card-header .badge {
            background: #00c853;
            color: #062d17;
            font-size: 6.5px;
            font-weight: 800;
            padding: 1mm 2mm;
            border-radius: 999px;
            white-space: nowrap;
        }
        .card-body {
            display: flex;
            flex: 1;
            padding: 2.5mm 3.5mm;
            gap: 3mm;
        }
        .photo {
            width: 20mm;
            height: 26mm;
            border-radius: 3mm;
            background: #e2e8f0;
            overflow: hidden;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 0.4mm solid #1a237e;
        }
        .photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .photo .initials {
            font-size: 22px;
            font-weight: 900;
            color: #1a237e;
        }
        .details {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1.2mm;
        }
        .details .student-name {
            font-size: 13px;
            font-weight: 800;
            color: #1a237e;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-size: 7.5px;
            border-top: 0.35mm dashed #cbd5e1;
            padding-top: 0.8mm;
        }
        .detail-row .label {
            color: #64748b;
            font-weight: 600;
        }
        .detail-row .value {
            font-weight: 700;
            direction: ltr;
            unicode-bidi: bidi-override;
        }
        .detail-row .value.rtl {
            direction: rtl;
        }
        .barcode-area {
            text-align: center;
            padding: 0 3.5mm 2mm;
        }
        .barcode-area svg {
            width: 100%;
            height: 8mm;
        }
        .barcode-number {
            font-size: 7px;
            font-weight: 700;
            letter-spacing: 1.5px;
            color: #334155;
            margin-top: 0.3mm;
        }
    </style>
</head>
<body>
    <div class="actions no-print">
        <button onclick="window.print()" class="btn">🖨️ طباعة / حفظ PDF</button>
        <a href="javascript:history.back()" class="btn secondary">رجوع</a>
    </div>

    <div class="card">
        <div class="card-header">
            <div class="logo">
                @if($logoUrl)
                    <img src="{{ $logoUrl }}" alt="logo">
                @else
                    <div class="logo-fallback">المعايير</div>
                @endif
            </div>
            <div class="titles">
                <div class="inst-ar">{{ $instituteNameAr }}</div>
                <div class="inst-en">{{ $instituteNameEn }}</div>
            </div>
            <div class="badge">البطاقة الأكاديمية</div>
        </div>

        <div class="card-body">
            <div class="photo">
                @if($student->photo)
                    <img src="{{ asset('storage/'.$student->photo) }}" alt="{{ $student->name }}">
                @else
                    <div class="initials">{{ mb_substr($student->name, 0, 1) }}</div>
                @endif
            </div>

            <div class="details">
                <div class="student-name">{{ $student->name }}</div>
                <div class="detail-row">
                    <span class="label">رقم القيد</span>
                    <span class="value">{{ $student->student_no }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">القسم</span>
                    <span class="value rtl">{{ $student->level?->department?->name ?? '—' }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">السنة / الشعبة</span>
                    <span class="value rtl">السنة {{ $student->level?->year ?? '—' }} - شعبة {{ $student->level?->section ?? '—' }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">الجنس</span>
                    <span class="value rtl">{{ $student->gender === 'female' ? 'أنثى' : 'ذكر' }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">تاريخ القيد</span>
                    <span class="value">{{ optional($student->enrollment_date)->format('d/m/Y') }}</span>
                </div>
            </div>
        </div>

        <div class="barcode-area">
            {!! App\Services\IdCardBarcodeService::code39Svg($student->student_no) !!}
            <div class="barcode-number">{{ $student->student_no }}</div>
        </div>
    </div>
</body>
</html>