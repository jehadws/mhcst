<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LocaleController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:'.implode(',', config('app.supported_locales', ['en']))],
        ]);

        session(['locale' => $validated['locale']]);

        return response()->json([
            'locale' => $validated['locale'],
            'direction' => in_array($validated['locale'], config('app.rtl_locales', [])) ? 'rtl' : 'ltr',
        ]);
    }
}
