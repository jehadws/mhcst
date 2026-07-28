import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function InstructorsIndex() {
    useEffect(() => {
        router.replace(route('dashboard.instructors.list'));
    }, []);

    return null;
}
