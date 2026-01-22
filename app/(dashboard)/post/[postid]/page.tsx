import { getPostById } from "@/actions/posts.action";
import PostDetailClient from "./PostDetailClient";
import { getDBUserId } from "@/actions/users.action";

interface PageProps {
  params: Promise<{
    postid: string;
  }>;
}

const PostPage = async ({ params }: PageProps) => {
  const { postid } = await params;
  const post = await getPostById(postid);
  const dbUserId = await getDBUserId();

  if (!post) {
    return (
      <div className="text-center text-muted-foreground mt-20">
        Post not found
      </div>
    );
  }

  return <PostDetailClient post={post} dbUserId={dbUserId} />;
};

export default PostPage;
