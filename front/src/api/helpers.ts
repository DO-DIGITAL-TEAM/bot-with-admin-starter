import { useState } from 'react';
import {
  QueryClient,
  UndefinedInitialDataOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryResult,
  UseQueryOptions,
} from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { z, ZodError } from 'zod';
import { client } from './axios';
import { filter } from 'rambda';

interface EnhancedMutationParams<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> extends Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  'mutationFn' | 'onSuccess' | 'onError' | 'onSettled'
> {
  onSuccess?: (
    data: TData,
    variables: TVariables,
    context: TContext,
    queryClient: QueryClient
  ) => unknown;
  onError?: (
    error: TError,
    variables: TVariables,
    context: TContext | undefined,
    queryClient: QueryClient
  ) => unknown;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context: TContext | undefined,
    queryClient: QueryClient
  ) => unknown;
}

export enum FilterRule {
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUALS = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUALS = 'lte',
  LIKE = 'like',
  NOT_LIKE = 'nlike',
  IN = 'in',
  NOT_IN = 'nin',
  IS_NULL = 'isnull',
  IS_NOT_NULL = 'isnotnull',
  BETWEEN = 'between',
}

export type FilteringType = {
  field: string;
  rule: FilterRule,
  value: number | string | number[] | string[] | Date;
  label?: string | undefined;
}

export function buildFilteringParam(
  filters: FilteringType[],
  searchParams: URLSearchParams,
) {
  for (let [index, { field, rule, value }] of filters.entries()) {
    if (Array.isArray(value) && value.length) {
      value = value.join(',');
    } else if (typeof value === undefined) {
      continue;
    }

    searchParams.set(`filters[${index}]`, `${field}:${rule}:${value}`);
  }

  return searchParams;
}

/**
 * Create a URL with query parameters and route parameters
 *
 * @param base - The base URL with route parameters
 * @param queryParams - The query parameters
 * @param routeParams - The route parameters
 * @param filters - The filters
 * @returns The URL with query parameters
 * @example
 * createUrl('/api/users/:id', { page: 1 }, { id: 1 });
 * // => '/api/users/1?page=1'
 */
function createUrl(
  base: string,
  queryParams?: Record<string, string | number | undefined>,
  routeParams?: Record<string, string | number | undefined>,
  filters?: FilteringType[] | undefined,
) {
  const url = Object.entries(routeParams ?? {}).reduce(
    (acc, [key, value]) => acc.replaceAll(`:${key}`, String(value)),
    base
  );

  const query = new URLSearchParams();

  if (filters?.length) {
    buildFilteringParam(filters, query);
  }

  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      query.append(key, String(value));
    });
  }

  const queryString = query.toString();
  return queryString ? `${url}?${queryString}` : url;
}

type QueryKey = [string] | [string, Record<string, string | number | undefined>];

function getQueryKey(
  queryKey: QueryKey,
  route: Record<string, string | number | undefined> = {},
  query: Record<string, string | number | undefined> = {},
  filters: FilteringType[] = [],
) {
  const [mainKey, otherKeys = {}] = queryKey;

  return [mainKey, { ...otherKeys, ...route, ...query, filters }];
}

/** Handle request errors */
function handleRequestError(error: unknown): never {
  if (isAxiosError(error)) {
    throw error.response?.data;
  }

  if (error instanceof ZodError) {
    console.error(error.format());
  }

  console.log(error);

  throw error;
}

/* ----------------------------------- GET ---------------------------------- */

interface CreateGetQueryHookArgs<ResponseSchema extends z.ZodType> {
  /** The endpoint for the GET request */
  endpoint: string;
  /** The Zod schema for the response data */
  responseSchema: ResponseSchema;
  /** The query parameters for the react-query hook */
  rQueryParams: Omit<UseQueryOptions<{ statusCode: number; message: string; data: z.infer<ResponseSchema> }, Error>, 'queryFn'> & {
    queryKey: QueryKey;
  };
}

/**
 * Create a custom hook for performing GET requests with react-query and Zod validation
 *
 * @example
 * const useGetUser = createGetQueryHook<typeof userSchema, { id: string }>({
 *   endpoint: '/api/users/:id',
 *   responseSchema: userSchema,
 *   rQueryParams: { queryKey: ['getUser'] },
 * });
 *
 * const { data, error } = useGetUser({ route: { id: 1 } });
 */
