var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'noreply@aditya.ac.in',
    pass: 'Aditya1234'
  }
});

var mailOptions = {
  from: 'noreply@aditya.ac.in',
  to: 'kumarpsr9@gmail.com',
  subject: 'Sending Email using Node.js',
  html: '<h3>That was easy!</h3><h6>Description</h6><p>testing mail description</p>'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});