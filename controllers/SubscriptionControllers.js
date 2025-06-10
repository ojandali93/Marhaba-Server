import axios from 'axios';
import { supabase } from '../services/SupabaseClient.js';

// Replace this with your actual shared secret from App Store Connect
const APPLE_SHARED_SECRET = 'f993dc47c32f45d092ba789ac792db76';

const APPLE_PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

export const verifySubscription = async (req, res) => {
  const { transactionDate, userId, productId, transactionId, transactionReceipt } = req.body;

  if (!userId || !productId || !transactionDate || !transactionId || !transactionReceipt) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    console.log('🧾 Verifying receipt for user:', userId);
    console.log('🔍 Product:', productId);

    const requestBody = {
      'receipt-data': transactionReceipt,
      'password': APPLE_SHARED_SECRET,
      'exclude-old-transactions': true
    };

    // 1. Try production first
    let response = await axios.post(APPLE_PRODUCTION_URL, requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });

    let responseData = response.data;

    // 2. If 21007, retry with sandbox
    if (responseData?.status === 21007) {
      console.log('🔁 Receipt is from sandbox. Retrying...');
      response = await axios.post(APPLE_SANDBOX_URL, requestBody, {
        headers: { 'Content-Type': 'application/json' }
      });
      responseData = response.data;
    }

    console.log('📦 Apple receipt response:', JSON.stringify(responseData, null, 2));

    if (responseData.status !== 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid receipt',
        appleStatus: responseData.status
      });
    }

    const latestReceiptInfoList = responseData.latest_receipt_info || [];

    if (latestReceiptInfoList.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid subscription info in receipt'
      });
    }

    // Get latest by expiration
    const latestReceiptInfo = latestReceiptInfoList.reduce((latest, current) =>
      parseInt(current.expires_date_ms || '0') > parseInt(latest.expires_date_ms || '0')
        ? current
        : latest
    );

    const subscriptionExpirationDate = latestReceiptInfo.expires_date_ms
      ? new Date(parseInt(latestReceiptInfo.expires_date_ms)).toISOString()
      : null;

    console.log('✅ Subscription expires on:', subscriptionExpirationDate);

    // 3. Store to Supabase
    const { data: eventData, error: eventError } = await supabase
      .from('Subscriptions')
      .insert([
        {
          userId,
          productId,
          transactionId,
          transactionReceipt,
          transactionDate: new Date().toISOString(),
          expirationDate: subscriptionExpirationDate
        }
      ])
      .select();

    if (eventError) {
      console.error('❌ Supabase insert error:', eventError);
      return res.status(400).json({
        success: false,
        error: eventError.message || 'Failed to store subscription'
      });
    }

    return res.status(200).json({
      success: true,
      subscriptionExpirationDate,
      eventData
    });
  } catch (err) {
    console.error('❌ Server error during verification:', err?.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
