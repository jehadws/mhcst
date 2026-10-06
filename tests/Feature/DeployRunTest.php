<?php

use Illuminate\Support\Facades\Artisan;

it('rejects requests with a missing or wrong token', function () {
    config(['app.deploy_token' => 'secret-token']);

    $this->get('/deploy/run')->assertForbidden();
    $this->get('/deploy/run?token=wrong')->assertForbidden();
    $this->get('/deploy/run', ['Authorization' => 'Bearer wrong'])->assertForbidden();
    $this->get('/deploy/run', ['X-Deploy-Token' => 'wrong'])->assertForbidden();
});

it('is forbidden when the deploy hook is not configured', function () {
    config(['app.deploy_token' => null]);

    $this->get('/deploy/run?token=anything')->assertForbidden();
    $this->get('/deploy/run', ['Authorization' => 'Bearer anything'])->assertForbidden();
    $this->get('/deploy/run', ['X-Deploy-Token' => 'anything'])->assertForbidden();
});

it('runs the post-deploy artisan tasks with a valid token', function () {
    config(['app.deploy_token' => 'secret-token']);

    // Mock artisan so tests never touch real caches or public/ files.
    Artisan::shouldReceive('call')->times(7)->andReturn(0);

    $this->get('/deploy/run?token=secret-token')
        ->assertOk()
        ->assertJson(['status' => 'ok']);
});

it('accepts the token in the x-deploy-token header so it survives hosts that strip authorization', function () {
    config(['app.deploy_token' => 'secret-token']);

    Artisan::shouldReceive('call')->times(7)->andReturn(0);

    $this->get('/deploy/run', ['X-Deploy-Token' => 'secret-token'])
        ->assertOk()
        ->assertJson(['status' => 'ok']);
});

it('prefers the x-deploy-token header over an invalid query parameter', function () {
    config(['app.deploy_token' => 'secret-token']);

    Artisan::shouldReceive('call')->times(7)->andReturn(0);

    $this->get('/deploy/run?token=wrong', ['X-Deploy-Token' => 'secret-token'])
        ->assertOk()
        ->assertJson(['status' => 'ok']);
});

it('accepts the authorization bearer header so the token stays out of access logs', function () {
    config(['app.deploy_token' => 'secret-token']);

    Artisan::shouldReceive('call')->times(7)->andReturn(0);

    $this->get('/deploy/run', ['Authorization' => 'Bearer secret-token'])
        ->assertOk()
        ->assertJson(['status' => 'ok']);
});
