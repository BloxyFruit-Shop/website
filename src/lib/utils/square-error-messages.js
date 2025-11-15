/**
 * Square Payment Error Code Mapping
 * Maps Square error codes to user-friendly messages
 * Reference: https://developer.squareup.com/docs/devtools/sandbox/payments#sandbox-payment-risk-evaluation
 */

export const SQUARE_ERROR_MESSAGES = {
  // Payment Method Errors
  INSUFFICIENT_FUNDS: {
    title: 'Insufficient Funds',
    message: 'Your card does not have enough funds. Please use a different card or add funds to your account.',
    category: 'payment_method'
  },
  GENERIC_DECLINE: {
    title: 'Card Declined',
    message: 'Your card was declined. Please check your card details and try again, or use a different card.',
    category: 'payment_method'
  },
  CVV_MISMATCH: {
    title: 'Invalid Security Code',
    message: 'The security code (CVV) you entered is incorrect. Please check and try again.',
    category: 'payment_method'
  },
  EXPIRATION_EXPIRED: {
    title: 'Card Expired',
    message: 'Your card has expired. Please use a different card.',
    category: 'payment_method'
  },
  INVALID_EXPIRATION: {
    title: 'Invalid Expiration Date',
    message: 'The expiration date you entered is invalid. Please check and try again.',
    category: 'payment_method'
  },
  INVALID_ACCOUNT_NUMBER: {
    title: 'Invalid Card Number',
    message: 'The card number you entered is invalid. Please check and try again.',
    category: 'payment_method'
  },
  CARD_NOT_SUPPORTED: {
    title: 'Card Not Supported',
    message: 'This card type is not supported. Please use a different card.',
    category: 'payment_method'
  },
  CARD_PROCESSING_NOT_ENABLED: {
    title: 'Card Processing Unavailable',
    message: 'Card processing is temporarily unavailable. Please try again later.',
    category: 'payment_method'
  },

  // Risk Evaluation Errors
  CARD_VELOCITY_EXCEEDED: {
    title: 'Too Many Attempts',
    message: 'Too many payment attempts with this card. Please wait a while before trying again.',
    category: 'risk'
  },
  SUSPECTED_FRAUD: {
    title: 'Payment Flagged',
    message: 'Your payment was flagged for security review. Please contact support for assistance.',
    category: 'risk'
  },
  AUTHENTICATION_REQUIRED: {
    title: 'Additional Verification Required',
    message: 'Your payment requires additional verification. Please contact your bank or card issuer.',
    category: 'risk'
  },
  TRANSACTION_LIMIT_EXCEEDED: {
    title: 'Transaction Limit Exceeded',
    message: 'This transaction exceeds your card limit. Please use a different card or contact your bank.',
    category: 'risk'
  },
  DAILY_LIMIT_EXCEEDED: {
    title: 'Daily Limit Exceeded',
    message: 'You have exceeded your daily transaction limit. Please try again tomorrow.',
    category: 'risk'
  },
  MONTHLY_LIMIT_EXCEEDED: {
    title: 'Monthly Limit Exceeded',
    message: 'You have exceeded your monthly transaction limit. Please try again next month.',
    category: 'risk'
  },

  // Network & System Errors
  NETWORK_ERROR: {
    title: 'Connection Error',
    message: 'A network error occurred. Please check your connection and try again.',
    category: 'network'
  },
  TIMEOUT: {
    title: 'Request Timeout',
    message: 'The payment request timed out. Please try again.',
    category: 'network'
  },
  GATEWAY_TIMEOUT: {
    title: 'Payment Gateway Timeout',
    message: 'The payment gateway is not responding. Please try again in a moment.',
    category: 'network'
  },

  // 3D Secure / Authentication Errors
  THREE_D_SECURE_REQUIRED: {
    title: '3D Secure Verification Required',
    message: 'Your card requires additional verification. Please complete the verification process.',
    category: 'authentication'
  },
  THREE_D_SECURE_FAILED: {
    title: '3D Secure Verification Failed',
    message: 'The 3D Secure verification failed. Please try again or use a different card.',
    category: 'authentication'
  },

  // Address Verification Errors
  AVS_MISMATCH: {
    title: 'Address Mismatch',
    message: 'The billing address does not match your card records. Please verify your address.',
    category: 'verification'
  },
  ZIP_MISMATCH: {
    title: 'ZIP Code Mismatch',
    message: 'The ZIP code does not match your card records. Please verify your ZIP code.',
    category: 'verification'
  },

  // Account Errors
  ACCOUNT_UNUSABLE: {
    title: 'Card Cannot Be Used',
    message: 'This card cannot be used for payments. Please use a different card.',
    category: 'account'
  },
  ACCOUNT_CLOSED: {
    title: 'Account Closed',
    message: 'The card account is closed. Please use a different card.',
    category: 'account'
  },
  ACCOUNT_FROZEN: {
    title: 'Account Frozen',
    message: 'The card account is frozen. Please contact your bank.',
    category: 'account'
  },

  // Generic/Unknown Errors
  GENERIC_ERROR: {
    title: 'Payment Failed',
    message: 'The payment could not be processed. Please try again or contact support.',
    category: 'unknown'
  }
};

