import Head from "next/head";
import { type NextPage } from "next";


const SinglePostPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex h-screen justify-center">
        Post view
      </main>
    </>
  );
}

export default SinglePostPage;