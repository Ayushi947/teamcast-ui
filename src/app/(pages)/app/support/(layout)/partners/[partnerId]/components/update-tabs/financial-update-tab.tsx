'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  CreditCard,
  Building,
  Plus,
  Trash2,
  Shield,
} from 'lucide-react';

interface FinancialUpdateTabProps {
  form: UseFormReturn<any>;
  isSubmitting: boolean;
}

export function FinancialUpdateTab({
  form,
  isSubmitting,
}: FinancialUpdateTabProps) {
  const bankAccounts = form.watch('financialData.bankAccounts') || [];

  const addBankAccount = () => {
    const currentAccounts = form.getValues('financialData.bankAccounts') || [];
    form.setValue('financialData.bankAccounts', [
      ...currentAccounts,
      {
        accountName: '',
        accountNumber: '',
        bankName: '',
        swiftCode: '',
        isDefault: false,
      },
    ]);
  };

  const removeBankAccount = (index: number) => {
    const currentAccounts = form.getValues('financialData.bankAccounts') || [];
    const updatedAccounts = currentAccounts.filter(
      (_: any, i: number) => i !== index
    );
    form.setValue('financialData.bankAccounts', updatedAccounts);
  };

  const setDefaultAccount = (index: number) => {
    const currentAccounts = form.getValues('financialData.bankAccounts') || [];
    const updatedAccounts = currentAccounts.map((account: any, i: number) => ({
      ...account,
      isDefault: i === index,
    }));
    form.setValue('financialData.bankAccounts', updatedAccounts);
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <DollarSign className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
            Financial Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <FormField
            control={form.control}
            name="financialData.annualRevenue"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                  Annual Revenue
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="1000"
                      disabled={isSubmitting}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                      className="h-10 border-gray-300 pl-10 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                  Annual revenue in USD
                </FormDescription>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="financialData.taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    Tax ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter tax identification number"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="financialData.vatNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    VAT Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter VAT number"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="financialData.gstNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                    GST Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      className="h-10 border-gray-300 focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter GST number"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bank Accounts */}
      <Card className="bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <CreditCard className="h-5 w-5 text-[#6e55cf] dark:text-purple-400" />
              Bank Accounts ({bankAccounts.length})
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBankAccount}
              disabled={isSubmitting}
              className="h-8 gap-1 bg-[#6e55cf] text-white hover:bg-[#5a4ba8]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Account
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {bankAccounts.length > 0 ? (
            <div className="space-y-4">
              {bankAccounts.map((_: any, index: number) => (
                <Card
                  key={index}
                  className="border border-gray-200 dark:border-gray-700"
                >
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Account #{index + 1}
                        </span>
                        {bankAccounts[index]?.isDefault && (
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          >
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!bankAccounts[index]?.isDefault && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDefaultAccount(index)}
                            disabled={isSubmitting}
                            className="h-8 text-xs"
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBankAccount(index)}
                          disabled={isSubmitting}
                          className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`financialData.bankAccounts.${index}.accountName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-gray-900 dark:text-white">
                              Account Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isSubmitting}
                                className="h-9 border-gray-300 text-sm focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                placeholder="Account holder name"
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`financialData.bankAccounts.${index}.accountNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-gray-900 dark:text-white">
                              Account Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isSubmitting}
                                className="h-9 border-gray-300 text-sm focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                placeholder="Account number"
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`financialData.bankAccounts.${index}.bankName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-gray-900 dark:text-white">
                              Bank Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isSubmitting}
                                className="h-9 border-gray-300 text-sm focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                placeholder="Bank name"
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`financialData.bankAccounts.${index}.swiftCode`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-gray-900 dark:text-white">
                              SWIFT Code
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isSubmitting}
                                className="h-9 border-gray-300 text-sm focus:border-[#6e55cf] focus:ring-[#6e55cf] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                placeholder="SWIFT/BIC code"
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <CreditCard className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No Bank Accounts Added
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add bank accounts for payment processing and financial
                transactions.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={addBankAccount}
                disabled={isSubmitting}
                className="mt-4 bg-[#6e55cf] text-white hover:bg-[#5a4ba8]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Financial Information Security
              </h4>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                All financial data is encrypted and stored securely. Bank
                account numbers are masked in the interface for security
                purposes. Only authorized personnel can access complete
                financial information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
