'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Calendar, Check, DollarSign, Globe, User } from 'lucide-react';

interface CountryData {
  name: string;
  code: string;
  currency: string;
  currencySymbol: string;
  avgSalary: number;
  costOfLiving: number;
  candidatePool: number;
  remoteWorkAdoption: number;
  epfRate: number;
  epsRate: number;
  taxRate: number;
  exchangeRate: number;
  contractorRate: number; // Percentage markup for contractor
}

const countries: CountryData[] = [
  {
    name: 'India',
    code: 'IN',
    currency: 'INR',
    currencySymbol: '₹',
    avgSalary: 4800000,
    costOfLiving: 30,
    candidatePool: 15000000,
    remoteWorkAdoption: 75,
    epfRate: 3.67,
    epsRate: 8.33,
    taxRate: 32.5,
    exchangeRate: 80,
    contractorRate: 15, // 15% markup for contractors
  },
  {
    name: 'United States',
    code: 'US',
    currency: 'USD',
    currencySymbol: '$',
    avgSalary: 120000,
    costOfLiving: 100,
    candidatePool: 23900000,
    remoteWorkAdoption: 58,
    epfRate: 0,
    epsRate: 0,
    taxRate: 25,
    exchangeRate: 1,
    contractorRate: 20, // 20% markup for contractors
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    currency: 'GBP',
    currencySymbol: '£',
    avgSalary: 65000,
    costOfLiving: 90,
    candidatePool: 12000000,
    remoteWorkAdoption: 65,
    epfRate: 0,
    epsRate: 0,
    taxRate: 20,
    exchangeRate: 0.8,
    contractorRate: 25, // 25% markup for contractors
  },
  {
    name: 'Germany',
    code: 'DE',
    currency: 'EUR',
    currencySymbol: '€',
    avgSalary: 55000,
    costOfLiving: 85,
    candidatePool: 9800000,
    remoteWorkAdoption: 60,
    epfRate: 0,
    epsRate: 0,
    taxRate: 30,
    exchangeRate: 0.92,
    contractorRate: 18, // 18% markup for contractors
  },
  {
    name: 'Singapore',
    code: 'SG',
    currency: 'SGD',
    currencySymbol: 'S$',
    avgSalary: 85000,
    costOfLiving: 95,
    candidatePool: 3200000,
    remoteWorkAdoption: 70,
    epfRate: 0,
    epsRate: 0,
    taxRate: 22,
    exchangeRate: 1.35,
    contractorRate: 22, // 22% markup for contractors
  },
];

interface Package {
  name: string;
  price: number;
  features: string[];
}

const packages: Package[] = [
  {
    name: 'Starter',
    price: 199,
    features: ['Basic support', 'Essential features'],
  },
  {
    name: 'Professional',
    price: 499,
    features: ['Priority support', 'Advanced features'],
  },
  {
    name: 'Enterprise',
    price: 699,
    features: ['24/7 support', 'Custom features'],
  },
];

type ExperienceType = 'EOR' | 'Contractor';
type TimeFrame = 'Monthly' | 'Yearly';

// Define return types for the calculateCosts function
interface EORCosts {
  grossSalary: number;
  taxesAndSecurity: number;
  netSalary: number;
  epfContribution: number;
  epsContribution: number;
  teamcastFee: number;
  totalCosts: number;
  usdEquivalent: number;
}

interface ContractorCosts {
  grossSalary: number;
  contractorRate: number;
  teamcastFee: number;
  totalCosts: number;
  usdEquivalent: number;
}

type Costs = EORCosts | ContractorCosts;

