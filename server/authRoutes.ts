import type { Express } from "express";
import { storage } from "./storage";
import { AuthService } from "./authService";
import {
  signupEmailSchema,
  loginEmailSchema,
  signupPhoneSchema,
  attachEmailSchema,
  verifyOtpSchema,
  verifyEmailTokenSchema,
} from "@shared/schema";

export function registerAuthRoutes(app: Express) {
  app.post('/api/auth/signup-email', async (req, res) => {
    try {
      const validation = signupEmailSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validation.error.errors,
        });
      }

      const { email, password, firstName, lastName } = validation.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const passwordHash = await AuthService.hashPassword(password);
      const emailEncrypted = AuthService.encrypt(email);
      const verificationToken = AuthService.generateVerificationToken();
      const verificationTokenExpiry = AuthService.getTokenExpiryTime();

      const user = await storage.createUser({
        email,
        emailEncrypted,
        passwordHash,
        firstName,
        lastName,
        authProvider: "email",
        emailVerified: 0,
        phoneVerified: 0,
        verificationToken,
        verificationTokenExpiry,
      });

      const baseUrl = `${req.protocol}://${req.hostname}`;
      await AuthService.sendVerificationEmail(email, verificationToken, baseUrl);

      req.login({ claims: { sub: user.id } }, (err) => {
        if (err) {
          console.error("Error logging in after signup:", err);
          return res.status(500).json({ message: "Signup successful but login failed" });
        }

        res.json({
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            emailVerified: user.emailVerified === 1,
            authProvider: user.authProvider,
          },
          message: "Signup successful! Please check your email to verify your account.",
        });
      });
    } catch (error: any) {
      console.error("Error in signup-email:", error);
      res.status(500).json({ message: error.message || "Failed to sign up" });
    }
  });

  app.post('/api/auth/login-email', async (req, res) => {
    try {
      const validation = loginEmailSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validation.error.errors,
        });
      }

      const { email, password } = validation.data;

      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValid = await AuthService.verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.login({ claims: { sub: user.id } }, (err) => {
        if (err) {
          console.error("Error logging in:", err);
          return res.status(500).json({ message: "Login failed" });
        }

        res.json({
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            emailVerified: user.emailVerified === 1,
            phoneVerified: user.phoneVerified === 1,
            authProvider: user.authProvider,
          },
          message: "Login successful",
        });
      });
    } catch (error: any) {
      console.error("Error in login-email:", error);
      res.status(500).json({ message: error.message || "Failed to log in" });
    }
  });

  app.post('/api/auth/signup-phone', async (req, res) => {
    try {
      const validation = signupPhoneSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validation.error.errors,
        });
      }

      const { phoneNumber, firstName, lastName } = validation.data;

      const existingUser = await storage.getUserByPhoneNumber(phoneNumber);
      if (existingUser) {
        return res.status(400).json({ message: "Phone number already registered" });
      }

      const phoneNumberEncrypted = AuthService.encrypt(phoneNumber);
      const otpCode = AuthService.generateOTP();
      const otpExpiry = AuthService.getOTPExpiryTime();

      const user = await storage.createUser({
        phoneNumber,
        phoneNumberEncrypted,
        firstName,
        lastName,
        authProvider: "phone",
        emailVerified: 0,
        phoneVerified: 0,
        otpCode,
        otpExpiry,
      });

      await AuthService.sendOTP(phoneNumber, otpCode);

      res.json({
        userId: user.id,
        message: "OTP sent to your phone number. Please verify to continue.",
        requiresEmailAttachment: true,
      });
    } catch (error: any) {
      console.error("Error in signup-phone:", error);
      res.status(500).json({ message: error.message || "Failed to sign up" });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const validation = verifyOtpSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validation.error.errors,
        });
      }

      const { phoneNumber, otpCode } = validation.data;

      const user = await storage.getUserByPhoneNumber(phoneNumber);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.otpCode || !user.otpExpiry) {
        return res.status(400).json({ message: "No OTP found. Please request a new one." });
      }

      if (AuthService.isOTPExpired(user.otpExpiry)) {
        return res.status(400).json({ message: "OTP has expired. Please request a new one." });
      }

      if (user.otpCode !== otpCode) {
        return res.status(400).json({ message: "Invalid OTP code" });
      }

      await storage.verifyUserPhone(user.id);

      req.login({ claims: { sub: user.id } }, (err) => {
        if (err) {
          console.error("Error logging in after OTP verification:", err);
          return res.status(500).json({ message: "Verification successful but login failed" });
        }

        res.json({
          user: {
            id: user.id,
            phoneNumber: user.phoneNumber,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneVerified: true,
            emailVerified: user.emailVerified === 1,
            authProvider: user.authProvider,
          },
          message: "Phone verified successfully!",
          requiresEmailAttachment: !user.email,
        });
      });
    } catch (error: any) {
      console.error("Error in verify-otp:", error);
      res.status(500).json({ message: error.message || "Failed to verify OTP" });
    }
  });

  app.post('/api/auth/attach-email', async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Please verify your phone number first" });
      }

      const validation = attachEmailSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validation.error.errors,
        });
      }

      const { email } = validation.data;
      const userId = req.user.claims.sub;

      const existingEmailUser = await storage.getUserByEmail(email);
      if (existingEmailUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const emailEncrypted = AuthService.encrypt(email);
      const verificationToken = AuthService.generateVerificationToken();
      const verificationTokenExpiry = AuthService.getTokenExpiryTime();

      await storage.attachEmailToUser(userId, email, emailEncrypted);
      await storage.updateUserVerificationToken(userId, verificationToken, verificationTokenExpiry);

      const baseUrl = `${req.protocol}://${req.hostname}`;
      await AuthService.sendVerificationEmail(email, verificationToken, baseUrl);

      res.json({
        message: "Email attached successfully! Please check your email to verify.",
      });
    } catch (error: any) {
      console.error("Error in attach-email:", error);
      res.status(500).json({ message: error.message || "Failed to attach email" });
    }
  });

  app.get('/api/auth/verify-email/:token', async (req, res) => {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }

      const user = await storage.getUserByVerificationToken(token);
      
      if (!user) {
        return res.status(404).json({ message: "Invalid or expired verification token" });
      }

      if (!user.verificationToken || user.verificationToken !== token) {
        return res.status(400).json({ message: "Invalid verification token" });
      }

      if (!user.verificationTokenExpiry || AuthService.isTokenExpired(user.verificationTokenExpiry)) {
        return res.status(400).json({ message: "Verification token has expired" });
      }

      await storage.verifyUserEmail(user.id);
      if (user.email) {
        await AuthService.sendWelcomeEmail(user.email, user.firstName || "User");
      }

      res.json({
        message: "Email verified successfully! You can now login.",
      });
    } catch (error: any) {
      console.error("Error in verify-email:", error);
      res.status(500).json({ message: error.message || "Failed to verify email" });
    }
  });

  app.post('/api/auth/resend-otp', async (req, res) => {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      const user = await storage.getUserByPhoneNumber(phoneNumber);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.phoneVerified === 1) {
        return res.status(400).json({ message: "Phone number is already verified" });
      }

      const otpCode = AuthService.generateOTP();
      const otpExpiry = AuthService.getOTPExpiryTime();

      await storage.updateUserOTP(user.id, otpCode, otpExpiry);
      await AuthService.sendOTP(phoneNumber, otpCode);

      res.json({
        message: "New OTP sent to your phone number",
      });
    } catch (error: any) {
      console.error("Error in resend-otp:", error);
      res.status(500).json({ message: error.message || "Failed to resend OTP" });
    }
  });

  app.post('/api/auth/resend-verification-email', async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Please login first" });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || !user.email) {
        return res.status(400).json({ message: "No email found for this account" });
      }

      if (user.emailVerified === 1) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      const verificationToken = AuthService.generateVerificationToken();
      const verificationTokenExpiry = AuthService.getTokenExpiryTime();

      await storage.updateUserVerificationToken(userId, verificationToken, verificationTokenExpiry);

      const baseUrl = `${req.protocol}://${req.hostname}`;
      await AuthService.sendVerificationEmail(user.email, verificationToken, baseUrl);

      res.json({
        message: "Verification email sent successfully",
      });
    } catch (error: any) {
      console.error("Error in resend-verification-email:", error);
      res.status(500).json({ message: error.message || "Failed to resend verification email" });
    }
  });
}
