# 🆓 Free Twilio SMS Setup for Pramaan OTP

## Step 1: Get Free Twilio Account
1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for free trial account
3. **You get $15 free credits** (enough for ~500 SMS messages)
4. Verify your phone number during signup

## Step 2: Get Your Credentials
1. Go to [Twilio Console](https://console.twilio.com)
2. From the dashboard, copy:
   - **Account SID** 
   - **Auth Token**
3. Go to Phone Numbers → Manage → Active numbers
4. Copy your **Twilio Phone Number** (format: +1234567890)

## Step 3: Update Backend Configuration
Edit `backend/.env` file and replace:
```env
TWILIO_ACCOUNT_SID=your_actual_account_sid_here
TWILIO_AUTH_TOKEN=your_actual_auth_token_here  
TWILIO_PHONE_NUMBER=your_actual_twilio_number_here
```

## Step 4: Test Your Setup
1. Restart your backend server:
   ```bash
   cd backend
   npm run dev
   ```
2. The OTP will be sent to your real phone number!

## Demo Mode (Current)
- Right now it shows OTP in console AND response for demo
- Once you add Twilio credentials, it will send real SMS
- For hackathon demo, you can use both modes

## Cost Breakdown
- **Free Trial**: $15 credit
- **SMS Cost**: ~$0.0075 per message
- **Total Messages**: ~2000 SMS with free credits
- **Perfect for**: Hackathon demos and testing

## Troubleshooting
- Make sure phone numbers include country code (+91 for India)
- Twilio trial accounts can only send to verified numbers
- Add more numbers in Console → Phone Numbers → Verified Caller IDs

## Alternative: Keep Demo Mode
If you prefer to keep it simple for the hackathon:
- Leave Twilio credentials as placeholders
- OTP will show in console and browser response
- Perfect for demo presentations!
