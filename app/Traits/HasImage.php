<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;

trait HasImage
{
    protected static function bootHasImage(): void
    {
        static::deleting(function ($model) {
            $field = $model->imageField ?? 'cover_image';
            $path = $model->{$field};
            if (! empty($path) && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        });
    }

    public function updateImage(?string $newPath, string $field = 'cover_image'): void
    {
        $oldPath = $this->{$field};

        if ($newPath === '__remove__') {
            $this->deleteIfExists($oldPath);
            $this->forceFill([$field => null]);

            return;
        }

        if (empty($newPath)) {
            return;
        }

        if ($newPath !== $oldPath) {
            $this->deleteIfExists($oldPath);
            $this->forceFill([$field => $newPath]);
        }
    }

    private function deleteIfExists(?string $path): void
    {
        if (! empty($path) && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
