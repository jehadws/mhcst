import { resolveLogoUrl } from '@/lib/branding';
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { siteSettings } = usePage<SharedData>().props;

  return <img src={resolveLogoUrl(siteSettings, 'icon')} alt="Logo" {...props} />;
}
