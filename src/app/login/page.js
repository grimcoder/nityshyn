'use client'
import { useForm } from 'react-hook-form';
import Link from 'next/link';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = data => {
    console.log(data);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl mb-4 font-bold">Login</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="email">Email Address</label>
            <input 
              {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, message: 'invalid email address' } })}
              className="w-full p-2 border rounded"
              type="email" 
              id="email" 
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
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
      </div>
    </div>
  );
}
