<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

trait HasImage
{
    protected static function bootHasImage(): void
    {
        $usesSoftDeletes = in_array(
            SoftDeletes::class,
            class_uses_recursive(static::class)
        );

        // Purge files on soft delete as well as hard delete (no restore UI exists)
        static::deleted(function ($model) {
            static::deleteModelFiles($model);
        });

        if ($usesSoftDeletes) {
            static::forceDeleted(function ($model) {
                static::deleteModelFiles($model);
            });
        }
    }

    protected static function deleteModelFiles($model): void
    {
        $imageField = (function () {
            return $this->imageField ?? 'cover_image';
        })->call($model);

        $videoField = (function () {
            return $this->videoField ?? null;
        })->call($model);

        $fields = [$imageField ?: 'cover_image'];

        if (! empty($videoField)) {
            $fields[] = $videoField;
        }

        foreach ($fields as $field) {
            $path = $model->{$field};
            if (! empty($path) && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }

    public function purgeFiles(): void
    {
        static::deleteModelFiles($this);
    }

    /**
     * @param  Collection<int, static>  $models
     */
    public static function purgeFilesForModels(Collection $models): void
    {
        $models->each(fn ($model) => static::deleteModelFiles($model));
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
