import Head from "next/head";
import type { GetStaticProps, NextPage } from "next";
import { api } from "~/utils/api";

// type PageProps = InferGetStaticPropsType<typeof getStaticProps>;
const ProfilePage: NextPage<{ username: string }> = ({ username }) => {

  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className='h-36 bg-slate-600 relative'>
          <Image
            src={data.profileImageUrl}
            alt={`@${data.username}'s profile picture`}
            className="-mb-[64px] absolute bottom-0 left-0 ml-4 rounded-full border-4 border-black bg-black"
            width={128}
            height={128}
          />
        </div>
        <div className='h-[64px]'></div>
        <div className="p-4 text-2xl font-bold" >{`@${data.username ?? "" }`}</div>
        <div className="w-full border-b border-slate-400"></div>
      </PageLayout>
    </>
  );
}
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from 'superjson';
import { PageLayout } from "~/components/layout";
import Image from "next/image";


export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug;

  if (typeof slug !== 'string') throw new Error('slug is not a string');

  const username = slug.replace('@', '');

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {

  return { paths: [], fallback: "blocking" }

}

export default ProfilePage;