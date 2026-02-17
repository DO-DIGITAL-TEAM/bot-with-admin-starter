import { Grid } from '@mantine/core';
import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { paths } from '@/routes';
import { WordbooksTable } from './wordbooks-table';

const breadcrumbs = [
  { label: 'Dashboard', href: paths.dashboard.root },
  { label: 'Localization', href: paths.dashboard.localization.root },
  { label: 'Wordbooks' },
];

export default function ListWordbooksPage() {
  return (
    <Page title="Wordbooks">
      <PageHeader title="Wordbooks list" breadcrumbs={breadcrumbs} />

      <Grid>
        <Grid.Col span={12}>
          <WordbooksTable />
        </Grid.Col>
      </Grid>
    </Page>
  );
}
