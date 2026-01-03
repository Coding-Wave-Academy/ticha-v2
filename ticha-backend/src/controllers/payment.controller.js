import supabase from "../config/supabase.js";

const NKWA_PAY_API_KEY = process.env.NKWA_PAY_API_KEY;
// const NKWA_PAY_URL = "https://api.pay.staging.mynkwa.com/collect";
const NKWA_PAY_URL = "https://api.pay.staging.mynkwa.com/disburse";

export const collectPayment = async (req, res) => {
  try {
    const { phoneNumber, amount = 1000 } = req.body;
    const userId = req.user.userId;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Clean phone number (must be 237...)
    let cleanNumber = phoneNumber.replace(/\+/g, "");
    if (!cleanNumber.startsWith("237")) {
      cleanNumber = `237${cleanNumber}`;
    }

    console.log(`Initiating payment for ${userId} with number ${cleanNumber}`);

    const options = {
      method: "POST",
      headers: {
        "X-API-Key": NKWA_PAY_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        phoneNumber: cleanNumber,
      }),
    };

    const nkwaRes = await fetch(NKWA_PAY_URL, options);
    const nkwaData = await nkwaRes.json();

    if (!nkwaRes.ok) {
      throw new Error(nkwaData.message || "Payment initiation failed");
      console.log(nkwaData)
    }

    // Record the payment attempt in database
    await supabase.from("payments").insert({
      user_id: userId,
      amount: amount,
      phone_number: cleanNumber,
      status: "pending",
      provider_reference: nkwaData.reference || null,
      created_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message:
        "Payment initiated. Please check your phone for the MOMO prompt.",
      data: nkwaData,
    });
  } catch (err) {
    console.error("Payment Error:", err);
    res.status(500).json({ error: err.message });
  }
};
