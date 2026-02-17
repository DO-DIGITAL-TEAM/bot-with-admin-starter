import { Lang, LoadTo } from '@/api/entities';
import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useGetAllLangs, useOneWordbook, useUpdateWordbook } from '@/hooks';
import { paths } from '@/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { ActionIcon, Box, Button, Grid, Group, Radio, Select, Stack, Table, Tabs, Text, TextInput } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconArrowLeft, IconDeviceFloppy, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

const breadcrumbs = [
  { label: 'Dashboard', href: paths.dashboard.root },
  { label: 'Localization', href: paths.dashboard.localization.root },
  { label: 'Wordbooks', href: paths.dashboard.localization.wordbooks.list },
  { label: 'Edit' },
];

export default function EditWordbookPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const wordbookId = id ? parseInt(id, 10) : undefined;
  const { data: wordbookData, isLoading } = useOneWordbook({ route: { id: wordbookId } });
  const { data: langsData } = useGetAllLangs();
  const { mutate: update, isPending: isUpdateLoading } = useUpdateWordbook();
  const [selectedLang, setSelectedLang] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('words');

  const langs = langsData?.data || [];
  const wordbook = wordbookData?.data;

  useEffect(() => {
    if (langs.length > 0 && !selectedLang) {
      setSelectedLang(langs[0].slug || '');
    }
  }, [langs, selectedLang]);

  const wordsWithTranslations = useMemo(() => {
    if (!wordbook?.words) return [];
    return wordbook.words.map((word: any) => {
      const translations: Record<string, string> = {};
      (word.translations || []).forEach((trans: any) => {
        if (trans.lang?.slug) {
          translations[trans.lang.slug] = trans.text || '';
        }
      });
      return {
        id: word.id,
        mark: word.mark || '',
        translations,
      };
    });
  }, [wordbook]);

  type WordbookFormData = {
    name?: string | null;
    load_to?: LoadTo;
    words: Array<{ id?: number; mark: string; translations: Record<string, string> }>;
  };

  const methods = useForm<WordbookFormData>({
    resolver: zodResolver(
      z.object({
        name: z.string().nullable().optional(),
        load_to: z.nativeEnum(LoadTo).optional(),
        words: z.array(
          z.object({
            id: z.number().optional(),
            mark: z.string(),
            translations: z.record(z.string(), z.string()),
          })
        ),
      })
    ),
    mode: 'onChange',
    defaultValues: {
      name: '',
      load_to: LoadTo.All,
      words: [],
    },
  });

  const { control, handleSubmit, reset, watch } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'words',
  });

  useEffect(() => {
    if (wordbook) {
      reset({
        name: wordbook.name || '',
        load_to: wordbook.load_to || LoadTo.All,
        words: wordsWithTranslations,
      });
    }
  }, [wordbook, wordsWithTranslations, reset]);

  const debouncedUpdateTranslation = useDebouncedCallback((wordIndex: number, langSlug: string, text: string) => {
    const currentWords = watch('words');
    const word = currentWords[wordIndex];
    if (word && word.id) {
      // TODO: Добавить API для обновления отдельного перевода
      // Пока что обновляем через обновление всего словаря
    }
  }, 1000);

  const onSubmit = async (values: any) => {
    // Преобразуем слова с переводами в формат для API
    // Убеждаемся, что для каждого слова есть переводы для всех языков
    const words = values.words.map((word: any) => {
      const translations: Array<{ lang_slug: string; text: string | null }> = [];
      
      // Добавляем переводы для всех языков
      langs.forEach((lang: Lang) => {
        if (lang.slug) {
          const text = word.translations?.[lang.slug];
          translations.push({
            lang_slug: lang.slug,
            text: text && text.trim() !== '' ? text : null,
          });
        }
      });

      return {
        mark: word.mark,
        translations,
      };
    });

    update({
      route: { id: wordbookId },
      variables: {
        name: values.name,
        load_to: values.load_to,
        words,
        id: wordbookId,
      },
    });
  };

  const addWord = () => {
    const translations: Record<string, string> = {};
    langs.forEach((lang: Lang) => {
      if (lang.slug) {
        translations[lang.slug] = '';
      }
    });
    append({ mark: '', translations });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!wordbook) {
    return <div>Wordbook not found</div>;
  }

  return (
    <Page title={`Edit Wordbook - ${wordbook.name}`}>
      <PageHeader
        title={`Dictionaries - Edit`}
        breadcrumbs={breadcrumbs}
      >
        <Group gap="xs">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(paths.dashboard.localization.wordbooks.list)}
          >
            Back
          </Button>
          <Button
            variant="subtle"
            color="red"
            leftSection={<IconX size={16} />}
            onClick={() => navigate(paths.dashboard.localization.wordbooks.list)}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={handleSubmit(onSubmit)}
            loading={isUpdateLoading}
          >
            Save
          </Button>
        </Group>
      </PageHeader>

      <Grid>
        <Grid.Col span={12}>
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'words')}>
            <Tabs.List>
              <Tabs.Tab value="parameters">Parameters</Tabs.Tab>
              <Tabs.Tab value="words">Words</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="parameters" pt="md">
              <Stack gap="md">
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextInput label="Name" placeholder="common" {...field} value={field.value || ''} />
                  )}
                />
                <Controller
                  name="load_to"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Load To"
                      data={[
                        { value: LoadTo.All, label: 'All' },
                        { value: LoadTo.Bot, label: 'Bot' },
                      ]}
                      {...field}
                      value={field.value || LoadTo.All}
                    />
                  )}
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="words" pt="md">
              <Stack gap="md">
                <Group>
                  <Text fw={500}>Language:</Text>
                  <Radio.Group value={selectedLang} onChange={setSelectedLang}>
                    <Group>
                      {langs.map((lang: Lang) => (
                        <Radio key={lang.id} value={lang.slug || ''} label={lang.title || lang.slug} />
                      ))}
                    </Group>
                  </Radio.Group>
                </Group>

                <Box>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Mark</Table.Th>
                        <Table.Th>Text ({selectedLang})</Table.Th>
                        <Table.Th style={{ width: '50px' }}></Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {fields.map((field, index) => (
                        <Table.Tr key={field.id}>
                          <Table.Td>
                            <Controller
                              name={`words.${index}.mark`}
                              control={control}
                              render={({ field }) => (
                                <TextInput
                                  {...field}
                                  value={field.value || ''}
                                  placeholder="word mark"
                                  size="xs"
                                />
                              )}
                            />
                          </Table.Td>
                          <Table.Td>
                            {selectedLang && (
                              <Controller
                                name={`words.${index}.translations.${selectedLang}`}
                                control={control}
                                render={({ field }) => (
                                  <TextInput
                                    {...field}
                                    value={field.value || ''}
                                    placeholder={`Translation for ${selectedLang}`}
                                    size="xs"
                                    onChange={(e) => {
                                      field.onChange(e);
                                      debouncedUpdateTranslation(index, selectedLang, e.target.value);
                                    }}
                                  />
                                )}
                              />
                            )}
                          </Table.Td>
                          <Table.Td>
                            <ActionIcon color="red" variant="light" onClick={() => remove(index)}>
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    variant="light"
                    onClick={addWord}
                    mt="md"
                  >
                    Add Word
                  </Button>
                </Box>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Grid.Col>
      </Grid>
    </Page>
  );
}
