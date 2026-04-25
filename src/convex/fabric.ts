"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Use 'any' here to avoid importing fabric-network types at module load
type FabricConnection = {
  gateway: any;
  contract: any;
};

// Replace loadConnectionProfile to use dynamic imports
async function loadConnectionProfile(profilePath: string): Promise<any> {
  const fs = await import("node:fs");
  const path = await import("node:path");
  let yaml: any = null;
  try {
    yaml = await import("js-yaml");
  } catch {
    // yaml optional if not using .yaml
  }

  if (!fs.existsSync(profilePath)) {
    throw new Error(`CONNECTION_PROFILE_PATH not found at: ${profilePath}`);
  }
  const raw = fs.readFileSync(profilePath, "utf8");
  const ext = path.extname(profilePath).toLowerCase();
  if ((ext === ".yaml" || ext === ".yml") && yaml) {
    return yaml.load(raw);
  }
  return JSON.parse(raw);
}

// Role-based configuration for the 3-layer architecture
type FabricLayerConfig = {
  identity: string;
  channel: string;
  contract: string;
};

const LAYER_CONFIGS: Record<string, FabricLayerConfig> = {
  user: {
    identity: process.env.FABRIC_USER_IDENTITY || "touristUser",
    channel: process.env.FABRIC_USER_CHANNEL || "user-layer",
    contract: "IdentityContract",
  },
  official: {
    identity: process.env.FABRIC_OFFICIAL_IDENTITY || "officialUser",
    channel: process.env.FABRIC_OFFICIAL_CHANNEL || "official-layer",
    contract: "IncidentContract",
  },
  admin: {
    identity: process.env.FABRIC_ADMIN_IDENTITY || "adminUser",
    channel: process.env.FABRIC_ADMIN_CHANNEL || "admin-layer",
    contract: "GovernanceContract",
  },
};

async function connectToFabric(role: "user" | "official" | "admin" = "user"): Promise<FabricConnection> {
  const connectionProfilePath = process.env.CONNECTION_PROFILE_PATH;
  const walletPath = process.env.WALLET_PATH;

  if (!connectionProfilePath) throw new Error("Missing env: CONNECTION_PROFILE_PATH");
  if (!walletPath) throw new Error("Missing env: WALLET_PATH");

  const config = LAYER_CONFIGS[role];
  const discoveryEnabled = (process.env.FABRIC_SDK_DISCOVERY || "true").toLowerCase() === "true";
  const asLocalhost = (process.env.DISCOVERY_AS_LOCALHOST || "true").toLowerCase() === "true";

  const ccp = await loadConnectionProfile(connectionProfilePath);
  const fabric = await import("fabric-network");
  const { Gateway, Wallets } = fabric as any;

  const wallet = await Wallets.newFileSystemWallet(walletPath);
  const identity = await wallet.get(config.identity);
  
  if (!identity) {
    throw new Error(`Identity "${config.identity}" not found for role ${role}.`);
  }

  const gateway = new Gateway();
  await gateway.connect(ccp as any, {
    wallet,
    identity: config.identity,
    discovery: { enabled: discoveryEnabled, asLocalhost },
  });

  const network = await gateway.getNetwork(config.channel);
  const contract = network.getContract(config.contract);

  return { gateway, contract };
}

// Keep same close helper
async function close(conn?: FabricConnection) {
  try {
    if (conn?.gateway) {
      conn.gateway.disconnect();
    }
  } catch {
    // ignore
  }
}

// --- User Layer Actions (Layer 1) ---

export const createUserProfile = action({
  args: {
    userId: v.string(),
    userType: v.union(v.literal("tourist"), v.literal("operator"), v.literal("responder")),
  },
  handler: async (ctx, args) => {
    let conn: FabricConnection | undefined;
    try {
      conn = await connectToFabric("user");
      const tx = (conn.contract as any).createTransaction("CreateUserProfile");
      const res = await tx.submit(args.userId, args.userType);
      const txId = tx.getTransactionId().getTransactionID();
      await ctx.runMutation(internal.audit.log, {
        action: "fabric_tx",
        targetType: "CreateUserProfile",
        targetId: args.userId,
        details: { txId, userType: args.userType },
      });
      return { ok: true, data: res?.toString() ?? "", txId };
    } catch (e: any) {
      throw new Error(`Fabric.CreateUserProfile failed: ${e?.message || String(e)}`);
    } finally {
      await close(conn);
    }
  },
});

