import '../styles/globals.css';
import '../styles/css-global.css';
import '../styles/css-interact.css';
import '../styles/css-animation.css';
import '../styles/css-icons.css';
import '../styles/animate.min.css';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from 'react-query';


// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
// const stripePromise = loadStripe('pk_test_51NJQblAUvpM7YoWdblXFt9PWvw2eNiJe1bXhg7N88VhtPxDPiCsgDWy1czQpi1JfetDsF8UFsmhMLHoVkIb2vqlw00y6IcIhqK');

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const queryClient = new QueryClient();

  return (
    <>
      <Head>
        <title>Jimple</title>
        <link rel="icon" href="./logo_icons_sizes/favicon.ico" />
      </Head>
      {/* <QueryClientProvider client={queryClient}> */}
      {/* <UserDataProvider> */}
      {/* <SpeechRecognitionProvider> */}
      {/* <ChatStateProvider> */}
      {/* <Elements stripe={stripePromise}> */}
      <Component {...pageProps} />
      {/* </Elements> */}
      {/* </ChatStateProvider> */}
      {/* </SpeechRecognitionProvider> */}
      {/* </UserDataProvider> */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      {/* </QueryClientProvider> */}
    </>
  );
}
