import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { documentConfigService } from '@/lib/services/services';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, X, Loader2 } from 'lucide-react';

interface CountrySpecificDocumentDetailsProps {
  countryName: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CountrySpecificDocumentDetails({
  countryName,
  open,
  setOpen,
}: CountrySpecificDocumentDetailsProps) {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', countryName],
    queryFn: () => documentConfigService.getDocumentsByCountry(countryName),
    enabled: open && !!countryName,
  });

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-card max-h-[90vh] max-w-md overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-purple-600" />
            Document Required for {countryName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            View all document verification required for this country
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : !documents || documents.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <FileText className="mb-3 h-10 w-10 text-gray-300" />
              <h3 className="text-lg font-medium">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no document requirements configured for {countryName}.
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-2">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="bg-card rounded-lg border p-4 transition-all hover:shadow"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <div>
                      <span className="text-muted-foreground text-sm font-semibold">
                        {document.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <Button onClick={handleClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
