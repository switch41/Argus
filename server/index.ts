import express from 'express';
import cors from 'cors';
import { Wallets, Gateway } from 'fabric-network';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Fabric Gateway is running' });
});

const PORT = 3001;

// Fabric Configuration (Mocked for now, but structures are ready for SDK)
const ccpPath = path.resolve(__dirname, 'connection-org1.json');

app.post('/api/issue-id', async (req, res) => {
    const { touristId, fullName, passportNumber } = req.body;
    console.log(`[Fabric] Issuing Digital ID for ${fullName} (${touristId})`);

    try {
        // In a real environment, this is where we call the Fabric SDK:
        // const gateway = new Gateway();
        // await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
        // const network = await gateway.getNetwork('mychannel');
        // const contract = network.getContract('safetravel');
        // await contract.submitTransaction('IssueTouristID', touristId, fullName, passportNumber);

        const txId = `tx_${Math.random().toString(36).substr(2, 9)}`;
        res.json({ success: true, txId, digitalIdHash: `DID_${touristId}_${Date.now()}` });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/file-efir', async (req, res) => {
    const { firId, touristId, incidentData } = req.body;
    console.log(`[Fabric] Filing E-FIR for Case ${firId}`);

    try {
        const txId = `tx_${Math.random().toString(36).substr(2, 9)}`;
        res.json({ success: true, txId });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/reveal-data', async (req, res) => {
    const { digitalIdHash } = req.body;
    console.log(`[Fabric] Revealing data for Hash: ${digitalIdHash}`);

    try {
        // In a real environment, this is where we call the Fabric SDK's 'EvaluateTransaction'
        const mockData = {
            fullName: "Jane Doe",
            nationality: "German",
            passportNumber: "ABC123456",
            expiryDateMs: Date.now() + 100000000,
            emergencyContactsJson: JSON.stringify([{ name: "Hans Müller", phone: "+49123456" }])
        };
        res.json({ ok: true, data: JSON.stringify(mockData) });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

app.post('/api/update-governance', async (req, res) => {
    const { settingKey, settingValue } = req.body;
    console.log(`[Fabric] Updating Governance: ${settingKey} = ${settingValue}`);

    try {
        const txId = `tx_${Math.random().toString(36).substr(2, 9)}`;
        res.json({ success: true, txId });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/audit-logs', async (req, res) => {
    const { filter } = req.body;
    console.log(`[Fabric] Fetching Global Audit Logs${filter ? ` for ${filter}` : ''}`);

    try {
        const logs = [
            { txId: 'tx_a1b2c3d4', action: 'IssueDigitalID', timestamp: Date.now() - 1000 * 60 * 60 },
            { txId: 'tx_e5f6g7h8', action: 'UpdateGovernance', timestamp: Date.now() - 1000 * 60 * 30 }
        ];
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/verify-id', async (req, res) => {
    const { digitalIdHash } = req.body;
    console.log(`[Fabric] Verifying Hash: ${digitalIdHash}`);

    try {
        const isValid = digitalIdHash.startsWith('DID_');
        res.json({ ok: true, data: JSON.stringify({ valid: isValid }) });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

app.post('/api/link-wallet', async (req, res) => {
    const { userId, walletAddress } = req.body;
    console.log(`[Fabric] Linking Wallet for ${userId}: ${walletAddress}`);
    try {
        res.json({ ok: true });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

app.post('/api/get-wallet', async (req, res) => {
    const { userId } = req.body;
    try {
        res.json({ ok: true, data: "0xMockWalletAddress" });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Fabric Gateway running at http://localhost:${PORT}`);
});
