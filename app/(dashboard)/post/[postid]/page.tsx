import { getPostById } from "@/actions/posts.action";
import PostDetailClient from "./PostDetailClient";

interface PageProps {
  params: Promise<{
    postid: string;
  }>;
}

const PostPage = async ({ params }: PageProps) => {
  const { postid } = await params;
  const post = await getPostById(postid);

  if (!post) {
    return (
      <div className="text-center text-muted-foreground mt-20">
        Post not found
      </div>
    );
  }

  return <PostDetailClient post={post} />;
};

export default PostPage;
