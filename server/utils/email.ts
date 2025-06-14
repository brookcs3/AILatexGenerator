import { ServerClient } from 'postmark';

if (!process.env.POSTMARK_API_KEY) {
  console.warn('Missing POSTMARK_API_KEY environment variable. Email functionality will be disabled.');
}

const client = process.env.POSTMARK_API_KEY 
  ? new ServerClient(process.env.POSTMARK_API_KEY)
  : null;

export const FROM_EMAIL = 'no-reply@aitexgen.com';
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'support@aitexgen.com';

/**
 * Tests the connection to Postmark API
 */
export async function testPostmarkConnection(): Promise<{ success: boolean; message: string }> {
  if (!client) {
    return { 
      success: false, 
      message: 'Postmark client not initialized (missing API key)' 
    };
  }

  try {
    const response = await client.getServer();
    return { 
      success: true, 
      message: `Connected to Postmark server: ${response.Name}` 
    };
  } catch (error: any) {
    console.error('Postmark connection error:', error);
    return { 
      success: false, 
      message: `Failed to connect to Postmark: ${error.message || 'Unknown error'}` 
    };
  }
}

/**
 * Sends a verification email to the user
 */
export async function generateVerificationToken(): Promise<string> {
  // Generate a random string of 32 characters
  return Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

export async function sendVerificationEmail(
  email: string,
  verificationToken: string
): Promise<{ success: boolean; message: string }> {
  if (!client) {
    return { 
      success: false, 
      message: 'Email service not available' 
    };
  }
  
  console.log(`Sending verification email to ${email} with token ${verificationToken.substring(0, 8)}...`);

  try {
    // Determine the base URL based on the environment
    // For Railway, use the PRIMARY_DOMAIN environment variable
    // This will ensure the verification link works in both local and production environments
    const baseUrl =
      process.env.PRIMARY_DOMAIN ||
      process.env.PUBLIC_URL ||
      process.env.SITE_DOMAIN ||
      'https://aitexgen.com';
    const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;
    
    const response = await client.sendEmail({
      From: FROM_EMAIL,
      To: email,
      Subject: 'Verify your AITexGen account',
      HtmlBody: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="${baseUrl.replace(/\/$/, '')}/logo.png" alt="AITexGen Logo" style="max-width: 120px; height: auto;" onerror="this.style.display='none'">
          </div>
          <h1 style="color: #2563eb; margin-bottom: 24px; text-align: center;">Verify your email address</h1>
          <p style="margin-bottom: 24px; font-size: 16px; line-height: 24px;">
            Thank you for signing up for AITexGen! Please click the button below to verify your email address.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              Verify my email
            </a>
          </div>
          
          <div style="margin-top: 24px; padding: 16px; background-color: #f3f4f6; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #374151;">
              <strong>⚠</strong> Please check there if you don't see it in your inbox.
            </p>
          </div>
          
          <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
            If you didn't create an account, you can safely ignore this email.
          </p>
          <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            <a href="${verificationLink}" style="color: #2563eb; word-break: break-all;">
              ${verificationLink}
            </a>
          </p>
        </div>
      `,
      TextBody: `
        Verify your AITexGen account
        
        Thank you for signing up for AITexGen! Please visit the link below to verify your email address:
        
        ${verificationLink}
        
        If you didn't create an account, you can safely ignore this email.
      `,
      MessageStream: 'outbound'
    });
    
    return { 
      success: true, 
      message: `Verification email sent: ${response.MessageID}` 
    };
  } catch (error: any) {
    console.error('Failed to send verification email:', error);
    return {
      success: false,
      message: `Failed to send verification email: ${error.message || 'Unknown error'}`
    };
  }
}

/**
 * Sends a contact form email
 * @param options Contact email options
 */
export async function sendContactEmail(options: {
  fromEmail: string;
  message: string;
  name?: string;
  subject?: string;
}): Promise<{ success: boolean; message: string }> {
  const { fromEmail, message, name = '', subject = 'Contact Form Submission' } = options;
  
  if (!client) {
    return {
      success: false,
      message: 'Email service not available'
    };
  }

  const contactSubject = subject ? `Contact: ${subject}` : 'Contact Form Submission';

  try {
    const response = await client.sendEmail({
      From: FROM_EMAIL,
      To: CONTACT_EMAIL,
      ReplyTo: fromEmail,
      Subject: contactSubject,
      HtmlBody: `
        <p><strong>Name:</strong> ${name || 'N/A'}</p>
        <p><strong>Email:</strong> ${fromEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      TextBody: `Name: ${name}\nEmail: ${fromEmail}\n\n${message}`,
      MessageStream: 'outbound'
    });

    return {
      success: true,
      message: `Contact email sent: ${response.MessageID}`
    };
  } catch (error: any) {
    console.error('Failed to send contact email:', error);
    return {
      success: false,
      message: `Failed to send contact email: ${error.message || 'Unknown error'}`
    };
  }
}
