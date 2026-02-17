import { ContextModalProps } from '@mantine/modals';
import { WordbookForm } from '../../forms/wordbook-form';

export function WordbookModal({ context, id, innerProps }: ContextModalProps<{ wordbookId?: number }>) {
  return <WordbookForm modalId={id} wordbookId={innerProps.wordbookId} />;
}
