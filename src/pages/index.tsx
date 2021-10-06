/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';

import Prismic from '@prismicio/client';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);

  return (
    <>
      <Head>
        <title>Home | Spacetravelling</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <div className={styles.post} key={post.uid}>
              <Link href={`/post/${post.uid}`}>
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.postInfo}>
                    <div className={styles.postDate}>
                      <FiCalendar />
                      {post.first_publication_date}
                    </div>
                    <div className={styles.postAuthor}>
                      <FiUser />
                      {post.data.author}
                    </div>
                  </div>
                </a>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 20,
    }
  );

  const posts: Post[] = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: String(
        format(new Date(post.first_publication_date), 'dd MMM yyyy', {
          locale: ptBR,
        })
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
