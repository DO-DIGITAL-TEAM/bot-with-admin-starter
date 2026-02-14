import { useMemo } from 'react';
import { DataTableColumn } from 'mantine-datatable';
import { Text, Badge, Tooltip } from '@mantine/core';
import { Admin } from '@/api/entities';
import { usePagination } from '@/api/helpers';
import { AddButton } from '@/components/add-button';
import { DataTable } from '@/components/data-table';
import { useDeleteAdmin, useGetAdmins, useUpdateAdmin } from '@/hooks';
import { formatDate } from '@/utilities/date';
import { modals, openContextModal } from '@mantine/modals';
import { MODAL_NAMES } from '@/providers/modals-provider';
import { capitalize } from '@/utilities/text';
import { AdminInfo } from '@/components/admin-info';

type SortableFields = Pick<Admin, 'id' | 'created_at' | 'updated_at'>;

export function AdminsTable() {
  const { page, size, setSize, setPage } = usePagination();
  const { filters, sort } = DataTable.useDataTable<SortableFields>({
    sortConfig: {
      direction: 'desc',
      column: 'id',
    },
  });

  const { data: users, isLoading } = useGetAdmins({
    query: {
      page,
      size,
      sort: sort.query,
    },
  });

  const { mutate: update, isPending: isUpdateLoading } = useUpdateAdmin();
  const { mutate: deleteAdmin } = useDeleteAdmin();

  function openModal(): void;
  function openModal(user: Admin): void;
  function openModal(user?: Admin): void {
    openContextModal({
      modal: MODAL_NAMES.ADMIN,
      title: user?.id ? `Edit admin "${user?.username}"` : "Create admin",
      innerProps: { userId: user?.id },
    });
  }

  const openBlockModal = ({ id, email, username, role, is_active }: Admin) => {
    const action = is_active ? "block" : "unblock";

    modals.openConfirmModal({
      title: `${capitalize(action)} admin`,
      children: <Text size="sm">{`Are you sure you want to ${action} admin "${username}"?`}</Text>,
      labels: { confirm: capitalize(action), cancel: "Cancel" },
      confirmProps: { color: is_active ? 'red' : 'green' },
      onCancel: () => { },
      onConfirm: () => update({
        route: { id },
        variables: {
          email,
          username,
          role,
          is_active: !is_active,
        },
      })
    });
  };

  const openDeleteModal = (user: Admin) => modals.openConfirmModal({
    title: "Delete admin",
    children: <Text size="sm">{`Are you sure you want to delete admin "${user.username}"?`}</Text>,
    labels: { confirm: "Delete", cancel: "Cancel" },
    confirmProps: { color: 'red' },
    onCancel: () => { },
    onConfirm: () => deleteAdmin({ model: user, route: { id: user.id } }),
  });

  const columns: DataTableColumn<Admin>[] = useMemo(
    () => [
      {
        accessor: 'id',
        title: 'ID',
        width: "0%",
        sortable: true,
      },
      {
        accessor: 'username',
        title: 'Username',
        render: (admin: Admin) => <AdminInfo admin={admin} />,
      },
      {
        accessor: 'role',
        title: 'Role',
        render: (admin: Admin) => admin.role,
      },
      {
        accessor: 'is_active',
        title: 'Status',
        render: (admin: Admin) =>
          <Tooltip
            label="Click to change status"
            position="bottom"
            withArrow
          >
            <Badge
              color={admin.is_active ? "green" : "red"}
              variant="light"
              style={{ cursor: "pointer" }}
              onClick={() => openBlockModal(admin)}
            >
              {admin.is_active ? "Active" : "Blocked"}
            </Badge>
          </Tooltip>,
      },
      {
        accessor: 'created_at',
        title: 'Created at',
        noWrap: true,
        width: "0%",
        sortable: true,
        render: (user) => formatDate(user.created_at),
      },
      {
        accessor: 'updated_at',
        title: 'Updated at',
        noWrap: true,
        width: "0%",
        sortable: true,
        render: (user) => formatDate(user.updated_at),
      },
      {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        width: '0%',
        render: (user: Admin) => (
          <DataTable.Actions
            onEdit={() => openModal(user)}
            onDelete={() => openDeleteModal(user)}
          />
        ),
      },
    ],
    []
  );

  return (
    <DataTable.Container>
      <DataTable.Title
        title="Admins"
        description="Admins list"
        actions={
          <AddButton variant="default" size="xs" onClick={() => openModal()}>
            Create admin
          </AddButton>
        }
      />
      <DataTable.Filters filters={filters.filters} onClear={filters.clear} />
      <DataTable.Content>
        <DataTable.Table
          minHeight={240}
          noRecordsText={DataTable.noRecordsText('admin')}
          recordsPerPageLabel={DataTable.recordsPerPageLabel('admins')}
          paginationText={DataTable.paginationText('admins')}
          page={page}
          records={users?.data.items ?? []}
          fetching={isLoading}
          onPageChange={setPage}
          recordsPerPage={size}
          totalRecords={users?.data.totalCount ?? 0}
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
