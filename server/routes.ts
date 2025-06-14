  import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateUser, requireAuth } from "./middleware/auth";
import { checkSubscription } from "./middleware/subscription";
import { trackAnonymousUser, allowAnonymousOrAuth, incrementAnonymousUsage } from "./middleware/anonymous-user";

// Import validation middleware
import { z } from "zod";
// Define validateRequest middleware function here
const validateRequest = (schema: z.ZodType<any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors
        });
      }
      return res.status(500).json({ message: 'Internal server error during validation' });
    }
  };
};
import { generateLatexSchema, SubscriptionTier, REFILL_PACK_CREDITS, REFILL_PACK_PRICE, contactSchema, compileWebhookSchema } from "@shared/schema";
import { generateLatex, getAvailableModels, callProviderWithModel, modifyLatex, rewriteText, generateSummary, generateOutline, generateGlossary, generateFlashcards } from "./services/aiProvider";
import { compileLatex, compileAndFixLatex } from "./services/latexService";
import { stripeService } from "./services/stripeService";
import { stripeSync } from "./services/stripeSync";
import { testPostmarkConnection, generateVerificationToken, sendVerificationEmail, sendContactEmail } from "./utils/email";
import { sendWebhook } from "./utils/webhook";
import Stripe from "stripe";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "../db";

const GUEST_MODE = process.env.GUEST_MODE === 'true';

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing STRIPE_SECRET_KEY, Stripe functionality will be limited');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-04-30.basil" as any, // Using latest API version
    })
  : undefined;

