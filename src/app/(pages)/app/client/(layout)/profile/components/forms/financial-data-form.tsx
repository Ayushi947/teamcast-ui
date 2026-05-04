'use client';

import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { clientProfileService } from '@/lib/services/services';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  CreditCard,
  Plus,
  Trash2,
  Edit,
  Save,
  AlertCircle,
  CheckCircle,
  FileText,
  Building2,
  PlusCircle,
  Loader2,
} from 'lucide-react';
import {
  IClientFinancialData,
  IClientBankAccount,
  IClientBankAccountCreate,
  IClientBankAccountUpdate,
  IClientFinancialDataUpdate,
  logger,
} from '@/lib/shared';
import { ProfileFormSection } from '../ui/profile-form-section';

const financialDataSchema = z.object({
  annualRevenue: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().optional()
  ),
  taxId: z.string().min(1, 'Tax ID is required').optional(),
  vatNumber: z.string().optional(),
  gstNumber: z.string().optional(),
});

const bankAccountSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  swiftCode: z.string().min(1, 'SWIFT code is required'),
  isDefault: z.boolean().optional().default(false),
});

type FinancialDataFormData = z.infer<typeof financialDataSchema>;
type BankAccountFormData = z.input<typeof bankAccountSchema>;

interface FinancialDataFormProps {
  initialData?: IClientFinancialData;
  onSuccess?: () => void;
  isEditing?: boolean;
}

