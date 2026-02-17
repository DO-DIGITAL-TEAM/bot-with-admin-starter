import { useMemo } from 'react';
import { DataTableColumn } from 'mantine-datatable';
import { Text, Badge } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { Wordbook } from '@/api/entities';
import { usePagination } from '@/api/helpers';
import { AddButton } from '@/components/add-button';
import { DataTable } from '@/components/data-table';
import { useDeleteWordbook, useGetWordbooks } from '@/hooks';
import { formatDate } from '@/utilities/date';
import { modals, openContextModal } from '@mantine/modals';
import { MODAL_NAMES } from '@/providers/modals-provider';
import { paths } from '@/routes';

type SortableFields = Pick<Wordbook, 'id' | 'name' | 'load_to' | 'created_at' | 'updated_at'>;

export function WordbooksTable() {
  const navigate = useNavigate();
  const { page, size, setSize, setPage } = usePagination();
  const { filters, sort } = DataTable.useDataTable<SortableFields>({
    sortConfig: {
      direction: 'desc',
      column: 'id',
    },
  });

  const { data: wordbooks, isLoading } = useGetWordbooks({
    query: {
      page,
      size,
      sort: sort.query,
    },
  });

  const { mutate: deleteWordbook } = useDeleteWordbook();

  function openModal(): void;
  function openModal(wordbook: Wordbook): void;
  function openModal(wordbook?: Wordbook): void {
    if (wordbook?.id) {
      navigate(paths.dashboard.localization.wordbooks.edit.replace(':id', String(wordbook.id)));
    } else {
      openContextModal({
        modal: MODAL_NAMES.WORDBOOK,
        title: 'Create wordbook',
        innerProps: { wordbookId: undefined },
      });
    }
  }

  const openDeleteModal = (wordbook: Wordbook) =>
    modals.openConfirmModal({
      title: 'Delete wordbook',
      children: <Text size="sm">{`Are you sure you want to delete wordbook "${wordbook.name}"?`}</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onCancel: () => {},
      onConfirm: () => deleteWordbook({ model: wordbook, route: { id: wordbook.id } }),
    });

  const columns: DataTableColumn<Wordbook>[] = useMemo(
    () => [
      {
        accessor: 'id',
        title: 'ID',
        width: '0%',
        sortable: true,
      },
      {
        accessor: 'name',
        title: 'Name',
        sortable: true,
      },
      {
        accessor: 'load_to',
        title: 'Load To',
        render: (wordbook: Wordbook) => (
          <Badge color={wordbook.load_to === 'all' ? 'blue' : 'green'} variant="light">
            {wordbook.load_to.toUpperCase()}
          </Badge>
        ),
      },
      {
        accessor: 'words',
        title: 'Words Count',
        render: (wordbook: Wordbook) => wordbook.words?.length || 0,
      },
      {
        accessor: 'created_at',
        title: 'Created at',
        noWrap: true,
        width: '0%',
        sortable: true,
        render: (wordbook) => formatDate(wordbook.created_at),
      },
      {
        accessor: 'updated_at',
        title: 'Updated at',
        noWrap: true,
        width: '0%',
        sortable: true,
        render: (wordbook) => formatDate(wordbook.updated_at),
      },
      {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        width: '0%',
        render: (wordbook: Wordbook) => (
          <DataTable.Actions
            onEdit={() => openModal(wordbook)}
            onDelete={wordbook.defended ? undefined : () => openDeleteModal(wordbook)}
            disabledEdit={wordbook.defended}
          />
        ),
      },
    ],
    []
  );

  return (
    <DataTable.Container>
      <DataTable.Title
        title="Wordbooks"
        description="Manage translation dictionaries"
        actions={
          <AddButton variant="default" size="xs" onClick={() => openModal()}>
            Create wordbook
          </AddButton>
        }
      />
      <DataTable.Filters filters={filters.filters} onClear={filters.clear} />
      <DataTable.Content>
        <DataTable.Table
          minHeight={240}
          noRecordsText={DataTable.noRecordsText('wordbook')}
          recordsPerPageLabel={DataTable.recordsPerPageLabel('wordbooks')}
          paginationText={DataTable.paginationText('wordbooks')}
          page={page}
          records={wordbooks?.data.items ?? []}
          fetching={isLoading}
          onPageChange={setPage}
          recordsPerPage={size}
          totalRecords={wordbooks?.data.totalCount ?? 0}
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
