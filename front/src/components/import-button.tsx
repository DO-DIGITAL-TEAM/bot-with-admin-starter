import { forwardRef } from 'react';
import { Button, type ButtonProps, createPolymorphicComponent } from '@mantine/core';
import { PiDownloadSimple as ImportIcon} from 'react-icons/pi';

export type ImportButtonProps = Omit<ButtonProps, 'leftSection'>;

export const ImportButton = createPolymorphicComponent<'button', ImportButtonProps>(
  forwardRef<HTMLButtonElement, ImportButtonProps>((props, ref) => (
    <Button
      ref={ref}
      leftSection={<ImportIcon size="1rem" />}
      {...props} />
  ))
);
