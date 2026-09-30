<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

trait HasImage
{
    protected static function bootHasImage(): void
    {
        $usesSoftDeletes = in_array(
            SoftDeletes::class,
            class_uses_recursive(static::class)
        );

        if ($usesSoftDeletes) {
            // Only erase the physical file on a permanent (force) delete.
            // A recoverable soft-delete must NOT remove disk assets.
            static::forceDeleted(function ($model) {
                static::deleteModelFiles($model);
            });
        } else {
            // Model has no SoftDeletes — every delete is permanent.
            static::deleted(function ($model) {
                static::deleteModelFiles($model);
            });
        }
    }

    protected static function deleteModelFiles($model): void
    {
        $fields = [$model->imageField ?? 'cover_image'];

        if (property_exists($model, 'videoField') && ! empty($model->videoField)) {
            $fields[] = $model->videoField;
        }

        foreach ($fields as $field) {
            $path = $model->{$field};
            if (! empty($path) && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
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
