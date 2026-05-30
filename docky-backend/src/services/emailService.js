const nodemailer = require('nodemailer');

exports.sendResetEmail = async (email, resetToken) => {
    // 1. Secara otomatis membuat akun email bohongan (Ethereal) untuk testing
    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    // 2. URL ini nantinya akan mengarah ke halaman frontend milik Silvi
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    // 3. Template isi Email
    let info = await transporter.sendMail({
        from: '"Tim DOCKY" <support@docky.com>',
        to: email,
        subject: "Penting: Reset Password Akun DOCKY Anda",
        html: `
            <h3>Halo, DOCKY Engineer!</h3>
            <p>Seseorang telah meminta untuk mereset password akun Anda.</p>
            <p>Silakan klik link di bawah ini untuk membuat password baru:</p>
            <a href="${resetUrl}" target="_blank">${resetUrl}</a>
            <p>Link ini hanya berlaku selama 1 jam.</p>
        `,
    });

    // 4. Memunculkan link rahasia di terminal agar kita bisa melihat bentuk emailnya
    console.log("-----------------------------------------");
    console.log("📧 EMAIL BERHASIL DIKIRIM!");
    console.log("🔍 CEK PREVIEW EMAIL DI SINI: %s", nodemailer.getTestMessageUrl(info));
    console.log("-----------------------------------------");
};