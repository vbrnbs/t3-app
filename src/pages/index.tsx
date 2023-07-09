import { type NextPage } from "next";
import { useUser, SignInButton } from "@clerk/clerk-react";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from 'react-hot-toast';

import { LoadingPage, LoadingSpinner } from "~/components/Loading";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { PageLayout } from "~/components/layout";

dayjs.extend(relativeTime);

const CreatePostWizzard = () => {
  const { user } = useUser();

  const [input, setInput] = useState<string>("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failded to post! Please try again later.");
      }
    },
  });

  if (!user) return null;

  return (
    <div className="flex gap-3 w-full p-4">
      <Image
        className="h-12 w-12 rounded-full"
        src={user.profileImageUrl}
        alt="Profile Image"
        width={56}
        height={56}
      />
      <input
        placeholder="Type some emojis!"
        className="bg-transparent grow outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") mutate({ content: input });
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <>
          <button onClick={() => mutate({ content: input })} >Post</button>
        </>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  )
}

type PostWithUser = RouterOutputs['posts']['getAll'][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="p-4 gap-3 border-b border-slate-200 flex ">
      <Image
        src={author.profileImageUrl}
        alt={`@${author.username}'s profile picture`}
        className="h-12 w-12 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{` • ${dayjs(post.createdAt).fromNow()} ago`}</span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );

}
 
const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  )

}

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // start fetching asap
  api.posts.getAll.useQuery();

  // Retrun empty div if BOTH arent loaded, since user tends to load faster
  if (!userLoaded) return <div />;

  return (
      <PageLayout>
        <div className='flex border-b border-slate-400 p4'>
            {!isSignedIn && (<div className="flex justify-center" ><SignInButton /></div>)}
            {isSignedIn && <CreatePostWizzard />}
        </div>
        <Feed />
      </PageLayout>
  );
}

export default Home;
