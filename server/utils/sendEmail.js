import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
    console.log("Starting email send process...");
    console.log("SMTP Configuration:", {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from: process.env.SMTP_FROM
    });

    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error("Missing SMTP configuration:", {
            host: !!process.env.SMTP_HOST,
            port: !!process.env.SMTP_PORT,
            user: !!process.env.SMTP_USER,
            pass: !!process.env.SMTP_PASS
        });
        throw new Error("Email service not configured");
    }

    try {
        console.log("Creating SMTP transporter...");
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            debug: true, // Enable debug logging
            logger: true // Enable logger
        });

        console.log("Verifying SMTP connection...");
        await transporter.verify();
        console.log("SMTP connection verified successfully");

        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject,
            text: message
        };

        console.log("Sending email with options:", {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
        });

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", {
            messageId: info.messageId,
            response: info.response
        });
        return info;
    } catch (error) {
        console.error("Detailed email sending error:", {
            name: error.name,
            message: error.message,
            code: error.code,
            command: error.command,
            stack: error.stack
        });

        if (error.code === 'EAUTH') {
            throw new Error("Email authentication failed. Please check SMTP credentials.");
        } else if (error.code === 'ESOCKET') {
            throw new Error("Could not connect to email server. Please check SMTP settings.");
        } else {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
}; 