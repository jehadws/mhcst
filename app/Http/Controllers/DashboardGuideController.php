<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DashboardGuideController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('dashboard/guide/index');
    }
}
