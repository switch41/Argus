import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Create tourist profile
export const createProfile = mutation({
  args: {
    passportNumber: v.string(),
    nationality: v.string(),
    emergencyContact1: v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.string(),
    }),
    emergencyContact2: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.string(),
    })),
    entryPoint: v.string(),
    plannedDuration: v.number(),
    accommodationAddress: v.optional(v.string()),
    localGuideContact: v.optional(v.string()),
    medicalConditions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Generate blockchain hash (simplified for demo)
    const digitalIdHash = `DID_${user._id}_${Date.now()}`;
    const expiryDate = Date.now() + (args.plannedDuration * 24 * 60 * 60 * 1000);

    const profileId = await ctx.db.insert("touristProfiles", {
      userId: user._id,
      digitalIdHash,
      passportNumber: args.passportNumber,
      nationality: args.nationality,
      emergencyContact1: args.emergencyContact1,
      emergencyContact2: args.emergencyContact2,
      entryPoint: args.entryPoint,
      plannedDuration: args.plannedDuration,
      accommodationAddress: args.accommodationAddress,
      localGuideContact: args.localGuideContact,
      medicalConditions: args.medicalConditions,
      isActive: true,
      expiryDate,
    });

    // Initialize safety score
    await ctx.db.insert("safetyScores", {
      touristId: profileId,
      currentScore: 85, // Default safe score
      riskLevel: "safe",
      factors: {
        locationRisk: 20,
        behaviorPattern: 15,
        timeOfDay: 10,
        crowdDensity: 15,
        weatherConditions: 10,
      },
      lastUpdated: Date.now(),
    });

    return profileId;
  },
});

// Get current user's tourist profile
export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    return await ctx.db
      .query("touristProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
  },
});

// Get tourist profile by ID
export const getProfile = query({
  args: { profileId: v.id("touristProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.profileId);
  },
});

// Update location
export const updateLocation = mutation({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    accuracy: v.number(),
    isManual: v.boolean(),
    locationName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("touristProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!profile) throw new Error("Tourist profile not found");

    await ctx.db.insert("locationHistory", {
      touristId: profile._id,
      latitude: args.latitude,
      longitude: args.longitude,
      accuracy: args.accuracy,
      timestamp: Date.now(),
      isManual: args.isManual,
      locationName: args.locationName,
    });

    return { success: true };
  },
});

// Get current safety score
export const getSafetyScore = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const profile = await ctx.db
      .query("touristProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!profile) return null;

    return await ctx.db
      .query("safetyScores")
      .withIndex("by_tourist", (q) => q.eq("touristId", profile._id))
      .first();
  },
});

// Get recent location history
export const getLocationHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const profile = await ctx.db
      .query("touristProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!profile) return [];

    return await ctx.db
      .query("locationHistory")
      .withIndex("by_tourist", (q) => q.eq("touristId", profile._id))
      .order("desc")
      .take(args.limit || 50);
  },
});

// Get all active tourists (for dashboard)
export const getAllActiveTourists = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    // Return safe empty array for unauthorized users instead of throwing
    if (!user || (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin")) {
      return [];
    }

    return await ctx.db
      .query("touristProfiles")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});