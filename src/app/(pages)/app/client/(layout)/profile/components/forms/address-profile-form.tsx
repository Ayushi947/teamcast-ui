'use client';

import { type FC, useState, useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { clientProfileService } from '@/lib/services/services';
import {
  IClientProfileAddress,
  IClientProfileShippingAddress,
  IClientProfileBillingAddress,
} from '@/lib/shared';
import { Loader2, MapPin, Truck, CreditCard } from 'lucide-react';
import { ProfileFormSection } from '../ui/profile-form-section';
import { logger } from '@/lib/shared';

// Define form schema based on the actual API model fields
const formSchema = z.object({
  // Primary address
  address: z.string().min(2, { message: 'Address is required' }),
  city: z.string().min(2, { message: 'City is required' }),
  state: z.string().min(2, { message: 'State is required' }),
  country: z.string().min(2, { message: 'Country is required' }),
  zipCode: z.string().min(2, { message: 'Postal code is required' }),

  // Controls for same address
  useSameForShipping: z.boolean(),
  useSameForBilling: z.boolean(),

  // Shipping address
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingCountry: z.string().optional(),
  shippingZipCode: z.string().optional(),

  // Billing address
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingCountry: z.string().optional(),
  billingZipCode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddressProfileFormProps {
  initialData?: {
    address?: IClientProfileAddress;
    shippingAddress?: IClientProfileShippingAddress;
    billingAddress?: IClientProfileBillingAddress;
  };
  onSuccess?: () => void;
  isEditing?: boolean;
}

export const AddressProfileForm: FC<AddressProfileFormProps> = ({
  initialData,
  onSuccess,
  isEditing = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [useShipping, setUseShipping] = useState(true);
  const [useBilling, setUseBilling] = useState(true);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      useSameForShipping: true,
      useSameForBilling: true,
      shippingAddress: '',
      shippingCity: '',
      shippingState: '',
      shippingCountry: '',
      shippingZipCode: '',
      billingAddress: '',
      billingCity: '',
      billingState: '',
      billingCountry: '',
      billingZipCode: '',
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    if (initialData) {
      const hasShippingAddress =
        initialData.shippingAddress &&
        Object.keys(initialData.shippingAddress).length > 0;
      const hasBillingAddress =
        initialData.billingAddress &&
        Object.keys(initialData.billingAddress).length > 0;

      setUseShipping(!hasShippingAddress);
      setUseBilling(!hasBillingAddress);

      form.reset({
        address: initialData.address?.address || '',
        city: initialData.address?.city || '',
        state: initialData.address?.state || '',
        country: initialData.address?.country || '',
        zipCode: initialData.address?.zipCode || '',
        useSameForShipping: !hasShippingAddress,
        useSameForBilling: !hasBillingAddress,
        shippingAddress: initialData.shippingAddress?.shippingAddress || '',
        shippingCity: initialData.shippingAddress?.shippingCity || '',
        shippingState: initialData.shippingAddress?.shippingState || '',
        shippingCountry: initialData.shippingAddress?.shippingCountry || '',
        shippingZipCode: initialData.shippingAddress?.shippingZipCode || '',
        billingAddress: initialData.billingAddress?.billingAddress || '',
        billingCity: initialData.billingAddress?.billingCity || '',
        billingState: initialData.billingAddress?.billingState || '',
        billingCountry: initialData.billingAddress?.billingCountry || '',
        billingZipCode: initialData.billingAddress?.billingZipCode || '',
      });
    } else {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [address, shippingAddress, billingAddress] = await Promise.all([
            clientProfileService.getAddress(),
            clientProfileService.getShippingAddress(),
            clientProfileService.getBillingAddress(),
          ]);

          const hasShippingAddress =
            shippingAddress && Object.keys(shippingAddress).length > 0;
          const hasBillingAddress =
            billingAddress && Object.keys(billingAddress).length > 0;

          setUseShipping(!hasShippingAddress);
          setUseBilling(!hasBillingAddress);

          form.reset({
            address: address?.address || '',
            city: address?.city || '',
            state: address?.state || '',
            country: address?.country || '',
            zipCode: address?.zipCode || '',
            useSameForShipping: !hasShippingAddress,
            useSameForBilling: !hasBillingAddress,
            shippingAddress: shippingAddress?.shippingAddress || '',
            shippingCity: shippingAddress?.shippingCity || '',
            shippingState: shippingAddress?.shippingState || '',
            shippingCountry: shippingAddress?.shippingCountry || '',
            shippingZipCode: shippingAddress?.shippingZipCode || '',
            billingAddress: billingAddress?.billingAddress || '',
            billingCity: billingAddress?.billingCity || '',
            billingState: billingAddress?.billingState || '',
            billingCountry: billingAddress?.billingCountry || '',
            billingZipCode: billingAddress?.billingZipCode || '',
          });
        } catch (error) {
          toast.error('Failed to load address data');
          logger.error(error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [form, initialData]);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    // Check if form has any changes
    if (!isDirty) {
      toast.info('No changes to save');
      return;
    }

    setIsLoading(true);
    try {
      const addressData: IClientProfileAddress = {
        address: values.address,
        city: values.city,
        state: values.state,
        country: values.country,
        zipCode: values.zipCode,
      };

      const shippingData: IClientProfileShippingAddress =
        values.useSameForShipping
          ? {
              shippingAddress: values.address,
              shippingCity: values.city,
              shippingState: values.state,
              shippingCountry: values.country,
              shippingZipCode: values.zipCode,
            }
          : {
              shippingAddress: values.shippingAddress || '',
              shippingCity: values.shippingCity || '',
              shippingState: values.shippingState || '',
              shippingCountry: values.shippingCountry || '',
              shippingZipCode: values.shippingZipCode || '',
            };

      const billingData: IClientProfileBillingAddress = values.useSameForBilling
        ? {
            billingAddress: values.address,
            billingCity: values.city,
            billingState: values.state,
            billingCountry: values.country,
            billingZipCode: values.zipCode,
          }
        : {
            billingAddress: values.billingAddress || '',
            billingCity: values.billingCity || '',
            billingState: values.billingState || '',
            billingCountry: values.billingCountry || '',
            billingZipCode: values.billingZipCode || '',
          };

      await Promise.all([
        clientProfileService.updateAddress(addressData),
        clientProfileService.updateShippingAddress(shippingData),
        clientProfileService.updateBillingAddress(billingData),
      ]);

      queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
      form.reset(values);
      toast.success('Address information updated successfully');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Failed to update address information');
      logger.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShippingChange = (checked: boolean) => {
    setUseShipping(checked);
    form.setValue('useSameForShipping', checked);
  };

  const handleBillingChange = (checked: boolean) => {
    setUseBilling(checked);
    form.setValue('useSameForBilling', checked);
  };

  if (isLoading && !initialData) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <ProfileFormSection
            title="Primary Address"
            description="Main address for your company"
            icon={MapPin}
            className="dark:bg-accent"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter street address"
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter city"
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter state/province"
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter country"
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter postal code"
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ProfileFormSection>

          <ProfileFormSection
            title="Shipping Address"
            description="Address for shipping and delivery"
            icon={Truck}
            className="dark:bg-accent"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="useSameForShipping"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          handleShippingChange(checked as boolean);
                        }}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Use same as primary address</FormLabel>
                      <FormDescription>
                        If checked, your shipping address will be the same as
                        your primary address
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {!useShipping && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="shippingAddress"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Shipping Street Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter shipping address"
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shippingCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping City</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter shipping city"
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shippingState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping State/Province</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter shipping state/province"
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shippingCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Country</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter shipping country"
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shippingZipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Postal Code</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter shipping postal code"
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </ProfileFormSection>

          <ProfileFormSection
            title="Billing Address"
            description="Address for billing and invoicing"
            icon={CreditCard}
            className="dark:bg-accent"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="useSameForBilling"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          handleBillingChange(checked as boolean);
                        }}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Use same as primary address</FormLabel>
                      <FormDescription>
                        If checked, your billing address will be the same as
                        your primary address
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {!useBilling && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="billingAddress"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Billing Street Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter billing address"
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="billingCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing City</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter billing city"
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="billingState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing State/Province</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter billing state/province"
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="billingCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Country</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter billing country"
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="billingZipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Postal Code</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter billing postal code"
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </ProfileFormSection>

          {isEditing && (
            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={isLoading || !isDirty}
            >
              {isLoading ? (
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
    </div>
  );
};
