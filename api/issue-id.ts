export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
  const touristId = body.touristId ?? body.userId ?? "unknown";
  const fullName = body.fullName ?? "Unknown User";

  const txId = `tx_${Math.random().toString(36).slice(2, 11)}`;
  res.status(200).json({
    success: true,
    txId,
    digitalIdHash: `DID_${touristId}_${Date.now()}`,
    issuedTo: fullName,
  });
}
