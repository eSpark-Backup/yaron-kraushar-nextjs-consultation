import { NextApiRequest, NextApiResponse } from "next";
import sendEmail from "../../services/sendgrid/send_email";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>) {
  console.log("Server: Register Interest API");

  // Get data submitted in request's body.
  const data = req.body
  
  const formattedJson = JSON.stringify(data, null, 2);

  console.log("Server: Register Interest API: data: " + formattedJson);
  const html = jsonToHtml(formattedJson);

  //setup email 
  const emailParams = {
    to: "info@jimple.io",
    from: "noreply@jimple.io",
    subject: "REQUEST FOR EARLY ACCESS",
    text: formattedJson,
    html: `<p> ${html} </p> `
  };

   //Send email to user with link to reset password
   sendEmail(emailParams);

  res.status(200).json({ message: "Success" });
};

export default handler;


function jsonToHtml(json: string): string {
  // Use the <pre> and <code> tags to preserve formatting
  return `<pre><code>${escapeHtml(json)}</code></pre>`;
}

// Function to escape HTML characters
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
