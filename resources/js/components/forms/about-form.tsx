import { useState } from 'react';
import { router } from '@inertiajs/react';
import { useSite } from '@/context/site-context';
import type { AboutItemContent, AboutMilestoneContent, AboutPageContent } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUploader from '@/components/image-uploader';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
    content: AboutPageContent;
}

const emptyItem = (): AboutItemContent => ({ icon: '', title: '', title_ar: '', body: '', body_ar: '' });
const emptyMilestone = (): AboutMilestoneContent => ({ year: '', label: '', label_ar: '' });

function updateAt<T>(list: T[], index: number, key: keyof T, value: string): T[] {
    return list.map((item, i) => (i === index ? { ...item, [key]: value } : item));
}

export default function AboutForm({ content }: Props) {
    const { t } = useSite();
    const e = t.dashboard.aboutEditor;
    const [hero, setHero] = useState(content.hero);
    const [pillars, setPillars] = useState<AboutItemContent[]>(content.pillars);
    const [values, setValues] = useState<AboutItemContent[]>(content.values);
    const [milestones, setMilestones] = useState<AboutMilestoneContent[]>(content.milestones);
    const [submitting, setSubmitting] = useState(false);

    const submit = () => {
        setSubmitting(true);
        const payload = {
            hero: { ...hero },
            pillars: pillars.map((pillar) => ({ ...pillar })),
            values: values.map((value) => ({ ...value })),
            milestones: milestones.map((milestone) => ({ ...milestone })),
        };

        router.put(
            route('dashboard.pages.about.update'),
            payload,
            {
                onSuccess: () => toast.success(e.updated),
                onError: () => toast.error(e.failed),
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const itemCard = (
        list: AboutItemContent[],
        setList: React.Dispatch<React.SetStateAction<AboutItemContent[]>>,
        entity: string
    ) => (
        <div className="space-y-4">
            {list.length === 0 ? <p className="text-muted-foreground text-sm">{e.emptyList}</p> : null}
            {list.map((item, index) => (
                <Card key={index} className="border-dashed">
                    <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>{e.icon}</Label>
                            <Input
                                value={item.icon || ''}
                                onChange={(ev) => setList((prev) => updateAt(prev, index, 'icon', ev.target.value))}
                                placeholder="Target, Users, Heart..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{e.itemTitle}</Label>
                            <Input
                                value={item.title}
                                onChange={(ev) => setList((prev) => updateAt(prev, index, 'title', ev.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{e.itemTitleAr}</Label>
                            <Input
                                dir="rtl"
                                value={item.title_ar}
                                onChange={(ev) => setList((prev) => updateAt(prev, index, 'title_ar', ev.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{e.itemBody}</Label>
                            <Textarea
                                value={item.body}
                                onChange={(ev) => setList((prev) => updateAt(prev, index, 'body', ev.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{e.itemBodyAr}</Label>
                            <Textarea
                                dir="rtl"
                                value={item.body_ar}
                                onChange={(ev) => setList((prev) => updateAt(prev, index, 'body_ar', ev.target.value))}
                            />
                        </div>
                        <div className="flex items-end justify-end">
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => setList((prev) => prev.filter((_, i) => i !== index))}
                            >
                                <Trash2 className="me-1 h-4 w-4" /> {e.remove}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setList((prev) => [...prev, emptyItem()])}>
                <Plus className="me-1 h-4 w-4" /> {entity}
            </Button>
        </div>
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{e.heroSection}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>{e.heroTitle}</Label>
                        <Input value={hero.title} onChange={(ev) => setHero((prev) => ({ ...prev, title: ev.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>{e.heroTitleAr}</Label>
                        <Input
                            dir="rtl"
                            value={hero.title_ar}
                            onChange={(ev) => setHero((prev) => ({ ...prev, title_ar: ev.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{e.heroDescription}</Label>
                        <Textarea
                            value={hero.description || ''}
                            onChange={(ev) => setHero((prev) => ({ ...prev, description: ev.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{e.heroDescriptionAr}</Label>
                        <Textarea
                            dir="rtl"
                            value={hero.description_ar || ''}
                            onChange={(ev) => setHero((prev) => ({ ...prev, description_ar: ev.target.value }))}
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <ImageUploader
                            value={hero.image || null}
                            onChange={(path) => setHero((prev) => ({ ...prev, image: path || '' }))}
                            folder="about"
                            label={e.heroImage}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{e.pillarsSection}</CardTitle>
                </CardHeader>
                <CardContent>{itemCard(pillars, setPillars, e.addPillar)}</CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{e.valuesSection}</CardTitle>
                </CardHeader>
                <CardContent>{itemCard(values, setValues, e.addValue)}</CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{e.milestonesSection}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {milestones.length === 0 ? <p className="text-muted-foreground text-sm">{e.emptyList}</p> : null}
                        {milestones.map((item, index) => (
                            <Card key={index} className="border-dashed">
                                <CardContent className="grid gap-4 pt-4 sm:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label>{e.year}</Label>
                                        <Input
                                            value={item.year}
                                            onChange={(ev) => setMilestones((prev) => updateAt(prev, index, 'year', ev.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{e.milestoneLabel}</Label>
                                        <Input
                                            value={item.label}
                                            onChange={(ev) => setMilestones((prev) => updateAt(prev, index, 'label', ev.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{e.milestoneLabelAr}</Label>
                                        <Input
                                            dir="rtl"
                                            value={item.label_ar}
                                            onChange={(ev) => setMilestones((prev) => updateAt(prev, index, 'label_ar', ev.target.value))}
                                        />
                                    </div>
                                    <div className="flex items-end justify-end sm:col-span-3">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setMilestones((prev) => prev.filter((_, i) => i !== index))}
                                        >
                                            <Trash2 className="me-1 h-4 w-4" /> {e.remove}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setMilestones((prev) => [...prev, emptyMilestone()])}
                        >
                            <Plus className="me-1 h-4 w-4" /> {e.addMilestone}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={submit} disabled={submitting}>
                    {submitting ? e.saving : e.save}
                </Button>
            </div>
        </div>
    );
}

