import Link from "next/link";
import JimpleLogo from "./components/jimple-logo";
import { useRouter } from "next/router";

export default function SubscriptionSuccess() {
  const router = useRouter();
  const { session_id } = router.query; //Stripe session id, sent by Stripe after successful subscription redirect

 

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div>
          <JimpleLogo width={100} height={100} linkToRoot={false}/>
        </div>

    <div className="mt-8 p-4 md:p-16 text-slate-100">
    <h1 className="mb-8 text-3xl font-bold">Jimple's Privacy Policy</h1>
      <p className="font-thin">
          Welcome to Jimple's privacy policy. We are committed to protecting your privacy and handling your personal data responsibly. This policy explains how we collect, use, and safeguard your information when you use our applications.
      </p>

      <p className="font-bold mt-12 mb-2">IDENTITY AND CONTACT</p>
      <p className="font-thin">
          Jimple Pty Ltd<br/>
          Level 6, 24 Albert Rd, <br/>
          South Melbourne, VIC 3205<br/>
          Australia<br/>
          Email: info@jimple.com
      </p>

      <p className="font-bold mt-12 mb-2">WHAT INFORMATION WE COLLECT AND WHY</p>
      <p className="font-thin">
          Your JIMPLE Account: When you register for a JIMPLE account, we collect basic information like your name, email address, and country. If you register on behalf of an organization, we may ask for additional details such as the organization's name and your role.
          <br/>
          Application Usage Data: We collect information about how you use our applications, such as your settings (e.g., keyboard and voice preferences), personalized content (e.g., user-specific words and photos), and activity (e.g., frequency of app usage). We also collect anonymized usage statistics to improve our products and for research purposes.
          <br/>
          Support Requests: If you contact us for support, we collect information like your name and email address to assist you effectively.
      </p>

      <p className="font-bold mt-12 mb-2">PROTECTING MINORS' PRIVACY</p>
      <p className="font-thin">
          We understand the importance of protecting the privacy of minors who use our applications. We limit the collection and processing of their personal data as much as possible, especially in educational settings where we act as a processor and follow the instructions of schools and universities.
      </p>

      <p className="font-bold mt-12 mb-2">SHARING YOUR INFORMATION</p>
      <p className="font-thin">
          We do not sell your personal data to third parties or use it for advertising purposes. Your information is only shared with:
          <br/>
          Authorized App Team Members: Those who support the user, such as parents, teachers, or caregivers.
          <br/>
          Service Providers: External partners who assist us in delivering our services.
          <br/>
          Legal Obligations: In cases where we are legally required to disclose personal data.
      </p>

      <p className="font-bold mt-12 mb-2">WHERE YOUR DATA IS STORED</p>
      <p className="font-thin">
          Your personal data is processed on servers located in the European Economic Area (EEA), the United States of America (USA), and Australia. If data is transferred outside the EEA, we ensure it's done in compliance with applicable laws, such as using EU standard contractual clauses.
      </p>

      <p className="font-bold mt-12 mb-2">SECURITY AND RETENTION</p>
      <p className="font-thin">
          We employ various security measures like encryption, SSL, and access management to protect your data. We retain your personal data only as long as necessary or as required by law. Users' data is retained for 18 months after license expiration.
      </p>

      <p className="font-bold mt-12 mb-2">YOUR RIGHTS</p>
      <p className="font-thin">
          You have the right to access, amend, or delete your personal data. You can also request restrictions on certain data processing or withdraw consent previously given. If you have any concerns or requests, please contact us. Additionally, you have the right to lodge a complaint with your local data protection authority.
      </p>

      <p className="font-bold mt-12 mb-2">UPTIME GUARANTEE AND LIMITATION OF LIABILITY</p>
      <p className="font-thin">
          1. No Uptime Guarantee: Our software does not come with a Service Level Agreement (SLA) guaranteeing 99.9% uptime or any other specific uptime percentage. While we strive to provide the best possible service, we do not guarantee that the software will be uninterrupted, timely, secure, or error-free.
          <br/><br/>
          2. Limitation of Liability: To the maximum extent permitted by applicable law, in no event shall JIMPLE be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          <ul className="list-disc ml-5">
              <li>Your use of or inability to use the software.</li>
              <li>Any unauthorized access to or use of our servers and/or any personal information stored therein.</li>
              <li>Any interruption or cessation of transmission to or from our software.</li>
              <li>Any bugs, viruses, trojan horses, or the like that may be transmitted to or through our software by any third party.</li>
              <li>Any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content posted, emailed, transmitted, or otherwise made available through the software.</li>
          </ul>
          By using our software, you acknowledge and agree to these terms and disclaimers. If you do not agree with any part of these terms, you should not use our software.
      </p>

      <p className="font-bold mt-12 mb-2">CHANGES TO THIS POLICY</p>
      <p className="font-thin">
          We may update this privacy policy to ensure compliance with relevant laws. We recommend checking this policy regularly for updates. If there are significant changes, we'll notify you. By continuing to use our applications after any changes, you accept the updated policy.
          <br/><br/>
          Thank you for trusting JIMPLE with your privacy. If you have any questions or concerns, please don't hesitate to contact us.
      </p>




        </div>
      </div>
    </div>
  );
};
