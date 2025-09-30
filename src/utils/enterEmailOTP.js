const sendEmailOtp = async (email, otp) => {
  try {
    const response = await fetch(
      'https://us-central1-huna-invest-88638.cloudfunctions.net/sendEmailOtp',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-secret-key': 'hunaInvest2025', // இங்கே உங்கள் backend secret
        },
        body: JSON.stringify({email, otp: otp}), // OTP generate பண்ணி அனுப்பவேண்டும்
      },
    );

    const data = await response.json();
    console.log('OTP Response:', data);
    return data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

export {sendEmailOtp};
