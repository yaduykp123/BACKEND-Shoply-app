const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // For testing, I'll use ethereal.email if no credentials are provided in .env
  let transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // REAL SMTP (e.g. Gmail, SendGrid)
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // TEST SMTP (ethereal.email)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    // Capture the ethereal URL for the log
    console.log('--- TEST EMAIL CONFIG (ETHEREAL) ---');
    console.log('User:', testAccount.user);
    console.log('Pass:', testAccount.pass);
    console.log('------------------------------------');
  }

  const mailOptions = {
    from: `"Shoply Support" <${process.env.EMAIL_FROM || 'noreply@shoply.com'}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  const info = await transporter.sendMail(mailOptions);

  if (!process.env.EMAIL_USER) {
    console.log('--- TEST EMAIL SENT ---');
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    console.log('-----------------------');
  }

  return info;
};

module.exports = sendEmail;
