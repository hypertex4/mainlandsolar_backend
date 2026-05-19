const env = require('../config/env');
const emailQueueRepo = require('../repositories/email-queue.repository');

// ─── Logo ─────────────────────────────────────────────────────────────────────
const LOGO_URL = 'https://mainlandsolar.lagosapps.com/wp-content/uploads/2022/02/Group-330-1.svg';

// ─── Brand tokens ────────────────────────────────────────────────────────────
const BRAND = {
  green:      '#209E02',
  greenDark:  '#187001',
  greenLight: '#eaf6e7',
  charcoal:   '#414143',
  gray:       '#6b6b6d',
  border:     '#d9edd5',
  bg:         '#f4f7f3',
  white:      '#ffffff',
};


// ─── Base layout ─────────────────────────────────────────────────────────────
const baseTemplate = ({ preheader = '', body = '', footerNote = '' }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${env.APP_NAME}</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:'Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="background-color:${BRAND.bg};padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="max-width:600px;background-color:${BRAND.white};border-radius:12px;
                 overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header: white background so logo colours show correctly -->
          <tr>
            <td style="background-color:${BRAND.white};padding:32px 40px 24px;
                        text-align:center;border-bottom:3px solid ${BRAND.green};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">

                    <!-- Logo: SVG for modern clients (no filter — visible on white) -->
                    <!--[if !mso]><!-->
                    <a href="https://mainlandsolar.com" target="_blank"
                       style="display:inline-block;text-decoration:none;">
                      <img src="${LOGO_URL}"
                           alt="${env.APP_NAME}"
                           width="200"
                           height="60"
                           style="display:block;border:0;outline:none;
                                  max-width:200px;height:auto;" />
                    </a>
                    <!--<![endif]-->

                    <!-- Outlook fallback -->
                    <!--[if mso]>
                    <h1 style="margin:0;color:${BRAND.green};font-size:26px;font-weight:700;
                                font-family:Arial,sans-serif;">
                      ${env.APP_NAME}
                    </h1>
                    <![endif]-->

                    <!-- Tagline -->
                    <p style="margin:10px 0 0;color:${BRAND.gray};font-size:11px;
                               letter-spacing:2px;text-transform:uppercase;font-weight:600;">
                      Clean Energy Solutions
                    </p>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${body}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid ${BRAND.border};margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px 36px;text-align:center;">

              <!-- Small logo watermark -->
              <!--[if !mso]><!-->
              <a href="https://mainlandsolar.com" target="_blank"
                 style="display:inline-block;text-decoration:none;margin-bottom:16px;">
                <img src="${LOGO_URL}"
                     alt="${env.APP_NAME}"
                     width="110"
                     height="auto"
                     style="display:block;border:0;outline:none;opacity:0.55;
                            max-width:110px;height:auto;" />
              </a>
              <!--<![endif]-->

              ${footerNote
                ? `<p style="margin:0 0 12px;font-size:12px;color:${BRAND.gray};line-height:1.6;">
                    ${footerNote}
                   </p>`
                : ''}
              <p style="margin:0 0 6px;font-size:12px;color:${BRAND.gray};">
                &copy; ${new Date().getFullYear()} ${env.APP_NAME}. All rights reserved.
              </p>
              <p style="margin:0;font-size:12px;color:#aaaaaa;">
                Need help? Contact us at
                <a href="mailto:${env.SUPPORT_EMAIL}"
                   style="color:${BRAND.green};text-decoration:none;">${env.SUPPORT_EMAIL}</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>`;

// ─── Reusable components ──────────────────────────────────────────────────────
const greeting = (firstname) =>
  `<p style="margin:0 0 8px;font-size:22px;font-weight:700;color:${BRAND.charcoal};">
     Hi ${firstname},
   </p>`;

const otpBlock = (otp) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="margin:28px 0;">
    <tr>
      <td align="center"
        style="background:${BRAND.greenLight};border:2px dashed ${BRAND.green};
               border-radius:10px;padding:28px 20px;">
        <p style="margin:0 0 8px;font-size:11px;color:${BRAND.gray};
                   letter-spacing:2px;text-transform:uppercase;font-weight:600;">
          Your verification code
        </p>
        <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:14px;
                   color:${BRAND.green};font-family:'Courier New',monospace;">
          ${otp}
        </p>
        <p style="margin:10px 0 0;font-size:12px;color:${BRAND.gray};">
          Expires in <strong>10 minutes</strong>
        </p>
      </td>
    </tr>
  </table>`;

const warningNote = (text) =>
  `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
     style="margin-top:24px;">
     <tr>
       <td style="background:#fff8e6;border-left:4px solid #f0a500;border-radius:0 6px 6px 0;
                  padding:12px 16px;">
         <p style="margin:0;font-size:13px;color:#7a5c00;line-height:1.6;">
           <strong>Note:</strong> ${text}
         </p>
       </td>
     </tr>
   </table>`;

const bodyText = (text) =>
  `<p style="margin:0 0 16px;font-size:15px;color:${BRAND.charcoal};line-height:1.7;">${text}</p>`;

// ─── Send helper — pushes to queue, returns immediately ──────────────────────
const sendMail = async (to, subject, html) => {
  await emailQueueRepo.enqueue(
    `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_ADDRESS}>`,
    to,
    subject,
    html
  );
};

// ─── Templates ───────────────────────────────────────────────────────────────

const sendActivationOTP = async (email, firstname, otp) => {
  const html = baseTemplate({
    preheader: `Your ${env.APP_NAME} activation code is ${otp}`,
    body: `
      ${greeting(firstname)}
      ${bodyText(`Welcome to <strong>${env.APP_NAME}</strong>! We're excited to have you on board.`)}
      ${bodyText('To complete your registration and activate your account, enter the verification code below:')}
      ${otpBlock(otp)}
      ${bodyText('Once activated, you\'ll have full access to our solar energy solutions, products, and services.')}
      ${warningNote(`If you did not create an account with ${env.APP_NAME}, you can safely ignore this email. No action is required.`)}
    `,
    footerNote: `This is an automated message from ${env.APP_NAME}. Please do not reply directly to this email.`,
  });

  await sendMail(email, `Activate Your ${env.APP_NAME} Account`, html);
};

const sendPasswordResetOTP = async (email, firstname, otp) => {
  const html = baseTemplate({
    preheader: `Your ${env.APP_NAME} password reset code is ${otp}`,
    body: `
      ${greeting(firstname)}
      ${bodyText('We received a request to reset the password for your account.')}
      ${bodyText('Use the code below to proceed with resetting your password. This code is valid for <strong>10 minutes</strong> only.')}
      ${otpBlock(otp)}
      ${bodyText('After verifying this code, you will be prompted to set a new password.')}
      ${warningNote(`If you did not request a password reset, your account may be at risk. Please <a href="mailto:${env.SUPPORT_EMAIL}" style="color:${BRAND.green};font-weight:600;">contact our support team</a> immediately.`)}
    `,
    footerNote: `For security reasons, this code can only be used once and will expire after 10 minutes.`,
  });

  await sendMail(email, `Reset Your ${env.APP_NAME} Password`, html);
};

const sendWelcomeMail = async (email, firstname) => {
  const html = baseTemplate({
    preheader: `Welcome to ${env.APP_NAME} — your account is now active!`,
    body: `
      ${greeting(firstname)}
      ${bodyText(`Your account has been <strong>successfully activated</strong>. Welcome to the ${env.APP_NAME} family!`)}

      <!-- Feature highlights -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
        style="margin:24px 0;">
        <tr>
          <td style="background:${BRAND.greenLight};border-radius:10px;padding:24px 28px;">
            <p style="margin:0 0 16px;font-size:13px;color:${BRAND.green};
                       letter-spacing:2px;text-transform:uppercase;font-weight:700;">
              What you can do now
            </p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="padding:6px 0;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="width:24px;vertical-align:top;padding-top:2px;">
                        <div style="width:8px;height:8px;background:${BRAND.green};
                                    border-radius:50%;margin-top:4px;"></div>
                      </td>
                      <td style="font-size:14px;color:${BRAND.charcoal};line-height:1.6;padding-left:8px;">
                        Browse and order <strong>solar panels, inverters &amp; batteries</strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="width:24px;vertical-align:top;padding-top:2px;">
                        <div style="width:8px;height:8px;background:${BRAND.green};
                                    border-radius:50%;margin-top:4px;"></div>
                      </td>
                      <td style="font-size:14px;color:${BRAND.charcoal};line-height:1.6;padding-left:8px;">
                        Get <strong>expert consultation</strong> on the right solar setup for your needs
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="width:24px;vertical-align:top;padding-top:2px;">
                        <div style="width:8px;height:8px;background:${BRAND.green};
                                    border-radius:50%;margin-top:4px;"></div>
                      </td>
                      <td style="font-size:14px;color:${BRAND.charcoal};line-height:1.6;padding-left:8px;">
                        Track your <strong>orders and installation status</strong> in real time
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- CTA button -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
        style="margin:28px 0 8px;">
        <tr>
          <td align="center">
            <a href="${env.CLIENT_URL}"
               style="display:inline-block;background:${BRAND.green};color:${BRAND.white};
                      font-size:15px;font-weight:700;text-decoration:none;
                      padding:14px 40px;border-radius:6px;letter-spacing:0.3px;">
              Go to My Account
            </a>
          </td>
        </tr>
      </table>

      ${bodyText(`If you have any questions, our support team is always happy to help at <a href="mailto:${env.SUPPORT_EMAIL}" style="color:${BRAND.green};font-weight:600;">${env.SUPPORT_EMAIL}</a>.`)}
    `,
    footerNote: `You are receiving this email because you created an account with ${env.APP_NAME}.`,
  });

  await sendMail(email, `Welcome to ${env.APP_NAME} — You're All Set!`, html);
};

module.exports = { sendActivationOTP, sendPasswordResetOTP, sendWelcomeMail };
