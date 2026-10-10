import { useSite } from '@/context/site-context';

export function TrustBand() {
    const { t } = useSite();

    return (
        <section aria-label={t.accreditation.title} className="bg-teal-dark text-white">
            <div className="site-container grid gap-[35px] py-[42px] site-md:grid-cols-[1.15fr_repeat(3,1fr)]">
                <div className="flex items-center gap-[14px]">
                    <span aria-hidden="true" className="text-[18px] text-coral">
                        ✦
                    </span>
                    <p className="m-0 text-[15px] leading-[1.7] font-semibold">
                        {t.accreditation.title} {t.accreditation.titleAccent}
                    </p>
                </div>

                {t.accreditation.bodies.map((body, index) => {
                    const [name, ...rest] = body.split(' — ');
                    const qualifier = rest.join(' — ');

                    return (
                        <div
                            key={body}
                            className="flex flex-col justify-center gap-1 border-white/20 ps-0 site-md:border-s site-md:ps-[25px]"
                        >
                            <span className="font-site-latin text-[9px] font-bold tracking-[0.12em] text-mint">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <strong className="text-[13px] font-medium">{name}</strong>
                            {qualifier ? <small className="text-[10px] text-white/45">{qualifier}</small> : null}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
