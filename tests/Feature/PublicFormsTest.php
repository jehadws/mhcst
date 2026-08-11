<?php

test('contact form submits successfully and redirects with success message', function () {
    $response = $this->post('/contact', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '0912345678',
        'subject' => 'Inquiry',
        'message' => 'I would like to know more about the college.',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');
});

test('contact form validates required fields', function () {
    $this->post('/contact', ['message' => ''])
        ->assertSessionHasErrors(['name', 'email', 'message']);
});
