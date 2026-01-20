"use client";

import { getPosts } from "@/actions/posts.action";
import { getProfileByUsername, updateProfile } from "@/actions/profile.action";
import { toggleFollow } from "@/actions/users.action";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SignInButton, useUser } from "@clerk/nextjs";
import {
  EditIcon,
  FileTextIcon,
  HeartIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ProfileUser = NonNullable<
  Awaited<ReturnType<typeof getProfileByUsername>>
>;
type FeedPost = Awaited<ReturnType<typeof getPosts>>[number];

interface ProfileClientProps {
  user: ProfileUser;
  posts: FeedPost[];
  likedPosts: FeedPost[];
  isFollowing: boolean;
}

const ProfileClient = ({
  user,
  posts,
  likedPosts,
  isFollowing: initialIsFollowing,
}: ProfileClientProps) => {
  const { user: currentUser } = useUser();

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    website: user.website || "",
  });

  const currentUserHandle =
    currentUser?.username ??
    currentUser?.emailAddresses?.[0]?.emailAddress?.split("@")[0];

  const isOwnProfile =
    currentUserHandle?.toLowerCase() === user.username.toLowerCase();

  const handleFollow = async () => {
    if (!currentUser) return;
    try {
      setIsUpdatingFollow(true);
      await toggleFollow(user.id);
      setIsFollowing((p) => !p);
    } catch {
      toast.error("Failed to update follow");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const handleEditSubmit = async () => {
    const formData = new FormData();
    Object.entries(editForm).forEach(([k, v]) =>
      formData.append(k, v)
    );

    const res = await updateProfile(formData);
    if (res.success) {
      toast.success("Profile updated");
      setShowEditDialog(false);
    } else {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* PROFILE HEADER */}
      <div className="flex gap-10 items-start mt-10">
        <Avatar className="w-36 h-36 shrink-0">
          <AvatarImage src={user.image ?? "/avatar.png"} />
        </Avatar>

        <div className="flex-1 space-y-4">
          {/* USERNAME + BUTTON */}
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-xl font-semibold">
              {user.username}
            </h1>

            {!currentUser ? (
              <SignInButton mode="modal">
                <Button size="sm">Follow</Button>
              </SignInButton>
            ) : isOwnProfile ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEditDialog(true)}
              >
                <EditIcon className="size-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                disabled={isUpdatingFollow}
                onClick={handleFollow}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>

          {/* STATS */}
          <div className="flex gap-8 text-sm">
            <div>
              <span className="font-semibold">
                {user.postsCount}
              </span>{" "}
              posts
            </div>
            <div>
              <span className="font-semibold">
                {user.followersCount}
              </span>{" "}
              followers
            </div>
            <div>
              <span className="font-semibold">
                {user.followingCount}
              </span>{" "}
              following
            </div>
          </div>

          {/* BIO */}
          <div className="text-sm space-y-1 max-w-md">
            {user.name && (
              <div className="font-medium">{user.name}</div>
            )}
            {user.bio && <p>{user.bio}</p>}
            {user.website && (
              <a
                href={
                  user.website.startsWith("http")
                    ? user.website
                    : `https://${user.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {user.website}
              </a>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-10" />

      {/* TABS */}
      <Tabs defaultValue="posts">
        <TabsList className="w-full justify-center border-t rounded-none bg-transparent">
          <TabsTrigger
            value="posts"
            className="gap-2 px-6 rounded-none data-[state=active]:border-t-2"
          >
            <FileTextIcon className="size-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="likes"
            className="gap-2 px-6 rounded-none data-[state=active]:border-t-2"
          >
            <HeartIcon className="size-4" />
            Likes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-8 space-y-10">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                dbUserId={user.id}
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground">
              No posts yet
            </div>
          )}
        </TabsContent>

        <TabsContent value="likes" className="mt-8 space-y-10">
          {likedPosts.length > 0 ? (
            likedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                dbUserId={user.id}
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground">
              No liked posts
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* EDIT PROFILE DIALOG */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label>Bio</Label>
              <Textarea
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    bio: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label>Website</Label>
              <Input
                value={editForm.website}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    website: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditSubmit}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileClient;
