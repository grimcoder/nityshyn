'use client'
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
    }
  }
`;

export default function ArticleDetail(params) {
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
    <div>
      <h1 className="text-3xl font-bold mb-4">{data.article.title}</h1>
      <p className="mb-4">{data.article.content}</p>
      <p className="text-sm">Published on {data.article.created_at}</p>
    </div>
  );
}
