import React from 'react';
import { Link } from 'wouter';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InfoIcon } from 'lucide-react';

interface AnonymousUserBannerProps {
  usageRemaining: boolean;
}

/**
 * Banner shown to anonymous users encouraging them to sign up
 */
export function AnonymousUserBanner({ usageRemaining }: AnonymousUserBannerProps) {
  return (
    <Alert variant={usageRemaining ? "default" : "destructive"} className="mb-4">
      <InfoIcon className="h-4 w-4 mr-2" />
      <AlertTitle className="text-lg font-semibold">
        {usageRemaining 
          ? "Sign up for full features" 
          : "Account required"}
      </AlertTitle>
      <AlertDescription className="mt-2">
        {usageRemaining ? (
          <div>
            <p className="mb-2">
              You're currently using anonymous mode with limited functionality.
              Sign up from the header to access all features and premium templates!
            </p>
          </div>
        ) : (
          <div>
            <p className="mb-2">
              Please create an account or log in to continue using the service.
              Get access to premium features and templates when you sign up.
            </p>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

export default AnonymousUserBanner;
