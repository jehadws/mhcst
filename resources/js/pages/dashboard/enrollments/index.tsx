import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function EnrollmentsIndex() {
    useEffect(() => {
        router.replace(route('dashboard.enrollments.list'));
    }, []);

    return null;
}
