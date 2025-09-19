"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Gateway, Wallets, Contract } from "fabric-network";
import * as fs from "node:fs";
import * as path from "node:path";
import * as yaml from "js-yaml";

type FabricConnection = {
  gateway: Gateway;
  contract: Contract;
};

async function loadConnectionProfile(profilePath: string): Promise<any> {
  if (!fs.existsSync(profilePath)) {
    throw new Error(`CONNECTION_PROFILE_PATH not found at: ${profilePath}`);
  }
  const raw = fs.readFileSync(profilePath, "utf8");
  const ext = path.extname(profilePath).toLowerCase();
  if (ext === ".yaml" || ext === ".yml") {
    return yaml.load(raw);
  }
  return JSON.parse(raw);
}

async function connectToFabric(): Promise<FabricConnection> {
  const connectionProfilePath = process.env.CONNECTION_PROFILE_PATH;
  const walletPath = process.env.WALLET_PATH;

  if (!connectionProfilePath) {
    throw new Error("Missing env: CONNECTION_PROFILE_PATH");
  }
  if (!walletPath) {
    throw new Error("Missing env: WALLET_PATH");
  }

  const identityLabel = process.env.FABRIC_IDENTITY_LABEL || "appUser";
  const channelName = process.env.FABRIC_CHANNEL || "mychannel";
  const chaincodeName = process.env.FABRIC_CHAINCODE || "SafeTourContract";

  const discoveryEnabled = (process.env.FABRIC_SDK_DISCOVERY || "true").toLowerCase() === "true";
  const asLocalhost = (process.env.DISCOVERY_AS_LOCALHOST || "true").toLowerCase() === "true";

  const ccp = await loadConnectionProfile(connectionProfilePath);

  const wallet = await Wallets.newFileSystemWallet(walletPath);
  const identity = await wallet.get(identityLabel);
  if (!identity) {
    throw new Error(
      `Identity "${identityLabel}" not found in wallet at ${walletPath}. Add cert/key and register identity.`
    );
  }

  const gateway = new Gateway();
  await gateway.connect(ccp as any, {
    wallet,
    identity: identityLabel,
    discovery: { enabled: discoveryEnabled, asLocalhost },
  });

  const network = await gateway.getNetwork(channelName);
  const contract = network.getContract(chaincodeName);

  return { gateway, contract };
}

async function close(conn?: FabricConnection) {
  try {
    if (conn?.gateway) {
      conn.gateway.disconnect();
    }
  } catch {
    // ignore
  }
}

// CreateUserProfile(userId, userType)
export const createUserProfile = action({
  args: {
    userId: v.string(),
    userType: v.union(v.literal("tourist"), v.literal("operator"), v.literal("responder")),
  },
  handler: async (_ctx, args) => {
    let conn: FabricConnection | undefined;
    try {
      conn = await connectToFabric();
      const res = await conn.contract.submitTransaction("CreateUserProfile", args.userId, args.userType);
      return { ok: true, data: res?.toString() ?? "" };
    } catch (e: any) {
      throw new Error(`Fabric.CreateUserProfile failed: ${e?.message || String(e)}`);
    } finally {
      await close(conn);
    }
  },
});

// LinkWallet(userId, walletAddress)
export const linkWallet = action({
  args: {
    userId: v.string(),
    walletAddress: v.string(),
  },
  handler: async (_ctx, args) => {
    let conn: FabricConnection | undefined;
    try {
      conn = await connectToFabric();
      const res = await conn.contract.submitTransaction("LinkWallet", args.userId, args.walletAddress);
      return { ok: true, data: res?.toString() ?? "" };
    } catch (e: any) {
      throw new Error(`Fabric.LinkWallet failed: ${e?.message || String(e)}`);
    } finally {
      await close(conn);
    }
  },
});

// GetUserWallet(userId)
export const getUserWallet = action({
  args: { userId: v.string() },
  handler: async (_ctx, args) => {
    let conn: FabricConnection | undefined;
    try {
      conn = await connectToFabric();
      const res = await conn.contract.evaluateTransaction("GetUserWallet", args.userId);
      return { ok: true, data: res?.toString() ?? "" };
    } catch (e: any) {
      throw new Error(`Fabric.GetUserWallet failed: ${e?.message || String(e)}`);
    } finally {
      await close(conn);
    }
  },
});

// GetWalletOwner(walletAddress)
export const getWalletOwner = action({
  args: { walletAddress: v.string() },
  handler: async (_ctx, args) => {
    let conn: FabricConnection | undefined;
    try {
      conn = await connectToFabric();
      const res = await conn.contract.evaluateTransaction("GetWalletOwner", args.walletAddress);
      return { ok: true, data: res?.toString() ?? "" };
    } catch (e: any) {
      throw new Error(`Fabric.GetWalletOwner failed: ${e?.message || String(e)}`);
    } finally {
      await close(conn);
    }
  },
});

// VerifyWalletOwnership(userId, walletAddress)
export const verifyWalletOwnership = action({
  args: {
    userId: v.string(),
    walletAddress: v.string(),
  },
  handler: async (_ctx, args) => {
    let conn: FabricConnection | undefined;
    try {
      conn = await connectToFabric();
      const res = await conn.contract.evaluateTransaction("VerifyWalletOwnership", args.userId, args.walletAddress);
      return { ok: true, data: res?.toString() ?? "" };
    } catch (e: any) {
      throw new Error(`Fabric.VerifyWalletOwnership failed: ${e?.message || String(e)}`);
    } finally {
      await close(conn);
    }
  },
});
