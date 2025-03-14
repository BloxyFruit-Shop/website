export default (code) => {
  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width">
    <title></title>
    
    <style type="text/css">
      @font-face {
        font-family: 'Cabinet Grotesk';
        src: url('CabinetGrotesk.ttf') format('truetype');
        font-style: normal;
      }

      * {
        -webkit-text-size-adjust: none;
      }

      .ExternalClass * {
        line-height: 100%;
      }

      td {
        mso-line-height-rule: exactly;
      }
    </style>
  </head>

  <body style="padding:0px; margin:0px; -webkit-text-size-adjust:none !important; background-color:#FFFFFF">
    <div style="font-family:'Cabinet Grotesk', Helvetica, Arial, sans-serif; width:100%; margin-left:auto; margin-right:auto; padding-top: 40px; padding-bottom: 40px;"> 

      <table role="presentation" align="center" width="500" cellspacing="0" cellpadding="0" border="0" style="width:500px;">
        <tr>
          <td
            align="center"
            valign="top"
            style="
              padding: 40px 40px 40px 40px;
              background-image: url(https://pub-fe0cf95e4d5443c298777eeec222983b.r2.dev/background-email.png); 
              background-color: #F3F5FD; 
              background-size: cover; 
              background-repeat: no-repeat; 
              border-radius: 12px; 
              overflow: hidden; 
              position: relative;
            "
          >
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="128" align="left" valign="middle" style="width:128px;padding:0;">
                  <a href="https://bloxyfruit.com" target="_blank"><img src="https://pub-fe0cf95e4d5443c298777eeec222983b.r2.dev/bloxyfruit-logo.png" width="152" height="30" border="0" style="display:block; height:auto;" alt="BloxyFruit"></a>
                </td>
              </tr>
            </table>
            
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 0px">
              <tr>
                <td style="padding-top: 24px; border-radius: 12px;">
                  <p style="color: #38434D; font-weight: 700; font-size: 30px; margin: 0">Reset Your Password!</p>
                  <p style="color: #38434D; font-weight: 500;">
                    We received a request to reset the password for your BloxyFruit account. To proceed, please click the button below.
                    <br/><br/>
                    If you didn't request this, please ignore this email or contact our support team for assistance.
                  </p>
                  <a href="https://bloxyfruit.com/?resetCode=${code}" style="display: inline-block; text-decoration: none; width: 100%; background: linear-gradient(to right,#3BA4F0,#1B92E9); color: white; margin-top: 24px; margin-bottom: 0px; padding: 12px 0; text-align: center; font-weight: 600; font-size: 18px; border-radius: 8px;">
                    Reset Now
                    <img src="https://pub-fe0cf95e4d5443c298777eeec222983b.r2.dev/RoundedArrowRight.png" style="vertical-align: middle; object-fit: contain; width: 17px; height:17px; margin-left: 4px;" />
                  </a>
                  <p style="color: #38434D; font-weight: 500; margin: 0; margin-top: 6px; text-align: left;">
                    Or copy and paste this link: <a href="https://bloxyfruit.com/?resetCode=${code}" style="color: #1B92E9; text-decoration: underline;">https://bloxyfruit.com/?resetCode=${code}</a>
                  </p>
                  <p style="color: #38434D; font-weight: 500; margin: 0; margin-top: 24px;">
                    This link is valid for 1 hour. Please reset your password soon or you will have to request another one.
                  </p>
                  <div style="background: rgba(59, 164, 240, 0.12); border-radius: 999px; margin: 0; margin-top: 16px; width: 100%; height: 2px;"></div>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px;">
                    <tr>
                      <td align="left" style="color: #38434D; font-weight: 500;">
                        BloxFruit © 2024
                      </td>
                      <td align="right" style="color: #38434D; font-weight: 500;">
                        All Rights Reserved.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>
`
}