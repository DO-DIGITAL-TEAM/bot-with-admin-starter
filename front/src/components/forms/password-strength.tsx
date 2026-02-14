import { Box, Progress, PasswordInput, Group, Text, Center, PasswordInputProps } from '@mantine/core';
import { FC } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';

type Requirement = {
  re: RegExp;
  label: string;
}

const PasswordRequirement = ({ meets, label }: { meets: boolean; label: string }) => {
  return (
    <Text component="div" c={meets ? 'teal' : 'red'} mt={5} size="sm">
      <Center inline>
        {meets ? <IconCheck size="0.9rem" stroke={1.5} /> : <IconX size="0.9rem" stroke={1.5} />}
        <Box ml={7}>{label}</Box>
      </Center>
    </Text>
  );
};

export const PasswordStrength: FC<PasswordInputProps> = ({ value='', ...props }) => {
  const requirements: Requirement[] = [
    { re: /[0-9]/, label: 'Contains digits' },
    { re: /[a-z]/, label: 'Contains lowercase letter' },
    { re: /[A-Z]/, label: 'Contains uppercase letter' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Contains special character' },
  ];

  const getStrength = (password: string) => {
    let multiplier = password.length > 5 ? 0 : 1;

    requirements.forEach(requirement => {
      if (!requirement.re.test(password)) {
        multiplier += 1;
      }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
  };

  const strength = getStrength(value as string);
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(value as string)}
    />
  ));
  const bars = Array(4)
    .fill(0)
    .map((_, index) => (
      <Progress
        styles={{ section: { transitionDuration: '0ms' } }}
        value={
          (value as string).length > 0 && index === 0 ? 100 : strength >= ((index + 1) / 4) * 100 ? 100 : 0
        }
        color={strength > 80 ? 'teal' : strength > 50 ? 'yellow' : 'red'}
        key={index}
        size={4}
      />
    ));

  return (
    <Box>
      <PasswordInput
        value={value}
        {...props}
      />

      <Group gap={5} grow mt="xs" mb="md">
        {bars}
      </Group>

      <PasswordRequirement label="Contains at least 8 characters" meets={(value as string).length > 7} />
      {checks}
    </Box>
  );
};