export const linkWallet = action({
  args: {
    userId: v.string(),
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    let conn: FabricConnection | undefined;
    try {
      conn = await connectToFabric("user");
      const tx = (conn.contract as any).createTransaction("LinkWallet");
      const res = await tx.submit(args.userId, args.walletAddress);
      const txId = tx.getTransactionId().getTransactionID();
      await ctx.runMutation(internal.audit.log, {
        action: "fabric_tx",
        targetType: "LinkWallet",
        targetId: args.userId,
        details: { txId, walletAddress: args.walletAddress },
      });
      return { ok: true, data: res?.toString() ?? "", txId };
    } catch (e: any) {
      throw new Error(`Fabric.LinkWallet failed: ${e?.message || String(e)}`);
    } finally {
      await close(conn);
    }
  },
});

export const getUserWallet = action({
  args: { userId: v.string() },
  handler: async (_ctx, args) => {
    let conn: FabricConnection | undefined;
    try {
      conn = await connectToFabric("user");
      const res = await conn.contract.evaluateTransaction("GetUserWallet", args.userId);
      return { ok: true, data: res?.toString() ?? "" };
    } catch (e: any) {
      throw new Error(`Fabric.GetUserWallet failed: ${e?.message || String(e)}`);
    } finally {
      await close(conn);
    }
  },
});

export const getWalletOwner = action({
  args: { walletAddress: v.string() },
  handler: async (_ctx, args) => {
    let conn: FabricConnection | undefined;
    try {
      conn = await connectToFabric("user");
      const res = await conn.contract.evaluateTransaction("GetWalletOwner", args.walletAddress);
      return { ok: true, data: res?.toString() ?? "" };
    } catch (e: any) {
      throw new Error(`Fabric.GetWalletOwner failed: ${e?.message || String(e)}`);
    } finally {
      await close(conn);
    }
  },
});

export const verifyWalletOwnership = action({
  args: {
    userId: v.string(),
    walletAddress: v.string(),
  },
  handler: async (_ctx, args) => {
    let conn: FabricConnection | undefined;
    try {
      conn = await connectToFabric("user");
      const res = await conn.contract.evaluateTransaction("VerifyWalletOwnership", args.userId, args.walletAddress);
      return { ok: true, data: res?.toString() ?? "" };
    } catch (e: any) {
      throw new Error(`Fabric.VerifyWalletOwnership failed: ${e?.message || String(e)}`);
    } finally {
      await close(conn);
    }
  },
});

export const issueDigitalId = action({
  args: {
    userId: v.string(),
    fullName: v.string(),
    passportNumber: v.string(),
    nationality: v.string(),
    dateOfBirth: v.string(),
    bloodGroup: v.string(),
    medicalConditionsJson: v.string(),
    emergencyContactsJson: v.string(),
    itineraryJson: v.optional(v.string()),
    expiryDateMs: v.number(),
  },
  handler: async (ctx, args) => {
    let conn: FabricConnection | undefined;
    try {
      conn = await connectToFabric("user");
      const tx = (conn.contract as any).createTransaction("IssueDigitalId");
      const res = await tx.submit(
        args.userId,
        args.fullName,
        args.passportNumber,
        args.nationality,
        args.dateOfBirth,
        args.bloodGroup,
        args.medicalConditionsJson,
        args.emergencyContactsJson,
        args.itineraryJson || "{}",
        String(args.expiryDateMs)
      );
      const txId = tx.getTransactionId().getTransactionID();
      await ctx.runMutation(internal.audit.log, {
        action: "fabric_tx",
        targetType: "IssueDigitalId",
        targetId: args.userId,
        details: { txId, passportNumber: args.passportNumber },
      });
      return { ok: true, data: res?.toString() ?? "", txId };
    } catch (e: any) {
      throw new Error(`Fabric.IssueDigitalId failed: ${e?.message || String(e)}`);
    } finally {
      await close(conn);
    }
  },
});

