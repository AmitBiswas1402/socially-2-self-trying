"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { ilike } from "drizzle-orm"; // postgres
import { auth } from "@clerk/nextjs/server";

export async function searchUsers(query: string) {
  if (!query.trim()) return [];

  // optional: require auth
  const { userId } = await auth();
  if (!userId) return [];

  const results = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      image: users.image,
    })
    .from(users)
    .where(
      ilike(users.username, `%${query}%`)
    )
    .limit(10);

  return results;
}
