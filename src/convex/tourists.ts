import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

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

    const expiryDate = Date.now() + (args.plannedDuration * 24 * 60 * 60 * 1000);

    // Attempt on-chain issuance first; fall back to local hash if Fabric not configured
    let digitalIdHash: string;
    try {
      const emergencyContacts = {
        emergencyContact1: args.emergencyContact1,
        emergencyContact2: args.emergencyContact2 || null,
      };
      const emergencyContactsJson = JSON.stringify(emergencyContacts);

      // Chaincode should return the digitalId hash/string
      const res = await ctx.runAction(api.fabric.issueDigitalId, {
        userId: user._id as unknown as string,
        passportNumber: args.passportNumber,
        nationality: args.nationality,
        emergencyContactsJson,
        itineraryJson: "{}",
        expiryDateMs: expiryDate,
      });
      const data = (res as any)?.data as string | undefined;
      digitalIdHash = data && data.length > 0 ? data : `DID_${user._id}_${Date.now()}`;
    } catch (e) {
      // If Fabric is unavailable or misconfigured, proceed with a local hash to not block UX
      digitalIdHash = `DID_${user._id}_${Date.now()}`;
    }

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

    // --- AI ANOMALY DETECTION & GEO-FENCING ---
    
    // 1. Geofence Check
    const activeFences = await ctx.db
      .query("geoFences")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    for (const fence of activeFences) {
      // Simplified point-in-polygon check (bounding box for demo)
      const lats = fence.coordinates.map(c => c.latitude);
      const lons = fence.coordinates.map(c => c.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);

      const inFence = args.latitude >= minLat && args.latitude <= maxLat && 
                      args.longitude >= minLon && args.longitude <= maxLon;

      if (inFence && (fence.zoneType === "restricted" || fence.zoneType === "high_risk")) {
        await ctx.runMutation(api.alerts.triggerPanicAlert, {
          latitude: args.latitude,
          longitude: args.longitude,
          description: `GEOFENCE VIOLATION: Tourist entered ${fence.zoneType} zone: ${fence.name}`,
        });
        return { success: true, alertReason: "geofence_violation" };
      }
    }

    // 2. Itinerary Deviation Check
    const activeItinerary = await ctx.db
      .query("itineraries")
      .withIndex("by_tourist", (q) => q.eq("touristId", profile._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (activeItinerary && activeItinerary.plannedRoute.length > 0) {
      // Check if tourist is moving away from planned route (Simplified)
      const nearbyStops = activeItinerary.plannedRoute.filter(stop => {
        const dist = Math.abs(stop.latitude - args.latitude) + Math.abs(stop.longitude - args.longitude);
        return dist < 0.05; // ~5km
      });

      if (nearbyStops.length === 0) {
        // Log deviation as a medium alert (not full panic)
        await ctx.db.insert("alerts", {
          touristId: profile._id,
          alertType: "deviation",
          severity: "medium",
          title: "Route Deviation Detected",
          description: "Tourist is outside the planned itinerary buffer zone.",
          location: { latitude: args.latitude, longitude: args.longitude },
          isResolved: false,
        });
      }
    }

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

    // Check on-chain status (best-effort)
    let onChainValid: boolean | null = null;
    let onChainRaw: string | null = null;
    try {
      const res = await ctx.runAction(api.fabric.verifyDigitalIdOnChain, {
        digitalIdHash: args.digitalIdHash,
      });
      const data = (res as any)?.data as string | undefined;
      onChainRaw = data ?? null;
      if (data) {
        // Accept "true"/"false" or JSON { valid: boolean }
        const normalized = data.trim().toLowerCase();
        if (normalized === "true" || normalized === "false") {
          onChainValid = normalized === "true";
        } else {
          try {
            const parsed = JSON.parse(data);
            if (typeof parsed?.valid === "boolean") onChainValid = parsed.valid;
          } catch {
            onChainValid = null;
          }
        }
      }
    } catch {
      onChainValid = null;
    }

    const localValid = profile.isActive && profile.expiryDate > Date.now();
    const reconciledValid = onChainValid === null ? localValid : (localValid && onChainValid);

    return {
      _id: profile._id,
      nationality: profile.nationality,
      isActive: profile.isActive,
      expiryDate: profile.expiryDate,
      isValid: reconciledValid,
      validityPeriod: {
        start: profile._creationTime,
        end: profile.expiryDate,
      },
      onChain: {
        checked: onChainValid !== null,
        valid: onChainValid,
        raw: onChainRaw,
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

// Add: Get risk flags for latest itinerary's stops
export const getItineraryAreaRisks = query({
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

    const latestItinerary = await ctx.db
      .query("itineraries")
      .withIndex("by_tourist", (q) => q.eq("touristId", profile._id))
      .order("desc")
      .first();
    if (!latestItinerary || !latestItinerary.plannedRoute?.length) return [];

    // Simple heuristic risk scoring per stop (demo)
    const toRiskLevel = (lat: number, lon: number) => {
      const val = Math.abs(Math.sin(lat) + Math.cos(lon)); // 0..2
      if (val < 0.5) return "safe" as const;
      if (val < 1.0) return "moderate" as const;
      if (val < 1.5) return "high_risk" as const;
      return "critical" as const;
    };

    return latestItinerary.plannedRoute.map((stop) => ({
      locationName: stop.locationName,
      latitude: stop.latitude,
      longitude: stop.longitude,
      plannedArrival: stop.plannedArrival,
      riskLevel: toRiskLevel(stop.latitude, stop.longitude),
    }));
  },
});