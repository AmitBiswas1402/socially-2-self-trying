"use server"

import { db } from "@/db";
import { follows, users } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server"
import { eq, sql } from "drizzle-orm";

export async function syncUser() {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) {
        return;
    }

    const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, userId))
        .limit(1);

    if (existingUser.length) {
        return existingUser[0];
    }

    const [created] = await db
        .insert(users)
        .values({
            clerkId: userId,
            email: user.emailAddresses[0].emailAddress,
            username:
                user.username ??
                user.emailAddresses[0].emailAddress.split("@")[0],
            name: `${user.firstName ?? ""} ${user.lastName ?? ""}`,
            image: user.imageUrl,
        }).returning();

    return created;
}

export async function getUserByClerkId(clerkId: string) {
    const [user] = await db
        .select({
            id: users.id,
            name: users.name,
            username: users.username,
            image: users.image,
            clerkId: users.clerkId,

            bio: users.bio,
            website: users.website,
            location: users.location,

            followersCount: sql<number>`count(distinct ${follows.followerId})`,
            followingCount: sql<number>`count(distinct ${follows.followingId})`,
            postsCount: sql<number>`count(distinct posts.id)`,
        })
        .from(users)
        .leftJoin(
            follows,
            eq(follows.followingId, users.id)
        )
        .leftJoin(
            sql`posts`,
            sql`posts.author_id = users.id`
        )
        .where(eq(users.clerkId, clerkId))
        .groupBy(users.id);

    return user ?? null;
}

export async function getDBUserId() {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
        return null;
    }

    const user = await getUserByClerkId(clerkId);
    if (!user) {
        throw new Error("User not found");
    }

    return user.id;
}