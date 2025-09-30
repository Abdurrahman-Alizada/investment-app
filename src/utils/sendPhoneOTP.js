import axios from 'axios';

const sendOTP = async (phoneNumber, otp) => {
  try {
    const response = await axios.post(
      'https://us-central1-huna-invest-88638.cloudfunctions.net/sendOtp',
      {
        phoneNumber,
        otp,
      },
      {
        headers: {
          'x-secret-key': 'hunaInvest2025', // ✅ secret key header-ல add பண்ணுறது
        },
      }
    );

    console.log('OTP Sent:', response.data);
    return response.data;
  } catch (error) {
    console.log('Error sending OTP:', error.response ? error.response : error.message);
    return { success: false, error: error.message };
  }
};

export default sendOTP;
