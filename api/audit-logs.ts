export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  const logs = [
    { txId: "tx_a1b2c3d4", action: "IssueDigitalID", timestamp: Date.now() - 1000 * 60 * 60 },
    { txId: "tx_e5f6g7h8", action: "UpdateGovernance", timestamp: Date.now() - 1000 * 60 * 30 },
  ];

  res.status(200).json(logs);
}
