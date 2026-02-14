import {  Stack, Text, Title } from '@mantine/core';
import { Page } from '@/components/page';
import { UnderlineShape } from '@/components/underline-shape';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <Page title="Login">
      <Stack gap="xl">
        <Stack>
          <Title order={2}>
            Welcome back! Please{' '}
            <Text fz="inherit" fw="inherit" component="span" pos="relative">
              Sign in
              <UnderlineShape
                c="blue"
                left="0"
                pos="absolute"
                h="0.625rem"
                bottom="-1rem"
                w="7rem"
              />
            </Text>{' '}
            to continue.
          </Title>
        </Stack>
        <LoginForm />
      </Stack>
    </Page>
  );
}
