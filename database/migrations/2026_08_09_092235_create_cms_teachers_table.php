<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('email')->unique()->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('specialization')->nullable();
            $table->string('qualification')->nullable();
            $table->date('join_date')->nullable();
            $table->enum('status', ['active', 'suspended', 'resigned'])->default('active');
            $table->timestamps();
        });

        // Now that cms_teachers exists, add the FK from cms_departments.head_id
        Schema::table('cms_departments', function (Blueprint $table) {
            $table->foreign('head_id')->references('id')->on('cms_teachers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('cms_departments', function (Blueprint $table) {
            $table->dropForeign(['head_id']);
        });

        Schema::dropIfExists('cms_teachers');
    }
};
