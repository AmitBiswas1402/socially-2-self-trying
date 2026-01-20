import { getPosts } from "@/actions/posts.action";
import { getProfileByUsername, isFollowing } from "@/actions/profile.action";
import { notFound } from "next/navigation";
import ProfileClient from "./ProfileClient";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id: username } = await params;
  const user = await getProfileByUsername(username);
  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
};

const ProfilePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id: username } = await params;
  const user = await getProfileByUsername(username);

  if (!user) return notFound();

  const [allPosts, isCurrentUserFollowing] = await Promise.all([
    getPosts(),
    isFollowing(user.id),
  ]);

  const posts = allPosts.filter((post) => post.author.id === user.id);
  const likedPosts = allPosts.filter((post) =>
    post.likes.some((like) => like.userId === user.id),
  );

  return (
    <div>
      <ProfileClient
        user={user}
        posts={posts}
        likedPosts={likedPosts}
        isFollowing={isCurrentUserFollowing}
      />
    </div>
  );
};

export default ProfilePage;
