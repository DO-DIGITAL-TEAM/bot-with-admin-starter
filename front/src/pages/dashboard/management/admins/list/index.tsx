import { Grid } from '@mantine/core';
import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { paths } from '@/routes';
import { AdminsTable } from './admins-table';

const breadcrumbs = [
  { label: 'Dashboard', href: paths.dashboard.root },
  { label: 'Management', href: paths.dashboard.management.root },
  { label: 'Admins' },
];

export default function ListAdminsPage() {
  return (
    <Page title="Admins">
      <PageHeader title="Admins list" breadcrumbs={breadcrumbs} />

      <Grid>
        <Grid.Col span={12}>
          <AdminsTable />
        </Grid.Col>
      </Grid>
    </Page>
  );
}
