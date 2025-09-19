import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const exportIncidentsCsv = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const allAlerts: any[] = await ctx.runQuery(api.alerts.listAllIncidents, { limit: 100 });

    const csvHeader: string = "ID,Type,Severity,Title,Description,Created,Resolved,ResponseTime,Location\n";
    const csvRows: string = allAlerts
      .map((alert: any) => {
        const location =
          "location" in alert && alert.location
            ? `"${alert.location.latitude},${alert.location.longitude}"`
            : "";
        return [
          alert._id,
          alert.alertType,
          alert.severity,
          `"${alert.title}"`,
          `"${alert.description || ""}"`,
          new Date(alert._creationTime).toISOString(),
          alert.isResolved ? new Date(alert.resolvedAt || 0).toISOString() : "",
          alert.responseTime || "",
          location,
        ].join(",");
      })
      .join("\n");

    return csvHeader + csvRows;
  },
});