export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const mockData = {
    fullName: "Jane Doe",
    nationality: "German",
    passportNumber: "ABC123456",
    expiryDateMs: Date.now() + 100000000,
    emergencyContactsJson: JSON.stringify([{ name: "Hans Muller", phone: "+49123456" }]),
  };

  res.status(200).json({ ok: true, data: JSON.stringify(mockData) });
}