// Add custom request type definition to handle session.userId
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple health check endpoints for deployment
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
  });
  
  // Root health check endpoint (required by some hosting providers)
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });
  
  // Track 404 paths to return correct status codes for SEO
  const notFoundPaths = new Map<string, number>();
  
  // API endpoint to set status code for a path
  app.post('/api/set-status', (req, res) => {
    const status = parseInt(req.query.status as string) || 404;
    const path = req.query.path as string;
    
    if (path && status === 404) {
      // Store this path as a 404 path
      notFoundPaths.set(path, status);
      console.log(`Registered 404 path: ${path}`);
    }
    
    res.status(200).json({ success: true });
  });
  
  // Middleware to check if a path has been registered as a 404
  app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Check if this path has been registered as a 404
    if (notFoundPaths.has(req.path)) {
      console.log(`Serving registered 404 path: ${req.path}`);
      // Set status but continue to next handler to serve SPA
      res.status(404);
    }
    
    next();
  });

  // Enhanced session middleware configuration with maximum reliability
  const PostgresStore = pgSession(session);
  
  // Create the session store
  const sessionStore = new PostgresStore({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,  // Ensure the table exists
    pruneSessionInterval: 60,    // Clean old sessions every minute
    // Lower error threshold for session store errors
    errorLog: console.error
  });
  
  // Set up session with robust configuration
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error('SESSION_SECRET environment variable must be defined');
  }

  app.use(session({
    store: sessionStore,
    secret: sessionSecret,
    resave: true,                   // Always save session with every request
    rolling: true,                  // Reset expiration with each request
    saveUninitialized: false,       // Don't save empty sessions
    // Use the most reliable cookie configuration
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      // Use secure cookies in production
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,               // Prevent JavaScript access
      sameSite: 'lax',             // Allow cross-site requests in specific cases
      path: '/'                     // Ensure cookies are sent with all requests
    },
    name: 'latex.sid'              // Custom name to avoid conflicts
  }));
  
  // Optional session logging middleware for debugging
  const debugSessions = process.env.DEBUG_SESSIONS === 'true';
  if (debugSessions) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method === 'GET' && req.path.startsWith('/api/')) {
        console.log('Session ID:', req.sessionID);
        console.log('Session data:', req.session);
      }
      next();
    });
  }
  // Anonymous user status endpoint
  app.get("/api/anonymous/status", trackAnonymousUser, async (req: Request, res: Response) => {
    try {
      // If user is authenticated, they're not anonymous
      if (req.session.userId) {
        return res.status(200).json({
          isAnonymous: false,
          hasRemainingUsage: false
        });
      }
      
      // Check fingerprint
      const fingerprint = req.headers["x-device-fingerprint"] as string;
      
      if (!fingerprint) {
        return res.status(200).json({
          isAnonymous: true,
          hasRemainingUsage: true, // Default to true if we can't track them
          noFingerprint: true
        });
      }
      
      // Check if anonymous user has remaining usage
      const hasRemainingUsage = await storage.hasRemainingAnonymousUsage(fingerprint);
      
      return res.status(200).json({
        isAnonymous: true,
        hasRemainingUsage
      });
    } catch (error) {
      console.error("Error checking anonymous status:", error);
      return res.status(500).json({ message: "Error checking anonymous status" });
    }
  });

  // Contact form endpoint
  app.post('/api/contact', async (req: Request, res: Response) => {
    try {
      const { name, email, subject = '', message } = contactSchema.parse(req.body);

      const result = await sendContactEmail({
        fromEmail: email,
        name,
        subject,
        message
      });

      if (result.success) {
        return res.status(200).json({ success: true });
      }

      return res.status(500).json({ success: false, message: result.message });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation failed', errors: error.errors });
      }
      console.error('Contact form error:', error);
      return res.status(500).json({ success: false, message: 'Failed to send message' });
    }
  });
  
  // Authentication routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    
    try {
      // Generate verification token
      const verificationToken = await generateVerificationToken();
      
      // Create user with verification token
      const result = await storage.createUser(username, email, password, verificationToken);
      
      if (result.success && result.user) {
        // Send verification email
        const emailResult = await sendVerificationEmail(email, verificationToken);
        
        if (!emailResult.success) {
          console.warn(`Failed to send verification email: ${emailResult.message}`);
          // Continue with registration even if email fails
        }
        
        // Set the user ID in the session
        req.session.userId = result.user.id;
        
        return res.status(201).json({
          user: result.user,
          usageLimit: result.usageLimit,
          emailVerificationSent: emailResult.success
        });
      } else {
        return res.status(400).json({ message: result.error });
      }
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  // Email verification endpoint
  app.get("/api/auth/verify-email", async (req: Request, res: Response) => {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: "Invalid verification token" });
    }
    
    try {
      const result = await storage.verifyUserEmail(token);
      
      if (result.success && result.user) {
        // Set the user ID in the session
        req.session.userId = result.user.id;
        
        return res.status(200).json({
          success: true,
          message: "Email verified successfully",
          user: result.user
        });
      } else {
        return res.status(400).json({ 
          success: false,
          message: result.error || "Email verification failed" 
        });
      }
    } catch (error) {
      console.error("Email verification error:", error);
      return res.status(500).json({ 
        success: false,
        message: "Email verification failed due to server error" 
      });
    }
  });

  // Test Postmark connection endpoint
  app.get("/api/auth/test-email", async (req: Request, res: Response) => {
    try {
      const result = await testPostmarkConnection();
      return res.status(200).json(result);
    } catch (error) {
      console.error("Test email error:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to test email connection" 
      });
    }
  });
  
  // Resend verification email endpoint
  app.post("/api/auth/resend-verification", async (req: Request, res: Response) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    console.log(`Resend verification request for email: ${email}`);
    
    try {
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // For security reasons, still return success even if user doesn't exist
        console.log(`User with email ${email} not found in database`);
        return res.status(200).json({
          success: true,
          message: "If your email is registered, a verification link has been sent"
        });
      }
      
      // If already verified, no need to resend
      if (user.emailVerified) {
        console.log(`User with email ${email} is already verified`);
        return res.status(200).json({
          success: true,
          message: "Your email is already verified, please log in"
        });
      }
      
      console.log(`Generating new verification token for user: ${user.id}`);
      // Generate new verification token
      const verificationToken = await generateVerificationToken();
      
      // Update user with new token
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      const updatedUser = await storage.updateUserVerificationToken(user.id, verificationToken, tokenExpiry);
      
      if (!updatedUser) {
        return res.status(500).json({
          success: false,
          message: "Failed to update verification token"
        });
      }
      
      // Send verification email
      const emailResult = await sendVerificationEmail(email, verificationToken);
      
      return res.status(200).json({
        success: true,
        message: "Verification email has been sent",
        emailSent: emailResult.success
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to resend verification email"
      });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    try {
      const result = await storage.validateUser(email, password);
      
      if (result.success && result.user) {
        // Check if email is verified
        if (!result.user.emailVerified) {
          return res.status(403).json({ 
            message: "Please verify your email before logging in",
            requiresEmailVerification: true
          });
        }
        
        // Set the user ID in the session
        req.session.userId = result.user.id;
        
        // Explicitly save the session to ensure it's persisted
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ message: "Failed to save session" });
          }
          
          // Set a cookie with a 30-day expiration
          res.cookie('userLoggedIn', 'true', { 
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: false, // Allow JavaScript access
            path: '/',
            sameSite: 'lax'
          });
          
          console.log(`User ${result.user.username} logged in successfully, session ID saved`);
          
          return res.status(200).json({
            user: result.user,
            usageLimit: result.usageLimit
          });
        });
      } else {
        return res.status(401).json({ message: result.error || "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    // Clear the backup cookie first
    res.clearCookie('userLoggedIn', { 
      path: '/', 
      httpOnly: false 
    });
    
    // Then destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      
      // Clear the session cookie
      res.clearCookie("latex.sid", { 
        path: '/' 
      });
      
      console.log("User logged out successfully, session destroyed");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", authenticateUser, async (req: Request, res: Response) => {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUserById(userId);
      
      if (!user) {
        console.log(`User with ID ${userId} not found in database`);
        // Clear invalid session
        req.session.userId = undefined;
        return res.status(404).json({ message: "User not found" });
      }
      
      const usageLimit = await storage.getUserUsageLimit(user);
      
      return res.status(200).json({
        user,
        usageLimit
      });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // LaTeX Generation Routes
  app.post("/api/latex/generate", 
    trackAnonymousUser, // Track anonymous users before checking authentication
    allowAnonymousOrAuth, // Allow anonymous users with remaining free usage or authenticated users
    checkSubscription, // Check subscription for authenticated users
    validateRequest(generateLatexSchema),
    async (req: Request, res: Response) => {
      const { content, documentType, options } = req.body;
      const userId = req.session.userId; // May be undefined for anonymous users
      const isAuthenticated = !!userId; // Check if user is authenticated
      const shouldCompile = req.body.compile === true; // Optional flag to compile or not
      
      // For anonymous users, increment their usage count
      if (!isAuthenticated) {
        await incrementAnonymousUsage(req);
      }
      
      try {
        console.log(`LaTeX generation request - Auth: ${isAuthenticated ? 'Yes' : 'No (Guest)'}, Type: ${documentType}`);
        
        // Generate LaTeX using AI
        const latexResult = await generateLatex(content, documentType, options);
        
        if (!latexResult.success) {
          return res.status(500).json({ message: latexResult.error });
        }
        
        // Default empty compilation result
        let compilationResult = {
          success: false,
          pdf: null,
          error: null,
          errorDetails: null
        };
        
        // Only compile if explicitly requested
        if (shouldCompile) {
          console.log("Compiling LaTeX (requested)");
          compilationResult = await compileLatex(latexResult.latex);
        }
        
        // Only track usage and save document if user is authenticated
        let documentId;
        
        if (isAuthenticated) {
          // Increment usage counter for the user
          await storage.incrementUserUsage(userId);
          
          // Save the document
          const document = await storage.saveDocument({
            userId,
            title: getDocumentTitle(content),
            inputContent: content,
            latexContent: latexResult.latex,
            documentType,
            compilationSuccessful: shouldCompile ? compilationResult.success : false,
            compilationError: shouldCompile ? (compilationResult.error || null) : null
          });
          
          documentId = document.id;
        }
        
        return res.status(200).json({
          latex: latexResult.latex,
          compilationResult,
          documentId
        });
      } catch (error) {
        console.error("LaTeX generation error:", error);
        return res.status(500).json({ message: "Failed to generate LaTeX" });
      }
    }
  );

  app.post("/api/latex/compile", 
    authenticateUser, // Allow guest users 
    async (req: Request, res: Response) => {
      const { latex } = req.body;
      const isAuthenticated = !!req.session.userId;
      
      console.log(`LaTeX compilation request - Auth: ${isAuthenticated ? 'Yes' : 'No (Guest)'}`);
      
      if (!latex) {
        return res.status(400).json({ message: "LaTeX content is required" });
      }
      
      try {
        const compilationResult = await compileLatex(latex);
        
        return res.status(200).json({
          latex,
          compilationResult
        });
      } catch (error) {
        console.error("LaTeX compilation error:", error);
        return res.status(500).json({ message: "Failed to compile LaTeX" });
      }
    }
  );

  app.post('/api/latex/compile/webhook',
    authenticateUser,
    validateRequest(compileWebhookSchema),
    async (req: Request, res: Response) => {
      const { latex, webhookUrl } = req.body as { latex: string; webhookUrl: string };

      // Run compilation asynchronously and notify via webhook
      compileLatex(latex).then((result) => {
        sendWebhook(webhookUrl, result);
      }).catch((err) => {
        console.error('Async compilation error:', err);
        sendWebhook(webhookUrl, { success: false, error: 'Internal error during compilation' });
      });

      res.status(202).json({ message: 'Compilation started, webhook will receive result' });
    }
  );

  app.post("/api/latex/compile/fix", 
    authenticateUser,
    async (req: Request, res: Response) => {
      const { latex, errorDetails } = req.body;
      
      if (!latex) {
        return res.status(400).json({ message: "LaTeX content is required" });
      }
      
      try {
        const result = await compileAndFixLatex(latex, errorDetails);
        
        return res.status(200).json({
          latex: result.fixedLatex,
          compilationResult: result.compilationResult
        });
      } catch (error) {
        console.error("LaTeX fix error:", error);
        return res.status(500).json({ message: "Failed to fix LaTeX" });
      }
    }
  );
  
  // New endpoint for modifying existing LaTeX with notes or omissions
  app.post("/api/latex/modify",
    trackAnonymousUser, // Track anonymous users before checking authentication
    allowAnonymousOrAuth, // Allow anonymous users with remaining free usage or authenticated users
    checkSubscription, // Check subscription for authenticated users
    async (req: Request, res: Response) => {
      const { latex, notes, isOmit } = req.body;
      const userId = req.session.userId;
      const isAuthenticated = !!userId;
      
      if (!latex) {
        return res.status(400).json({ message: "LaTeX content is required" });
      }
      
      if (!notes) {
        return res.status(400).json({ message: "Modification notes are required" });
      }
      
      try {
        console.log(`LaTeX modification request - Auth: ${isAuthenticated ? 'Yes' : 'No (Anonymous)'}, OMIT mode: ${isOmit}`);
        
        // For anonymous users, increment their usage count
        if (!isAuthenticated) {
          await incrementAnonymousUsage(req);
        }
        
        // Call the modifyLatex function to process the request
        const result = await modifyLatex(latex, notes, isOmit);
        
        if (!result.success) {
          return res.status(500).json({ message: result.error });
        }
        
        // Count this as a generation for usage tracking (authenticated users only)
        if (isAuthenticated && userId) {
          await storage.incrementUserUsage(userId);
        }
        
        return res.status(200).json({
          latex: result.latex,
          compilationResult: {
            success: false,
            pdf: null,
            error: null,
            errorDetails: null
          }
        });
      } catch (error) {
        console.error("LaTeX modification error:", error);
        return res.status(500).json({ 
          message: "Failed to modify LaTeX",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  );

  // Endpoint to rewrite text using Groq to make it less detectable as AI
  app.post(
    "/api/undetectable/rewrite",
    trackAnonymousUser,
    allowAnonymousOrAuth,
    checkSubscription,
    async (req: Request, res: Response) => {
      const { text } = req.body;
      const userId = req.session.userId;
      const isAuthenticated = !!userId;

      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      try {
        if (!isAuthenticated) {
          await incrementAnonymousUsage(req);
        }

        const result = await rewriteText(text);

        if (!result.success) {
          return res.status(500).json({ message: result.error });
        }

        if (isAuthenticated && userId) {
          await storage.incrementUserUsage(userId);
        }

        return res.status(200).json({ text: result.text });
      } catch (error) {
        console.error("Rewrite text error:", error);
        return res.status(500).json({ message: "Failed to rewrite text" });
      }
    }
  );

  // Groq niche feature endpoints
  app.post(
    "/api/groq/summarize",
    trackAnonymousUser,
    allowAnonymousOrAuth,
    checkSubscription,
    async (req: Request, res: Response) => {
      const { text } = req.body;
      const userId = req.session.userId;
      const isAuthenticated = !!userId;

      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      try {
        if (!isAuthenticated) {
          await incrementAnonymousUsage(req);
        }

        const result = await generateSummary(text);

        if (!result.success) {
          return res.status(500).json({ message: result.error });
        }

        if (isAuthenticated && userId) {
          await storage.incrementUserUsage(userId);
        }

        return res.status(200).json({ summary: result.summary });
      } catch (error) {
        console.error("Summary error:", error);
        return res.status(500).json({ message: "Failed to generate summary" });
      }
    }
  );

  app.post(
    "/api/groq/outline",
    trackAnonymousUser,
    allowAnonymousOrAuth,
    checkSubscription,
    async (req: Request, res: Response) => {
      const { text } = req.body;
      const userId = req.session.userId;
      const isAuthenticated = !!userId;

      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      try {
        if (!isAuthenticated) {
          await incrementAnonymousUsage(req);
        }

        const result = await generateOutline(text);

        if (!result.success) {
          return res.status(500).json({ message: result.error });
        }

        if (isAuthenticated && userId) {
          await storage.incrementUserUsage(userId);
        }

        return res.status(200).json({ outline: result.outline });
      } catch (error) {
        console.error("Outline error:", error);
        return res.status(500).json({ message: "Failed to generate outline" });
      }
    }
  );

  app.post(
    "/api/groq/glossary",
    trackAnonymousUser,
    allowAnonymousOrAuth,
    checkSubscription,
    async (req: Request, res: Response) => {
      const { text } = req.body;
      const userId = req.session.userId;
      const isAuthenticated = !!userId;

      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      try {
        if (!isAuthenticated) {
          await incrementAnonymousUsage(req);
        }

        const result = await generateGlossary(text);

        if (!result.success) {
          return res.status(500).json({ message: result.error });
        }

        if (isAuthenticated && userId) {
          await storage.incrementUserUsage(userId);
        }

        return res.status(200).json({ glossary: result.glossary });
      } catch (error) {
        console.error("Glossary error:", error);
        return res.status(500).json({ message: "Failed to generate glossary" });
      }
    }
  );

  app.post(
    "/api/groq/flashcards",
    trackAnonymousUser,
    allowAnonymousOrAuth,
    checkSubscription,
    async (req: Request, res: Response) => {
      const { text } = req.body;
      const userId = req.session.userId;
      const isAuthenticated = !!userId;

      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      try {
        if (!isAuthenticated) {
          await incrementAnonymousUsage(req);
        }

        const result = await generateFlashcards(text);

        if (!result.success) {
          return res.status(500).json({ message: result.error });
        }

        if (isAuthenticated && userId) {
          await storage.incrementUserUsage(userId);
        }

        return res.status(200).json({ flashcards: result.flashcards });
      } catch (error) {
        console.error("Flashcards error:", error);
        return res.status(500).json({ message: "Failed to generate flashcards" });
      }
    }
  );

  // Document routes
  app.get("/api/documents", 
    requireAuth,
    async (req: Request, res: Response) => {
      const userId = req.session.userId;
      
      try {
        const documents = await storage.getUserDocuments(userId);
        return res.status(200).json(documents);
      } catch (error) {
        console.error("Get documents error:", error);
        return res.status(500).json({ message: "Failed to get documents" });
      }
    }
  );

  app.get("/api/documents/:id", 
    requireAuth,
    async (req: Request, res: Response) => {
      const documentId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      try {
        const document = await storage.getDocumentById(documentId);
        
        if (!document) {
          return res.status(404).json({ message: "Document not found" });
        }
        
        if (document.userId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
        
        return res.status(200).json(document);
      } catch (error) {
        console.error("Get document error:", error);
        return res.status(500).json({ message: "Failed to get document" });
      }
    }
  );

  app.get("/api/documents/:id/pdf", 
    requireAuth,
    async (req: Request, res: Response) => {
      const documentId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      try {
        const document = await storage.getDocumentById(documentId);
        
        if (!document) {
          return res.status(404).json({ message: "Document not found" });
        }
        
        if (document.userId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
        
        if (!document.compilationSuccessful) {
          return res.status(400).json({ message: "Document has not been successfully compiled" });
        }
        
        // Compile the LaTeX to get the PDF
        const compilationResult = await compileLatex(document.latexContent);
        
        if (!compilationResult.success) {
          return res.status(500).json({ message: "Failed to compile LaTeX" });
        }
        
        return res.status(200).json({
          pdf: compilationResult.pdf
        });
      } catch (error) {
        console.error("Get document PDF error:", error);
        return res.status(500).json({ message: "Failed to get document PDF" });
      }
    }
  );

  app.post("/api/documents", 
    requireAuth,
    async (req: Request, res: Response) => {
      const userId = req.session.userId;
      const { title, inputContent, latexContent, documentType, compilationSuccessful, compilationError } = req.body;
      
      try {
        const document = await storage.saveDocument({
          userId,
          title,
          inputContent,
          latexContent,
          documentType,
          compilationSuccessful,
          compilationError
        });
        
        return res.status(201).json(document);
      } catch (error) {
        console.error("Save document error:", error);
        return res.status(500).json({ message: "Failed to save document" });
      }
    }
  );

  app.patch("/api/documents/:id", 
    requireAuth,
    async (req: Request, res: Response) => {
      const documentId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      try {
        const existingDocument = await storage.getDocumentById(documentId);
        
        if (!existingDocument) {
          return res.status(404).json({ message: "Document not found" });
        }
        
        if (existingDocument.userId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
        
        const { title, inputContent, latexContent, documentType, compilationSuccessful, compilationError } = req.body;
        
        const updatedDocument = await storage.updateDocument(documentId, {
          title,
          inputContent,
          latexContent,
          documentType,
          compilationSuccessful,
          compilationError
        });
        
        return res.status(200).json(updatedDocument);
      } catch (error) {
        console.error("Update document error:", error);
        return res.status(500).json({ message: "Failed to update document" });
      }
    }
  );

  app.delete("/api/documents/:id", 
    requireAuth,
    async (req: Request, res: Response) => {
      const documentId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      try {
        const document = await storage.getDocumentById(documentId);
        
        if (!document) {
          return res.status(404).json({ message: "Document not found" });
        }
        
        if (document.userId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
        
        await storage.deleteDocument(documentId);
        
        return res.status(200).json({ message: "Document deleted successfully" });
      } catch (error) {
        console.error("Delete document error:", error);
        return res.status(500).json({ message: "Failed to delete document" });
      }
    }
  );

  // Subscription routes
  app.post("/api/subscription/create", 
    requireAuth,
    async (req: Request, res: Response) => {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const { tier } = req.body;
      const userId = req.session.userId;
      
      try {
        const user = await storage.getUserById(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Create success and cancel URLs for redirect after checkout
        const successUrl = `${req.protocol}://${req.get('host')}/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${req.protocol}://${req.get('host')}/account`;
        
        // Create a checkout session
        const session = await stripeService.createSubscriptionSession(
          userId, 
          tier, 
          successUrl, 
          cancelUrl
        );
        
        // Return session URL for redirect
        return res.status(200).json({
          sessionId: session.id,
          url: session.url
        });
      } catch (error) {
        console.error("Create subscription error:", error);
        return res.status(500).json({ message: "Failed to create subscription" });
      }
    }
  );

  app.post("/api/subscription/cancel", 
    requireAuth,
    async (req: Request, res: Response) => {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const userId = req.session.userId;
      
      try {
        const user = await storage.getUserById(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        if (!user.stripeSubscriptionId) {
          return res.status(400).json({ message: "No active subscription found" });
        }
        
        // Cancel the subscription at the end of the current period
        await stripe.subscriptions.update(user.stripeSubscriptionId, {
          cancel_at_period_end: true
        });
        
        return res.status(200).json({
          success: true,
          message: "Your subscription has been cancelled and will end at the end of the billing period."
        });
      } catch (error) {
        console.error("Cancel subscription error:", error);
        return res.status(500).json({ message: "Failed to cancel subscription" });
      }
    }
  );

  app.post("/api/subscription/portal", 
    requireAuth,
    async (req: Request, res: Response) => {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const userId = req.session.userId;
      
      try {
        const user = await storage.getUserById(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        if (!user.stripeCustomerId) {
          return res.status(400).json({ message: "No Stripe customer found" });
        }
        
        // Create a return URL for after the customer finishes in the portal
        const returnUrl = `${req.protocol}://${req.get('host')}/account`;
        
        // Create a billing portal session
        const session = await stripe.billingPortal.sessions.create({
          customer: user.stripeCustomerId,
          return_url: returnUrl
        });
        
        return res.status(200).json({ url: session.url });
      } catch (error) {
        console.error("Create portal session error:", error);
        return res.status(500).json({ message: "Failed to create portal session" });
      }
    }
  );
  
  // Create payment intent for refill pack
  app.post("/api/subscription/refill/create", 
    requireAuth,
    async (req: Request, res: Response) => {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const userId = req.session.userId;
      
      try {
        const user = await storage.getUserById(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Only allow paid subscribers to purchase refill packs
        if (user.subscriptionTier === SubscriptionTier.Free) {
          return res.status(403).json({ 
            message: "Refill packs are only available for paid subscribers. Please upgrade to a paid plan first." 
          });
        }
        
        // Create a payment intent for the refill pack
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(REFILL_PACK_PRICE * 100), // Convert to cents
          currency: "usd",
          customer: user.stripeCustomerId,
          metadata: {
            userId: userId.toString(),
            type: "refill_pack",
            credits: REFILL_PACK_CREDITS.toString()
          }
        });
        
        return res.status(200).json({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        console.error("Error creating refill payment intent:", error);
        return res.status(500).json({ message: "Failed to create payment intent" });
      }
    }
  );
  
  // Process refill pack purchase webhook
  app.post("/api/subscription/refill", 
    requireAuth,
    async (req: Request, res: Response) => {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const userId = req.session.userId;
      const quantity = req.body.quantity || 1;
      
      try {
        const user = await storage.getUserById(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Only allow paid subscribers to purchase refill packs
        if (user.subscriptionTier === SubscriptionTier.Free) {
          return res.status(403).json({ 
            message: "Refill packs are only available for paid subscribers. Please upgrade to a paid plan first." 
          });
        }
        
        // Create success and cancel URLs for redirect after checkout
        const successUrl = `${req.protocol}://${req.get('host')}/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${req.protocol}://${req.get('host')}/account`;
        
        // Create a checkout session for the refill pack
        const session = await stripeService.createRefillSession(
          userId,
          successUrl,
          cancelUrl
        );
        
        return res.status(200).json({
          sessionId: session.id,
          url: session.url
        });
      } catch (error) {
        console.error("Create refill pack checkout error:", error);
        return res.status(500).json({ message: "Failed to create checkout session for refill pack" });
      }
    }
  );

  // Stripe webhook - must be defined before any other routes that use body parsing
  app.post("/webhook/stripe", 
    express.raw({ type: 'application/json' }),
    async (req: Request, res: Response) => {
      try {
        console.log('🔔 Received Stripe webhook request');
        
        if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
          console.error('❌ Webhook error: Stripe is not fully configured');
          return res.status(500).json({ message: "Stripe is not fully configured" });
        }
        
        const sig = req.headers['stripe-signature'] as string;
        if (!sig) {
          console.error('❌ Webhook error: No Stripe signature in headers');
          return res.status(400).send('Webhook Error: No Stripe signature provided');
        }
        
        // The raw body must be a Buffer for the Stripe signature verification to work
        if (!Buffer.isBuffer(req.body)) {
          console.error('❌ Webhook error: req.body is not a Buffer, type:', typeof req.body);
          return res.status(400).send('Webhook Error: req.body must be a Buffer');
        }
        
        console.log(`💡 Attempting to verify webhook signature with secret: ${process.env.STRIPE_WEBHOOK_SECRET.substring(0, 8)}...`);
        
        const event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
        
        console.log(`✅ Webhook verified and received: ${event.type}`);
        console.log(`📦 Event data: ${JSON.stringify(event.data.object).substring(0, 200)}...`);
        
        // Handle different webhook events using our stripeService
        if (event.type.startsWith('customer.subscription.')) {
          console.log(`🔄 Processing subscription event: ${event.type}`);
          // Handle subscription events
          const result = await stripeService.handleSubscriptionEvent(event);
          console.log(`✅ Subscription event processed:`, result);
        } else if (event.type === 'checkout.session.completed') {
          console.log(`💰 Processing checkout completion event`);
          // Handle checkout completion (refill packs)
          const result = await stripeService.handleCheckoutCompleted(event);
          console.log(`✅ Checkout event processed:`, result);
        } else {
          console.log(`ℹ️ Ignoring unhandled event type: ${event.type}`);
        }
        
        res.json({ received: true });
      } catch (err) {
        console.error('❌ Webhook error:', err);
        return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  );

  // API route for syncing user subscription with Stripe
  app.post("/api/stripe/sync-subscription", 
    authenticateUser,
    async (req: Request, res: Response) => {
      try {
        const userId = req.session.userId;
        if (!userId) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        
        // First, sync the user to Stripe to ensure we have a customer
        const customerSync = await stripeSync.syncUserToStripe(userId);
        
        if (!customerSync.success) {
          return res.status(500).json({ 
            message: "Failed to sync user with Stripe", 
            error: customerSync.message
          });
        }
        
        // Then sync their subscriptions
        const subscriptionSync = await stripeSync.syncUserSubscriptions(userId);
        
        // Return user data with fresh subscription info
        const user = await storage.getUserById(userId);
        const usageLimit = await storage.getUserUsageLimit(user);
        
        return res.status(200).json({
          success: true,
          message: subscriptionSync.message,
          user,
          usageLimit,
          tierUpdated: subscriptionSync.tierUpdated
        });
      } catch (error) {
        console.error("Sync subscription error:", error);
        return res.status(500).json({ message: "Failed to sync subscription", error: String(error) });
      }
    }
  );

  // API route for available AI models
  app.get("/api/models", 
    authenticateUser,
    async (req: Request, res: Response) => {
      try {
        const userId = req.session.userId;
        const user = await storage.getUserById(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        const models = await getAvailableModels(user.subscriptionTier);
        
        return res.status(200).json(models);
      } catch (error) {
        console.error("Get models error:", error);
        return res.status(500).json({ message: "Failed to get available models" });
      }
    }
  );

  // Extract title from LaTeX content using AI
  app.post("/api/latex/extract-title", 
    authenticateUser,
    async (req: Request, res: Response) => {
      try {
        const { latex } = req.body;
        
        if (!latex) {
          return res.status(400).json({ message: "LaTeX content is required" });
        }
        
        // Always use AI to generate a title without relying on heuristics
        // Determine which AI provider to use
        const userId = req.session.userId;
        let provider = "groq"; // Default to Groq as it's efficient and cost-effective
          
        if (userId) {
          const user = await storage.getUserById(userId);
          if (user) {
            // Use a provider based on user's subscription tier
            // For now just use Groq
            provider = "groq";
          }
        }
        
        // Generate a meaningful title based on the LaTeX content
        try {
          // Improved prompt focusing on key concepts and meaningful title generation
          const prompt = `Analyze this LaTeX document content and generate a concise, meaningful title (3-7 words) that captures its core subject matter.
          
Your title should be descriptive, academically appropriate, and directly relevant to the content. 
Avoid generic titles like "Assignment" or "Document". Focus on identifying the main theme or research topic.

Return ONLY the title with no quotes, explanations, or additional formatting:

${latex.substring(0, 5000)}`;  // Limit content to avoid token overflow
          
          // Use our existing AI provider interface
          const generatedTitle = await callProviderWithModel(`${provider}/llama3-8b-8192`, prompt);
          
          // Clean up the title (remove quotes, line breaks, etc.)
          let title = generatedTitle
            .replace(/["'`]/g, '')  // Remove quotes
            .replace(/\\n|\\r/g, '') // Remove line breaks
            .replace(/^Title:\s*/i, '')  // Remove "Title:" prefix
            .replace(/\\LaTeX|\\TeX/g, 'LaTeX') // Fix LaTeX command formatting
            .replace(/^\s+|\s+$/g, '')  // Trim whitespace
            .substring(0, 100);  // Limit length
          
          // Use default if we got an empty title
          if (!title || title.length < 3) {
            // Try to extract from LaTeX as fallback
            title = extractTitleFromLatex(latex);
          }
          
          return res.status(200).json({ title });
        } catch (error) {
          console.error("Error generating title with AI:", error);
          
          // Fall back to heuristic extraction
          const title = extractTitleFromLatex(latex);
          return res.status(200).json({ title });
        }
      } catch (error) {
        console.error("Title extraction error:", error);
        return res.status(500).json({ 
          message: "Failed to extract title", 
          title: "Generated Document"  // Provide fallback
        });
      }
    }
  );

  // Community forum routes
  app.get("/api/posts", authenticateUser, async (req: Request, res: Response) => {
    try {
      const posts = await storage.getAllPosts();
      return res.status(200).json(posts);
    } catch (error) {
      console.error("Get posts error:", error);
      return res.status(500).json({ message: "Failed to get posts" });
    }
  });

  app.post("/api/posts", requireAuth, async (req: Request, res: Response) => {
    try {
      const { title, content } = insertPostSchema.parse(req.body);
      const post = await storage.createPost({
        userId: req.session.userId,
        title,
        content,
      });
      return res.status(201).json(post);
    } catch (error) {
      console.error("Create post error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation failed", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.post("/api/posts/:id/upvote", requireAuth, async (req: Request, res: Response) => {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    try {
      await storage.addPostUpvote(req.session.userId, postId);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Upvote error:", error);
      return res.status(500).json({ message: "Failed to upvote" });
    }
  });

  // Showcase gallery routes
  app.get("/api/showcase", authenticateUser, async (_req: Request, res: Response) => {
    try {
      const entries = await storage.getShowcaseEntries();
      return res.status(200).json(entries);
    } catch (error) {
      console.error("Get showcase error:", error);
      return res.status(500).json({ message: "Failed to get showcase" });
    }
  });

  app.post("/api/showcase", requireAuth, async (req: Request, res: Response) => {
    try {
      const { documentId, title } = req.body as { documentId: number; title?: string };
      if (!documentId) {
        return res.status(400).json({ message: "documentId is required" });
      }
      const entry = await storage.createShowcaseEntry({ userId: req.session.userId, documentId, title });
      return res.status(201).json(entry);
    } catch (error) {
      console.error("Create showcase error:", error);
      return res.status(500).json({ message: "Failed to add to showcase" });
    }
  });

  // Helper function to extract title from LaTeX content using heuristics
  function extractTitleFromLatex(latex: string): string {
    // Try various patterns to find the title in the LaTeX code
    const patterns = [
      /\\title\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/,      // \title{...} command
      /\\begin\{document\}[\s\S]*?\\section\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/, // First section after begin{document}
      /\\begin\{document\}[\s\S]*?\\chapter\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/, // First chapter after begin{document}
      /\\maketitle[\s\S]*?\\section\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/,         // First section after maketitle
    ];
    
    for (const pattern of patterns) {
      const match = latex.match(pattern);
      if (match && match[1] && match[1].trim()) {
        let title = match[1].trim();
        
        // Remove LaTeX commands from the title
        title = title.replace(/\\[a-zA-Z]+(\{[^{}]*\}|\[[^[\]]*\])?/g, '');
        title = title.replace(/[\\\{\}]/g, '');
        
        return title.trim() || "Untitled Document";
      }
    }
    
    return "Untitled Document";
  }
  
  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to extract a title from content
function getDocumentTitle(content: string): string {
  // Try to find a heading or title in the content
  const titleMatch = content.match(/^#\s+(.+)$/m) || 
                    content.match(/^Title:\s*(.+)$/mi) ||
                    content.match(/^(.{1,50})/);
  
  if (titleMatch && titleMatch[1].trim()) {
    return titleMatch[1].trim();
  }
  
  return "Untitled Document";
}
