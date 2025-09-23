import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const seedDemo = action({
  args: {},
  handler: async (ctx) => {
    // Create sample alerts with varied severities
    // removed unused sampleAlerts definition

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