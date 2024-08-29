import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

import { useRouter } from 'next/router';
import { validate as uuidValidate } from 'uuid';
import JimpleLogo from '../components/jimple-logo';
import LinkExpired from '../components/link-expired';
import axios from 'axios';

//https://jasonwatmore.com/post/2021/09/03/next-js-form-validation-example-with-react-hook-form

export default function ChangePassword({ user }) {
  //Form validation rules
  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], `Passwords don't match`)
      .required('Confirm Password is required'),
  });

  const formOptions = { resolver: yupResolver(validationSchema) };

  const router = useRouter();

  // get functions to build form with useForm() hook
  const { register, handleSubmit, reset, formState, setError } =
    useForm(formOptions);
  const { errors } = formState;

  //handles form submit
  const formHandler = async (data) => {
    const password = data.password;
    const confirmPassword = data.confirmPassword;
    const UUID = router.query.UUID;
    const userID = user._id;

    // Send the form data to the server API
    const response = await fetch('/api/reset_password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: password,
        confirmPassword: confirmPassword,
        UUID: UUID,
        userID: userID,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      switch (response.status) {
        case 403:
          console.log('403 response error recieved');
          setError('email', { message: responseData.data });
          break;
      }
    } else {
      // User was created succesfully
      router.push('/password_change_success');
    }
  };

  return user.authorized ? (
    <div>
      <header className="z-30 p-2 h-16 flex justify-between items-center fixed top-0 w-full">
        <Link href="/">
          <button className="w-12 h-12 ui-icon ui-cross bg-footer-button hover:bg-zinc-800 rounded-md mr-6"></button>
        </Link>
      </header>

      <div className="flex flex-row items-center justify-center min-h-screen">
        <div className="">
          <div className="max-w-screen-lg mx-auto flex justify-center">
            <JimpleLogo width={100}> height={100}</JimpleLogo>
          </div>

          <div className="w-80">
            <h1 className=" mb-8 text-2xl text-center justify-center">
              Change Password
            </h1>
            <form onSubmit={handleSubmit(formHandler)}>
              <div className="text-jimple-red pb-1">
                {errors.password?.message?.toString()}
              </div>
              <input
                type="password"
                {...register('password')}
                className={`block w-full p-3 pl-5 rounded-full focus:outline-none hover:bg-zinc-800 focus:bg-zinc-700 bg-zinc-900 mb-4 hover:cursor-pointer ${errors.password ? 'is-invalid' : ''}`}
                name="password"
                placeholder="Password"
                autoComplete="off"
              />
              <div className="text-jimple-red pb-1">
                {errors.confirmPassword?.message?.toString()}
              </div>

              <input
                type="password"
                {...register('confirmPassword')}
                className={`block w-full p-3 pl-5 rounded-full focus:outline-none hover:bg-zinc-800 focus:bg-zinc-700 bg-zinc-900 mb-5 hover:cursor-pointer ${errors.confirmPassword ? 'is-invalid' : ''}`}
                name="confirmPassword"
                placeholder="Confirm Password"
                autoComplete="off"
              />

              <button
                type="submit"
                className="p-3 w-full flex justify-center hover:cursor-pointer hover:bg-indigo-600 bg-zinc-900 rounded-full"
              >
                <span className="text-white">Update Password</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <LinkExpired></LinkExpired>
  );
}

export async function getServerSideProps(context: any) {
  const UUID = context.params.UUID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const isProduction = process.env.NODE_ENV === 'production';
  const config = {
    headers: isProduction ? {} : { origin: baseUrl },
  };
  if (!uuidValidate(UUID)) {
    // handle the error case: stop execution, throw an error, or return an error response
    return {
      props: {
        user: { authorized: false },
      },
    };
  }

  console.log('UUID: ', UUID);
  const response = await axios.post(
    `${baseUrl}/api/internal/get_user_by_query`,
    {
      query: {
        'resetPassword.UUID': UUID,
        'resetPassword.expires': { $gt: new Date().toISOString() },
      },
      config,
    },
  );
  const user = response.data;

  console.log('user: ', user);

  // Convert ObjectId to string
  const userForProps = {
    ...user,
    _id: user?._id.toString(), // Convert _id to string
    authorized: true,
    resetPassword: user?.resetPassword
      ? {
          ...user.resetPassword,
          expires: user.resetPassword.expires?.toISOString(),
        }
      : undefined,
    stripe_link: user?.stripe_link
      ? {
          ...user.stripe_link,
          expires: user.stripe_link.expires?.toISOString(),
        }
      : undefined,
    registeredAt: user?.registeredAt?.toISOString(),
  };

  // Clean up undefined fields
  Object.keys(userForProps).forEach(
    (key) => userForProps[key] === undefined && delete userForProps[key],
  );
  if (
    userForProps.stripe_link &&
    Object.keys(userForProps.stripe_link).length === 0
  ) {
    delete userForProps.stripe_link; // Remove empty stripe_link object
  }
  if (user) {
    return {
      props: {
        user: userForProps,
      },
    };
  } else
    return {
      props: {
        user: { authorized: false },
      },
    };
}
