<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // The pages directory is committed as lowercase resources/js/pages,
        // so Inertia's default testing path (js/Pages) only resolves on
        // case-insensitive filesystems and fails on Linux CI.
        config()->set('inertia.testing.page_paths', [resource_path('js/pages')]);
    }
}
