<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\CmsAttendance;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Models\NotificationTemplate;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class CmsDemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles & Default Admin Account
        Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => UserRole::Teacher->value, 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

        $adminUser = User::firstOrCreate(
            ['email' => 'admin@cms.local'],
            [
                'name' => 'مدير النظام الأكاديمي',
                'password' => Hash::make('password'),
            ]
        );
        $adminUser->syncRoles([UserRole::Admin->value]);

        // 2. Departments
        $deptCs = CmsDepartment::create([
            'name' => 'قسم علوم الحاسوب وتكنولوجيا المعلومات',
            'description' => 'يعنى بدراسة برمجة الحاسوب، الذكاء الاصطناعي وشبكات المعلومات.',
        ]);

        $deptEng = CmsDepartment::create([
            'name' => 'قسم الهندسة والتقنيات الهندسية',
            'description' => 'يعنى بالهندسة الكهربائية والهندسة الإلكترونية والميكانيك.',
        ]);

        $deptBus = CmsDepartment::create([
            'name' => 'قسم إدارة الأعمال والمحاسبة',
            'description' => 'يركز على الإدارة المالية، التسويق وعلوم المحاسبة.',
        ]);

        // 3. Teachers
        $teacherData = [
            ['name' => 'د. أحمد محمود الشريف', 'email' => 'a.sharif@cms.local', 'specialization' => 'الذكاء الاصطناعي', 'qualification' => 'دكتوراه'],
            ['name' => 'د. فاطمة علي الورفلي', 'email' => 'f.werfali@cms.local', 'specialization' => 'هندسة البرمجيات', 'qualification' => 'دكتوراه'],
            ['name' => 'أ. سالم محمد الحداد', 'email' => 's.haddad@cms.local', 'specialization' => 'شبكات الحاسوب', 'qualification' => 'ماجستير'],
            ['name' => 'د. عمر عبدالسلام الترهوني', 'email' => 'o.tarhuni@cms.local', 'specialization' => 'القواعد والبيانات الضخمة', 'qualification' => 'دكتوراه'],
            ['name' => 'أ. مريم حسن العبيدي', 'email' => 'm.obeidi@cms.local', 'specialization' => 'إدارة أعمال دولية', 'qualification' => 'ماجستير'],
            ['name' => 'د. خالد إبراهيم السويسي', 'email' => 'k.sweisi@cms.local', 'specialization' => 'المحاسبة المالية', 'qualification' => 'دكتوراه'],
        ];

        $teachers = [];
        foreach ($teacherData as $t) {
            $user = User::create([
                'name' => $t['name'],
                'email' => $t['email'],
                'password' => Hash::make('password'),
            ]);
            $user->assignRole(UserRole::Teacher->value);

            $teachers[] = CmsTeacher::create([
                'user_id' => $user->id,
                'name' => $t['name'],
                'email' => $t['email'],
                'specialization' => $t['specialization'],
                'qualification' => $t['qualification'],
                'status' => 'active',
                'join_date' => now()->subYears(rand(1, 5))->format('Y-m-d'),
            ]);
        }

        // Set department heads
        $deptCs->update(['head_id' => $teachers[0]->id]);
        $deptEng->update(['head_id' => $teachers[1]->id]);
        $deptBus->update(['head_id' => $teachers[4]->id]);

        // 4. Levels (4 years per department, sections A & B)
        $levels = [];
        foreach ([$deptCs, $deptEng, $deptBus] as $dept) {
            for ($year = 1; $year <= 4; $year++) {
                foreach (['A', 'B'] as $sec) {
                    $levels[] = CmsLevel::create([
                        'department_id' => $dept->id,
                        'year' => $year,
                        'section' => $sec,
                        'capacity' => 40,
                    ]);
                }
            }
        }

        // 5. Subjects
        $subjectsData = [
            ['dept' => $deptCs, 'code' => 'CS101', 'name' => 'مقدمة في البرمجة', 'credits' => 3, 'has_lab' => true, 'semester' => 'first'],
            ['dept' => $deptCs, 'code' => 'CS102', 'name' => 'خوارزميات وهياكل البيانات', 'credits' => 4, 'has_lab' => true, 'semester' => 'second'],
            ['dept' => $deptCs, 'code' => 'CS201', 'name' => 'قواعد البيانات متقدمة', 'credits' => 3, 'has_lab' => true, 'semester' => 'first'],
            ['dept' => $deptCs, 'code' => 'CS301', 'name' => 'هندسة البرمجيات والأنظمة', 'credits' => 3, 'has_lab' => false, 'semester' => 'first'],
            ['dept' => $deptEng, 'code' => 'ENG101', 'name' => 'الفيزياء الهندسية', 'credits' => 4, 'has_lab' => true, 'semester' => 'first'],
            ['dept' => $deptEng, 'code' => 'ENG201', 'name' => 'الدوائر الإلكترونية', 'credits' => 3, 'has_lab' => true, 'semester' => 'second'],
            ['dept' => $deptBus, 'code' => 'BUS101', 'name' => 'مبادئ الإدارة الحديثة', 'credits' => 3, 'has_lab' => false, 'semester' => 'first'],
            ['dept' => $deptBus, 'code' => 'ACC101', 'name' => 'المحاسبة المالية I', 'credits' => 3, 'has_lab' => false, 'semester' => 'first'],
        ];

        $subjects = [];
        foreach ($subjectsData as $s) {
            $subjects[] = CmsSubject::create([
                'department_id' => $s['dept']->id,
                'code' => $s['code'],
                'name' => $s['name'],
                'credits' => $s['credits'],
                'has_lab' => $s['has_lab'],
                'semester' => $s['semester'],
            ]);
        }

        // 6. Students (100 students)
        $studentNames = [
            'عبدالرحمن طارق', 'سارة خالد', 'يوسف محمود', 'خديجة سالم', 'حمزة علي',
            'ريم مصطفى', 'إبراهيم حسن', 'نور هاني', 'بلال رجب', 'زينب مسعود',
            'مالك عادل', 'أسماء بشير', 'مصطفى كمال', 'آية فرج', 'عمر فتحي',
        ];

        $students = [];
        for ($i = 1; $i <= 40; $i++) {
            $name = $studentNames[$i % count($studentNames)].' ('.$i.')';
            $stuNo = '2025'.str_pad((string) $i, 4, '0', STR_PAD_LEFT);
            $level = $levels[$i % count($levels)];

            $students[] = CmsStudent::create([
                'student_no' => $stuNo,
                'name' => $name,
                'email' => "student{$i}@cms.local",
                'phone' => '091'.rand(1000000, 9999999),
                'level_id' => $level->id,
                'enrollment_date' => '2025-09-01',
                'status' => 'active',
                'gender' => $i % 2 === 0 ? 'female' : 'male',
            ]);
        }

        // Link first two students to login accounts for dashboard / transcript testing
        foreach ([1, 2] as $index) {
            $student = $students[$index - 1];
            $studentUser = User::firstOrCreate(
                ['email' => "student{$index}@cms.local"],
                [
                    'name' => $student->name,
                    'password' => Hash::make('password'),
                    'is_active' => true,
                ]
            );
            $studentUser->syncRoles([UserRole::Student->value]);
            $student->update(['user_id' => $studentUser->id]);
        }

        // 7. Enrollments, Grades & Attendance
        foreach ($students as $index => $student) {
            // enroll student in 2 subjects matching department
            $matchingSubjects = CmsSubject::where('department_id', $student->level->department_id)->get();
            foreach ($matchingSubjects as $subject) {
                $enrollment = CmsEnrollment::create([
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'academic_year' => '2025-2026',
                    'semester' => 'first',
                    'status' => 'active',
                ]);

                // Create Grades
                $mid = rand(60, 95);
                $fin = rand(60, 98);
                $ass = rand(70, 100);
                $prj = rand(70, 100);
                $part = rand(80, 100);

                CmsGrade::create([
                    'enrollment_id' => $enrollment->id,
                    'midterm' => $mid,
                    'final' => $fin,
                    'assignments' => $ass,
                    'projects' => $prj,
                    'participation' => $part,
                    'entered_by' => $teachers[0]->user_id,
                    'entered_at' => now(),
                ]);

                // Create Attendance records
                for ($d = 1; $d <= 5; $d++) {
                    CmsAttendance::create([
                        'enrollment_id' => $enrollment->id,
                        'date' => now()->subDays($d)->format('Y-m-d'),
                        'status' => rand(1, 10) > 2 ? 'present' : 'absent',
                        'recorded_by' => $teachers[0]->user_id,
                    ]);
                }
            }
        }

        // 8. Timetable Schedules
        $days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday'];
        foreach ($subjects as $idx => $subj) {
            CmsSchedule::create([
                'subject_id' => $subj->id,
                'teacher_id' => $teachers[$idx % count($teachers)]->id,
                'level_id' => $levels[$idx % count($levels)]->id,
                'day' => $days[$idx % count($days)],
                'start_time' => '09:00',
                'end_time' => '11:00',
                'room' => 'قاعة '.($idx + 101),
                'type' => $subj->has_lab ? 'lab' : 'lecture',
                'academic_year' => '2025-2026',
                'semester' => 'first',
            ]);
        }

        NotificationTemplate::firstOrCreate(
            ['trigger_event' => 'attendance.alert', 'channel' => 'email'],
            [
                'name' => 'Attendance Alert',
                'subject' => 'تنبيه غياب — {student_name} — {subject_name}',
                'body' => "عزيزي/عزيزتي {student_name},\n\nنود إبلاغكم بوجود تنبيه غياب في مادة {subject_name}:\n{reasons}\n\nيرجى مراجعة شؤون الطلاب.",
            ]
        );
    }
}
