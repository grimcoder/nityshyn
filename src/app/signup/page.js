'use client'

import { useMutation, gql } from '@apollo/client';
import { useForm } from 'react-hook-form';
import client from '../lib/apolloClient';
import Link from 'next/link'

const REGISTER_USER = gql`
  mutation Register($email: String!, $password: String!, $username: String!) {
    register(input: { email: $email, password: $password, username: $username }) {
      success
      message
      user {
        email
      }
    }
  }
`;

export default function Register() {
  const [registerUser, { data, loading, error }] = useMutation(REGISTER_USER, {
    client: client,
  });
  const { register, handleSubmit } = useForm();

  const onSubmit = async ({ email, password, username }) => {
    try {
      const response = await registerUser({ variables: { email, password, username } });
      if (response.data.register.success) {
        console.log('Registration successful:', response.data.register.message);
      } else {
        console.error('Registration error:', response.data.register.message);
      }
    } catch (err) {
      console.error('Error:', err.message);
    }
  };

  return (
    <div className='min-h-screen flex flex-col justify-center items-center bg-gray-100'>
      <div className='bg-white p-8 rounded-lg shadow-md w-96'>
      <h1 className="text-3xl text-blue-500 mb-4 font-bold">Register</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
        <div className='flex mb-4 items-center'>
          <label className='text-blue-500 w-40'>Username:</label>
          <input className='w-full p-2 border rounded' type="text" {...register('username')} required />
        </div>
        <div  className='flex mb-4 items-center'>
          <label className='text-blue-500 w-40'>Email:</label>
          <input  className='w-full p-2 border rounded' type="email" {...register('email')} required />
        </div>
        <div  className='mb-4 flex items-center'>
          <label className='text-blue-500 w-40'>Password:</label>
          <input  className='w-full p-2 border rounded' type="password" {...register('password')} required />
        </div>
        <div className='flex justify-between items-center'>
          <button type="submit" className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded'>Register</button>
          <Link href="/" className="text-blue-500 hover:text-blue-600">Back to Home</Link>

        </div>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && data.register.success && <p>{data.register.message}</p>}
      </div>
    </div>
  );
}
