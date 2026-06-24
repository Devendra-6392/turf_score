const nodemailer = require('nodemailer');

const EMAIL_USER = 'devendra.bhattsqaure@gmail.com';
const EMAIL_PASS = 'mtge nxbq tbrc biah';

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use host/port if not gmail
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

exports.sendBookingBillEmail = async (userEmail, bookingDetails) => {
  try {
    const mailOptions = {
      from: `"Skipers" <${EMAIL_USER}>`,
      to: userEmail,
      subject: `Booking Confirmed: ${bookingDetails.turfName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto;">
          <h2 style="color: #4B7A2F;">Booking Confirmed!</h2>
          <p>Thank you for booking with Skipers.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
            <p><strong>Turf:</strong> ${bookingDetails.turfName}</p>
            <p><strong>Date:</strong> ${bookingDetails.date}</p>
            <p><strong>Time:</strong> ${bookingDetails.time}</p>
            <p><strong>Amount Paid:</strong> ₹${bookingDetails.amount}</p>
          </div>
          <p>Enjoy your game!</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Booking email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending booking email:', error);
  }
};

exports.sendChallengeAcceptedEmail = async (creatorEmail, opponentName, challengeDetails) => {
  try {
    const mailOptions = {
      from: `"Skipers" <${EMAIL_USER}>`,
      to: creatorEmail,
      subject: `Challenge Accepted! 🔥`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto;">
          <h2 style="color: #E63946;">Challenge Accepted!</h2>
          <p>Great news! <strong>${opponentName}</strong> has accepted your challenge and paid their half of the booking amount.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
            <p><strong>Challenge:</strong> ${challengeDetails.title}</p>
            <p><strong>Turf:</strong> ${challengeDetails.turfName}</p>
            <p><strong>Cashback credited to wallet:</strong> ₹${challengeDetails.cashbackAmount}</p>
          </div>
          <p>Get ready for the match!</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Challenge accepted email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending challenge email:', error);
  }
};
