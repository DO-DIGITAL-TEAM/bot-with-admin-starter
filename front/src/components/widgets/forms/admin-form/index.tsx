import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useEffect } from "react";
import {
  Box,
  Button,
  LoadingOverlay,
  Select,
  Skeleton,
  Stack,
  TextInput,
  Tooltip,
  rem,
} from "@mantine/core";
import { useCreateAdmin, useOneAdmin, useUpdateAdmin } from "@/hooks";
import { Roles, AdminDto } from '@/api/entities';
import { PasswordStrength } from '@/components/forms/password-strength';
import { closeModal } from '@mantine/modals';

interface Props {
  modalId: string;
  userId: number | undefined;
}

enum AdminStatus {
  Active = "Active",
  Inactive = "Blocked",
}

export const AdminForm: FC<Props> = ({ modalId, userId }) => {
  const { mutate: update, isPending: isUpdateLoading } = useUpdateAdmin();
  const { mutate: create, isPending: isCreateLoading } = useCreateAdmin();
  const { data: user, isLoading } = useOneAdmin({ route: { id: userId } });

  const methods = useForm<AdminDto>({
    resolver: zodResolver(AdminDto),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      username: "",
      email: "",
      role: Roles.Admin,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = methods;

  useEffect(() => {
    if (user) {
      methods.reset(user?.data);
    } else {
      setValue('is_active', true);
    }
  }, [user]);

  const handleStatusChange = (value: string | null) => {
    const isActive = value === AdminStatus.Active;
    methods.setValue('is_active', isActive);
  };

  const onSubmit: SubmitHandler<AdminDto> = async (values: any) => {
    const data = {
      variables: values,
      route: { id: userId },
    };

    const onSuccess = () => {
      closeModal(modalId);
    };

    if (userId) {
      update(data, { onSuccess });
    } else {
      create(data, { onSuccess });
    }
  };

  return (
    <FormProvider {...methods}>
      <LoadingOverlay visible={isLoading} />
      <Box component="form" onSubmit={handleSubmit(onSubmit)} pos="relative">
        <Box>
          <Stack pb={rem(30)}>
            <Controller
              name="username"
              render={({ field }) => {
                return (
                  <Skeleton visible={isLoading}>
                    <TextInput
                      label="Username"
                      placeholder="username"
                      error={errors.username?.message}
                      {...field}
                      value={field?.value}
                    />
                  </Skeleton>
                );
              }}
            />
            <Controller
              name="email"
              render={({ field }) => {
                return (
                  <Skeleton visible={isLoading}>
                    <TextInput
                      type="email"
                      label="Email"
                      placeholder="john.doe@example.com"
                      error={errors.email?.message}
                      {...field}
                      value={field?.value}
                    />
                  </Skeleton>
                );
              }}
            />
            <Controller
              name="is_active"
              render={({ field }) => {
                return (
                  <Skeleton visible={isLoading}>
                    <Select
                      label="Status"
                      placeholder="Status"
                      error={errors.is_active?.message}
                      data={[AdminStatus.Active, AdminStatus.Inactive]}
                      {...field}
                      value={watch('is_active') ? AdminStatus.Active : AdminStatus.Inactive}
                      onChange={handleStatusChange}
                    />
                  </Skeleton>
                );
              }}
            />
            <Controller
              name="password"
              render={({ field }) => {
                return (
                  <Skeleton visible={isLoading}>
                    <Tooltip
                      label="Enter a new password if you want to change it"
                      openDelay={500}
                      position="right"
                      withArrow
                    >
                      <PasswordStrength
                        label="Password"
                        placeholder={user ? 'Enter new password to change' : 'Password'}
                        {...field}
                      />
                    </Tooltip>
                  </Skeleton>
                )
              }}
            />
          </Stack>
          <Button
            loading={isCreateLoading || isUpdateLoading}
            w="100%"
            type="submit"
          >
            Save
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};