/**
 * Parse Square error response and return user-friendly message
 * @param {Object} errorResponse - The error response from Square API
 * @returns {Object} - { title, message, category, originalError }
 */
export function parseSquareError(errorResponse) {
  // Handle network errors
  if (!errorResponse) {
    return SQUARE_ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Extract error code from various possible locations
  let errorCode = null;

  // Check if it's a direct error code string
  if (typeof errorResponse === 'string') {
    errorCode = errorResponse;
  }
  // Check errors array (from API response)
  else if (errorResponse.errors && Array.isArray(errorResponse.errors)) {
    const firstError = errorResponse.errors[0];
    if (firstError?.code) {
      errorCode = firstError.code;
    }
  }
  // Check payment.card_details.errors
  else if (errorResponse.payment?.card_details?.errors) {
    const cardErrors = errorResponse.payment.card_details.errors;
    if (Array.isArray(cardErrors) && cardErrors[0]?.code) {
      errorCode = cardErrors[0].code;
    }
  }
  // Check direct code property
  else if (errorResponse.code) {
    errorCode = errorResponse.code;
  }

  // Return mapped message or generic error
  if (errorCode && SQUARE_ERROR_MESSAGES[errorCode]) {
    return {
      ...SQUARE_ERROR_MESSAGES[errorCode],
      originalError: errorCode
    };
  }

  // Return generic error with original message if available
  return {
    ...SQUARE_ERROR_MESSAGES.GENERIC_ERROR,
    originalError: errorResponse.message || 'Unknown error'
  };
}

/**
 * Get user-friendly error message from Square error
 * @param {Object} errorResponse - The error response from Square API
 * @returns {string} - User-friendly error message
 */
export function getSquareErrorMessage(errorResponse) {
  const parsed = parseSquareError(errorResponse);
  return parsed.message;
}

/**
 * Get error title from Square error
 * @param {Object} errorResponse - The error response from Square API
 * @returns {string} - Error title
 */
export function getSquareErrorTitle(errorResponse) {
  const parsed = parseSquareError(errorResponse);
  return parsed.title;
}

/**
 * Check if error is a recoverable error (user can retry)
 * @param {Object} errorResponse - The error response from Square API
 * @returns {boolean} - True if user can retry
 */
export function isRecoverableError(errorResponse) {
  const parsed = parseSquareError(errorResponse);
  const recoverableCategories = ['payment_method', 'network', 'verification'];
  return recoverableCategories.includes(parsed.category);
}

/**
 * Check if error requires contacting support
 * @param {Object} errorResponse - The error response from Square API
 * @returns {boolean} - True if user should contact support
 */
export function requiresSupport(errorResponse) {
  const parsed = parseSquareError(errorResponse);
  const supportCategories = ['risk', 'account', 'authentication'];
  return supportCategories.includes(parsed.category);
}
