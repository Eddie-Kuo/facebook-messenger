'use client';

import { useCallback, useEffect, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import AuthSocialButton from './AuthSocialButton';
import AuthInput from './ui/AuthInput';
import Button from './ui/Button';
import { BsGithub, BsGoogle } from 'react-icons/bs';
import axios from 'axios';
import toast from 'react-hot-toast';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Variant = 'LOGIN' | 'REGISTER';

export default function AuthForm() {
  const [variant, setVariant] = useState<Variant>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);

  const session = useSession();
  const router = useRouter();

  // page redirect for authenticated users
  useEffect(() => {
    if (session?.status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [session?.status, router]);

  const toggleVariant = useCallback(() => {
    if (variant === 'LOGIN') {
      setVariant('REGISTER');
    } else {
      setVariant('LOGIN');
    }
  }, [variant]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    if (variant === 'REGISTER') {
      // Axios Register
      axios
        .post('/api/register', data)
        .catch(() => toast.error('Something went wrong! Try again.'))
        .finally(() => setIsLoading(false));
    }

    if (variant === 'LOGIN') {
      // NextAuth Sign in
      signIn('credentials', {
        ...data,
        redirect: false,
      })
        .then((callback) => {
          if (callback?.error) {
            toast.error('Invalid Credentials');
          }

          if (callback?.ok && !callback.error) {
            toast.success('Logged in!');
          }
        })
        .finally(() => setIsLoading(false));
    }
  };

  const socialSignIn = (action: string) => {
    setIsLoading(true);
    // NextAuth Social Sign in
    signIn(action, { redirect: false })
      .then((callback) => {
        if (callback?.error) {
          toast.error('Failed to log in.');
        }
        if (callback?.ok && !callback?.error) {
          toast.success('Logged in!');
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className='mt-8 mx-auto sm:w-full sm:max-w-md'>
      <div className='bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10'>
        <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
          {variant === 'REGISTER' && (
            <AuthInput
              id='name'
              label='Name'
              register={register}
              errors={errors}
              disabled={isLoading}
            />
          )}
          <AuthInput
            id='email'
            label='Email Address'
            type='email'
            register={register}
            errors={errors}
            disabled={isLoading}
          />
          <AuthInput
            id='password'
            label='Password'
            type='password'
            register={register}
            errors={errors}
            disabled={isLoading}
          />

          <div>
            <Button disabled={isLoading} fullWidth type='submit'>
              {variant === 'LOGIN' ? 'Sign In' : 'Register'}
            </Button>
          </div>
        </form>

        <div className='mt-6'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='bg-white px-2 text-gray-500'>
                Or continue with
              </span>
            </div>
          </div>

          <div className='mt-6 flex gap-2'>
            <AuthSocialButton
              icon={BsGithub}
              onClick={() => socialSignIn('github')}
            />
            <AuthSocialButton
              icon={BsGoogle}
              onClick={() => socialSignIn('google')}
            />
          </div>
        </div>

        <div className='flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500'>
          <div>
            {variant === 'LOGIN'
              ? 'New to Messenger?'
              : 'Already have an account?'}
          </div>
          <div onClick={toggleVariant} className='underline cursor-pointer'>
            {variant === 'LOGIN' ? 'Create an Account' : ' Login'}
          </div>
        </div>
      </div>
    </div>
  );
}
