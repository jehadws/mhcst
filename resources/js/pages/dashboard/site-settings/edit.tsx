import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import ImageUploader from '@/components/image-uploader';
import type { BreadcrumbItem } from '@/types';
import { useSite } from '@/context/site-context';

interface SettingField {
    key: string;
    value: string;
    type: 'text' | 'image' | 'json';
}

interface SettingGroup {
    label: string;
    fields: SettingField[];
}

function parseJson(value: string): Record<string, string> {
    try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed;
        }
    } catch {
        return {};
    }
    return {};
}

export default function SiteSettingsEditPage({ groups }: { groups: SettingGroup[] }) {
    const { t } = useSite();
    const d = t.dashboard;
    const [settings, setSettings] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        groups.forEach(g => g.fields.forEach(f => { initial[f.key] = f.value; }));
        return initial;
    });

    const [socialLinks, setSocialLinks] = useState<Record<string, string>>(() =>
        parseJson(settings.social_links || '{}'),
    );

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.siteSettings.title, href: '#' },
    ];

    const handleValueChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setErrors(prev => {
            const next = { ...prev };
            delete next[`settings.${key}`];
            return next;
        });
    };

    const handleImageChange = (key: string, path: string | null) => {
        setSettings(prev => ({ ...prev, [key]: path || '' }));
        setErrors(prev => {
            const next = { ...prev };
            delete next[`settings.${key}`];
            return next;
        });
    };

    const handleSocialKeyChange = (oldKey: string, newKey: string) => {
        setSocialLinks(prev => {
            const { [oldKey]: value, ...rest } = prev;
            return { ...rest, [newKey]: value };
        });
    };

    const handleSocialValueChange = (key: string, value: string) => {
        setSocialLinks(prev => ({ ...prev, [key]: value }));
    };

    const addSocialLink = () => {
        const base = 'network';
        let i = 1;
        while (socialLinks[`${base}_${i}`]) i++;
        setSocialLinks(prev => ({ ...prev, [`${base}_${i}`]: '' }));
    };

    const removeSocialLink = (key: string) => {
        setSocialLinks(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const fd = new FormData();
        fd.append('_method', 'PUT');
        fd.append('settings[social_links]', JSON.stringify(socialLinks));

        Object.entries(settings).forEach(([key, value]) => {
            if (key === 'social_links') return;
            fd.append(`settings[${key}]`, value);
        });

        router.post(route('dashboard.site-settings.update'), fd, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(d.toast.savedSuccess);
                setProcessing(false);
            },
            onError: (errs) => {
                setErrors(errs);
                toast.error(d.siteContent.validationError);
                setProcessing(false);
            },
        });
    };

    const getFieldValue = (field: SettingField): string => {
        if (field.type === 'image') {
            if (settings[field.key]?.startsWith('http')) {
                return settings[field.key];
            }
            return settings[field.key]
                ? `/storage/${settings[field.key]}`
                : '';
        }
        return settings[field.key] || '';
    };

    const fieldLabel = (key: string): string => {
        const labels = d.siteSettings.fieldLabels as Record<string, string>;
        return labels[key.toLowerCase()] || key;
    };

    const socialPlaceholder = (platform: string): string => {
        const placeholders = d.siteSettings.social as Record<string, string>;
        return placeholders[platform.toLowerCase()] || d.form.placeholders.socialUrl;
    };

    const renderField = (field: SettingField) => {
        const error = errors[`settings.${field.key}`];

        switch (field.type) {
            case 'image':
                return (
                    <div>
                        <ImageUploader
                            value={settings[field.key]}
                            onChange={(path) => handleImageChange(field.key, path)}
                            folder="settings"
                            label={fieldLabel(field.key)}
                        />
                        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
                    </div>
                );

            case 'json':
                return field.key === 'social_links' ? (
                    <div>
                        <Label>{fieldLabel(field.key)}</Label>
                        <div className="mt-2 space-y-3">
                            {Object.entries(socialLinks).map(([platform, url]) => (
                                <div key={platform} className="flex items-start gap-2">
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <Input
                                            value={platform}
                                            onChange={e => handleSocialKeyChange(platform, e.target.value)}
                                            placeholder={d.form.placeholders.socialPlatform}
                                        />
                                        <Input
                                            value={url}
                                            onChange={e => handleSocialValueChange(platform, e.target.value)}
                                            placeholder={socialPlaceholder(platform)}
                                            dir="ltr"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="mt-0.5 shrink-0 text-destructive"
                                        onClick={() => removeSocialLink(platform)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
                                <Plus className="h-4 w-4 ms-1" /> {d.siteSettings.social.add}
                            </Button>
                        </div>
                        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
                    </div>
                ) : (
                    <div>
                        <Label>{fieldLabel(field.key)}</Label>
                        <Textarea
                            value={getFieldValue(field)}
                            onChange={e => handleValueChange(field.key, e.target.value)}
                            rows={6}
                            className="mt-2 font-mono text-sm"
                            dir="ltr"
                        />
                        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
                    </div>
                );

            default:
                return (
                    <div>
                        <Label>{fieldLabel(field.key)}</Label>
                        <Input
                            value={getFieldValue(field)}
                            onChange={e => handleValueChange(field.key, e.target.value)}
                            className="mt-2"
                        />
                        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
                    </div>
                );
        }
    };

    const translateTab = (label: string): string => {
        const tabs = d.siteSettings.tabs as Record<string, string>;
        const key = Object.keys(tabs).find(k => label.toLowerCase().includes(k));
        return key ? tabs[key] : label;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={d.siteSettings.title} />

            <form onSubmit={handleSubmit}>
                <div className="border-b">
                    <div className="flex items-center justify-between py-4 px-4">
                        <div>
                            <h1 className="text-xl font-semibold">{d.siteSettings.title}</h1>
                            <p className="text-sm text-muted-foreground">{d.siteSettings.description}</p>
                        </div>
                        <Button disabled={processing} type="submit">
                            {processing ? d.siteSettings.saving : d.form.buttons.save}
                        </Button>
                    </div>
                </div>

                <div className="p-4">
                    <Tabs defaultValue={groups[0]?.label || ''}>
                        <TabsList className="mb-6">
                            {groups.map(group => (
                                <TabsTrigger key={group.label} value={group.label}>
                                    {translateTab(group.label)}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {groups.map(group => (
                            <TabsContent key={group.label} value={group.label}>
                                <Card>
                                    <CardContent className="pt-6 space-y-6">
                                        {group.fields.map(field => (
                                            <div key={field.key}>
                                                {renderField(field)}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </form>
        </AppLayout>
    );
}
