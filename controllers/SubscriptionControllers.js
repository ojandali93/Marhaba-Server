export const verifySubscription = async (req, res) => {
  const { transactionDate, userId, productId, transactionId, transactionReceipt } = req.body;

  if (!receiptData || !userId || !productId) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    console.log('\ud83d\udcc5 Verifying receipt for user:', userId);
    console.log('\ud83d\udd0d Product:', productId);

    // Build request to Apple
    const requestBody = {
      'receipt-data': receiptData,
      'password': 'YOUR_SHARED_SECRET',
      'exclude-old-transactions': true
    };

    // First try production
    let response = await axios.post(APPLE_PRODUCTION_URL, requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });

    let responseData = response.data;

    // If receipt is from sandbox, retry with sandbox URL
    if (responseData.status === 21007) {
      console.log('\ud83d\udd04 Receipt is from Sandbox, retrying with Sandbox URL...');
      response = await axios.post(APPLE_SANDBOX_URL, requestBody, {
        headers: { 'Content-Type': 'application/json' }
      });
      responseData = response.data;
    }

    // Log the full response for debugging
    console.log('\ud83d\udce6 Apple receipt response:', JSON.stringify(responseData, null, 2));

    if (responseData.status !== 0) {
      return res.status(400).json({ success: false, error: 'Invalid receipt', appleStatus: responseData.status });
    }

    // Parse the latest subscription info (pick latest one with highest expires_date)
    const latestReceiptInfoList = responseData.latest_receipt_info || [];

    if (latestReceiptInfoList.length === 0) {
      return res.status(400).json({ success: false, error: 'No subscription info found in receipt.' });
    }

    const latestReceiptInfo = latestReceiptInfoList.reduce((latest, current) => {
      return parseInt(current.expires_date_ms || '0') > parseInt(latest.expires_date_ms || '0') ? current : latest;
    });

    const subscriptionExpirationDate = latestReceiptInfo.expires_date_ms
      ? new Date(parseInt(latestReceiptInfo.expires_date_ms)).toISOString()
      : null;

    console.log('\u2705 Subscription expiration:', subscriptionExpirationDate);

    // Save subscription to your database
    const { data: eventData, error: eventError } = await supabase
      .from('Subscriptions')
      .insert([
        {
          userId,
          productId,
          transactionDate,
          transactionId,
          transactionReceipt,
          transactionDate: new Date().toISOString()
        }
      ])
      .select();

    if (eventError) {
      console.error('\u274c Supabase error:', eventError);
      return res.status(400).json({ error: eventError.message || 'Failed to save subscription.' });
    }

    return res.status(200).json({ success: true, subscriptionExpirationDate, eventData });
  } catch (err) {
    console.error('\u274c Error verifying receipt:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
