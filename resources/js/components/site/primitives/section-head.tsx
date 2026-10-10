import { cn } from '@/lib/utils';
import type * as React from 'react';
import { SectionTag } from './section-tag';

interface SectionHeadProps {
    index: string;
    label: React.ReactNode;
    title: React.ReactNode;
    lead?: React.ReactNode;
    light?: boolean;
    className?: string;
}

export function SectionHead({ index, label, title, lead, light = false, className }: SectionHeadProps) {
    return (
        <div
            className={cn(
                'mb-[60px] flex items-end justify-between gap-10 max-[760px]:mb-[38px] max-[760px]:block',
                className,
            )}
        >
            <div>
                <SectionTag index={index} label={label} light={light} />
                <h2
                    className={cn(
                        'text-site-h2 m-0 mt-[18px] font-semibold tracking-[-0.06em]',
                        light ? 'text-white' : 'text-ink',
                    )}
                >
                    {title}
                </h2>
            </div>
            {lead ? (
                <p
                    className={cn(
                        'm-0 mb-1 max-w-[350px] text-[14px] leading-[2.1] max-[760px]:mt-[22px]',
                        light ? 'text-white/60' : 'text-ink-muted',
                    )}
                >
                    {lead}
                </p>
            ) : null}
        </div>
    );
}
