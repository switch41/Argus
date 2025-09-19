import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const seedDemo = action({
  args: {},
  handler: async (ctx) => {
    // Create sample alerts with varied severities
    const sampleAlerts = [
      {
        alertType: "panic_button" as const,
        severity: "critical" as const,
        title: "Tourist Emergency - Panic Button",
        description: "Tourist activated panic button near Red Fort area",
        location: { latitude: 28.6562, longitude: 77.2410 },
      },
      {
        alertType: "geo_fence_violation" as const,
        severity: "high" as const,
        title: "Restricted Area Entry",
        description: "Tourist entered restricted military zone",
        location: { latitude: 28.6139, longitude: 77.2090 },
      },
      {
        alertType: "inactivity" as const,
        severity: "medium" as const,
        title: "Prolonged Inactivity",
        description: "No movement detected for 4 hours",
        location: { latitude: 28.5355, longitude: 77.3910 },
      },
    ];

    // Create sample advisories
    await ctx.runMutation(api.advisories.create, {
      title: "Weather Alert",
      message: "Heavy rainfall expected in Delhi NCR. Carry umbrellas and avoid low-lying areas.",
      audience: "tourists",
    });

    await ctx.runMutation(api.advisories.create, {
      title: "Security Update",
      message: "Increased security measures at major tourist attractions. Carry valid ID.",
      audience: "all",
    });

    // Create sample device signal
    const currentUser = await ctx.runQuery(api.users.currentUser);
    if (currentUser) {
      const profile = await ctx.runQuery(api.tourists.getCurrentProfile);
      if (profile) {
        await ctx.runMutation(api.devices.ingestSignal, {
          touristId: profile._id,
          type: "vitals",
          payload: { heartRate: 85, temperature: 98.6 },
        });

        // Create sample locations for heatmap
        const locations = [
          { lat: 28.6562, lon: 77.2410 }, // Red Fort
          { lat: 28.6139, lon: 77.2090 }, // India Gate
          { lat: 28.5355, lon: 77.3910 }, // Akshardham
        ];

        for (const loc of locations) {
          await ctx.runMutation(api.tourists.updateLocation, {
            latitude: loc.lat,
            longitude: loc.lon,
            accuracy: 10,
            isManual: false,
          });
        }
      }
    }

    return { success: true, message: "Demo data seeded successfully" };
  },
});