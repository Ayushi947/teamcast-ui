import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

type SortOrder = 'asc' | 'desc';

interface RequestParamNames {
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface UseTableQueryParamsOptions {
  /**
   * Default page number when no value is present in the query string.
   * @default 1
   */
  defaultPage?: number;
  /**
   * Default page size when no value is present in the query string.
   * @default 10
   */
  defaultPageSize?: number;
  /**
   * Default sort field when no value is present in the query string.
   * When `null`, no sort field will be applied until explicitly set.
   * @default null
   */
  defaultSortBy?: string | null;
  /**
   * Default sort order when no value is present in the query string.
   * @default 'asc'
   */
  defaultSortOrder?: SortOrder;
  /**
   * Query string key for the current page number.
   * @default 'page'
   */
  pageParam?: string;
  /**
   * Query string key for the page size.
   * @default 'pageSize'
   */
  pageSizeParam?: string;
  /**
   * Query string key for the sort field.
   * @default 'sortBy'
   */
  sortByParam?: string;
  /**
   * Query string key for the sort order.
   * @default 'sortOrder'
   */
  sortOrderParam?: string;
  /**
   * Mapping used when constructing the request params object.
   * Allows differing query parameter names vs API payload keys (e.g. limit vs pageSize).
   */
  requestParamNames?: RequestParamNames;
  /**
   * When false, default values are omitted from the query string to keep URLs clean.
   * @default false
   */
  preserveDefaultsInQuery?: boolean;
  /**
   * Navigation history strategy when updating the query string.
   * @default 'replace'
   */
  history?: 'push' | 'replace';
  /**
   * Whether routing updates should maintain scroll position.
   * @default false
   */
  scroll?: boolean;
}

interface SetPageSizeOptions {
  resetPage?: boolean;
}

interface SetSortOptions {
  resetPage?: boolean;
}

export interface UseTableQueryParamsResult {
  page: number;
  pageSize: number;
  sortBy: string | null;
  sortOrder: SortOrder;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number, options?: SetPageSizeOptions) => void;
  setSort: (
    sortBy: string | null,
    sortOrder?: SortOrder,
    options?: SetSortOptions
  ) => void;
  clearSort: () => void;
  updateQueryParams: (
    changes: Record<string, string | number | null | undefined>,
    options?: { resetPage?: boolean }
  ) => void;
  requestParams: Record<string, string | number>;
}

const clampPositiveInteger = (value: number, fallback: number) => {
  if (Number.isNaN(value) || value <= 0) {
    return fallback;
  }
  return Math.floor(value);
};

const parseIntOrDefault = (rawValue: string | null, fallback: number) => {
  if (!rawValue) {
    return fallback;
  }
  const asNumber = Number.parseInt(rawValue, 10);
  return clampPositiveInteger(asNumber, fallback);
};

const parseSortOrder = (
  rawValue: string | null,
  fallback: SortOrder
): SortOrder => {
  if (rawValue === 'asc' || rawValue === 'desc') {
    return rawValue;
  }
  return fallback;
};

