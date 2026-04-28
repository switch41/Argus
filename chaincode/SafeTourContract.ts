/*
 * SafeTravelID - 3-Layer Chaincode Implementation (Conceptual)
 * This TypeScript chaincode demonstrates the logic for User, Official, and Admin layers.
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';

@Info({ title: 'SafeTourChaincode', description: '3-Layer Travel Safety Smart Contract' })
export class SafeTourContract extends Contract {

    // =================================================================================
    // LAYER 1: REGULAR USER (Identity & Consent)
    // =================================================================================

    @Transaction()
    public async CreateUserProfile(ctx: Context, userId: string, userType: string): Promise<void> {
        const profile = { userId, userType, createdAt: ctx.stub.getTxTimestamp() };
        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(profile)));
    }

    @Transaction()
    public async IssueDigitalId(
        ctx: Context,
        userId: string,
        fullName: string,
        passport: string,
        nationality: string,
        dob: string,
        bloodGroup: string,
        medicalInfo: string
    ): Promise<string> {
        // Layer 1: Storage for "Every info of the individual"
        const idData = {
            userId,
            fullName,
            passport,
            nationality,
            dob,
            bloodGroup,
            medicalInfo,
            verified: true
        };
        const idHash = ctx.stub.getBinding();
        await ctx.stub.putState(`DID_${idHash}`, Buffer.from(JSON.stringify(idData)));
        return idHash;
    }

    // =================================================================================
    // LAYER 2: OFFICIALS (Sensitive Incident Data) - Using Private Data Collections
    // =================================================================================

    @Transaction()
    public async FileEFIR(ctx: Context, firId: string, touristId: string, sensitiveData: string): Promise<void> {
        // Verify that the caller belongs to an Official Org (Police/Hospital)
        const clientOrg = ctx.clientIdentity.getMSPID();
        if (clientOrg !== 'OfficialOrg') {
            throw new Error('Only Official organizations can file incident reports.');
        }

        const incident = { firId, touristId, sensitiveData, status: 'FILED' };

        // Store in a Private Data Collection (PDC) instead of the public ledger
        // PDC ensures only members of 'collectionOfficial' can see the actual content
        await ctx.stub.putPrivateData('collectionOfficial', firId, Buffer.from(JSON.stringify(incident)));
    }

    @Transaction(false)
    public async GetIncidentDetails(ctx: Context, firId: string): Promise<string> {
        const data = await ctx.stub.getPrivateData('collectionOfficial', firId);
        if (!data || data.length === 0) {
            throw new Error(`Incident ${firId} does not exist or access denied.`);
        }
        return data.toString();
    }

    // =================================================================================
    // LAYER 3: ADMIN (System Governance & Audit)
    // =================================================================================

    @Transaction()
    public async UpdateGovernanceSetting(ctx: Context, key: string, value: string): Promise<void> {
        // Strict Admin check
        const clientOrg = ctx.clientIdentity.getMSPID();
        if (clientOrg !== 'GovernmentOrg') {
            throw new Error('Unauthorized: Admin access required.');
        }
        await ctx.stub.putState(`SETTING_${key}`, Buffer.from(value));
    }

    @Transaction(false)
    public async GetAuditLogs(ctx: Context, filter: string): Promise<string[]> {
        // Returns a history of transactions for auditing
        const results: string[] = [];
        const iterator = await ctx.stub.getQueryResult(JSON.stringify({ selector: { type: 'audit' } }));
        // Logic to iterate and filter...
        return results;
    }
}
