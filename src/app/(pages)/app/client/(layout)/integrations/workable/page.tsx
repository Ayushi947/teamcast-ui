'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
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
import { Button } from '@/components/ui/button';
import { WorkableIcon } from '@/components/icons';
import {
  integrationCommonService,
  workableService,
} from '@/lib/services/services';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CheckCircle, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { logger } from '@/lib/logger';
import { useApp } from '@/lib/context/app-context';

// Zod schema for Workable connection form
const workableConnectionSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  subdomain: z.string().min(1, 'Subdomain is required'),
  apiKey: z.string().min(1, 'API key is required'),
  name: z.string().optional().default('Workable Integration'),
});

type WorkableConnectionFormData = z.infer<typeof workableConnectionSchema>;

export default function WorkableIntegrationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<
    'not_connected' | 'connected' | 'checking'
  >('not_connected');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { user } = useApp();

  // Use type assertion to resolve TypeScript issues
  const form = useForm<WorkableConnectionFormData>({
    resolver: zodResolver(workableConnectionSchema) as any,
    defaultValues: {
      companyName: '',
      subdomain: '',
      apiKey: '',
      name: 'Workable Integration',
    },
  });

  // Check existing connection on page load
  useEffect(() => {
    const checkExistingConnection = async () => {
      setIsLoading(true);
      try {
        setConnectionStatus('checking');
        // Always check with workableService and integrationCommonService
        try {
          // Try to get connection details from workableService
          const connectionDetails =
            await integrationCommonService.getIntegrationDataSummary();
          const workableIntegration = connectionDetails.find(
            (integration) =>
              integration.providerName.toLowerCase() === 'workable'
          );

          if (workableIntegration && workableIntegration.integrationId) {
            const result = await workableService.validateConnection(
              workableIntegration.integrationId
            );
            setConnectionStatus(result.isValid ? 'connected' : 'not_connected');
          } else {
            setConnectionStatus('not_connected');
          }
        } catch (error) {
          setConnectionStatus('not_connected');
          logger.error('Error checking existing connection:', error);
        }
      } catch (error) {
        setConnectionStatus('not_connected');
        logger.error('Error checking existing connection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingConnection();
  }, []);

  // Handle manage connection redirect
  const handleManageConnection = () => {
    setIsRedirecting(true);
    router.push('workable/settings');
  };

  // Type-safe submit handler
  const onSubmit: SubmitHandler<WorkableConnectionFormData> = async (data) => {
    if (!user) {
      toast.error('Authentication Required', {
        description: 'Please log in to connect an integration',
      });
      return;
    }

    setIsLoading(true);
    setConnectionStatus('checking');
    try {
      const response = await workableService.connectWorkable({
        ...data,
        description: `Workable integration for ${data.companyName}`,
      });

      if (response.status === 'ACTIVE') {
        // Store integration ID for future use
        localStorage.setItem('workable_integration_id', response.integrationId);

        toast.success('Workable Integration Connected', {
          description: response.message,
        });
        setConnectionStatus('connected');
        router.push('workable/settings');
      } else {
        toast.error('Connection Failed', {
          description: response.message || 'Unable to connect to Workable',
        });
        setConnectionStatus('not_connected');
      }
    } catch (error) {
      toast.error('Connection Error', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
      setConnectionStatus('not_connected');
    } finally {
      setIsLoading(false);
    }
  };

  // Loader component for redirection
  if (isRedirecting) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4">
          <Loader2
            className="text-primary h-12 w-12 animate-spin"
            strokeWidth={2}
          />
          <p className="text-muted-foreground text-sm">
            Redirecting to Workable settings...
          </p>
        </div>
      </div>
    );
  }

  // Loader component for initial loading
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4">
          <Loader2
            className="text-primary h-12 w-12 animate-spin"
            strokeWidth={2}
          />
          <p className="text-muted-foreground text-sm">
            Validating Workable connection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full space-y-6 p-3">
      <div className="mb-6 flex items-center space-x-4">
        <Link
          href="/app/client/integrations"
          className="text-muted-foreground hover:text-primary mr-4 flex items-center transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <WorkableIcon className="h-12 w-12" />
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">Connect Workable</h1>
          </div>
          <p className="text-muted-foreground">
            Integrate your Workable Applicant Tracking System with Teamcast
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left Column: Connection Form */}
        <div className="bg-background border-border/50 space-y-6 rounded-lg border p-6 shadow-sm">
          <div className="mb-4 text-center">
            <h2 className="text-primary mb-2 text-xl font-semibold">
              Workable Integration
            </h2>
            <p className="text-muted-foreground text-sm">
              Enter your Workable account details
            </p>
          </div>

          {connectionStatus === 'connected' ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:bg-green-950/30">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-green-700 dark:text-green-300">
                Integration Connected
              </h3>
              <p className="text-muted-foreground mb-4">
                Your Workable ATS is successfully integrated
              </p>
              <Button onClick={handleManageConnection} variant="secondary">
                Manage Integration
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your company name"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The name of your company as registered in Workable
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subdomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workable Subdomain</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your company's Workable subdomain"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your Workable subdomain (e.g., &apos;mycompany&apos; for
                        mycompany.workable.com)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workable API Key</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your Workable API key"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        You can generate an API key in your Workable account
                        settings
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Connecting...' : 'Connect Workable'}
                </Button>
              </form>
            </Form>
          )}
        </div>

        {/* Right Column: Integration Guide */}
        <div className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 space-y-4 rounded-lg border p-6">
          <div className="mb-4 flex items-center space-x-4">
            <div className="bg-primary/10 dark:bg-primary/20 rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary dark:text-primary/80 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <h2 className="text-primary dark:text-primary/80 text-xl font-bold">
              Workable Integration Guide
            </h2>
          </div>

          <div className="space-y-4">
            <section>
              <h3 className="text-primary dark:text-primary/80 mb-2 font-semibold">
                1. Find Your Company Subdomain
              </h3>
              <ol className="text-foreground dark:text-foreground/80 list-inside list-decimal space-y-2 pl-4 text-sm">
                <li>Log in to your Workable account</li>
                <li>Go to Settings</li>
                <li>Under the Company section, click on Company Profile</li>
                <li>
                  Copy your subdomain (e.g., &apos;mycompany&apos; from
                  mycompany.workable.com)
                </li>
              </ol>
            </section>

            <section>
              <h3 className="text-primary dark:text-primary/80 mb-2 font-semibold">
                2. Generate API Access Token
              </h3>
              <ol className="text-foreground dark:text-foreground/80 list-inside list-decimal space-y-2 pl-4 text-sm">
                <li>In Settings, go to the Integrations section</li>
                <li>Click on Apps &rarr; select API Access Tokens</li>
                <li>Click Generate new token</li>
                <li>
                  Provide a Token Name (e.g., &quot;Teamcast Integration&quot;)
                </li>
                <li>Set the Expiry Date</li>
                <li>
                  Select the required API Scopes:
                  <ul className="mt-2 list-[circle] pl-6">
                    <li>r_accounts</li>
                    <li>r_candidates</li>
                    <li>r_jobs</li>
                  </ul>
                </li>
                <li>Click Generate and copy the token</li>
              </ol>
            </section>

            <section>
              <h3 className="text-primary dark:text-primary/80 mb-2 font-semibold">
                3. Important Considerations
              </h3>
              <div className="bg-primary/5 dark:bg-primary/10 text-foreground dark:text-foreground/80 rounded-lg p-3 text-sm">
                <p className="mb-2 flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-primary dark:text-primary/80 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Ensure API key has appropriate permissions</span>
                </p>
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>Recommended: Create a dedicated integration user</li>
                  <li>Limit API key to minimum required scopes</li>
                  <li>Regularly rotate API keys for security</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
