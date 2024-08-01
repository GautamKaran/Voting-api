import nodemailer from "nodemailer";

export const EmailSenderMethod = async (
  receiverEmail,
  subjectOfmail,
  BodyOfEmail
) => {
  try {
    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: process.env.Email_ID,
        pass: process.env.Email_Password,
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.Email_ID,
      to: receiverEmail,
      subject: subjectOfmail,
      html: BodyOfEmail,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Mail has been sent", info.messageId);
  } catch (error) {
    console.error("Error in sending email:", error.message);
    throw new Error("Failed to send email");
  }
};
