import { action, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get analytics overview
export const getOverview = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin")) {
      return {
        totalTourists: 0,
        activeTourists: 0,
        totalAlerts: 0,
        resolvedAlerts: 0,
        averageResponseTime: 0,
        topRiskAreas: [],
      };
    }

    const allProfiles = await ctx.db.query("touristProfiles").collect();
    const activeProfiles = allProfiles.filter(p => p.isActive);
    
    const allAlerts = await ctx.db.query("alerts").collect();
    const resolvedAlerts = allAlerts.filter(a => a.isResolved);
    
    const avgResponseTime = resolvedAlerts.length > 0 
      ? resolvedAlerts.reduce((sum, alert) => sum + (alert.responseTime || 0), 0) / resolvedAlerts.length
      : 0;

    // Simple risk area aggregation by rounding coordinates
    const riskAreas: Record<string, number> = {};
    allAlerts.forEach(alert => {
      if ("location" in alert && alert.location?.latitude && alert.location?.longitude) {
        const lat = Math.round(alert.location.latitude * 1000) / 1000;
        const lon = Math.round(alert.location.longitude * 1000) / 1000;
        const key = `${lat},${lon}`;
        riskAreas[key] = (riskAreas[key] || 0) + 1;
      }
    });

    const topRiskAreas = Object.entries(riskAreas)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([coords, count]) => ({ coords, count }));

    return {
      totalTourists: allProfiles.length,
      activeTourists: activeProfiles.length,
      totalAlerts: allAlerts.length,
      resolvedAlerts: resolvedAlerts.length,
      averageResponseTime: Math.round(avgResponseTime),
      topRiskAreas,
    };
  },
});

export const exportIncidentsCsv = action({
  args: {},
  handler: async () => {
    // Deprecated here. The real implementation moved to src/convex/exports.ts
    const csvHeader = "ID,Type,Severity,Title,Description,Created,Resolved,ResponseTime,Location\n";
    return csvHeader;
  },
});
