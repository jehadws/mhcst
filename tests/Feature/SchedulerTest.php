<?php

test('queue worker is scheduled every minute', function () {
    $this->artisan('schedule:list')
        ->expectsOutputToContain('queue:work --stop-when-empty')
        ->assertSuccessful();
});
