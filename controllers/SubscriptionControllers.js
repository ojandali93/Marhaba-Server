export const verifySubscription = async (req, res) => {
  const { userId, receipt, productId } = req.body;

  if (!receipt || !userId || !productId) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  try {
    const requestBody = {
      'receipt-data': receipt,
      'password': APPLE_SHARED_SECRET,
      'exclude-old-transactions': true,
    };

    // Step 1: Attempt to verify with production
    let response = await axios.post(APPLE_PRODUCTION_URL, requestBody, {
      headers: { 'Content-Type': 'application/json' },
    });

    // Step 2: If receipt is from sandbox, retry with sandbox endpoint
    if (response.data.status === 21007) {
      response = await axios.post(APPLE_SANDBOX_URL, requestBody, {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { status, latest_receipt_info } = response.data;

    if (status === 0 && latest_receipt_info?.length) {
      const latest = latest_receipt_info[latest_receipt_info.length - 1];
      const expirationDate = parseInt(latest.expires_date_ms, 10);
      const now = Date.now();

      const isActive = expirationDate > now;
      const tier = productId.includes('plus') ? 3 : 2; // Map product ID to tier

      // TODO: Update user tier in DB here
      console.log(`✅ Subscription active for user ${userId}, tier: ${tier}`);

      return res.json({ success: true, active: isActive, tier, expiration: expirationDate });
    } else {
      return res.status(200).json({ success: false, message: 'Invalid or expired receipt.' });
    }
  } catch (err) {
    console.error('❌ Apple receipt validation error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error validating receipt.' });
  }
};