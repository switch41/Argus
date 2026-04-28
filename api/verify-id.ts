export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
  const digitalIdHash = body.digitalIdHash ?? "";
  const isValid = typeof digitalIdHash === "string" && digitalIdHash.startsWith("DID_");

  res.status(200).json({
    ok: true,
    data: JSON.stringify({ valid: isValid }),
  });
}
