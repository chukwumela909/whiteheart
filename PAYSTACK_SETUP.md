# Paystack Payment Integration Setup Guide

## Overview
Your checkout now includes Paystack payment integration. Customers will be able to pay securely using cards, bank transfers, and other payment methods supported by Paystack.

## Setup Steps

### 1. Get Your Paystack API Keys

1. **Sign up for Paystack** (if you haven't already)
   - Go to: https://dashboard.paystack.com/signup
   - Create your account with your business email

2. **Get Your API Keys**
   - Login to: https://dashboard.paystack.com/
   - Go to **Settings** → **API Keys & Webhooks**
   - You'll see two keys:
     - **Test Public Key** (starts with `pk_test_...`) - For testing
     - **Live Public Key** (starts with `pk_live_...`) - For production

### 2. Add Your Public Key to the Project

1. **Open the `.env.local` file** in your project root
2. **Replace** `pk_test_your_paystack_public_key_here` with your actual Paystack public key:

```bash
# For Testing (use test key)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx

# For Production (use live key)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
```

3. **Restart your development server** after updating the `.env.local` file:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

### 3. Test the Payment Integration

#### Using Test Mode (Recommended First)

1. Make sure you're using the **test public key** (`pk_test_...`)
2. Add items to cart and proceed to checkout
3. Fill in the checkout form
4. Click "Proceed to Payment"
5. Use Paystack's test card details:
   - **Card Number:** `4084084084084081`
   - **Expiry:** Any future date (e.g., `12/25`)
   - **CVV:** `408`
   - **PIN:** `0000`
   - **OTP:** `123456`

6. Complete the payment and verify:
   - Order status updates to "processing"
   - Payment status shows as "paid"
   - You receive confirmation

### 4. Go Live (Production)

Once testing is complete:

1. **Submit Your Business for Verification**
   - Go to: https://dashboard.paystack.com/settings/compliance
   - Provide required business documents
   - Wait for approval (usually 1-3 business days)

2. **Switch to Live Keys**
   - Replace test key with live key in `.env.local`:
   ```bash
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
   ```

3. **Deploy Your Application**
   - Make sure to add the environment variable to your hosting platform
   - Common platforms:
     - **Vercel:** Settings → Environment Variables
     - **Netlify:** Site settings → Environment variables
     - **Railway:** Variables tab

## How It Works

### Payment Flow

1. **Customer fills checkout form** → Order created in database (status: pending, payment: pending)
2. **Customer clicks "Proceed to Payment"** → Paystack payment modal opens
3. **Customer completes payment** → Paystack processes payment
4. **Payment successful** → Order status updated (status: processing, payment: paid)
5. **Customer redirected** → Order confirmation page

### If Payment Fails or is Cancelled

- Order remains in database with status "pending" and payment "pending"
- Customer can:
  - Try payment again from their orders page
  - Contact support to complete payment
  - Order won't be processed until paid

## Testing Different Scenarios

### Test Cards for Different Results

**Successful Payment:**
- Card: `4084084084084081`
- CVV: `408`
- Result: Payment succeeds

**Declined Payment:**
- Card: `5060666666666666666`
- CVV: Any
- Result: Payment is declined

**Insufficient Funds:**
- Card: `5061020000000000094`
- CVV: Any
- Result: Insufficient funds error

## Supported Payment Methods

When you go live, customers can pay with:
- ✅ Visa & Mastercard
- ✅ Verve Cards
- ✅ Bank Transfer
- ✅ USSD
- ✅ Mobile Money
- ✅ QR Code

## Currency

Currently set to **NGN (Nigerian Naira)**. To change currency:

1. Open `app/checkout/page.tsx`
2. Find the line: `currency: 'NGN',`
3. Change to your desired currency (e.g., `'GHS'` for Ghana, `'KES'` for Kenya)

## Transaction Fees

Paystack charges:
- **Local cards:** 1.5% + ₦100 (capped at ₦2,000)
- **International cards:** 3.9% + ₦100
- You can choose to pass fees to customers or absorb them

To pass fees to customers, update the total calculation in checkout.

## Support & Resources

- **Paystack Dashboard:** https://dashboard.paystack.com/
- **Documentation:** https://paystack.com/docs/
- **Support:** support@paystack.com
- **Test Cards:** https://paystack.com/docs/payments/test-payments/

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` to Git (it's already in `.gitignore`)
- Never expose your secret key (only use public key in frontend)
- Always use test keys during development
- Only switch to live keys when ready for production

## Troubleshooting

### "Payment system is still loading"
- Check your internet connection
- Verify the Paystack script is loading (check browser console)
- Try refreshing the page

### "Payment Error" / Script fails to load
- Check if you have ad blockers disabled
- Verify the Paystack service is up: https://status.paystack.com/

### Order created but payment not updating
- Check your Paystack dashboard for the transaction
- Verify the order_number matches
- Check browser console for errors

### Payments work in test mode but not live
- Ensure business is verified with Paystack
- Check that you're using the live public key
- Verify you haven't exceeded your settlement limit

---

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check Paystack dashboard for transaction logs
3. Review the order in your database
4. Contact Paystack support with transaction reference
