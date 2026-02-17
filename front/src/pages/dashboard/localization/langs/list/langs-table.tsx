import { useMemo, useState } from 'react';
import { DataTableColumn } from 'mantine-datatable';
import { TextInput, Checkbox, Select, ActionIcon, Tooltip, Text } from '@mantine/core';
import { Lang, DateFormat } from '@/api/entities';
import { usePagination } from '@/api/helpers';
import { AddButton } from '@/components/add-button';
import { DataTable } from '@/components/data-table';
import { useDeleteLang, useGetLangs, useUpdateLang } from '@/hooks';
import { formatDate } from '@/utilities/date';
import { modals, openContextModal } from '@mantine/modals';
import { MODAL_NAMES } from '@/providers/modals-provider';
import { useDebouncedCallback } from '@mantine/hooks';

type SortableFields = Pick<Lang, 'id' | 'slug' | 'title' | 'active' | 'created_at' | 'updated_at'>;

export function LangsTable() {
  const { page, size, setSize, setPage } = usePagination();
  const { filters, sort } = DataTable.useDataTable<SortableFields>({
    sortConfig: {
      direction: 'desc',
      column: 'id',
    },
  });

  const { data: langs, isLoading } = useGetLangs({
    query: {
      page,
      size,
      sort: sort.query,
    },
  });

  const { mutate: update, isPending: isUpdateLoading } = useUpdateLang();
  const { mutate: deleteLang } = useDeleteLang();
  const [editingCells, setEditingCells] = useState<Record<string, Partial<Lang>>>({});

  function openModal(): void;
  function openModal(lang: Lang): void;
  function openModal(lang?: Lang): void {
    openContextModal({
      modal: MODAL_NAMES.LANG,
      title: lang?.id ? `Edit language "${lang?.title || lang?.slug}"` : 'Create language',
      innerProps: { langId: lang?.id },
    });
  }

  const handleFieldChange = (langId: number, field: keyof Lang, value: any) => {
    setEditingCells((prev) => ({
      ...prev,
      [langId]: {
        ...prev[langId],
        [field]: value,
      },
    }));
  };

  const debouncedUpdate = useDebouncedCallback((langId: number, updates: Partial<Lang>) => {
    update({
      route: { id: langId },
      variables: {
        id: langId,
        ...updates,
      },
    });
    setEditingCells((prev) => {
      const newState = { ...prev };
      delete newState[langId];
      return newState;
    });
  }, 1000);

  const handleFieldBlur = (lang: Lang) => {
    const updates = editingCells[lang.id];
    if (updates && Object.keys(updates).length > 0) {
      debouncedUpdate(lang.id, updates);
    }
  };

  const handleActiveToggle = (lang: Lang, checked: boolean) => {
    update({
      route: { id: lang.id },
      variables: {
        id: lang.id,
        active: checked,
      },
    });
  };

  const openDeleteModal = (lang: Lang) =>
    modals.openConfirmModal({
      title: 'Delete language',
      children: <Text size="sm">{`Are you sure you want to delete language "${lang.title || lang.slug}"?`}</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onCancel: () => {},
      onConfirm: () => deleteLang({ model: lang, route: { id: lang.id } }),
    });

  const columns: DataTableColumn<Lang>[] = useMemo(
    () => [
      {
        accessor: 'id',
        title: 'ID',
        width: '0%',
        sortable: true,
      },
      {
        accessor: 'slug',
        title: 'Slug',
        sortable: true,
        render: (lang: Lang) => {
          const editingValue = editingCells[lang.id]?.slug ?? lang.slug;
          return (
            <TextInput
              value={editingValue || ''}
              onChange={(e) => {
                handleFieldChange(lang.id, 'slug', e.target.value);
                debouncedUpdate(lang.id, { ...editingCells[lang.id], slug: e.target.value });
              }}
              onBlur={() => handleFieldBlur(lang)}
              size="xs"
              disabled={lang.defended}
              styles={{ input: { border: 'none', padding: '4px 8px' } }}
            />
          );
        },
      },
      {
        accessor: 'title',
        title: 'Title',
        sortable: true,
        render: (lang: Lang) => {
          const editingValue = editingCells[lang.id]?.title ?? lang.title;
          return (
            <TextInput
              value={editingValue || ''}
              onChange={(e) => {
                handleFieldChange(lang.id, 'title', e.target.value);
                debouncedUpdate(lang.id, { ...editingCells[lang.id], title: e.target.value });
              }}
              onBlur={() => handleFieldBlur(lang)}
              size="xs"
              disabled={lang.defended}
              styles={{ input: { border: 'none', padding: '4px 8px' } }}
            />
          );
        },
      },
      {
        accessor: 'active',
        title: 'Activity',
        render: (lang: Lang) => (
          <Checkbox
            checked={lang.active}
            onChange={(e) => handleActiveToggle(lang, e.currentTarget.checked)}
            disabled={lang.defended}
          />
        ),
      },
      {
        accessor: 'dir',
        title: 'Direction',
        render: (lang: Lang) => {
          const editingValue = editingCells[lang.id]?.dir ?? lang.dir;
          return (
            <Select
              value={editingValue || 'ltr'}
              onChange={(value) => {
                if (value) {
                  handleFieldChange(lang.id, 'dir', value);
                  debouncedUpdate(lang.id, { ...editingCells[lang.id], dir: value });
                }
              }}
              data={[
                { value: 'ltr', label: 'LTR' },
                { value: 'rtl', label: 'RTL' },
              ]}
              size="xs"
              disabled={lang.defended}
              styles={{ input: { border: 'none', padding: '4px 8px' } }}
            />
          );
        },
      },
      {
        accessor: 'dateformat',
        title: 'Date Format',
        render: (lang: Lang) => {
          const editingValue = editingCells[lang.id]?.dateformat ?? lang.dateformat;
          return (
            <Select
              value={editingValue || DateFormat.En}
              onChange={(value) => {
                if (value) {
                  handleFieldChange(lang.id, 'dateformat', value as DateFormat);
                  debouncedUpdate(lang.id, { ...editingCells[lang.id], dateformat: value as DateFormat });
                }
              }}
                      data={[
                        { value: DateFormat.En, label: 'American' },
                        { value: DateFormat.Ru, label: 'European' },
                      ]}
              size="xs"
              disabled={lang.defended}
              styles={{ input: { border: 'none', padding: '4px 8px' } }}
            />
          );
        },
      },
      {
        accessor: 'created_at',
        title: 'Created at',
        noWrap: true,
        width: '0%',
        sortable: true,
        render: (lang) => formatDate(lang.created_at),
      },
      {
        accessor: 'updated_at',
        title: 'Updated at',
        noWrap: true,
        width: '0%',
        sortable: true,
        render: (lang) => formatDate(lang.updated_at),
      },
      {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        width: '0%',
        render: (lang: Lang) => (
          <DataTable.Actions
            onEdit={() => openModal(lang)}
            onDelete={lang.defended ? undefined : () => openDeleteModal(lang)}
            disabledEdit={lang.defended}
          />
        ),
      },
    ],
    [editingCells]
  );

  return (
    <DataTable.Container>
      <DataTable.Title
        title="Languages"
        description="Manage bot languages"
        actions={
          <AddButton variant="default" size="xs" onClick={() => openModal()}>
            Create language
          </AddButton>
        }
      />
      <DataTable.Filters filters={filters.filters} onClear={filters.clear} />
      <DataTable.Content>
        <DataTable.Table
          minHeight={240}
          noRecordsText={DataTable.noRecordsText('language')}
          recordsPerPageLabel={DataTable.recordsPerPageLabel('languages')}
          paginationText={DataTable.paginationText('languages')}
          page={page}
          records={langs?.data.items ?? []}
          fetching={isLoading}
          onPageChange={setPage}
          recordsPerPage={size}
          totalRecords={langs?.data.totalCount ?? 0}
          onRecordsPerPageChange={setSize}
          recordsPerPageOptions={[5, 15, 30]}
          sortStatus={sort.status}
          onSortStatusChange={sort.change}
          columns={columns}
        />
      </DataTable.Content>
    </DataTable.Container>
  );
}
