<x-mail::message>
# {{ $campaign->subject }}

{!! $campaign->content !!}

@if ($unsubscribeUrl)
<x-mail::button :url="$unsubscribeUrl" color="gray">
    Unsubscribe from this newsletter
</x-mail::button>
@endif

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
