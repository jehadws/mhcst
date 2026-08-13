<?php

namespace App\Http\Controllers;

use App\Services\SiteSeoService;
use Symfony\Component\HttpFoundation\Response;

class SeoController extends Controller
{
    public function __construct(private SiteSeoService $siteSeo) {}

    public function manifest(): Response
    {
        return response()
            ->json($this->siteSeo->manifest())
            ->header('Content-Type', 'application/manifest+json');
    }

    public function robots(): Response
    {
        return response($this->siteSeo->robots(), 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
        ]);
    }

    public function sitemap(): Response
    {
        return response($this->siteSeo->sitemapXml(), 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    public function browserConfig(): Response
    {
        return response($this->siteSeo->browserConfigXml(), 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }
}
