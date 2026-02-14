import { ContextModalProps } from '@mantine/modals';
import { AdminForm } from '../../forms/admin-form';

export function AdminModal({ context, id, innerProps }: ContextModalProps<{ userId?: number }>) {
  return <AdminForm modalId={id} userId={innerProps.userId} />;
}
