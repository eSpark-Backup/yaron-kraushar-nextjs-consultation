import Link from "next/link";
import JimpleLogo from "./components/jimple-logo";
import { useRouter } from "next/router";
import { useEffect } from "react";
import DeepLink from "../services/deeplink";
import Image from 'next/image';
export default function SubscriptionCancelled() {
  const router = useRouter();
  const { isFlutterClient } = router.query;

  useEffect(() => {
    if (isFlutterClient === 'true') {
      console.log("Flutter client detected: Automatically handling back to app.");
      handleBackToApp();
    } else {
      console.log("Non-Flutter client detected: No automatic redirect.");
    }
  }, [isFlutterClient]);

  const handleBackToApp = () => {
    console.log("Subscription cancelled: Returning to app");
    DeepLink.error();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <JimpleLogo width={100} height={100} linkToRoot={false} />

      <div className="w-80 mt-8 p-1">
        <h1 className="mb-8 text-3xl font-semibold text-amber-400">Subscription Cancelled</h1>
        <p className="text-lg mb-4">Your subscription was not completed. Please subscribe to use Jimple.</p>
      </div>

      {isFlutterClient === 'true' ? (
        <button 
          className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleBackToApp}
        >
          Back to the app
        </button>
      ) : (
        <Link href="/" className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Return to Homepage
        </Link>
      )}

      <div className="flex justify-center mt-24">
      <Link href="https://apps.apple.com/au/app/jimple/id6474167499" passHref>
        <a>
          <Image
            src="/icon-download-ios.png"
            alt="iOS Logo"
            width={192} // Adjust these values based on your image's actual dimensions
            height={192}
            className="w-48 mr-8"
          />
        </a>
      </Link>
      <Link href="https://play.google.com/store/apps/details?id=com.jimple.jimplechat&pcampaignid=web_share" passHref>
        <a>
          <Image
            src="/icon-download-android.png"
            alt="Android Logo"
            width={192} // Adjust these values based on your image's actual dimensions
            height={192}
            className="w-48"
          />
        </a>
      </Link>
      </div>
    </div>
  );
}
