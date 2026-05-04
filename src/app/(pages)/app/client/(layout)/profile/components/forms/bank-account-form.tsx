'use client';

import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { clientProfileService } from '@/lib/services/services';
import { toast } from 'sonner';
import { Building2, CreditCard } from 'lucide-react';
import {
  IClientBankAccount,
  IClientBankAccountCreate,
  IClientBankAccountUpdate,
  logger,
} from '@/lib/shared';

// Form schema
const bankAccountSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  swiftCode: z.string().min(1, 'SWIFT code is required'),
  isDefault: z.boolean(),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface BankAccountFormProps {
  initialData?: IClientBankAccount;
  onSuccess?: () => void;
  isEditing?: boolean;
  editMode?: boolean;
}

export const BankAccountForm: FC<BankAccountFormProps> = ({
  initialData,
  onSuccess,
  isEditing = true,
  editMode = false,
}) => {
  const queryClient = useQueryClient();

  const form = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountName: initialData?.accountName || '',
      accountNumber: initialData?.accountNumber || '',
      bankName: initialData?.bankName || '',
      swiftCode: initialData?.swiftCode || '',
      isDefault: initialData?.isDefault || false,
    },
  });

  // Bank account mutations
  const addBankAccountMutation = useMutation({
    mutationFn: async (data: IClientBankAccountCreate) => {
      return await clientProfileService.addBankAccount(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
      toast.success('Bank account added successfully');
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      logger.error('Error adding bank account:', error);
      toast.error('Failed to add bank account');
    },
  });

  const updateBankAccountMutation = useMutation({
    mutationFn: async (data: IClientBankAccountUpdate) => {
      if (!initialData?.id) {
        throw new Error('Bank account ID not found');
      }
      return await clientProfileService.updateBankAccount(initialData.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
      toast.success('Bank account updated successfully');
      onSuccess?.();
    },
    onError: (error) => {
      logger.error('Error updating bank account:', error);
      toast.error('Failed to update bank account');
    },
  });

  const onSubmit = (data: BankAccountFormData) => {
    if (editMode && initialData?.id) {
      updateBankAccountMutation.mutate(data);
    } else {
      addBankAccountMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form
        id="bank-account-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Name */}
          <FormField
            control={form.control}
            name="accountName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  Account Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={!isEditing}
                    placeholder="Enter account name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Account Number */}
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  Account Number
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={!isEditing}
                    placeholder="Enter account number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bank Name */}
          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  Bank Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={!isEditing}
                    placeholder="Enter bank name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SWIFT Code */}
          <FormField
            control={form.control}
            name="swiftCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-orange-600" />
                  SWIFT Code
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={!isEditing}
                    placeholder="Enter SWIFT code"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Default Account */}
        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!isEditing}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Set as default account</FormLabel>
                <p className="text-muted-foreground text-sm">
                  This account will be used as the default for receiving
                  payments
                </p>
              </div>
            </FormItem>
          )}
        />

        {isEditing && (
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                addBankAccountMutation.isPending ||
                updateBankAccountMutation.isPending
              }
            >
              {addBankAccountMutation.isPending ||
              updateBankAccountMutation.isPending
                ? 'Saving...'
                : editMode
                  ? 'Update Bank Account'
                  : 'Add Bank Account'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};