export function createGetQueryHook<
  ResponseSchema extends z.ZodType,
  RouteParams extends Record<string, string | number | undefined> = {},
  QueryParams extends Record<string, string | number | undefined> = {},
>({ endpoint, responseSchema, rQueryParams }: CreateGetQueryHookArgs<ResponseSchema>) {
  const queryFn = async (params?: { query?: QueryParams; route?: RouteParams; filters?: FilteringType[]; }): Promise<{
    statusCode: number;
    message: string;
    data: z.infer<ResponseSchema>;
  }> => {
    const url = createUrl(endpoint, params?.query, params?.route, params?.filters);

    const responseWrapperSchema = z.object({
      statusCode: z.number(),
      message: z.string(),
      data: responseSchema,
    });

    return client
      .get(url)
      .then((response) => {
        const parsed = responseWrapperSchema.parse(response.data);
        return {
          statusCode: parsed.statusCode,
          message: parsed.message,
          data: parsed.data,
        };
      })
      .catch(handleRequestError);
  };

  return (params?: { query?: QueryParams; route?: RouteParams, filters?: FilteringType[] | undefined }) =>
    useQuery({
      ...rQueryParams,
      queryKey: getQueryKey(rQueryParams.queryKey, params?.route, params?.query, params?.filters),
      queryFn: () => queryFn(params),
    }) as UseQueryResult<{
      statusCode: number;
      message: string;
      data: z.infer<ResponseSchema>;
    }>;
}

/* ---------------------------------- POST ---------------------------------- */

interface CreatePostMutationHookArgs<
  BodySchema extends z.ZodType,
  ResponseSchema extends z.ZodType,
> {
  /** The endpoint for the POST request */
  endpoint: string;
  /** The Zod schema for the request body */
  bodySchema: BodySchema;
  /** The Zod schema for the response data */
  responseSchema: ResponseSchema;
  /** The mutation parameters for the react-query hook */
  rMutationParams?: EnhancedMutationParams<z.infer<ResponseSchema>, Error, z.infer<BodySchema>>;
  options?: { isMultipart?: boolean };
}

/**
 * Create a custom hook for performing POST requests with react-query and Zod validation
 *
 * @example
 * const useCreateUser = createPostMutationHook({
 *  endpoint: '/api/users',
 *  bodySchema: createUserSchema,
 *  responseSchema: userSchema,
 *  rMutationParams: { onSuccess: () => queryClient.invalidateQueries('getUsers') },
 * });
 */
export function createPostMutationHook<
  BodySchema extends z.ZodType,
  ResponseSchema extends z.ZodType,
  RouteParams extends Record<string, string | number | undefined> = {},
  QueryParams extends Record<string, string | number | undefined> = {},
>({
  endpoint,
  bodySchema,
  responseSchema,
  rMutationParams,
  options,
}: CreatePostMutationHookArgs<BodySchema, ResponseSchema>) {
  return (params?: { query?: QueryParams; route?: RouteParams }) => {
    const queryClient = useQueryClient();

    const mutationFn = async ({
      variables,
      route,
      query,
    }: {
      variables: z.infer<BodySchema>;
      query?: QueryParams;
      route?: RouteParams;
    }) => {
      const url = createUrl(endpoint, query || params?.query, route || params?.route);

      const config = options?.isMultipart
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined;

      const responseWrapperSchema = z.object({
        statusCode: z.number(),
        message: z.string(),
        data: responseSchema,
      });

      return client
        .post(url, bodySchema.parse(variables), config)
        .then((response) => responseWrapperSchema.parse(response.data))
        .catch(handleRequestError);
    };

    return useMutation({
      ...rMutationParams,
      mutationFn,
      onSuccess: (data, variables, context) =>
        rMutationParams?.onSuccess?.(data, variables, context, queryClient),
      onError: (error, variables, context) =>
        rMutationParams?.onError?.(error, variables, context, queryClient),
      onSettled: (data, error, variables, context) =>
        rMutationParams?.onSettled?.(data, error, variables, context, queryClient),
    });
  };
}

