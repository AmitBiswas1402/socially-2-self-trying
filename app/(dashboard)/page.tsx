import { getPosts } from '@/actions/posts.action';
import { getDBUserId } from '@/actions/users.action';
import PostCard from '@/components/PostCard';

const HomePage = async() => {
  const posts = await getPosts();
  const dbUserId = await getDBUserId();
  return (
    <div>
      <div className='space-y-6'>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} dbUserId={dbUserId} />
        ))}
      </div>
    </div>
  )
}

export default HomePage;