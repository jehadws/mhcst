import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { siteSettings } = usePage<SharedData>().props;

  const logoPath = siteSettings?.site_logo ? `/storage/${siteSettings.site_logo}` : '/logo.png';

  return <img src={logoPath} alt="Logo" {...props} />;
}