/* ----------------------------------- PATCH ---------------------------------- */

interface CreatePatchMutationHookArgs<
  BodySchema extends z.ZodType,
  ResponseSchema extends z.ZodType,
> {
  /** The endpoint for the PATCH request */
  endpoint: string;
  /** The Zod schema for the request body */
  bodySchema: BodySchema;
  /** The Zod schema for the response data */
  responseSchema: ResponseSchema;
  /** The mutation parameters for the react-query hook */
  rMutationParams?: EnhancedMutationParams<z.infer<ResponseSchema>, Error, z.infer<BodySchema>>;
  options?: { isMultipart?: boolean };
}

/**
 * Create a custom hook for performing PATCH requests with react-query and Zod validation
 *
 * @example
 * const useUpdateUser = createPatchMutationHook<typeof updateUserSchema, typeof userSchema, { id: string }>({
 *  endpoint: '/api/users/:id',
 *  bodySchema: updateUserSchema,
 *  responseSchema: userSchema,
 *  rMutationParams: { onSuccess: () => queryClient.invalidateQueries('getUsers') },
 * });
 */
export function createPatchMutationHook<
  BodySchema extends z.ZodType,
  ResponseSchema extends z.ZodType,
  RouteParams extends Record<string, string | number | undefined> = {},
  QueryParams extends Record<string, string | number | undefined> = {},
>({
  endpoint,
  bodySchema,
  responseSchema,
  rMutationParams,
  options,
}: CreatePatchMutationHookArgs<BodySchema, ResponseSchema>) {
  return (params?: { query?: QueryParams; route?: RouteParams }) => {
    const queryClient = useQueryClient();
    const mutationFn = async ({
      variables,
      route,
      query,
    }: {
      variables: z.infer<BodySchema>;
      query?: QueryParams;
      route?: RouteParams;
    }) => {
      const url = createUrl(endpoint, query || params?.query, route || params?.route);

      const config = options?.isMultipart
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined;

      const responseWrapperSchema = z.object({
        statusCode: z.number(),
        message: z.string(),
        data: responseSchema,
      });

      return client
        .patch(url, bodySchema.parse(variables), config)
        .then((response) => responseWrapperSchema.parse(response.data))
        .catch(handleRequestError);
    };

    return useMutation({
      ...rMutationParams,
      mutationFn,
      onSuccess: (data, variables, context) =>
        rMutationParams?.onSuccess?.(data, variables, context, queryClient),
      onError: (error, variables, context) =>
        rMutationParams?.onError?.(error, variables, context, queryClient),
      onSettled: (data, error, variables, context) =>
        rMutationParams?.onSettled?.(data, error, variables, context, queryClient),
    });
  };
}

/* --------------------------------- DELETE --------------------------------- */

interface CreateDeleteMutationHookArgs<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> {
  /** The endpoint for the DELETE request */
  endpoint: string;
  /** The mutation parameters for the react-query hook */
  rMutationParams?: EnhancedMutationParams<TData, TError, TVariables, TContext>;
}

/**
 * Create a custom hook for performing DELETE requests with react-query
 *
 * @example
 * const useDeleteUser = createDeleteMutationHook<typeof userSchema, { id: string }>({
 *  endpoint: '/api/users/:id',
 *  rMutationParams: { onSuccess: () => queryClient.invalidateQueries('getUsers') },
 * });
 */
export function createDeleteMutationHook<
  ModelSchema extends z.ZodType,
  RouteParams extends Record<string, string | number | undefined> = {},
  QueryParams extends Record<string, string | number | undefined> = {},
>({
  endpoint,
  rMutationParams,
}: CreateDeleteMutationHookArgs<z.infer<ModelSchema>, Error, z.infer<ModelSchema>>) {
  return (params?: { query?: QueryParams; route?: RouteParams }) => {
    const queryClient = useQueryClient();
    const baseUrl = createUrl(endpoint, params?.query, params?.route);

    const mutationFn = async ({
      model,
      route,
      query,
    }: {
      model: z.infer<ModelSchema>;
      query?: QueryParams;
      route?: RouteParams;
    }) => {
      const url = createUrl(baseUrl, query, route);
      return client
        .delete(url)
        .then(() => model)
        .catch(handleRequestError);
    };

    return useMutation({
      ...rMutationParams,
      mutationFn,
      onSuccess: (data, variables, context) =>
        rMutationParams?.onSuccess?.(data, variables, context, queryClient),
      onError: (error, variables, context) =>
        rMutationParams?.onError?.(error, variables, context, queryClient),
      onSettled: (data, error, variables, context) =>
        rMutationParams?.onSettled?.(data, error, variables, context, queryClient),
    });
  };
}

