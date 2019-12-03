const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'zohrabyan95@gmail.com',
        pass: process.env.EMAIL_PASS
    }
});

const sendWelcomeEmail = (email, name) => {
    transporter.sendMail({
        from: 'zohrabyan95@gmail.com',
        to: email,
        subject: 'Thanks for joining',
        text: `Welcome to the app, ${name}, let me know how you get along with the app!`
    })
};

const sendGoodbyeEmail = (email, name) => {
    transporter.sendMail({
        from: 'zohrabyan95@gmail.com',
        to: email,
        subject: 'Goodbye sir!',
        text: `It was a pleasure to have a user like you, ${name}, hope to see you soon!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}
