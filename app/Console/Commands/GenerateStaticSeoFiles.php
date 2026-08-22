<?php

namespace App\Console\Commands;

use App\Services\SiteSeoService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class GenerateStaticSeoFiles extends Command
{
    /**
     * Files written to public/ so Apache/LiteSpeed serves them directly,
     * bypassing PHP entirely. The dynamic routes remain as fallbacks.
     */
    private const FILES = [
        'site.webmanifest' => 'renderManifest',
        'robots.txt' => 'renderRobots',
        'browserconfig.xml' => 'renderBrowserConfig',
    ];

    protected $signature = 'seo:generate-static';

    protected $description = 'Generate static site.webmanifest, robots.txt and browserconfig.xml into public/';

    public function handle(SiteSeoService $seo): int
    {
        foreach (self::FILES as $fileName => $renderer) {
            $contents = $this->{$renderer}($seo);

            File::put(public_path($fileName), $contents);

            $this->info("Generated public/{$fileName} (".$this->byteSize($contents).')');
        }

        return self::SUCCESS;
    }

    private function renderManifest(SiteSeoService $seo): string
    {
        return json_encode($seo->manifest(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    private function renderRobots(SiteSeoService $seo): string
    {
        return $seo->robots();
    }

    private function renderBrowserConfig(SiteSeoService $seo): string
    {
        return $seo->browserConfigXml();
    }

    private function byteSize(string $contents): string
    {
        return number_format(strlen($contents) / 1024, 1).' KB';
    }
}