const CalculatorPage = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(
    countries[0]
  );
  const [grossSalary, setGrossSalary] = useState(selectedCountry.avgSalary);
  const [selectedPackage, setSelectedPackage] = useState(packages[1]);
  const [experienceType, setExperienceType] = useState<ExperienceType>('EOR');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('Yearly');

  // Calculate costs based on inputs
  const calculateCosts = (): Costs => {
    // Convert to monthly if yearly is selected
    const monthlyGrossSalary =
      timeFrame === 'Yearly' ? grossSalary / 12 : grossSalary;

    if (experienceType === 'Contractor') {
      // For contractors, just show the rate with markup
      const contractorRate =
        monthlyGrossSalary * (1 + selectedCountry.contractorRate / 100);
      const teamcastFee = selectedPackage.price;

      return {
        grossSalary: monthlyGrossSalary,
        contractorRate,
        teamcastFee,
        totalCosts: contractorRate + teamcastFee,
        usdEquivalent:
          (contractorRate + teamcastFee) * selectedCountry.exchangeRate,
      };
    } else {
      // For EOR, calculate all the details
      const taxesAndSecurity =
        (monthlyGrossSalary * selectedCountry.taxRate) / 100;
      const netSalary = monthlyGrossSalary - taxesAndSecurity;

      const epfContribution =
        (monthlyGrossSalary * selectedCountry.epfRate) / 100;
      const epsContribution =
        (monthlyGrossSalary * selectedCountry.epsRate) / 100;

      const teamcastFee = selectedPackage.price;

      const totalCosts =
        monthlyGrossSalary + epfContribution + epsContribution + teamcastFee;

      return {
        grossSalary: monthlyGrossSalary,
        taxesAndSecurity,
        netSalary,
        epfContribution,
        epsContribution,
        teamcastFee,
        totalCosts,
        usdEquivalent: totalCosts * selectedCountry.exchangeRate,
      };
    }
  };

  const costs = calculateCosts();

  // Format currency with appropriate symbol and decimal places
  const formatCurrency = (amount: number) => {
    return `${selectedCountry.currencySymbol}${amount.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    )}`;
  };

  // Type guard to check if costs is EORCosts
  const isEORCosts = (costs: Costs): costs is EORCosts => {
    return 'taxesAndSecurity' in costs;
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Global Experience Cost Calculator
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Calculate the total cost of hiring candidate globally with our EOR
            or Contractor solutions
          </p>
        </div>

        {/* Information Section */}
        <div className="mb-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center">
                  <div className="mr-4 rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Employer of Record (EOR)
                  </h3>
                </div>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  Our EOR solution allows you to hire employees globally without
                  setting up local entities. We handle payroll, compliance, and
                  benefits.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="mt-0.5 mr-2 h-5 w-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Full compliance with local labor laws
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mt-0.5 mr-2 h-5 w-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Payroll and benefits management
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mt-0.5 mr-2 h-5 w-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Employee onboarding and offboarding
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center">
                  <div className="mr-4 rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                    <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Contractor Management
                  </h3>
                </div>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  Simplify contractor payments and compliance with our
                  contractor management solution. Perfect for project-based
                  work.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="mt-0.5 mr-2 h-5 w-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Streamlined contractor onboarding
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mt-0.5 mr-2 h-5 w-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Automated payment processing
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mt-0.5 mr-2 h-5 w-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Contract and compliance management
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center">
                  <div className="mr-4 rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                    <Globe className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Global Compliance
                  </h3>
                </div>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  Stay compliant with local labor laws and regulations in over
                  150 countries. Our experts handle all the complexities.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="mt-0.5 mr-2 h-5 w-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Up-to-date regulatory knowledge
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mt-0.5 mr-2 h-5 w-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Risk mitigation strategies
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mt-0.5 mr-2 h-5 w-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Local legal support
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Calculator Section */}
        <div className="mb-16 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Country Selection */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center">
                      <Globe className="mr-2" />
                      Country
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCountry.code}
                      onChange={(e) => {
                        const country = countries.find(
                          (c) => c.code === e.target.value
                        );
                        if (country) {
                          setSelectedCountry(country);
                          setGrossSalary(
                            timeFrame === 'Yearly'
                              ? country.avgSalary
                              : country.avgSalary / 12
                          );
                        }
                      }}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Experience Type Selection */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center">
                      <User className="mr-2" />
                      Experience Type
                    </div>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setExperienceType('EOR')}
                      className={`flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                        experienceType === 'EOR'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      Employer of Record
                    </button>
                    <button
                      onClick={() => setExperienceType('Contractor')}
                      className={`flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                        experienceType === 'Contractor'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      Contractor
                    </button>
                  </div>
                </div>

                {/* Time Frame Selection */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center">
                      <Calendar className="mr-2" />
                      Time Frame
                    </div>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setTimeFrame('Monthly');
                        setGrossSalary(grossSalary * 12);
                      }}
                      className={`flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                        timeFrame === 'Monthly'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => {
                        setTimeFrame('Yearly');
                        setGrossSalary(grossSalary / 12);
                      }}
                      className={`flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                        timeFrame === 'Yearly'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      Yearly
                    </button>
                  </div>
                </div>

                {/* Salary Input */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center">
                      <DollarSign className="mr-2" />
                      {timeFrame === 'Yearly' ? 'Annual' : 'Monthly'}{' '}
                      {experienceType === 'EOR' ? 'Salary' : 'Rate'}
                    </div>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 dark:text-gray-400">
                        {selectedCountry.currencySymbol}
                      </span>
                    </div>
                    <input
                      type="number"
                      value={grossSalary}
                      onChange={(e) => setGrossSalary(Number(e.target.value))}
                      className="block w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-8 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Package Selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Teamcast Package
                  </label>
                  <div className="space-y-3">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.name}
                        className={`cursor-pointer rounded-lg border p-4 transition-all ${
                          selectedPackage.name === pkg.name
                            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {pkg.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              ${pkg.price}/month
                            </p>
                          </div>
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                              selectedPackage.name === pkg.name
                                ? 'border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {selectedPackage.name === pkg.name && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {experienceType === 'EOR' && isEORCosts(costs) ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                          {timeFrame === 'Yearly' ? 'Annual' : 'Monthly'} Gross{' '}
                          {timeFrame === 'Yearly' ? 'Salary' : 'Rate'}
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(
                            costs.grossSalary *
                              (timeFrame === 'Yearly' ? 12 : 1)
                          )}
                        </p>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                          Net {timeFrame === 'Yearly' ? 'Salary' : 'Rate'}
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(
                            costs.netSalary * (timeFrame === 'Yearly' ? 12 : 1)
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                      <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Taxes and Social Security ({selectedCountry.taxRate}%)
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                          costs.taxesAndSecurity *
                            (timeFrame === 'Yearly' ? 12 : 1)
                        )}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                      <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mandatory Employer Contributions
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            EPF Contribution ({selectedCountry.epfRate}%)
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(
                              costs.epfContribution *
                                (timeFrame === 'Yearly' ? 12 : 1)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            EPS Contribution ({selectedCountry.epsRate}%)
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(
                              costs.epsContribution *
                                (timeFrame === 'Yearly' ? 12 : 1)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                      <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Teamcast fee ({selectedPackage.name})
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                          costs.teamcastFee * (timeFrame === 'Yearly' ? 12 : 1)
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                          {timeFrame === 'Yearly' ? 'Annual' : 'Monthly'}{' '}
                          Contractor Rate
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(
                            (costs as ContractorCosts).contractorRate *
                              (timeFrame === 'Yearly' ? 12 : 1)
                          )}
                        </p>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                          Teamcast fee ({selectedPackage.name})
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(
                            costs.teamcastFee *
                              (timeFrame === 'Yearly' ? 12 : 1)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/30">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="mb-1 text-sm text-blue-600 dark:text-blue-400">
                        Total {timeFrame === 'Yearly' ? 'Annual' : 'Monthly'}{' '}
                        Cost
                      </p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {formatCurrency(
                          costs.totalCosts * (timeFrame === 'Yearly' ? 12 : 1)
                        )}
                      </p>
                      <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                        ≈ $
                        {(
                          costs.usdEquivalent *
                          (timeFrame === 'Yearly' ? 12 : 1)
                        ).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}{' '}
                        USD
                      </p>
                    </div>
                    <div className="mt-4 flex gap-3 md:mt-0">
                      <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                        Get Started
                      </button>
                      <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        Book a Demo
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
