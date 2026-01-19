import { getPosts } from '@/actions/posts.action';
import { getDBUserId } from '@/actions/users.action';
import PostCard from '@/components/PostCard';

const HomePage = async () => {
  const posts = await getPosts();
  const dbUserId = await getDBUserId();
  return (
    <div className="w-full flex justify-start">
      <div className="w-[72%] max-w-[700px] ml-24 space-y-12">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            dbUserId={dbUserId}
          />
        ))}
      </div>
    </div>
  )
}

export default HomePage;