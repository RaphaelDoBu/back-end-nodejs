const nodemailer = require('nodemailer');
const {host, port, user, pass} = require('../config/mailer.json');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');

var transport = nodemailer.createTransport({
    host,
    port,
    auth: {
      user: user,
      pass: pass
    }
});

transport.use('compile', hbs({
  viewEngine: {
    extName: '.html',
    partialsDir: path.resolve('./src/resources/mail/'),
    layoutsDir: path.resolve('./src/resources/mail/'),
    defaultLayout: 'auth/forgot_password.html',
},
viewPath: path.resolve('./src/resources/mail/'),
extName: '.html'

}));

module.exports = transport;