/* ------------------------------- PAGINATION ------------------------------- */

export type PaginationParams = {
  page?: number;
  size?: number;
};

export function usePagination(params?: PaginationParams) {
  const [page, setPage] = useState(params?.page ?? 1);
  const [size, setSize] = useState(params?.size ?? 15);

  const onChangeLimit = (value: number) => {
    setSize(value);
    setPage(1);
  };

  return { page, size, setPage, setSize: onChangeLimit };
}

export const PaginationMetaSchema = z.object({
  total: z.number().int().min(0),
  perPage: z.number().int().positive(),
  currentPage: z.number().int().positive().nullable(),
  lastPage: z.number().int().positive(),
  firstPage: z.number().int().positive(),
  firstPageUrl: z.string(),
  lastPageUrl: z.string(),
  nextPageUrl: z.string().nullable(),
  previousPageUrl: z.string().nullable(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

interface CreatePaginationQueryHookArgs<DataSchema extends z.ZodType> {
  /** The endpoint for the GET request */
  endpoint: string;
  /** The Zod schema for the data attribute in response */
  dataSchema: DataSchema;
  /** The query parameters for the react-query hook */
  rQueryParams: Omit<UndefinedInitialDataOptions, 'queryFn' | 'queryKey'> & {
    queryKey: QueryKey;
  };
}

export type SortableQueryParams = {
  sort?: `${string}:${'asc' | 'desc'}`;
  shuffle?: 'true' | 'false';
};

/**
 * Create a custom hook for performing paginated GET requests with react-query and Zod validation
 *
 * @example
 * const useGetUsers = createPaginatedQueryHook<typeof userSchema>({
 *  endpoint: '/api/users',
 *  dataSchema: userSchema,
 *  queryParams: { queryKey: 'getUsers' },
 * });
 */
export function createPaginationQueryHook<
  DataSchema extends z.ZodType,
  QueryParams extends Record<string, string | number | undefined> = SortableQueryParams,
  RouteParams extends Record<string, string | number | undefined> = {},
>({ endpoint, dataSchema, rQueryParams }: CreatePaginationQueryHookArgs<DataSchema>) {
  const queryFn = async (params: {
    query?: QueryParams & PaginationParams;
    route?: RouteParams;
    filters?: FilteringType[];
  }) => {
    const url = createUrl(endpoint, params?.query, params?.route, params?.filters);

    const schema = z.object({
      statusCode: z.number(),
      message: z.string(),
      data: z.object({
        totalCount: z.number().positive(),
        items: dataSchema.array(),
      }),
    });

    return client
      .get(url)
      .then((response) => schema.parse(response.data))
      .catch(handleRequestError);
  };

  return (params?: { query: QueryParams & PaginationParams; route?: RouteParams, filters?: FilteringType[] | undefined }) => {
    const query = { page: 1, size: 25, ...params?.query } as unknown as QueryParams;
    const route = params?.route ?? ({} as RouteParams);
    const filters = params?.filters;

    return useQuery({
      ...rQueryParams,
      queryKey: getQueryKey(rQueryParams.queryKey, route, query, filters),
      queryFn: () => queryFn({ query, route, filters }),
    }) as UseQueryResult<{
      statusCode: number;
      message: string;
      data: {
        totalCount: number;
        items: z.infer<DataSchema>[];
      }
    }>;
  };
}

export function useShuffle(initialValue = false) {
  const [shuffle, setShuffle] = useState(initialValue);

  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  return {
    shuffle: shuffle ? 'true' : 'false' as 'true' | 'false' | undefined,
    isShuffled: shuffle,
    toggleShuffle,
    setShuffle: (value: boolean) => setShuffle(value),
  };
}
