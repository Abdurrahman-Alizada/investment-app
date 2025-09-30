// utils/sendNotification.js

export async function sendNotification({playerId, heading, message}) {
  // const playerId= '4b4a8950-c703-4e33-8001-bf25f32f5180'

  try {
    const response = await fetch(
      'https://us-central1-huna-invest-88638.cloudfunctions.net/sendNotification',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          heading,
          message,
        }),
      },
    );

    const data = await response.json();
    if (data.success) {
      console.log('✅ Notification அனுப்பப்பட்டது:', data.response);
      return {success: true, data: data.response};
    } else {
      console.error('❌ Notification send failed:', data.error);
      return {success: false, error: data.error};
    }
  } catch (error) {
    console.error('⚠️ Error:', error.message);
    return {success: false, error: error.message};
  }
}
