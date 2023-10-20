'use client'
import Link from 'next/link'
import Head from 'next/head'
import { useQuery, gql } from '@apollo/client';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';


export default function HomePage() {

  const client = new ApolloClient({
    uri: 'http://localhost:4000/graphql',
    cache: new InMemoryCache()
  });

  const GET_ARTICLES = gql`
    query GetArticles {
      articles {
        id
        title      
      }
    }
  `;

  function ArticlesList() {
    const { loading, error, data } = useQuery(GET_ARTICLES);

    // While the query is loading
    if (loading) return <p>Loading...</p>;

    // If there's an error fetching the query
    if (error) return <p>Error: {error.message}</p>;

    // Render the list of articles
    return (
      <div>
        {data.articles.map(article => (
          <div key={article.id}>
            <h2>{article.title}</h2>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ApolloProvider client={client}>
      <div className="min-h-screen flex flex-col justify-center items-center bg-white-100">

        <Head>
          <title>Nityshyn</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>

        <div className="bg-white p-8 rounded-lg shadow-md">

          <h1 className="text-2xl mb-4 font-bold">Welcome to Nityshyn</h1>

          <ArticlesList />

          <div className="flex space-x-4">
            <Link href="/login">
              Login
            </Link>
            <Link href="/signup">
              Sign Up
            </Link>
            <Link href="/admin">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </ApolloProvider>
  )
}