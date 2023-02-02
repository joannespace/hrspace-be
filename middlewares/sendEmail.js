const { nextDay } = require("date-fns");
const nodemailer = require("nodemailer");
const { AppError } = require("../helpers/utils");
const nodeMailerUser = process.env.NODEMAILER_USER;
const nodeMailerPass = process.env.NODEMAILER_PASS;

const nodeMailerSending = {};

nodeMailerSending.sendEmailVerification = (name, email, confirmationCode) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: nodeMailerUser,
      pass: nodeMailerPass,
    },
  });

  const mailOption = {
    from: `HRSpace Platform <${nodeMailerUser}>`,
    to: email,
    subject: "HRSpace| Verification Email",
    html: `<h4>Email Confirmation</h4>
            <p>Hello ${name}</p>
            <p>Thank you for signing up to HRSpace Platform. Please confirm your email by clicking on the following link</p>
           <p><a href=https://hrspace.netlify.app/verification/${confirmationCode}> Click here</a></p>
            Cheers,
            </div>`,
  };

  transporter.sendMail(mailOption, function (error, info) {
    if (error) {
      console.log(error);
      throw new AppError(
        401,
        `${error.message}`,
        "Email Verification Sending Error"
      );
    } else {
      console.log("Email send:" + info.response);
      return true;
    }
  });
};

nodeMailerSending.sendPasswordEmail = (name, email, password) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: nodeMailerUser,
      pass: nodeMailerPass,
    },
  });

  const mailOption = {
    from: `HRSpace Platform <${nodeMailerUser}>`,
    to: email,
    subject: "HRSpace| Reset Password",
    html: `<h4>HRSpace| Password Access To HRSpace Platform</h4>
              <p>Hello ${name}</p>
              <p>Below is your password to access to <a href=https://hrspace.netlify.app/>HRSpace</a> platform. Please keep it personally. </p>
              <ul>
              <li>Email: ${email}</li>
              <li>Password: ${password}</li>
              </ul>
              Cheers,
              </div>`,
  };

  transporter.sendMail(mailOption, function (error, info) {
    if (error) {
      console.log(error);
      throw new AppError(
        401,
        `${error.message}`,
        "Password Email Sending Error"
      );
    } else {
      console.log("Email send:" + info.response);
      return true;
    }
  });
};

nodeMailerSending.sendPasswordAndVerification = (
  name,
  email,
  currentUserEmail,
  confirmationCode,
  password
) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: nodeMailerUser,
      pass: nodeMailerPass,
    },
  });

  const mailOption = {
    from: `HRSpace Platform <${nodeMailerUser}>`,
    to: email,
    subject: "HRSpace| Password Access To HRSpace Platform",
    html: `<h4>HRSpace| Password Access To HRSpace Platform</h4>
                <p>Hello ${name}</p>
                <p>This email was sent to you via ${currentUserEmail}</p>
                <p>Please confirm your email by clicking on the following link</p>
                <p><a href=https://hrspace.netlify.app/verification/${confirmationCode}> Click here</a></p>
                <p>After verification success, you can access to HRSpace platform via the following password. Please keep it personally. </p>
                <ul>
                <li>Email: ${email}</li>
                <li>Password: ${password}</li>
                </ul>
                Cheers,
                </div>`,
  };

  transporter.sendMail(mailOption, function (error, info) {
    if (error) {
      console.log(error);
      throw new AppError(
        401,
        `${error.message}`,
        "Password Verification Sending Error"
      );
    } else {
      console.log("Email send:" + info.response);
      return true;
    }
  });
};

nodeMailerSending.email = ({ reviewerName, revieweeName, link, email }) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: nodeMailerUser,
      pass: nodeMailerPass,
    },
  });

  const mailOption = {
    from: `HRSpace Platform <${nodeMailerUser}>`,
    to: email,
    subject: "HRSpace| Review Reminder",
    html: `<h4>HRSpace| Reminder for ${revieweeName}'s Reviewe</h4>
              <p>Hello ${reviewerName}</p>
              <p>This email is to remind you to access the HRSpace Platform via the link below to complete the review for ${revieweeName}</p>
              <p><a href=${link}>Click here</a></p>
              Cheers,
              </div>`,
  };

  transporter.sendMail(mailOption, function (error, info) {
    if (error) {
      throw new AppError(401, `${error.message}`, "Email Sending Error");
    } else {
      console.log("Email send:" + info);
      return true;
    }
  });
};

module.exports = nodeMailerSending;
