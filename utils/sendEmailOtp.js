import axios from 'axios';

const SENDGRID_API = 'https://api.sendgrid.com/v3/mail/send';
const SENDGRID_API_KEY = 'YOUR_SENDGRID_API_KEY';

export const sendOtpEmail = async (toEmail, otp) => {
  try {
    const response = await axios.post(
      SENDGRID_API,
      {
        personalizations: [
          {
            to: [{email: toEmail}],
            subject: 'Your OTP Code',
          },
        ],
        from: {email: 'your_verified_sender@example.com'}, // must be verified in SendGrid
        content: [
          {
            type: 'text/plain',
            value: `Your OTP code is: ${otp}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ Email sent:', response.data);
  } catch (error) {
    console.error(
      '❌ Error sending OTP:',
      error.response?.data || error.message,
    );
  }
};
