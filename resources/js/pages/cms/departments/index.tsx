import CmsPagination from '@/components/cms/cms-pagination';
import CmsErrorBanner from '@/components/cms/cms-error-banner';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCms } from '@/hooks/use-cms';
import AppLayout from '@/layouts/app-layout';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem, PaginatedData } from '@/types';
import { CmsDepartment } from '@/types/cms';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, Edit, Plus, Search, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function DepartmentsIndex({ departments, filters }: { departments: PaginatedData<CmsDepartment>; filters: { search?: string } }) {
  const { c } = useCms();

  const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [{ label: c.nav.departments, href: '/cms/departments' }]);

  const [deleteItem, setDeleteItem] = useState<CmsDepartment | null>(null);

  const search: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    router.get('/cms/departments', { search: (e.target as HTMLFormElement).search.value });
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    router.delete(`/cms/departments/${deleteItem.id}`, {
      onFinish: () => setDeleteItem(null),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={c.departments.title} />
      <div className="flex flex-col gap-6 p-6">
        <CmsErrorBanner />
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-3xl leading-snug font-extrabold">{c.departments.title}</h1>
            <p className="text-muted-foreground text-sm">{c.departments.subtitle}</p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/cms/departments/create">
              <Plus className="h-4 w-4" /> {c.departments.add}
            </Link>
          </Button>
        </div>

        <form onSubmit={search} className="relative w-full sm:w-72">
          <Search className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2" />
          <Input name="search" defaultValue={filters.search} placeholder={c.departments.search} className="ps-9" />
        </form>

        {departments.data.length === 0 ? (
          <div className="bg-card text-muted-foreground rounded-xl border px-6 py-10 text-center text-sm">
            {filters.search ? c.departments.emptyFiltered : c.common.noRecords}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departments.data.map((dept) => (
              <div key={dept.id} className="bg-card flex flex-col justify-between rounded-xl border p-5 shadow-sm">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {dept.image ? (
                        <img
                          src={dept.image.startsWith('http') ? dept.image : `/storage/${dept.image}`}
                          alt={dept.name}
                          className="h-9 w-9 rounded-lg border object-cover"
                        />
                      ) : (
                        <Building2 className="text-primary h-5 w-5" />
                      )}
                      <h3 className="font-display text-lg leading-snug font-extrabold">{dept.name}</h3>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4 text-sm">{dept.description || c.common.noDescription}</p>
                  <div className="text-muted-foreground space-y-1 text-xs">
                    <div>
                      {c.departments.head}: <span className="text-foreground font-medium">{dept.head?.name || c.departments.unassigned}</span>
                    </div>
                    <div>
                      {c.departments.levelsCount}: <span className="font-medium">{dept.levels_count ?? 0}</span>
                    </div>
                    <div>
                      {c.departments.subjectsCount}: <span className="font-medium">{dept.subjects_count ?? 0}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2 border-t pt-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/cms/departments/${dept.id}/edit`}>
                      <Edit className="ms-1 h-3.5 w-3.5" /> {c.common.edit}
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteItem(dept)}>
                    <Trash2 className="ms-1 h-3.5 w-3.5" /> {c.common.delete}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <CmsPagination paginator={departments} />

        <ConfirmationDialog
          isOpen={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDelete}
          title={c.departments.deleteTitle}
          description={c.departments.deleteDescription.replace('{name}', deleteItem?.name ?? '')}
        />
      </div>
    </AppLayout>
  );
}
