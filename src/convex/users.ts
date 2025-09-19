import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

// List officers (police, tourism_official, admin)
export const listOfficials = query({
  args: {},
  handler: async (ctx) => {
    // Anyone signed in can fetch this list to assign alerts via UI; backend auth enforced in assign
    const rows = await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "police")).collect();
    const rows2 = await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "tourism_official")).collect();
    const rows3 = await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "admin")).collect();
    return [...rows, ...rows2, ...rows3];
  },
});