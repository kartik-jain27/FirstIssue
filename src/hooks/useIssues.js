import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchIssues } from '../api/client.js';
import { useDebounce } from './useDebounce.js';

const DEFAULT_FILTERS = {
  search: '',
  language: '',
  labels: [],
  minStars: 0,
  sortBy: 'score',
  page: 1,
  limit: 20
};

function parseLabels(value) {
  return value ? value.split(',').filter(Boolean) : [];
}

function readFilters(searchParams) {
  return {
    search: searchParams.get('q') || DEFAULT_FILTERS.search,
    language: searchParams.get('language') || DEFAULT_FILTERS.language,
    labels: parseLabels(searchParams.get('labels')),
    minStars: Number(searchParams.get('minStars') || DEFAULT_FILTERS.minStars),
    sortBy: searchParams.get('sortBy') || DEFAULT_FILTERS.sortBy,
    page: Number(searchParams.get('page') || DEFAULT_FILTERS.page),
    limit: Number(searchParams.get('limit') || DEFAULT_FILTERS.limit)
  };
}

function writeFilters(filters) {
  const params = new URLSearchParams();

  if (filters.search) params.set('q', filters.search);
  if (filters.language) params.set('language', filters.language);
  if (filters.labels.length) params.set('labels', filters.labels.join(','));
  if (filters.minStars > 0) params.set('minStars', String(filters.minStars));
  if (filters.sortBy !== DEFAULT_FILTERS.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.page !== DEFAULT_FILTERS.page) params.set('page', String(filters.page));
  if (filters.limit !== DEFAULT_FILTERS.limit) params.set('limit', String(filters.limit));

  return params;
}

function normalizeLabel(label) {
  return String(label).trim().toLowerCase();
}

function labelsMatch(selectedLabel, issueLabel) {
  const selected = normalizeLabel(selectedLabel);
  const actual = normalizeLabel(issueLabel);

  if (selected === actual) return true;
  return selected === 'documentation' && actual === 'docs';
}

function filterLocally(issues, search, labels) {
  const query = search.trim().toLowerCase();

  return issues.filter((issue) => {
    const issueLabels = issue.labels || [];
    const matchesSearch =
      !query ||
      issue.title.toLowerCase().includes(query) ||
      issue.repoName.toLowerCase().includes(query) ||
      issueLabels.some((label) => label.toLowerCase().includes(query));

    const matchesLabels =
      labels.length === 0 || labels.some((selectedLabel) => issueLabels.some((issueLabel) => labelsMatch(selectedLabel, issueLabel)));

    return matchesSearch && matchesLabels;
  });
}

/**
 * Manages issue filters, URL query synchronization, and issue fetching.
 * @returns {{issues: Array<object>, loading: boolean, error: string, pagination: object, filters: object, setFilter: Function, toggleLabel: Function, refetch: Function}}
 */
export function useIssues() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const debouncedSearch = useDebounce(filters.search, 400);
  const [issues, setIssues] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestNonce, setRequestNonce] = useState(0);

  const setFilter = useCallback(
    (name, value) => {
      const nextFilters = {
        ...filters,
        [name]: value,
        page: name === 'page' ? value : 1
      };
      setSearchParams(writeFilters(nextFilters));
    },
    [filters, setSearchParams]
  );

  const toggleLabel = useCallback(
    (label) => {
      const labels = filters.labels.includes(label)
        ? filters.labels.filter((item) => item !== label)
        : [...filters.labels, label];
      setFilter('labels', labels);
    },
    [filters.labels, setFilter]
  );

  const refetch = useCallback(() => {
    setRequestNonce((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;
    const hasLocalFiltering = filters.labels.length > 1 || debouncedSearch.trim().length > 0;
    const selectedLabel = filters.labels.length === 1 ? filters.labels[0] : undefined;
    const requestLimit = hasLocalFiltering ? 100 : filters.limit;

    async function loadIssues() {
      setLoading(true);
      setError('');

      try {
        const result = await fetchIssues({
          language: filters.language || undefined,
          label: selectedLabel,
          minStars: filters.minStars > 0 ? filters.minStars : undefined,
          sortBy: filters.sortBy,
          page: filters.page,
          limit: requestLimit
        });

        if (active) {
          setIssues(result.data || []);
          setPagination(result.pagination || { page: filters.page, limit: requestLimit, total: 0, totalPages: 0 });
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadIssues();
    return () => {
      active = false;
    };
  }, [filters.language, filters.labels, filters.minStars, filters.sortBy, filters.page, filters.limit, debouncedSearch, requestNonce]);

  const visibleIssues = useMemo(
    () => filterLocally(issues, debouncedSearch, filters.labels),
    [issues, debouncedSearch, filters.labels]
  );

  const hasLocalFiltering = debouncedSearch.trim().length > 0 || filters.labels.length > 1;
  const visiblePagination = hasLocalFiltering
    ? {
        page: 1,
        limit: Math.max(visibleIssues.length, 1),
        total: visibleIssues.length,
        totalPages: 1
      }
    : pagination;

  return {
    issues: visibleIssues,
    loading,
    error,
    pagination: visiblePagination,
    filters,
    setFilter,
    toggleLabel,
    refetch
  };
}
