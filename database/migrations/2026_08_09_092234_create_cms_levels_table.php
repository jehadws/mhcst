<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained('cms_departments')->cascadeOnDelete();
            $table->tinyInteger('year')->unsigned();
            $table->string('section', 10);
            $table->smallInteger('capacity')->unsigned()->default(40);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_levels');
    }
};
