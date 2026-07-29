"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { completeOnboardingAction } from '@/lib/actions/profile-actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Check, ChevronRight, ChevronLeft, Building2, Target, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function OnboardingWizard({ initialUser }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const [formData, setFormData] = React.useState({
    fullName: initialUser?.user_metadata?.full_name || '',
    baseCurrency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    bankAccountName: 'HDFC Salary Account',
    bankBalance: '25000',
    cashBalance: '5000',
    monthlyBudget: '40000',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    setErrorMsg('');
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setErrorMsg('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        fullName: formData.fullName,
        baseCurrency: formData.baseCurrency,
        currencySymbol: formData.currencySymbol,
        timezone: formData.timezone,
        bankAccountName: formData.bankAccountName,
        bankBalance: parseFloat(formData.bankBalance) || 0,
        cashBalance: parseFloat(formData.cashBalance) || 0,
        monthlyBudget: parseFloat(formData.monthlyBudget) || 0,
      };

      const res = await completeOnboardingAction(payload);
      if (!res.success) {
        throw new Error(res.error);
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('[ONBOARDING_SUBMIT_ERROR]:', err);
      setErrorMsg(err.message || 'Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-8">
      {/* Progress Steps Header */}
      <div className="flex items-center justify-between px-4">
        {[
          { step: 1, title: 'Profile', icon: Sparkles },
          { step: 2, title: 'Accounts', icon: Building2 },
          { step: 3, title: 'Budget Boundary', icon: Target },
          { step: 4, title: 'Ready', icon: Check },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          const isDone = currentStep > item.step;
          return (
            <div key={item.step} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all',
                  isDone
                    ? 'bg-income text-income-foreground font-bold shadow-sm'
                    : isActive
                    ? 'bg-primary text-primary-foreground font-bold ring-4 ring-primary/20 shadow-sm'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span
                className={cn(
                  'text-xs font-semibold',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.title}
              </span>
            </div>
          );
        })}
      </div>

      {errorMsg && (
        <div className="rounded-control border border-expense-border bg-expense-soft p-4 text-sm font-semibold text-expense">
          {errorMsg}
        </div>
      )}

      {/* Step 1: Profile & Regional Preferences */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-heading">Set Up Your Financial Profile</CardTitle>
            <CardDescription className="text-muted-foreground">
              Tell us how to address you and select your base currency.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-foreground">
                Full Name
              </label>
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ananya Sharma"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-foreground">
                  Base Currency
                </label>
                <select
                  name="baseCurrency"
                  value={formData.baseCurrency}
                  onChange={handleChange}
                  className="w-full rounded-control border border-input bg-card text-foreground p-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-foreground">
                  Timezone
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  className="w-full rounded-control border border-input bg-card text-foreground p-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleNext} className="gap-2">
              Next Step <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Primary Accounts Setup */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-heading">Link Your Primary Accounts</CardTitle>
            <CardDescription className="text-muted-foreground">
              Set up your primary bank account and cash balance to start tracking immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-foreground">
                Primary Bank Account Name
              </label>
              <Input
                name="bankAccountName"
                value={formData.bankAccountName}
                onChange={handleChange}
                placeholder="HDFC Salary Account"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-foreground">
                Opening Bank Balance (₹)
              </label>
              <Input
                name="bankBalance"
                type="number"
                value={formData.bankBalance}
                onChange={handleChange}
                placeholder="25000"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-foreground">
                Cash Wallet Balance (₹)
              </label>
              <Input
                name="cashBalance"
                type="number"
                value={formData.cashBalance}
                onChange={handleChange}
                placeholder="5000"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={handleNext} className="gap-2">
              Next Step <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Monthly Budget Boundary */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-heading">Set Monthly Spending Target</CardTitle>
            <CardDescription className="text-muted-foreground">
              Establish a monthly expenditure boundary. We will alert you when spending hits 80%.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-foreground">
                Target Monthly Budget (₹)
              </label>
              <Input
                name="monthlyBudget"
                type="number"
                value={formData.monthlyBudget}
                onChange={handleChange}
                placeholder="40000"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                You can add category-specific budgets later in the Budgets module.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={handleNext} className="gap-2">
              Review & Complete <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 4: Summary & Completion */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-heading">
              <Sparkles className="h-6 w-6 text-primary" /> You&apos;re All Set!
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Review your initial setup before entering your financial dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 rounded-control bg-secondary p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Full Name</span>
              <span className="font-semibold text-foreground">{formData.fullName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Currency</span>
              <span className="font-semibold text-foreground">{formData.baseCurrency} (₹)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Primary Bank</span>
              <span className="font-semibold text-foreground">
                {formData.bankAccountName} (₹{formData.bankBalance})
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cash Wallet</span>
              <span className="font-semibold text-foreground">₹{formData.cashBalance}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Budget Cap</span>
              <span className="font-semibold text-foreground">₹{formData.monthlyBudget}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={isLoading} className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
              {isLoading ? 'Setting Up Workspace...' : 'Enter Rupiyo Dashboard'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
