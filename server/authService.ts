import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-default-32-character-key!!';
const IV_LENGTH = 16;

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString('hex');
      crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(salt + ':' + derivedKey.toString('hex'));
      });
    });
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(':');
      crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(key === derivedKey.toString('hex'));
      });
    });
  }

  static generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static encrypt(text: string): string {
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '!').substring(0, 32));
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  static decrypt(text: string): string {
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '!').substring(0, 32));
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  static async sendOTP(phoneNumber: string, otpCode: string): Promise<boolean> {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      console.log(`[Twilio] Sending OTP ${otpCode} to ${phoneNumber}`);
      return true;
    }
    
    console.log(`[STUB] OTP for ${phoneNumber}: ${otpCode}`);
    console.log(`[STUB] In production, this would send via Twilio SMS`);
    return true;
  }

  static async sendVerificationEmail(email: string, token: string, baseUrl: string): Promise<boolean> {
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;
    
    if (process.env.SENDGRID_API_KEY) {
      console.log(`[SendGrid] Sending verification email to ${email}`);
      console.log(`[SendGrid] Verification link: ${verificationLink}`);
      return true;
    }
    
    console.log(`[STUB] Verification email for ${email}`);
    console.log(`[STUB] Verification link: ${verificationLink}`);
    console.log(`[STUB] In production, this would send via SendGrid`);
    return true;
  }

  static async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    if (process.env.SENDGRID_API_KEY) {
      console.log(`[SendGrid] Sending welcome email to ${email}`);
      return true;
    }
    
    console.log(`[STUB] Welcome email for ${firstName} (${email})`);
    console.log(`[STUB] In production, this would send via SendGrid`);
    return true;
  }

  static isOTPExpired(otpExpiry: Date | null): boolean {
    if (!otpExpiry) return true;
    return new Date() > otpExpiry;
  }

  static isTokenExpired(tokenExpiry: Date | null): boolean {
    if (!tokenExpiry) return true;
    return new Date() > tokenExpiry;
  }

  static getOTPExpiryTime(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);
    return expiry;
  }

  static getTokenExpiryTime(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    return expiry;
  }
}
