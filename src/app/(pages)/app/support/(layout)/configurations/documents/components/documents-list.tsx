'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Eye, Plus, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ICountryWithDocuments } from '@/lib/shared';

import SaasDataTable, {
  SaasTableColumn,
  SaasTableAction,
  SaasPaginationInfo,
} from '@/components/app/common/tables/saas-data-table';
import { documentConfigService } from '@/lib/services/services';
import { CountrySpecificDocumentDetails } from './country-specific-document-details';
import { AddDocumentsDialog } from './add-documents-dialog';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function DocumentsList() {
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [isViewDocumentsModalOpen, setIsViewDocumentsModalOpen] =
    useState(false);
  const [isAddDocumentsModalOpen, setIsAddDocumentsModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] =
    useState<ICountryWithDocuments | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [shouldFetch, setShouldFetch] = useState(true);
  const {
    data: countryData,
    isLoading: isLoadingCountry,
    refetch,
  } = useQuery({
    queryKey: [
      'support-country-data',
      currentPage,
      pageSize,
      searchTerm,
      sortBy,
    ],
    queryFn: async () => {
      try {
        const response = await documentConfigService.getAllDocumentsConfig();
        return response as unknown as ICountryWithDocuments[];
      } catch (err: any) {
        if (err?.code === 'ERR_4001') {
          setShouldFetch(false);
        }
        throw err;
      }
    },
    enabled: shouldFetch,
    retry: false,
  });

  const handleOpenViewDocumentsModal = (country: ICountryWithDocuments) => {
    setSelectedCountry(country);
    setIsViewDocumentsModalOpen(true);
  };

  const handleOpenAddDocumentsModal = (country: ICountryWithDocuments) => {
    setSelectedCountry(country);
    setIsAddDocumentsModalOpen(true);
  };

  // Table configuration
  const columns: SaasTableColumn<ICountryWithDocuments>[] = [
    {
      key: 'country',
      label: 'Country',
      sortable: true,
      render: (country: ICountryWithDocuments) => (
        <div className="flex items-center gap-2">
          <MapPin className="text-muted-foreground h-4 w-4" />
          <div>
            <span className="font-medium">
              {country.countryName || 'Unknown'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'documentCount',
      label: 'Total Documents',
      sortable: false,
      render: (country: ICountryWithDocuments) => (
        <div className="flex items-center gap-2">
          <FileText className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">
            {country.documentCount || 0}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (country: ICountryWithDocuments) => (
        <span className="text-muted-foreground text-sm">
          {country.createdAt
            ? format(new Date(country.createdAt), 'MMM d, yyyy')
            : 'N/A'}
        </span>
      ),
    },
  ];

  // Table actions
  const actions: SaasTableAction<ICountryWithDocuments>[] = [
    {
      key: 'viewDocuments',
      label: 'View Documents',
      icon: <Eye className="h-4 w-4" />,
      onClick: (country: ICountryWithDocuments) =>
        handleOpenViewDocumentsModal(country),
    },
    {
      key: 'addDocuments',
      label: 'Add Documents',
      icon: <Plus className="h-4 w-4" />,
      onClick: (country: ICountryWithDocuments) =>
        handleOpenAddDocumentsModal(country),
    },
  ];

  // Pagination configuratio
  const pagination: SaasPaginationInfo = {
    currentPage,
    totalPages: 1,
    totalItems: 0,
    pageSize,
    onPageChange: setCurrentPage,
    onPageSizeChange: setPageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    sortBy,
    sortOrder,
    onSortChange: (field: string | null, order: 'asc' | 'desc' | null) => {
      setSortBy(field || '');
      setSortOrder(order || 'desc');
      setCurrentPage(1);
    },
  };

  return (
    <div className="space-y-6">
      <SaasDataTable<ICountryWithDocuments>
        columns={columns}
        data={countryData || []}
        actions={actions}
        isLoading={isLoadingCountry}
        searchable={true}
        searchValue={searchTerm}
        searchPlaceholder="Search countries by name..."
        onSearchChange={setSearchTerm}
        filters={[]}
        pagination={pagination}
        onRefresh={refetch}
        emptyState={{
          icon: <MapPin className="text-muted-foreground/50 h-12 w-12" />,
          title: 'No countries found',
        }}
        getRowKey={(country) => country.id || ''}
      />

      {selectedCountry && (
        <>
          <CountrySpecificDocumentDetails
            countryName={selectedCountry.countryName}
            open={isViewDocumentsModalOpen}
            setOpen={setIsViewDocumentsModalOpen}
          />
          <AddDocumentsDialog
            country={selectedCountry}
            open={isAddDocumentsModalOpen}
            onOpenChange={setIsAddDocumentsModalOpen}
            onSuccess={() => {
              refetch();
            }}
          />
        </>
      )}
    </div>
  );
}
