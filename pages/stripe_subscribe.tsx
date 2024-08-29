import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import DeepLink from '../services/deeplink';
import { updateUserWithStripeDetails } from './api/stripe/update_stripe_details';

const StripeSubscribePage: NextPage = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { userId, email, fullName, isFlutterClient = 'false' } = router.query;
  const isRedirectingRef = useRef(false);
  console.log('start stripe subscribe');
  useEffect(() => {
    if (userId && email && fullName && !isRedirectingRef.current) {
      isRedirectingRef.current = true;
      handleSubscription(
        userId.toString(),
        email.toString(),
        fullName.toString(),
        isFlutterClient.toString(),
      );
    }
  }, [userId, email, fullName, isFlutterClient]);

  const handleSubscription = async (
    userId: string,
    email: string,
    fullName: string,
    isFlutterClient: string,
  ) => {
    console.log('Starting subscription handling...');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const isProduction = process.env.NODE_ENV === 'production';
    const config = {
      headers: isProduction ? {} : { origin: baseUrl },
    };
    if (userId && email && fullName) {
      try {
        // Prevent multiple API calls by checking if already loading

        console.log('Making API call to create checkout session with data:', {
          userId,
          email,
          fullName,
          isFlutterClient,
        });

        const response = await axios.post(
          `${baseUrl}/api/internal/create-checkout-session`,
          {
            userId,
            email,
            fullName,
            isFlutterClient,
          },
          config,
        );

        const { status, returnUrl, checkoutUrl } = response.data;
        console.log(
          'API call completed with status:',
          status,
          'returnUrl:',
          returnUrl,
          'checkoutUrl:',
          checkoutUrl,
        );

        switch (status) {
          case 'existing_subscription':
            console.log(
              'User has an existing subscription. Triggering DeepLink.success().',
            );
            DeepLink.success();
            break;
          case 'new_subscription':
            console.log(
              'New subscription created. Redirecting to returnUrl:',
              returnUrl,
            );
            window.location.href = returnUrl;
            break;
          case 'renew_subscription':
            console.log(
              'Subscription renewal required. Redirecting to checkoutUrl:',
              checkoutUrl,
            );
            window.location.href = checkoutUrl;
            break;
          default:
            console.error('Unexpected response from server:', status);
            setError('Unexpected response from server.');
        }
      } catch (error) {
        console.error('Error handling subscription:', error);
        setError(
          'An error occurred while processing your request. Please try again later.',
        );
        DeepLink.error();
      }
    } else {
      console.log(
        'Missing one or more required query parameters: userId, email, fullName. userId:',
        userId,
        'email:',
        email,
        'fullName:',
        fullName,
      );
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div
          className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full mb-4"
          role="status"
        >
          {/* Spinner */}
        </div>
        <div className="text-red-400 mt-4 p-10 text-center">
          {error} {/* Error Message */}
        </div>
      </div>

      <style jsx>{`
        .spinner-border {
          color: #4f46e5; // Tailwind color, you can change this
          border-top-color: transparent; // Makes a spinner effect
        }
        .animate-spin {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default StripeSubscribePage;
