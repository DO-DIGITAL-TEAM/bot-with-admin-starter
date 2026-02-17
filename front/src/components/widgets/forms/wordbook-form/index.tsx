import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  LoadingOverlay,
  Select,
  Skeleton,
  Stack,
  TextInput,
  rem,
  Text,
} from '@mantine/core';
import { useCreateWordbook, useOneWordbook, useUpdateWordbook } from '@/hooks';
import { LoadTo, WordbookDto } from '@/api/entities';
import { closeModal } from '@mantine/modals';
import { paths } from '@/routes';

interface Props {
  modalId: string;
  wordbookId: number | undefined;
}

export const WordbookForm: FC<Props> = ({ modalId, wordbookId }) => {
  const { mutate: update, isPending: isUpdateLoading } = useUpdateWordbook();
  const { mutate: create, isPending: isCreateLoading } = useCreateWordbook();
  const { data: wordbook, isLoading } = useOneWordbook({ route: { id: wordbookId } });

  const defaultValues = useMemo(() => {
    if (wordbook?.data) {
      const wb = wordbook.data;
      return {
        name: wb.name || '',
        load_to: wb.load_to || LoadTo.All,
        defended: wb.defended || false,
      };
    }
    return {
      name: '',
      load_to: LoadTo.All,
      defended: false,
    };
  }, [wordbook]);

  const methods = useForm<WordbookDto>({
    resolver: zodResolver(WordbookDto),
    mode: 'onChange',
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (wordbook?.data) {
      methods.reset(defaultValues);
    }
  }, [wordbook, defaultValues]);

  const onSubmit: SubmitHandler<WordbookDto> = async (values: any) => {
    const data = {
      variables: {
        name: values.name,
        load_to: values.load_to,
        id: wordbookId,
      },
      route: { id: wordbookId },
    };

    if (wordbookId) {
      update(data, {
        onSuccess: () => {
          closeModal(modalId);
        },
      });
    } else {
      create(data, {
        onSuccess: (response: any) => {
          closeModal(modalId);
          // После создания переходим на страницу редактирования для добавления слов
          if (response?.data?.id) {
            window.location.href = paths.dashboard.localization.wordbooks.edit.replace(':id', String(response.data.id));
          }
        },
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <LoadingOverlay visible={isLoading} />
      <Box component="form" onSubmit={handleSubmit(onSubmit)} pos="relative">
        <Box>
          <Stack pb={rem(30)}>
            <Controller
              name="name"
              render={({ field }) => {
                return (
                  <Skeleton visible={isLoading}>
                    <TextInput
                      label="Name"
                      placeholder="common"
                      error={errors.name?.message}
                      {...field}
                      value={field?.value || ''}
                    />
                  </Skeleton>
                );
              }}
            />
            <Controller
              name="load_to"
              render={({ field }) => {
                return (
                  <Skeleton visible={isLoading}>
                    <Select
                      label="Load To"
                      placeholder="Select target"
                      error={errors.load_to?.message}
                      data={[
                        { value: LoadTo.All, label: 'All' },
                        { value: LoadTo.Bot, label: 'Bot' },
                      ]}
                      {...field}
                      value={field?.value || LoadTo.All}
                    />
                  </Skeleton>
                );
              }}
            />
          </Stack>

          {!wordbookId && (
            <Text size="sm" c="dimmed" mt="md">
              After creating the wordbook, you will be redirected to the edit page where you can add words and translations.
            </Text>
          )}

          <Button loading={isCreateLoading || isUpdateLoading} w="100%" type="submit" mt="md">
            Save
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};
