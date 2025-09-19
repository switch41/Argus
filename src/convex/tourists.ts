import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { Id } from "./_generated/dataModel";

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

// Create itinerary (minimal: single or multiple stops accepted)
export const createItinerary = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    plannedRoute: v.array(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
        locationName: v.string(),
        plannedArrival: v.number(),
        plannedDeparture: v.optional(v.number()),
      })
    ),
    startDate: v.number(),
    endDate: v.number(),
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
    const id = await ctx.db.insert("itineraries", {
      touristId: profile._id,
      title: args.title,
      description: args.description,
      plannedRoute: args.plannedRoute,
      startDate: args.startDate,
      endDate: args.endDate,
      isActive: true,
    });
    return id;
  },
});

// List my itineraries
export const listMyItineraries = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const profile = await ctx.db
      .query("touristProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    if (!profile) return [];
    return await ctx.db
      .query("itineraries")
      .withIndex("by_tourist", (q) => q.eq("touristId", profile._id))
      .order("desc")
      .collect();
  },
});

// Delete itinerary
export const deleteItinerary = mutation({
  args: { itineraryId: v.id("itineraries") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const itinerary = await ctx.db.get(args.itineraryId);
    if (!itinerary) throw new Error("Not found");
    // Ensure ownership
    const profile = await ctx.db
      .query("touristProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    if (!profile || itinerary.touristId !== profile._id) throw new Error("Unauthorized");
    await ctx.db.delete(args.itineraryId);
    return { success: true };
  },
});

// List active profiles for officials (limited public fields)
export const listActiveProfilesForOfficials = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin")) {
      return [];
    }

    const profiles = await ctx.db
      .query("touristProfiles")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Return limited public fields with masked passport
    return profiles.map(profile => ({
      _id: profile._id,
      nationality: profile.nationality,
      passportNumber: profile.passportNumber.slice(0, 3) + "****" + profile.passportNumber.slice(-2),
      isActive: profile.isActive,
      expiryDate: profile.expiryDate,
      _creationTime: profile._creationTime,
    }));
  },
});

// Get movement and alerts summary for a specific tourist
export const getMovementAndAlertsSummary = query({
  args: { profileId: v.id("touristProfiles") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const profile = await ctx.db.get(args.profileId);
    if (!profile) return null;

    // Check authorization: officials can view any, tourists only their own
    const isOfficial = user.role === "police" || user.role === "tourism_official" || user.role === "admin";
    if (!isOfficial && profile.userId !== user._id) {
      return null;
    }

    // Get last 10 locations
    const locations = await ctx.db
      .query("locationHistory")
      .withIndex("by_tourist", (q) => q.eq("touristId", args.profileId))
      .order("desc")
      .take(10);

    // Get alerts for this tourist
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("by_tourist", (q) => q.eq("touristId", args.profileId))
      .order("desc")
      .take(10);

    return {
      profile: {
        _id: profile._id,
        nationality: profile.nationality,
        isActive: profile.isActive,
        expiryDate: profile.expiryDate,
      },
      locations,
      alerts,
    };
  },
});

// Verify digital ID by hash
export const verifyDigitalId = query({
  args: { digitalIdHash: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("touristProfiles")
      .filter((q) => q.eq(q.field("digitalIdHash"), args.digitalIdHash))
      .first();

    if (!profile) return null;

    const isValid = profile.isActive && profile.expiryDate > Date.now();

    return {
      _id: profile._id,
      nationality: profile.nationality,
      isActive: profile.isActive,
      expiryDate: profile.expiryDate,
      isValid,
      validityPeriod: {
        start: profile._creationTime,
        end: profile.expiryDate,
      },
    };
  },
});

// List recent locations aggregated for heatmap
export const listRecentLocationsAggregated = query({
  args: { minutesBack: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin")) {
      return [];
    }

    const cutoff = Date.now() - (args.minutesBack || 60) * 60 * 1000;
    
    const recentLocations = await ctx.db
      .query("locationHistory")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), cutoff))
      .collect();

    // Aggregate by rounding to 3 decimals
    const clusters: Record<string, number> = {};
    recentLocations.forEach(loc => {
      const lat = Math.round(loc.latitude * 1000) / 1000;
      const lon = Math.round(loc.longitude * 1000) / 1000;
      const key = `${lat},${lon}`;
      clusters[key] = (clusters[key] || 0) + 1;
    });

    return Object.entries(clusters).map(([coords, count]) => {
      const [lat, lon] = coords.split(',').map(Number);
      return { lat, lon, count };
    });
  },
});