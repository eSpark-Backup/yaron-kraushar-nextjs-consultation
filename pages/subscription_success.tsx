import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import JimpleLogo from './components/jimple-logo';
import DeepLink from '../services/deeplink';

export default function SubscriptionSuccess() {
  const router = useRouter();
  const { userId, isFlutterClient } = router.query;
  const [verificationStatus, setVerificationStatus] = useState<
    'pending' | 'success' | 'error'
  >('pending');
  const [countdown, setCountdown] = useState(5);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  const navigateBack = useCallback(() => {
    if (isFlutterClient === 'true') {
      console.log('Flutter client detected. Triggering DeepLink.error().');
      DeepLink.error();
    } else {
      console.log('Non-Flutter client. No action taken on navigate back.');
    }
  }, [isFlutterClient]);

  const navigateSuccess = useCallback(() => {
    if (isFlutterClient === 'true') {
      console.log('Flutter client detected. Triggering DeepLink.success().');
      DeepLink.success();
    } else {
      console.log('Non-Flutter client. No action taken on navigate success.');
    }
  }, [isFlutterClient]);

  useEffect(() => {
    if (userId) {
      console.log('Subscription ID found. Verifying subscription:', userId);
      verifySubscription(userId.toString());
    } else {
      console.log('No subscription ID found in the query.');
    }
  }, [userId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (
      (verificationStatus === 'success' || verificationStatus === 'error') &&
      countdown > 0
    ) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setShouldNavigate(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, verificationStatus]);

  useEffect(() => {
    if (shouldNavigate) {
      if (verificationStatus === 'success') {
        navigateSuccess();
      } else if (verificationStatus === 'error') {
        navigateBack();
      }
    }
  }, [shouldNavigate, verificationStatus, navigateSuccess, navigateBack]);

  const verifySubscription = async (userId: string) => {
    try {
      console.log('Sending request to verify subscription with ID:', userId);
      const response = await fetch('/api/stripe/verify-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.status === 200) {
        const { userId } = await response.json();
        console.log('Subscription verification successful. User ID:', userId);
        setVerificationStatus('success');
      } else {
        console.error(
          'Error verifying subscription. Server responded with status:',
          response.status,
        );
        setVerificationStatus('error');
      }
    } catch (error) {
      console.error('Error during subscription verification:', error);
      setVerificationStatus('error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <JimpleLogo width={100} height={100} linkToRoot={false} />
      <div className="mt-8 text-center">
        {verificationStatus === 'pending' && (
          <p>Verifying your subscription...</p>
        )}
        {verificationStatus === 'success' && (
          <>
            <p className="text-white">
              Congratulations! You have been subscribed successfully.
            </p>
            <p className="text-white mt-2">
              You will be automatically directed back to the app in: {countdown}{' '}
              seconds
            </p>
          </>
        )}
        {verificationStatus === 'error' && (
          <>
            <p className="text-red-500">
              There was an error verifying your subscription. Please contact
              support.
            </p>
            <p className="text-white mt-2">
              You will be automatically directed back to the app in: {countdown}{' '}
              seconds
            </p>
          </>
        )}
      </div>
    </div>
  );
}