export const useTableQueryParams = (
  options: UseTableQueryParamsOptions = {}
): UseTableQueryParamsResult => {
  const {
    defaultPage = 1,
    defaultPageSize = 10,
    defaultSortBy = null,
    defaultSortOrder = 'asc',
    pageParam = 'page',
    pageSizeParam = 'pageSize',
    sortByParam = 'sortBy',
    sortOrderParam = 'sortOrder',
    requestParamNames,
    preserveDefaultsInQuery = false,
    history = 'replace',
    scroll = false,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = useMemo(
    () => parseIntOrDefault(searchParams.get(pageParam), defaultPage),
    [searchParams, pageParam, defaultPage]
  );

  const pageSize = useMemo(
    () => parseIntOrDefault(searchParams.get(pageSizeParam), defaultPageSize),
    [searchParams, pageSizeParam, defaultPageSize]
  );

  const sortBy = useMemo(() => {
    const value = searchParams.get(sortByParam);
    if (!value) {
      return defaultSortBy;
    }
    return value;
  }, [searchParams, sortByParam, defaultSortBy]);

  const sortOrder = useMemo(
    () => parseSortOrder(searchParams.get(sortOrderParam), defaultSortOrder),
    [searchParams, sortOrderParam, defaultSortOrder]
  );

  const defaultStringValues = useMemo(
    () => ({
      [pageParam]: String(defaultPage),
      [pageSizeParam]: String(defaultPageSize),
      [sortByParam]: defaultSortBy ?? '',
      [sortOrderParam]: defaultSortOrder,
    }),
    [
      defaultPage,
      defaultPageSize,
      defaultSortBy,
      defaultSortOrder,
      pageParam,
      pageSizeParam,
      sortByParam,
      sortOrderParam,
    ]
  );

  const applyNavigation = useCallback(
    (url: string) => {
      if (history === 'push') {
        router.push(url, { scroll });
      } else {
        router.replace(url, { scroll });
      }
    },
    [router, history, scroll]
  );

  const updateQueryParams = useCallback(
    (
      changes: Record<string, string | number | null | undefined>,
      opts?: { resetPage?: boolean }
    ) => {
      const mergedChanges = { ...changes };
      if (opts?.resetPage) {
        mergedChanges[pageParam] = preserveDefaultsInQuery ? defaultPage : null;
      }

      const currentParamsString = searchParams.toString();
      const nextParams = new URLSearchParams(currentParamsString);

      Object.entries(mergedChanges).forEach(([key, rawValue]) => {
        const stringified =
          typeof rawValue === 'number' ? String(rawValue) : rawValue;

        if (
          !preserveDefaultsInQuery &&
          stringified !== undefined &&
          stringified !== null &&
          stringified === defaultStringValues[key]
        ) {
          nextParams.delete(key);
          return;
        }

        if (
          stringified === undefined ||
          stringified === null ||
          stringified === ''
        ) {
          nextParams.delete(key);
        } else {
          nextParams.set(key, stringified);
        }
      });

      const nextQueryString = nextParams.toString();
      if (nextQueryString === currentParamsString) {
        return;
      }

      const nextUrl = nextQueryString
        ? `${pathname}?${nextQueryString}`
        : pathname;
      applyNavigation(nextUrl);
    },
    [
      applyNavigation,
      defaultPage,
      defaultStringValues,
      pageParam,
      pathname,
      preserveDefaultsInQuery,
      searchParams,
    ]
  );

  const setPage = useCallback(
    (nextPage: number) => {
      const safePage = clampPositiveInteger(nextPage, defaultPage);
      updateQueryParams({
        [pageParam]:
          !preserveDefaultsInQuery &&
          String(safePage) === defaultStringValues[pageParam]
            ? null
            : safePage,
      });
    },
    [
      defaultPage,
      defaultStringValues,
      pageParam,
      preserveDefaultsInQuery,
      updateQueryParams,
    ]
  );

  const setPageSize = useCallback(
    (nextPageSize: number, opts: SetPageSizeOptions = { resetPage: true }) => {
      const safePageSize = clampPositiveInteger(nextPageSize, defaultPageSize);
      updateQueryParams(
        {
          [pageSizeParam]:
            !preserveDefaultsInQuery &&
            String(safePageSize) === defaultStringValues[pageSizeParam]
              ? null
              : safePageSize,
        },
        { resetPage: opts.resetPage !== false }
      );
    },
    [
      defaultPageSize,
      defaultStringValues,
      pageSizeParam,
      preserveDefaultsInQuery,
      updateQueryParams,
    ]
  );

  const setSort = useCallback(
    (
      nextSortBy: string | null,
      nextSortOrder: SortOrder = defaultSortOrder,
      opts: SetSortOptions = { resetPage: true }
    ) => {
      if (!nextSortBy) {
        updateQueryParams(
          {
            [sortByParam]: null,
            [sortOrderParam]: null,
          },
          { resetPage: opts.resetPage }
        );
        return;
      }

      const changes: Record<string, string | number | null> = {
        [sortByParam]:
          !preserveDefaultsInQuery &&
          nextSortBy === defaultStringValues[sortByParam]
            ? null
            : nextSortBy,
      };

      const orderToApply = parseSortOrder(nextSortOrder, defaultSortOrder);

      changes[sortOrderParam] =
        !preserveDefaultsInQuery &&
        orderToApply === defaultStringValues[sortOrderParam]
          ? null
          : orderToApply;

      updateQueryParams(changes, { resetPage: opts.resetPage });
    },
    [
      defaultSortOrder,
      defaultStringValues,
      preserveDefaultsInQuery,
      sortByParam,
      sortOrderParam,
      updateQueryParams,
    ]
  );

  const clearSort = useCallback(() => {
    updateQueryParams(
      {
        [sortByParam]: null,
        [sortOrderParam]: null,
      },
      { resetPage: false }
    );
  }, [sortByParam, sortOrderParam, updateQueryParams]);

  const requestParams = useMemo(() => {
    const paramNames: Required<RequestParamNames> = {
      page: requestParamNames?.page ?? 'page',
      pageSize: requestParamNames?.pageSize ?? 'pageSize',
      sortBy: requestParamNames?.sortBy ?? 'sortBy',
      sortOrder: requestParamNames?.sortOrder ?? 'sortOrder',
    };

    const payload: Record<string, string | number> = {
      [paramNames.page]: page,
      [paramNames.pageSize]: pageSize,
    };

    if (sortBy) {
      payload[paramNames.sortBy] = sortBy;
      payload[paramNames.sortOrder] = sortOrder;
    }

    return payload;
  }, [page, pageSize, sortBy, sortOrder, requestParamNames]);

  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
    setPage,
    setPageSize,
    setSort,
    clearSort,
    updateQueryParams,
    requestParams,
  };
};
