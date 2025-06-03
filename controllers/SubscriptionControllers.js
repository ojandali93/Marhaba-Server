export const verifySubscription = async (req, res) => {
  const { receiptData, userId, productId } = req.body;

  if (!receiptData || !userId || !productId) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    console.log('📥 Verifying receipt for user:', userId);
    console.log('🔍 Product:', productId);

    // Build request to Apple
    const requestBody = {
      'receipt-data': receiptData,
      'password': 'YOUR_SHARED_SECRET', // App-specific shared secret from App Store Connect
      'exclude-old-transactions': true
    };

    // First try production
    let response = await axios.post(APPLE_PRODUCTION_URL, requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });

    let responseData = response.data;

    // If receipt is from sandbox, retry with sandbox URL
    if (responseData.status === 21007) {
      console.log('🔄 Receipt is from Sandbox, retrying with Sandbox URL...');
      response = await axios.post(APPLE_SANDBOX_URL, requestBody, {
        headers: { 'Content-Type': 'application/json' }
      });
      responseData = response.data;
    }

    // Log the full response for debugging
    console.log('📦 Apple receipt response:', JSON.stringify(responseData, null, 2));

    if (responseData.status !== 0) {
      return res.status(400).json({ success: false, error: 'Invalid receipt', appleStatus: responseData.status });
    }

    // You can now parse the latest subscription info
    const latestReceiptInfo = responseData.latest_receipt_info?.[0] || {};

    const subscriptionExpirationDate = latestReceiptInfo.expires_date_ms
      ? new Date(parseInt(latestReceiptInfo.expires_date_ms))
      : null;

    console.log('✅ Subscription expiration:', subscriptionExpirationDate);

    // Save subscription to your database
    const { data: eventData, error: eventError } = await supabase
      .from('Subscriptions')
      .insert([{ userId, productId, subscriptionExpirationDate, originalTransactionId: new Date().toISOString(), latestReceiptInfo }])
      .select()

    if (eventError) {
      console.error('❌ Supabase error:', eventError);
      return res.status(400).json({ error: eventError.message || 'Failed to save subscription.' });
    }

    return res.status(200).json({ success: true, subscriptionExpirationDate });
  } catch (err) {
    console.error('❌ Error verifying receipt:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

