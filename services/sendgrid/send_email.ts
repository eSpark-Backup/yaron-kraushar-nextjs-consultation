// sendgrid.ts
import sgMail from '@sendgrid/mail';

export interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(emailParams: EmailParams): Promise<void> {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

  try {
    await sgMail.send(emailParams);
    console.log('Email sent');
  } catch (error) {
    console.error(error);
  }
}

export default sendEmail;
