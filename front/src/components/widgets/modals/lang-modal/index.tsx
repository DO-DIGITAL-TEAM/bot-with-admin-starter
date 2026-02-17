import { ContextModalProps } from '@mantine/modals';
import { LangForm } from '../../forms/lang-form';

export function LangModal({ context, id, innerProps }: ContextModalProps<{ langId?: number }>) {
  return <LangForm modalId={id} langId={innerProps.langId} />;
}
