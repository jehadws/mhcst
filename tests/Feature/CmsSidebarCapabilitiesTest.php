<?php

use App\Enums\UserRole;

test('cms capabilities are teacher-only for a pure teacher account', function () {
    $user = createUserWithRoles([UserRole::Teacher->value]);

    $this->actingAs($user)->get('/dashboard')->assertOk()->assertInertia(fn ($page) => $page
        ->where('cmsCapabilities.canManage', false)
        ->where('cmsCapabilities.isTeacher', true)
    );
});

test('cms capabilities allow management for a manager account', function () {
    $user = createUserWithRoles([UserRole::Manager->value]);

    $this->actingAs($user)->get('/dashboard')->assertOk()->assertInertia(fn ($page) => $page
        ->where('cmsCapabilities.canManage', true)
        ->where('cmsCapabilities.isTeacher', false)
    );
});

test('cms capabilities allow management for an admin account', function () {
    $user = createAdminUser();

    $this->actingAs($user)->get('/dashboard')->assertOk()->assertInertia(fn ($page) => $page
        ->where('cmsCapabilities.canManage', true)
        ->where('cmsCapabilities.isTeacher', false)
    );
});

test('cms capabilities allow management even when teacher is combined with manager', function () {
    $user = createUserWithRoles([UserRole::Teacher->value, UserRole::Manager->value]);

    $this->actingAs($user)->get('/dashboard')->assertOk()->assertInertia(fn ($page) => $page
        ->where('cmsCapabilities.canManage', true)
        ->where('cmsCapabilities.isTeacher', false)
    );
});

test('cms capabilities deny cms access for a student account', function () {
    $user = createUserWithRoles([UserRole::Student->value]);

    $this->actingAs($user)->get('/dashboard')->assertOk()->assertInertia(fn ($page) => $page
        ->where('cmsCapabilities.canManage', false)
        ->where('cmsCapabilities.isTeacher', false)
    );
});
