'use client'
import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import styles
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, gql } from '@apollo/client';
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

const ARTICLE_ADD_MUTATION = gql`

  mutation addArticle($title: String!, $content: String!, $author: Int!) {
    addArticle(input: { title: $title, content: $content, author_id: $author }) {
        title
        content
        author_id
      }
  }
`;

const ARTICLE_EDIT_MUTATION = gql`

  mutation editArticle($id: Int!, $title: String!, $content: String!, $author: Int!) {
    editArticle(input: {article_id: $id, title: $title, content: $content, author_id: $author }) {
        article_id
        title
        content
        author_id
      }
  }
`;

export default function EditorPage() {

    const [editArticle, { data: editData, loading: editLoading, error: editError }] = useMutation(ARTICLE_EDIT_MUTATION, {
        client: client,
    });

    const [addArticle, { data: addData, loading: addLoading, error: addError }] = useMutation(ARTICLE_ADD_MUTATION, {
        client: client,
    });

    async function save() {

        if (!id) {

            const result = await addArticle({ variables: { title, content, author: 1 } }); //todo: this is hardcoded

        } else {

            try{
                const {data} = await editArticle({ variables: { id, title, content, author: 1 } });//todo: this is hardcoded
                if (data.editArticle.success) {
                    console.log("updated")
                } else {
                    console.log(data.editArticle.error)
                }
            }
            catch (error){
                const a = 10;
            }

        }

        try {



        } catch (err) {
            console.error('Login error:', err.message);
        }
    }

    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');

    const [article_id, setArticle_Id] = useState(0);

    const searchParams = useSearchParams()
    const id_str = searchParams.get('id')
    let id = 0;
    if (id_str) id = Number(id_str)

    const { loading, error, data } = useQuery(GET_ARTICLE_DETAILS, {
        client,
        variables: { id: Number(id) },
        skip: !id,
    });

    useEffect(() => {
        if (data && data.article && data.article.content) {
            setContent(data.article.content);
            setArticle_Id(data.article.article_id);
            setTitle(data.article.title);
        }

    }, [data]);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;


    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
            <div className="p-8 rounded-lg shadow-md w-full max-w-2xl ">
                <h1 className="text-2xl    mb-4 font-bold">Edit your article</h1>
                <h2>Title</h2>
                <input type='text' value={title} onChange={setTitle}></input>
                <ReactQuill
                    value={content}
                    onChange={setContent}
                    theme="snow"
                />
                <div className="mt-4">
                    <pre className="bg-black-200  p-4 rounded whitespace-pre-wrap">{content}</pre>
                </div>
                <button type="submit" onClick={save} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
            </div>
        </div>
    );
}