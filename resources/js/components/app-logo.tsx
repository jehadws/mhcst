import AppLogoIcon from './app-logo-icon';
import { useSite } from '@/context/site-context';

export default function AppLogo() {
  const { locale } = useSite()
  return (
    <>
      <div className=" flex aspect-square size-8 items-center justify-center rounded-md">
        <AppLogoIcon className="size-5" />
      </div>
      <div className="flex-1 text-start text-sm">
        <span className="mb-0.5 truncate leading-none font-semibold">{locale === "en" ? "ALMAAYIR ALHADITHA" : "المعايير الحديثة"}</span>
      </div>
    </>
  );
}
