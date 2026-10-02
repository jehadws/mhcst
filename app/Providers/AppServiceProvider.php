<?php

namespace App\Providers;

use App\Support\SecurityHelper;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(function (Login $event) {
            activity()
                ->performedOn($event->user)
                ->causedBy($event->user)
                ->withProperties(['ip' => request()?->ip(), 'guard' => $event->guard])
                ->log('auth.login');
        });

        Event::listen(function (Logout $event) {
            if ($event->user) {
                activity()
                    ->performedOn($event->user)
                    ->causedBy($event->user)
                    ->withProperties(['ip' => request()?->ip(), 'guard' => $event->guard])
                    ->log('auth.logout');
            }
        });

        Event::listen(function (Failed $event) {
            activity()
                ->withProperties([
                    'email' => $event->credentials['email'] ?? 'unknown',
                    'ip' => request()?->ip(),
                    'guard' => $event->guard,
                ])
                ->causedByAnonymous()
                ->log('auth.failed');
        });

        Event::listen(function (Lockout $event) {
            activity()
                ->withProperties([
                    'ip' => request()?->ip(),
                    'input' => SecurityHelper::stripSensitiveRecursive($event->request?->input() ?? []),
                ])
                ->causedByAnonymous()
                ->log('auth.lockout');
        });

        Event::listen(function (PasswordReset $event) {
            activity()
                ->performedOn($event->user)
                ->causedBy($event->user)
                ->withProperties(['ip' => request()?->ip()])
                ->log('auth.password_reset');
        });

        // Queued jobs (notification emails today) must never fail silently:
        // log every exhausted attempt so admins can spot delivery problems.
        Queue::failing(function (JobFailed $event): void {
            Log::error('queue.job_failed', [
                'job' => $event->job->resolveName(),
                'queue' => $event->job->getQueue(),
                'error' => $event->exception->getMessage(),
            ]);
        });
    }
}
