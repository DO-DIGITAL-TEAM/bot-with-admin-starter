import { Grid } from '@mantine/core';
import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { paths } from '@/routes';
import { LangsTable } from './langs-table';

const breadcrumbs = [
  { label: 'Dashboard', href: paths.dashboard.root },
  { label: 'Localization', href: paths.dashboard.localization.root },
  { label: 'Languages' },
];

export default function ListLangsPage() {
  return (
    <Page title="Languages">
      <PageHeader title="Languages list" breadcrumbs={breadcrumbs} />

      <Grid>
        <Grid.Col span={12}>
          <LangsTable />
        </Grid.Col>
      </Grid>
    </Page>
  );
}