export const FinancialDataForm: FC<FinancialDataFormProps> = ({
  initialData,
  onSuccess,
  isEditing = true,
}) => {
  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const form = useForm<FinancialDataFormData>({
    resolver: zodResolver(financialDataSchema) as any,
    defaultValues: {
      annualRevenue: initialData?.annualRevenue || undefined,
      taxId: initialData?.taxId || '',
      vatNumber: initialData?.vatNumber || '',
      gstNumber: initialData?.gstNumber || '',
    },
  });

  const bankAccountForm = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      swiftCode: '',
      isDefault: false,
    },
  });

  const updateFinancialDataMutation = useMutation({
    mutationFn: async (data: IClientFinancialDataUpdate) => {
      try {
        await clientProfileService.updateFinancialData(data);
      } catch (error) {
        logger.error(
          'Failed to update financial data, trying to create:',
          error
        );
        await clientProfileService.createFinancialData(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
      toast.success('Financial information updated successfully');
      onSuccess?.();
    },
    onError: (error) => {
      logger.error('Error updating financial data:', error);
      toast.error('Failed to update financial information');
    },
  });

  // Bank account mutations - using clientProfileService
  const addBankAccountMutation = useMutation({
    mutationFn: async (data: IClientBankAccountCreate) => {
      return await clientProfileService.addBankAccount(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
      toast.success('Bank account added successfully');
      setIsAddAccountDialogOpen(false);
      bankAccountForm.reset();
    },
    onError: (error) => {
      logger.error('Error adding bank account:', error);
      toast.error('Failed to add bank account');
    },
  });

  const updateBankAccountMutation = useMutation({
    mutationFn: async ({
      accountId,
      data,
    }: {
      accountId: string;
      data: IClientBankAccountUpdate;
    }) => {
      return await clientProfileService.updateBankAccount(accountId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
      toast.success('Bank account updated successfully');
      setEditingAccount(null);
    },
    onError: (error) => {
      logger.error('Error updating bank account:', error);
      toast.error('Failed to update bank account');
    },
  });

  const deleteBankAccountMutation = useMutation({
    mutationFn: async (accountId: string) => {
      return await clientProfileService.deleteBankAccount(accountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
      toast.success('Bank account deleted successfully');
      setDeleteConfirm(null);
    },
    onError: (error) => {
      logger.error('Error deleting bank account:', error);
      toast.error('Failed to delete bank account');
    },
  });

  const onSubmit = (data: FinancialDataFormData) => {
    updateFinancialDataMutation.mutate(data);
  };

  const onSubmitBankAccount = (data: BankAccountFormData) => {
    addBankAccountMutation.mutate(data);
  };

  const handleEditAccount = (account: IClientBankAccount) => {
    bankAccountForm.reset({
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      swiftCode: account.swiftCode,
      isDefault: account.isDefault,
    });
    setEditingAccount(account.id);
  };

  const handleUpdateAccount = (data: BankAccountFormData) => {
    if (editingAccount) {
      updateBankAccountMutation.mutate({
        accountId: editingAccount,
        data,
      });
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    deleteBankAccountMutation.mutate(accountId);
  };

  const revenueRanges = [
    { value: 100000, label: 'Under $100K' },
    { value: 500000, label: '$100K - $500K' },
    { value: 1000000, label: '$500K - $1M' },
    { value: 5000000, label: '$1M - $5M' },
    { value: 10000000, label: '$5M - $10M' },
    { value: 50000000, label: '$10M - $50M' },
    { value: 100000000, label: '$50M+' },
  ];

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <ProfileFormSection
            title="Financial Information"
            description="Company financial details and tax information"
            icon={DollarSign}
            className="dark:bg-accent"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="annualRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Annual Revenue
                    </FormLabel>
                    <Select
                      disabled={!isEditing}
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select annual revenue" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {revenueRanges.map((range) => (
                          <SelectItem
                            key={range.value}
                            value={range.value.toString()}
                          >
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Tax ID
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        placeholder="Enter tax ID"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vatNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-600" />
                      VAT Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        placeholder="Enter VAT number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gstNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-orange-600" />
                      GST Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        placeholder="Enter GST number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ProfileFormSection>

          {/* Bank Accounts Section */}
          <ProfileFormSection
            title="Bank Accounts"
            description="Manage company bank accounts for payments and transactions"
            icon={CreditCard}
            className="dark:bg-accent"
          >
            <div className="space-y-4">
              {isEditing && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddAccountDialogOpen(true)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Account
                  </Button>
                </div>
              )}

              {/* Bank Account List */}
              {initialData?.bankAccounts &&
              initialData.bankAccounts.length > 0 ? (
                <AnimatePresence>
                  {initialData.bankAccounts.map((account) => (
                    <motion.div
                      key={account.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-card flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-muted/50 flex h-10 w-10 items-center justify-center rounded-full">
                          <CreditCard className="text-muted-foreground h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{account.accountName}</p>
                          <p className="text-muted-foreground text-sm">
                            {account.bankName} • ****{' '}
                            {account.accountNumber.slice(-4)}
                          </p>
                          {account.isDefault && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isEditing && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditAccount(account)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-8 w-8"
                            onClick={() => setDeleteConfirm(account.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground">
                    No bank accounts added yet
                  </p>
                  {isEditing && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsAddAccountDialogOpen(true)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Your First Account
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ProfileFormSection>

          {isEditing && (
            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={updateFinancialDataMutation.isPending}
            >
              {updateFinancialDataMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          )}
        </form>
      </Form>

      {/* Add Bank Account Dialog */}
      <Dialog
        open={isAddAccountDialogOpen}
        onOpenChange={setIsAddAccountDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="text-muted-foreground h-5 w-5" />
              Add Bank Account
            </DialogTitle>
            <DialogDescription>
              Add a new bank account to your company profile.
            </DialogDescription>
          </DialogHeader>
          <Form {...bankAccountForm}>
            <form
              onSubmit={bankAccountForm.handleSubmit(onSubmitBankAccount)}
              className="space-y-4"
            >
              <div className="grid gap-4">
                <FormField
                  control={bankAccountForm.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter account holder name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bankAccountForm.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter bank name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={bankAccountForm.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter account number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bankAccountForm.control}
                    name="swiftCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SWIFT Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter SWIFT/BIC code"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={bankAccountForm.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Set as default account</FormLabel>
                        <p className="text-muted-foreground text-sm">
                          Use this account as the primary account for
                          transactions.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddAccountDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addBankAccountMutation.isPending}
                >
                  {addBankAccountMutation.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                    />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Add Account
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Bank Account Dialog */}
      <Dialog
        open={!!editingAccount}
        onOpenChange={(open) => !open && setEditingAccount(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="text-muted-foreground h-5 w-5" />
              Edit Bank Account
            </DialogTitle>
            <DialogDescription>
              Update the bank account information.
            </DialogDescription>
          </DialogHeader>
          <Form {...bankAccountForm}>
            <form
              onSubmit={bankAccountForm.handleSubmit(handleUpdateAccount)}
              className="space-y-4"
            >
              <div className="grid gap-4">
                <FormField
                  control={bankAccountForm.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter account holder name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bankAccountForm.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter bank name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={bankAccountForm.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter account number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bankAccountForm.control}
                    name="swiftCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SWIFT Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter SWIFT/BIC code"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={bankAccountForm.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Set as default account</FormLabel>
                        <p className="text-muted-foreground text-sm">
                          Use this account as the primary account for
                          transactions.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingAccount(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={() =>
                    bankAccountForm.handleSubmit(handleUpdateAccount)()
                  }
                  disabled={updateBankAccountMutation.isPending}
                >
                  {updateBankAccountMutation.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                    />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="text-destructive h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bank account? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="bg-muted/20 rounded-lg border p-4">
              <p className="text-muted-foreground flex items-center text-sm">
                <AlertCircle className="text-destructive mr-2 h-4 w-4" />
                Deleting this bank account will permanently remove it from your
                profile. Any associated payment settings will need to be
                reconfigured.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() =>
                deleteConfirm && handleDeleteAccount(deleteConfirm)
              }
              disabled={deleteBankAccountMutation.isPending}
            >
              {deleteBankAccountMutation.isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
