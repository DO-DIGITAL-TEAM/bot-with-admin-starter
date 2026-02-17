import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useEffect } from 'react';
import {
  Box,
  Button,
  LoadingOverlay,
  Select,
  Skeleton,
  Stack,
  TextInput,
  rem,
} from '@mantine/core';
import { useCreateLang, useOneLang, useUpdateLang } from '@/hooks';
import { DateFormat, LangDto } from '@/api/entities';
import { closeModal } from '@mantine/modals';

interface Props {
  modalId: string;
  langId: number | undefined;
}

export const LangForm: FC<Props> = ({ modalId, langId }) => {
  const { mutate: update, isPending: isUpdateLoading } = useUpdateLang();
  const { mutate: create, isPending: isCreateLoading } = useCreateLang();
  const { data: lang, isLoading } = useOneLang({ route: { id: langId } });

  const methods = useForm<LangDto>({
    resolver: zodResolver(LangDto),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      slug: '',
      title: '',
      active: true,
      dir: 'ltr',
      dateformat: DateFormat.En,
      defended: false,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = methods;

  useEffect(() => {
    if (lang) {
      methods.reset(lang?.data);
    } else {
      setValue('active', true);
      setValue('dir', 'ltr');
      setValue('dateformat', DateFormat.En);
      setValue('defended', false);
    }
  }, [lang]);

  const onSubmit: SubmitHandler<LangDto> = async (values: any) => {
    const data = {
      variables: langId ? { ...values, id: langId } : values,
      route: { id: langId },
    };

    const onSuccess = () => {
      closeModal(modalId);
    };

    if (langId) {
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
              name="slug"
              render={({ field }) => {
                return (
                  <Skeleton visible={isLoading}>
                    <TextInput
                      label="Slug"
                      placeholder="en"
                      error={errors.slug?.message}
                      {...field}
                      value={field?.value || ''}
                    />
                  </Skeleton>
                );
              }}
            />
            <Controller
              name="title"
              render={({ field }) => {
                return (
                  <Skeleton visible={isLoading}>
                    <TextInput
                      label="Title"
                      placeholder="English"
                      error={errors.title?.message}
                      {...field}
                      value={field?.value || ''}
                    />
                  </Skeleton>
                );
              }}
            />
            <Controller
              name="dir"
              render={({ field }) => {
                return (
                  <Skeleton visible={isLoading}>
                    <Select
                      label="Text Direction"
                      placeholder="Select direction"
                      error={errors.dir?.message}
                      data={[
                        { value: 'ltr', label: 'Left to Right (LTR)' },
                        { value: 'rtl', label: 'Right to Left (RTL)' },
                      ]}
                      {...field}
                      value={field?.value || 'ltr'}
                    />
                  </Skeleton>
                );
              }}
            />
            <Controller
              name="dateformat"
              render={({ field }) => {
                return (
                  <Skeleton visible={isLoading}>
                    <Select
                      label="Date Format"
                      placeholder="Select format"
                      error={errors.dateformat?.message}
                      data={[
                        { value: DateFormat.En, label: 'American (MM/DD/YYYY)' },
                        { value: DateFormat.Ru, label: 'European (DD.MM.YYYY)' },
                      ]}
                      {...field}
                      value={field?.value || DateFormat.En}
                    />
                  </Skeleton>
                );
              }}
            />
            <Controller
              name="active"
              render={({ field }) => {
                return (
                  <Skeleton visible={isLoading}>
                    <Select
                      label="Status"
                      placeholder="Status"
                      error={errors.active?.message}
                      data={[
                        { value: 'true', label: 'Active' },
                        { value: 'false', label: 'Inactive' },
                      ]}
                      {...field}
                      value={watch('active') ? 'true' : 'false'}
                      onChange={(value) => setValue('active', value === 'true')}
                    />
                  </Skeleton>
                );
              }}
            />
          </Stack>
          <Button loading={isCreateLoading || isUpdateLoading} w="100%" type="submit">
            Save
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};
