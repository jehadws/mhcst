<?php

use Illuminate\Support\Facades\Artisan;

it('rejects requests with a missing or wrong token', function () {
    config(['app.deploy_token' => 'secret-token']);

    $this->get('/deploy/run')->assertForbidden();
    $this->get('/deploy/run?token=wrong')->assertForbidden();
});

it('is forbidden when the deploy hook is not configured', function () {
    config(['app.deploy_token' => null]);

    $this->get('/deploy/run?token=anything')->assertForbidden();
});

it('runs the post-deploy artisan tasks with a valid token', function () {
    config(['app.deploy_token' => 'secret-token']);

    // Mock artisan so tests never touch real caches or public/ files.
    Artisan::shouldReceive('call')->times(7)->andReturn(0);

    $this->get('/deploy/run?token=secret-token')
        ->assertOk()
        ->assertJson(['status' => 'ok']);
});
