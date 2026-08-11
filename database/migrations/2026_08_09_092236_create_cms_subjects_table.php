<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained('cms_departments')->cascadeOnDelete();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->tinyInteger('credits')->unsigned()->default(3);
            $table->boolean('has_lab')->default(false);
            $table->enum('semester', ['first', 'second', 'summer']);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_subjects');
    }
};
