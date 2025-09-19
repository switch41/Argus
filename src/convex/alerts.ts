import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Trigger panic button alert
export const triggerPanicAlert = mutation({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    address: v.optional(v.string()),
    description: v.optional(v.string()),
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

    const alertId = await ctx.db.insert("alerts", {
      touristId: profile._id,
      alertType: "panic_button",
      severity: "critical",
      title: "PANIC BUTTON ACTIVATED",
      description: args.description || "Tourist has activated emergency panic button",
      location: {
        latitude: args.latitude,
        longitude: args.longitude,
        address: args.address,
      },
      isResolved: false,
    });

    // Auto-generate E-FIR for panic button
    const firNumber = `FIR_${Date.now()}_${profile._id.slice(-6)}`;
    await ctx.db.insert("eFirs", {
      alertId,
      firNumber,
      touristId: profile._id,
      incidentType: "Emergency - Panic Button",
      incidentDescription: args.description || "Tourist emergency assistance required",
      location: {
        latitude: args.latitude,
        longitude: args.longitude,
        address: args.address || "Location coordinates provided",
      },
      reportedBy: user._id,
      status: "filed",
      priority: "urgent",
    });

    return { alertId, firNumber };
  },
});

// Get alerts for current user
export const getMyAlerts = query({
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
      .query("alerts")
      .withIndex("by_tourist", (q) => q.eq("touristId", profile._id))
      .order("desc")
      .collect();
  },
});

// Get all active alerts (for dashboard)
export const getAllActiveAlerts = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    // Return safe empty array for unauthorized users instead of throwing
    if (!user || (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin")) {
      return [];
    }

    return await ctx.db
      .query("alerts")
      .withIndex("by_resolved", (q) => q.eq("isResolved", false))
      .order("desc")
      .collect();
  },
});

// Resolve alert
export const resolveAlert = mutation({
  args: {
    alertId: v.id("alerts"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin")) {
      throw new Error("Unauthorized");
    }

    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");

    const responseTime = Math.floor((Date.now() - alert._creationTime) / (1000 * 60)); // Minutes

    await ctx.db.patch(args.alertId, {
      isResolved: true,
      resolvedBy: user._id,
      resolvedAt: Date.now(),
      responseTime,
      notes: args.notes,
    });

    return { success: true, responseTime };
  },
});

// Get alert statistics
export const getAlertStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    // Return safe zeroed stats for unauthorized users instead of throwing
    if (!user || (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin")) {
      return {
        total: 0,
        active: 0,
        resolved: 0,
        averageResponseTime: 0,
        criticalActive: 0,
      };
    }

    const allAlerts = await ctx.db.query("alerts").collect();
    const activeAlerts = allAlerts.filter(alert => !alert.isResolved);
    const resolvedAlerts = allAlerts.filter(alert => alert.isResolved);
    
    const avgResponseTime = resolvedAlerts.length > 0 
      ? resolvedAlerts.reduce((sum, alert) => sum + (alert.responseTime || 0), 0) / resolvedAlerts.length
      : 0;

    return {
      total: allAlerts.length,
      active: activeAlerts.length,
      resolved: resolvedAlerts.length,
      averageResponseTime: Math.round(avgResponseTime),
      criticalActive: activeAlerts.filter(alert => alert.severity === "critical").length,
    };
  },
});

export const assignAlert = mutation({
  args: {
    alertId: v.id("alerts"),
    officerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin")) {
      throw new Error("Unauthorized");
    }
    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");

    // Verify target assignee is an officer
    const officer = await ctx.db.get(args.officerId);
    if (!officer || (officer.role !== "police" && officer.role !== "tourism_official" && officer.role !== "admin")) {
      throw new Error("Assignee must be an officer");
    }

    await ctx.db.patch(args.alertId, { assignedTo: args.officerId });
    return { success: true };
  },
});