export const verifyDigitalIdOnChain = action({
  args: { digitalIdHash: v.string() },
  handler: async (_ctx, args) => {
    let conn: FabricConnection | undefined;
    try {
      conn = await connectToFabric("user");
      const res = await conn.contract.evaluateTransaction("VerifyDigitalId", args.digitalIdHash);
      return { ok: true, data: res?.toString() ?? "" };
    } catch (e: any) {
      throw new Error(`Fabric.VerifyDigitalId failed: ${e?.message || String(e)}`);
    } finally {
      await close(conn);
    }
  },
});

// --- Official Layer Actions (Layer 2) ---

export const fileEFirOnChain = action({
  args: {
    firId: v.string(),
    touristId: v.string(),
    incidentData: v.string(), // Encrypted or sensitive JSON
  },
  handler: async (ctx, args) => {
    let conn: FabricConnection | undefined;
    try {
      conn = await connectToFabric("official");
      const tx = (conn.contract as any).createTransaction("FileEFIR");
      // This is stored in the Official PDC (Private Data Collection)
      const res = await tx.submit(args.firId, args.touristId, args.incidentData);
      const txId = tx.getTransactionId().getTransactionID();
      
      await ctx.runMutation(internal.audit.log, {
        action: "fabric_official_tx",
        targetType: "FileEFIR",
        targetId: args.firId,
        details: { txId, touristId: args.touristId },
      });
      return { ok: true, data: res?.toString() ?? "", txId };
    } catch (e: any) {
      throw new Error(`Fabric.FileEFIR failed: ${e?.message}`);
    } finally {
      await close(conn);
    }
  },
});

export const getIncidentDetails = action({
  args: { firId: v.string() },
  handler: async (_ctx, args) => {
    let conn: FabricConnection | undefined;
    try {
      conn = await connectToFabric("official");
      const res = await conn.contract.evaluateTransaction("GetIncidentDetails", args.firId);
      return { ok: true, data: res?.toString() ?? "" };
    } catch (e: any) {
      throw new Error(`Fabric.GetIncidentDetails failed: ${e?.message}`);
    } finally {
      await close(conn);
    }
  },
});

// --- Admin Layer Actions (Layer 3) ---

export const updateSystemGovernance = action({
  args: {
    settingKey: v.string(),
    settingValue: v.string(),
  },
  handler: async (ctx, args) => {
    let conn: FabricConnection | undefined;
    try {
      conn = await connectToFabric("admin");
      const tx = (conn.contract as any).createTransaction("UpdateGovernanceSetting");
      const res = await tx.submit(args.settingKey, args.settingValue);
      const txId = tx.getTransactionId().getTransactionID();
      
      await ctx.runMutation(internal.audit.log, {
        action: "fabric_admin_tx",
        targetType: "UpdateGovernance",
        targetId: args.settingKey,
        details: { txId },
      });
      return { ok: true, data: res?.toString() ?? "", txId };
    } catch (e: any) {
      throw new Error(`Fabric.UpdateGovernance failed: ${e?.message}`);
    } finally {
      await close(conn);
    }
  },
});

export const getGlobalAuditLogs = action({
  args: { filter: v.optional(v.string()) },
  handler: async (_ctx, args) => {
    let conn: FabricConnection | undefined;
    try {
      conn = await connectToFabric("admin");
      const res = await conn.contract.evaluateTransaction("GetAuditLogs", args.filter || "");
      return { ok: true, data: res?.toString() ?? "" };
    } catch (e: any) {
      throw new Error(`Fabric.GetAuditLogs failed: ${e?.message}`);
    } finally {
      await close(conn);
    }
  },
});