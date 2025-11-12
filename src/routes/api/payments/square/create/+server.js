import { json } from '@sveltejs/kit';
import { users, globalSettings, squarePayments } from '$server/mongo';
import { SquareClient, SquareEnvironment } from 'square';
import { SQUARE_ACCESS_TOKEN, SQUARE_ENVIRONMENT } from '$env/static/private';
import crypto from 'crypto';

const client = new SquareClient({
  environment:
    SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
  token: SQUARE_ACCESS_TOKEN
});

const paymentsApi = client.payments;

/**
 * Generate idempotency key to prevent duplicate charges
 */
function generateIdempotencyKey(userId, amount, timestamp) {
  return `${userId}-${amount}-${timestamp}`;
}

/**
 * Check if user has exceeded purchase rate limit (1 order per 6 hours)
 */
async function checkRateLimit(user, settings) {
  if (!user.lastPurchaseAt) {
    return { allowed: true };
  }

  const hoursSinceLastPurchase =
    (Date.now() - user.lastPurchaseAt.getTime()) / (1000 * 60 * 60);

  const limitHours = settings.purchaseLimitHours || 0;

  if (hoursSinceLastPurchase < limitHours) {
    const hoursRemaining =
      Math.ceil((limitHours - hoursSinceLastPurchase) * 100) / 100;
    return {
      allowed: false,
      hoursRemaining
    };
  }

  return { allowed: true };
}

export async function POST({ request, locals }) {
  try {
    // Check if user is authenticated
    if (!locals.localUser || !locals.localUser._id) {
      return json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { robuxAmount, sourceId } = await request.json();

    // Validate input
    if (!robuxAmount || !sourceId) {
      return json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get global settings
    const settings = await globalSettings.findOne({ _id: 'settings' }).lean();
    if (!settings) {
      return json(
        { success: false, error: 'System configuration error' },
        { status: 500 }
      );
    }

    // Validate robux amount
    const minRobux = settings.minRobuxPerPurchase || 300;
    const maxRobux = settings.maxRobuxPerPurchase || 10000;

    if (robuxAmount < minRobux || robuxAmount > maxRobux) {
      return json(
        {
          success: false,
          error: `Robux amount must be between ${minRobux} and ${maxRobux}`
        },
        { status: 400 }
      );
    }

    // Get user and check rate limit
    const user = await users.findById(locals.localUser._id);
    if (!user) {
      return json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const rateLimitCheck = await checkRateLimit(user, settings);
    if (!rateLimitCheck.allowed) {
      return json(
        {
          success: false,
          error: `You can only purchase once every ${
            settings.purchaseLimitHours || 6
          } hours. Please try again in ${rateLimitCheck.hoursRemaining} hours.`
        },
        { status: 429 }
      );
    }

    // Calculate USD amount from robux
    const usdToRobuxRate = settings.usdToRobuxRate || 0.00829;
    const usdAmount = robuxAmount * usdToRobuxRate;

    // Convert USD to EUR (1 EUR = 1.0832004953 USD)
    const eurToUsdRate = 1.0832004953;
    const eurAmount = usdAmount / eurToUsdRate;
    const amountInCents = Math.round(eurAmount * 100);

    // Validate minimum USD amount ($1.00)
    if (amountInCents < 100) {
      return json(
        { success: false, error: 'Minimum purchase is $1.00' },
        { status: 400 }
      );
    }

    // Generate idempotency key
    const timestamp = Date.now();
    const idempotencyKey = generateIdempotencyKey(
      user._id.toString(),
      robuxAmount,
      timestamp
    );

    // Check if payment with this idempotency key already exists
    const existingPayment = await squarePayments
      .findOne({ idempotencyKey })
      .lean();
    if (existingPayment) {
      return json(
        {
          success: true,
          paymentId: existingPayment.paymentId,
          message: 'Payment already processed'
        },
        { status: 200 }
      );
    }

    // Create payment with Square
    try {
      const paymentRequest = {
        sourceId,
        amountMoney: {
          amount: BigInt(amountInCents),
          currency: 'EUR'
        },
        idempotencyKey,
        customerId: user.squareCustomerId || undefined,
        note: `Robux Purchase: ${robuxAmount} R$ for ${user.username}`,
        referenceId: user._id.toString()
      };

      const response = await paymentsApi.create(paymentRequest);
      const payment = response.payment;

      // Store payment record in database
      // Status is 'authorized' at this point - will be updated to 'completed' when payment.updated webhook fires
      const paymentRecord = await squarePayments.create({
        paymentId: payment.id,
        userId: user._id,
        amount: amountInCents,
        robuxAmount: robuxAmount,
        status: 'authorized',
        idempotencyKey: idempotencyKey,
        sourceAmount: eurAmount,
        sourceCurrency: 'EUR',
        createdAt: new Date(),
        receiptUrl: payment.receiptUrl || null
      });

      // Update user's last purchase time
      await users.updateOne(
        { _id: user._id },
        { $set: { lastPurchaseAt: new Date() } }
      );

      return json(
        {
          success: true,
          paymentId: payment.id,
          robuxAmount: robuxAmount,
          message: 'Payment processed successfully'
        },
        { status: 200 }
      );
    } catch (squareError) {
      console.error('Square API error:', squareError);

      // Store failed payment record
      await squarePayments.create({
        paymentId: `failed-${idempotencyKey}`,
        userId: user._id,
        amount: amountInCents,
        robuxAmount: robuxAmount,
        status: 'failed',
        idempotencyKey: idempotencyKey,
        sourceAmount: eurAmount,
        sourceCurrency: 'EUR',
        failureReason: squareError.message || 'Payment processing failed'
      });

      return json(
        {
          success: false,
          error: squareError.message || 'Payment processing failed'
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment creation error:', error);
    return json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
