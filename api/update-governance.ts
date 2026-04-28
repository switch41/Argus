export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  const txId = `tx_${Math.random().toString(36).slice(2, 11)}`;
  res.status(200).json({ success: true, txId });
}
