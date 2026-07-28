import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function CoursesIndex() {
    useEffect(() => {
        router.replace(route('dashboard.courses.list'));
    }, []);

    return null;
}
