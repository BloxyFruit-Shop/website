export default (link, discord) => {
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
</style>
<style type="text/css">
* {
  -webkit-text-size-adjust: none;
}

/*** prevent iOS font upsizing ***/
.ExternalClass * {
  line-height: 100%;
}

/*** force Outlook.com to honor line-height ***/
td {
  mso-line-height-rule: exactly;
}

</style>
</head>

<body style="padding:0px; margin:0px; -webkit-text-size-adjust:none !important; background-color:#090B11">
  <div style="font-family:'Cabinet Grotesk', Helvetica, Arial, sans-serif; width:100%; margin-left:auto; margin-right:auto; padding-top: 40px; padding-bottom: 40px;"> 

    <!-- [START] Header -->
    <table role="presentation" align="center" width="500" cellspacing="0" cellpadding="0" border="0" style="width:500px;">
      <tr>
        <td
          align="center"
          valign="top"
          
          style="padding: 40px 40px 40px 40px;
            background: url(https://pub-fe0cf95e4d5443c298777eeec222983b.r2.dev/background-image.png), #0C0E16; 
            background-color: #0C0E16; 
            background-size: cover; 
            background-repeat: no-repeat; 
            border-radius: 12px; 
            overflow: hidden; 
            position: relative;"
        >
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <!-- header logo -->
              <td width="128" align="left" valign="middle" style="width:128px;padding:0;">
                <a href="https://bloxyfruit.com" target="_blank"><img src="https://bloxyfruit.com/assets/bloxyfruit-logo.png" width="152" height="30" border="0" style="display:block; height:auto;" alt="BloxyFruit"></a>
              </td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 0px">
            <tr>
              <td style="padding-top: 24px; border-radius: 12px;">
                <p style="color: white; font-weight: 700; font-size: 30px; margin: 0">Claim your order!</p>
                <p style="color: white; font-weight: 500;">
                  Thanks for choosing BloxyFruit, you can easily claim your order by in our user panel, selecting the order and click redeem!
                </p>
                <a href="https://bloxyfruit.com/?claimOrder={{id}}" style="display: inline-block; text-decoration: none; width: 100%; background: linear-gradient(#3BA4F0,#1B92E9); color: white; margin-top: 24px; padding: 12px 0; text-align: center; font-weight: 600; font-size: 18px; border-radius: 8px;">
                  Claim Order
                  <img src="https://bloxyfruit.com/assets/RoundedArrowRight.png" style="vertical-align: middle; object-fit: contain; width: 17px; height:17px; margin-left: 4px;" />
                </a>
                <p style="color: #809BB5; font-weight: 500; margin: 0; margin-top: 24px;">
                  For assistance or questions, join our Discord and open a support ticket. We're here to help!
                </p>
                <a href="https://discord.com/bloxyfruit" style="display: inline-block; text-decoration: none; width: 100%; background: rgba(29,37,53,0.25); border: 2px solid rgba(29,37,53,0.2); color: white; margin-top: 16px; padding: 12px 0; text-align: center; font-weight: 600; font-size: 18px; border-radius: 8px;">
                  Join Discord
                  <img src="https://bloxyfruit.com/assets/Discord.png" style="vertical-align: middle; object-fit: contain; width: 20px; height:20px; margin-left: 4px;" />
                </a>
                <div style="background: rgba(128, 155, 181, 0.12); border-radius: 999px; margin: 0; margin-top: 16px; width: 100%; height: 2px;"></div>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px;">
                  <tr>
                    <td align="left" style="color: #809BB5; font-weight: 500;">
                      BloxFruit © 2024
                    </td>
                    <td align="right" style="color: #809BB5; font-weight: 500;">
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
    
  </body>
</html>
  `
}