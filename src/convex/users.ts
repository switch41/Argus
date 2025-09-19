import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { roleValidator } from "./schema";

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

// Add mutation to set role by email (for setup/admin ops)
export const setRoleForEmail = mutation({
  args: {
    email: v.string(),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      throw new Error("User not found for that email");
    }

    await ctx.db.patch(user._id, { role: args.role });
    return { success: true, userId: user._id, role: args.role };
  },
});