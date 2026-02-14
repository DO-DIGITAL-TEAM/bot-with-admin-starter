import { UnstyledButton, Checkbox, Text, Avatar, Box, rem } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import s from './image-checkbox.module.scss';
import { firstLetters } from '@/utilities/text';

interface ImageCheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?(checked: boolean): void;
  title: string;
  description: string;
  image: string;
}

export function ImageCheckbox({
  checked,
  defaultChecked,
  onChange,
  title,
  description,
  className,
  image,
  ...others
}: ImageCheckboxProps & Omit<React.ComponentPropsWithoutRef<'button'>, keyof ImageCheckboxProps>) {
  const [value, handleChange] = useUncontrolled({
    value: checked,
    defaultValue: defaultChecked,
    finalValue: false,
    onChange,
  });

  return (
    <UnstyledButton
      {...others}
      onClick={() => handleChange(!value)}
      data-checked={value || undefined}
      className={s.button}
    >
      <Avatar size={rem(40)} src={image} alt={title}>
        {firstLetters(title)}
      </Avatar>

      <Box className={s.body}>
        <Text c="dimmed" size="xs" lh={1} mb={5}>
          {description}
        </Text>
        <Text fw={500} size="sm" lh={1}>
          {title}
        </Text>
      </Box>

      <Checkbox
        checked={value}
        onChange={() => { }}
        tabIndex={-1}
        styles={{ input: { cursor: 'pointer' } }}
      />
    </UnstyledButton>
  );
}
