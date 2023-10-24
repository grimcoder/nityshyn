'use client'
// You may need to adjust the import path to the ApolloClient depending on your directory structure.
import { useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import client from '../lib/apolloClient';


const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      success
      message
      token
      user {
        username
      }
    }
  }
`;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const [login, { data, loading, error }] = useMutation(LOGIN_MUTATION ,{
    client: client,
  });

  const onSubmit = async (data) => {
    try {
      const { data: loginData } = await login({ variables: { username: data.username, password: data.password } });
      if (loginData.login.success) {
        console.log('Login successful:', loginData);
        // You can navigate the user to another page, store the token, etc.
      } else {
        console.error('Login failed:', loginData.login.message);
      }
    } catch (err) {
      console.error('Login error:', err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-blue-500 text-3xl font-bold">Login</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="username">Email Address</label>
            <input 
              {...register('username', { required: 'username is required' })}
              className="w-full p-2 border rounded"
              type="text" 
              id="username" 
            />
            {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="password">Password</label>
            <input 
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password should be at least 6 characters long' } })}
              className="w-full p-2 border rounded"
              type="password" 
              id="password"
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex justify-between items-center">
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Login</button>
            <Link href="/" className="text-blue-500 hover:text-blue-600">Back to Home</Link>
          </div>
        </form>
        {/* Optionally display login errors */}
        {error && <p className="text-red-600 text-sm mt-1">{error.message}</p>}
      </div>
    </div>
  );
}
