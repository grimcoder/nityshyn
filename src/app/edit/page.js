'use client'
import { useState } from 'react';
import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.snow.css'; // Import styles

import { useRouter, useSearchParams} from 'next/navigation'
import { useQuery, gql } from '@apollo/client';
import client from '../lib/apolloClient';


const GET_ARTICLE_DETAILS = gql`
  query GetArticle($id: ID!) {
    article(article_id: $id) {
      title
      content
      author_id
      created_at
      article_id
    }
  }
`;

export default function EditorPage() {

    const [content, setContent] = useState('');

    const searchParams = useSearchParams()
    const id = searchParams.get('id')

    const { loading, error, data } = useQuery(GET_ARTICLE_DETAILS, {
        client,
        variables: { id: Number(id) },
        skip: !id,
      });
    
      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
            <div className="bg-black p-8 rounded-lg shadow-md w-full max-w-2xl">

                <h1 className="text-2xl  text-blue-500  mb-4 font-bold">Rich Text Editor</h1>

                <ReactQuill 
                    className=' text-blue-500 '
                    value={content}
                    onChange={setContent}
                    theme="snow" 
                />

                <div className="mt-4">
                    <h2 className="text-xl mb-2">Content:</h2>
                    <pre className="bg-black-200 text-blue-500 p-4 rounded whitespace-pre-wrap">{content}</pre>
                </div>

            </div>
        </div>
    );
}