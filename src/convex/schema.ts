import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// User roles for the system
export const ROLES = {
  ADMIN: "admin",
  TOURIST: "tourist",
  POLICE: "police",
  TOURISM_OFFICIAL: "tourism_official",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.TOURIST),
  v.literal(ROLES.POLICE),
  v.literal(ROLES.TOURISM_OFFICIAL),
);
export type Role = Infer<typeof roleValidator>;

// Safety score levels
export const SAFETY_LEVELS = {
  SAFE: "safe",
  MODERATE: "moderate", 
  HIGH_RISK: "high_risk",
  CRITICAL: "critical",
} as const;

export const safetyLevelValidator = v.union(
  v.literal(SAFETY_LEVELS.SAFE),
  v.literal(SAFETY_LEVELS.MODERATE),
  v.literal(SAFETY_LEVELS.HIGH_RISK),
  v.literal(SAFETY_LEVELS.CRITICAL),
);

// Alert types
export const ALERT_TYPES = {
  PANIC_BUTTON: "panic_button",
  GEO_FENCE_VIOLATION: "geo_fence_violation",
  INACTIVITY: "inactivity",
  DEVIATION: "deviation",
  HEALTH_EMERGENCY: "health_emergency",
} as const;

export const alertTypeValidator = v.union(
  v.literal(ALERT_TYPES.PANIC_BUTTON),
  v.literal(ALERT_TYPES.GEO_FENCE_VIOLATION),
  v.literal(ALERT_TYPES.INACTIVITY),
  v.literal(ALERT_TYPES.DEVIATION),
  v.literal(ALERT_TYPES.HEALTH_EMERGENCY),
);

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      
      // Additional user fields
      phone: v.optional(v.string()),
      nationality: v.optional(v.string()),
      passportNumber: v.optional(v.string()),
      badgeNumber: v.optional(v.string()), // For police/officials
      department: v.optional(v.string()), // For police/officials
    }).index("email", ["email"]),

    // Tourist Digital ID records
    touristProfiles: defineTable({
      userId: v.id("users"),
      digitalIdHash: v.string(), // Blockchain hash
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
      entryPoint: v.string(), // Airport, border, etc.
      plannedDuration: v.number(), // Days
      accommodationAddress: v.optional(v.string()),
      localGuideContact: v.optional(v.string()),
      medicalConditions: v.optional(v.string()),
      isActive: v.boolean(),
      expiryDate: v.number(),
    })
    .index("by_user", ["userId"])
    .index("by_digital_id", ["digitalIdHash"])
    .index("by_passport", ["passportNumber"]),

    // Safety scores and risk assessment
    safetyScores: defineTable({
      touristId: v.id("touristProfiles"),
      currentScore: v.number(), // 0-100
      riskLevel: safetyLevelValidator,
      factors: v.object({
        locationRisk: v.number(),
        behaviorPattern: v.number(),
        timeOfDay: v.number(),
        crowdDensity: v.number(),
        weatherConditions: v.number(),
      }),
      lastUpdated: v.number(),
    })
    .index("by_tourist", ["touristId"])
    .index("by_risk_level", ["riskLevel"]),

    // Location tracking
    locationHistory: defineTable({
      touristId: v.id("touristProfiles"),
      latitude: v.number(),
      longitude: v.number(),
      accuracy: v.number(),
      timestamp: v.number(),
      isManual: v.boolean(), // Manual check-in vs automatic
      locationName: v.optional(v.string()),
    })
    .index("by_tourist", ["touristId"])
    .index("by_timestamp", ["timestamp"]),

    // Planned routes and itineraries
    itineraries: defineTable({
      touristId: v.id("touristProfiles"),
      title: v.string(),
      description: v.optional(v.string()),
      plannedRoute: v.array(v.object({
        latitude: v.number(),
        longitude: v.number(),
        locationName: v.string(),
        plannedArrival: v.number(),
        plannedDeparture: v.optional(v.number()),
      })),
      startDate: v.number(),
      endDate: v.number(),
      isActive: v.boolean(),
    })
    .index("by_tourist", ["touristId"])
    .index("by_active", ["isActive"]),

    // Geo-fence zones (safe/restricted areas)
    geoFences: defineTable({
      name: v.string(),
      description: v.string(),
      coordinates: v.array(v.object({
        latitude: v.number(),
        longitude: v.number(),
      })),
      zoneType: v.union(
        v.literal("safe"),
        v.literal("restricted"),
        v.literal("high_risk"),
        v.literal("emergency_services")
      ),
      isActive: v.boolean(),
      createdBy: v.id("users"),
    })
    .index("by_type", ["zoneType"])
    .index("by_active", ["isActive"]),

    // Alerts and incidents
    alerts: defineTable({
      touristId: v.id("touristProfiles"),
      alertType: alertTypeValidator,
      severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
      title: v.string(),
      description: v.string(),
      location: v.object({
        latitude: v.number(),
        longitude: v.number(),
        address: v.optional(v.string()),
      }),
      isResolved: v.boolean(),
      resolvedBy: v.optional(v.id("users")),
      resolvedAt: v.optional(v.number()),
      assignedTo: v.optional(v.id("users")),
      responseTime: v.optional(v.number()), // Minutes
      notes: v.optional(v.string()),
    })
    .index("by_tourist", ["touristId"])
    .index("by_type", ["alertType"])
    .index("by_severity", ["severity"])
    .index("by_resolved", ["isResolved"]),

    // E-FIR (Electronic First Information Report)
    eFirs: defineTable({
      alertId: v.id("alerts"),
      firNumber: v.string(),
      touristId: v.id("touristProfiles"),
      incidentType: v.string(),
      incidentDescription: v.string(),
      location: v.object({
        latitude: v.number(),
        longitude: v.number(),
        address: v.string(),
      }),
      reportedBy: v.id("users"),
      assignedOfficer: v.optional(v.id("users")),
      status: v.union(
        v.literal("filed"),
        v.literal("under_investigation"),
        v.literal("resolved"),
        v.literal("closed")
      ),
      priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
      evidence: v.optional(v.array(v.string())), // File IDs
      witnessStatements: v.optional(v.array(v.string())),
    })
    .index("by_alert", ["alertId"])
    .index("by_tourist", ["touristId"])
    .index("by_status", ["status"])
    .index("by_fir_number", ["firNumber"]),

    // Real-time notifications
    notifications: defineTable({
      userId: v.id("users"),
      title: v.string(),
      message: v.string(),
      type: v.union(
        v.literal("alert"),
        v.literal("safety_update"),
        v.literal("system"),
        v.literal("emergency")
      ),
      isRead: v.boolean(),
      actionUrl: v.optional(v.string()),
      relatedAlertId: v.optional(v.id("alerts")),
    })
    .index("by_user", ["userId"])
    .index("by_read", ["isRead"]),

    // System statistics and analytics
    systemStats: defineTable({
      date: v.string(), // YYYY-MM-DD
      totalTourists: v.number(),
      activeTourists: v.number(),
      totalAlerts: v.number(),
      resolvedAlerts: v.number(),
      averageResponseTime: v.number(),
      safetyScoreAverage: v.number(),
      topRiskAreas: v.array(v.string()),
    })
    .index("by_date", ["date"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;