'use client'

import { useMutation, gql } from '@apollo/client';
import { useForm } from 'react-hook-form';
import client from '../lib/apolloClient';

const REGISTER_USER = gql`
  mutation Register($email: String!, $password: String!) {
    register(input: { email: $email, password: $password }) {
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

  const onSubmit = async ({ email, password }) => {
    try {
      const response = await registerUser({ variables: { email, password } });
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
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Email:</label>
          <input type="email" {...register('email')} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" {...register('password')} required />
        </div>
        <button type="submit">Register</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && data.register.success && <p>{data.register.message}</p>}
    </div>
  );
}
