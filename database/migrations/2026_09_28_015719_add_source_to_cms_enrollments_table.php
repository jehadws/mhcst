<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cms_enrollments', function (Blueprint $table) {
            // Student self-registration origin. Existing and admin-created
            // enrollments stay 'admin'; self-service picks are 'self'.
            $table->enum('source', ['admin', 'self'])->default('admin')->after('status');

            // 'pending' holds self-registered subjects awaiting admin approval;
            // 'withdrawn' is the rejection state (subject becomes pickable again).
            $table->enum('status', ['active', 'dropped', 'completed', 'pending', 'withdrawn'])
                ->default('active')
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('cms_enrollments', function (Blueprint $table) {
            $table->enum('status', ['active', 'dropped', 'completed'])
                ->default('active')
                ->change();

            $table->dropColumn('source');
        });
    }
};
