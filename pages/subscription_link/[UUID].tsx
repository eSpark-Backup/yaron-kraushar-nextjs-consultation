import { useRouter } from 'next/router';
import { validate as uuidValidate } from 'uuid';
import { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import clientPromise from '../../services/mongodb';
import NotAuthorized from '../components/not-authorized';
import { User } from '../../services/user_entity';
import { serializeUser } from '../../services/user';

interface Props {
  user: Partial<User>;
}

export default function StripeSubscriptionLink({ user }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (user.authorized) {
      router.push(
        `/stripe_subscribe?userId=${user._id}&email=${user.email}&fullName=${user.fullName}&isFlutterClient=true`,
      );
    }
    if (!user.authorized) {
      <NotAuthorized />;
    }
  }, [user, router]);

  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const UUID = context.params?.UUID as string;
    const isProduction = process.env.NODE_ENV === 'production';
    const config = {
      headers: isProduction ? {} : { origin: baseUrl },
    };

    if (!uuidValidate(UUID)) {
      return {
        props: {
          user: { authorized: false },
        },
      };
    }

    const response = await axios.post(
      `${baseUrl}/api/internal/get_user_by_query`,
      {
        query: {
          'stripe_link.UUID': UUID,
          'stripe_link.expires': { $gt: new Date().toISOString() },
        },
        config,
      },
    );
    const user: User = response.data;

    if (user) {
      const userForProps = serializeUser(user);
      return {
        props: {
          user: { ...userForProps, authorized: true },
        },
      };
    } else {
      return {
        props: {
          user: { authorized: false },
        },
      };
    }
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        user: { authorized: false },
      },
    };
  }
};
