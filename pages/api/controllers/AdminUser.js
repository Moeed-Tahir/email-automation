const { google } = require('googleapis');
const AdminUser = require('../models/AdminUser');
const connectToDatabase = require('../lib/db');
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
dotenv.config();

const REDIRECT_URI = `${process.env.REQUEST_URL}/api/routes/AdminUser?action=handleAdminCallback`;
console.log("REDIRECT_URI", REDIRECT_URI);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI 
);

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
  });
};

// Admin signup
const adminSignup = async (req, res) => {
  try {
    await connectToDatabase();

    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists'
      });
    }

    // Create new admin
    const adminUser = new AdminUser({
      email,
      password,
      name
    });

    await adminUser.save();

    // Generate token
    const token = generateToken(adminUser.userId, adminUser.email);

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      token,
      user: {
        userId: adminUser.userId,
        email: adminUser.email,
        name: adminUser.name
      }
    });
  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin account'
    });
  }
};

const adminLogin = async (req, res) => {
  try {
    await connectToDatabase();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const adminUser = await AdminUser.findOne({ email });
    if (!adminUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!adminUser.password) {
      return res.status(401).json({
        success: false,
        message: 'Please set up a password first'
      });
    }

    const isPasswordValid = await adminUser.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(adminUser.userId, adminUser.email);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        userId: adminUser.userId,
        email: adminUser.email,
        name: adminUser.name,
        gmailConnected: !!adminUser.gmailAccessToken
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login'
    });
  }
};

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

const startAdminAuth = async (req, res) => {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const state = JSON.stringify({
      timestamp: Date.now(),
      isAdmin: true
    });

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: state,
      include_granted_scopes: true
    });

    res.redirect(url);
  } catch (error) {
    console.error('Admin auth start error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start authentication' 
    });
  }
};

const handleAdminCallback = async (req, res) => {
  try {
    await connectToDatabase();

    const { code, state, error: authError } = req.query;
    
    if (authError) {
      return res.redirect('/admin/login?error=auth_failed');
    }
    
    let parsedState = {};
    if (state) {
      try {
        parsedState = JSON.parse(state);
      } catch (e) {
        console.error('Error parsing state:', e);
      }
    }

    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.refresh_token) {
      throw new Error('No refresh token received - make sure to request offline access');
    }

    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const userEmail = userInfo.data.email;

    if (userEmail !== 'codevdigital.social@gmail.com') {
      console.warn(`Unauthorized login attempt from: ${userEmail}`);
      return res.redirect('/admin/login?error=unauthorized_email');
    }

    let adminUser = await AdminUser.findOne({ email: userEmail });
    
    if (!adminUser) {
      adminUser = new AdminUser({
        email: userEmail,
        name: userInfo.data.name || 'Admin User',
        gmailAccessToken: tokens.access_token,
        gmailRefreshToken: tokens.refresh_token,
        gmailExpiryDate: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null
      });
      
      await adminUser.save();
    } else {
      adminUser.gmailAccessToken = tokens.access_token;
      adminUser.gmailRefreshToken = tokens.refresh_token;
      adminUser.gmailExpiryDate = tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null;
      
      await adminUser.save();
    }

    const token = generateToken(adminUser.userId, adminUser.email);
    
    res.redirect(`/admin/login?gmail_connected=true&token=${token}`);
  } catch (error) {
    console.error('Admin callback error:', error);
    res.redirect('/admin/login?error=auth_failed');
  }
};

const checkGmailStatus = async (req, res) => {
  try {
    await connectToDatabase();
    
    const adminUser = await AdminUser.findOne({ email: 'codevdigital.social@gmail.com' });
    
    if (adminUser && adminUser.gmailAccessToken) {
      const isTokenValid = adminUser.gmailExpiryDate > new Date();
      
      if (isTokenValid) {
        return res.status(200).json({ 
          success: true, 
          status: 'connected',
          email: adminUser.email
        });
      } else {
        return res.status(200).json({ 
          success: true, 
          status: 'expired',
          email: adminUser.email
        });
      }
    } else {
      return res.status(200).json({ 
        success: true, 
        status: 'disconnected' 
      });
    }
  } catch (error) {
    console.error('Check Gmail status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check Gmail status' 
    });
  }
};

const disconnectGmail = async (req, res) => {
  try {
    await connectToDatabase();
    
    const result = await AdminUser.findOneAndUpdate(
      { email: 'codevdigital.social@gmail.com' },
      {
        gmailAccessToken: null,
        gmailRefreshToken: null,
        gmailExpiryDate: null
      },
      { new: true }
    );

    if (result) {
      res.status(200).json({ 
        success: true, 
        message: 'Gmail disconnected successfully' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Admin user not found' 
      });
    }
  } catch (error) {
    console.error('Disconnect Gmail error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to disconnect Gmail' 
    });
  }
};

// Refresh access token
const refreshAccessToken = async (req, res) => {
  try {
    await connectToDatabase();
    
    const adminUser = await AdminUser.findOne({ email: 'codevdigital.social@gmail.com' });
    
    if (!adminUser || !adminUser.gmailRefreshToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'No refresh token available' 
      });
    }

    oauth2Client.setCredentials({
      refresh_token: adminUser.gmailRefreshToken
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    
    const updatedAdmin = await AdminUser.findOneAndUpdate(
      { email: 'codevdigital.social@gmail.com' },
      {
        gmailAccessToken: credentials.access_token,
        gmailExpiryDate: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : null
      },
      { new: true }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Token refreshed successfully' 
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to refresh access token' 
    });
  }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    await connectToDatabase();
    
    const adminUser = await AdminUser.findOne({ email: req.user.email });
    
    if (!adminUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin user not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        email: adminUser.email,
        name: adminUser.name,
        gmailConnected: !!adminUser.gmailAccessToken,
        connectedAt: adminUser.updatedAt
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get admin profile' 
    });
  }
};

const setPassword = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const adminUser = await AdminUser.findOne({ email });
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }
    
    adminUser.password = password;
    await adminUser.save();
    
    res.status(200).json({
      success: true,
      message: 'Password set successfully'
    });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set password'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { currentPassword, newPassword } = req.body;
    const { email } = req.user;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    const adminUser = await AdminUser.findOne({ email });
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }
    
    // Verify current password
    const isPasswordValid = await adminUser.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Set new password
    adminUser.password = newPassword;
    await adminUser.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Verify admin token
const verifyAdminToken = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    await connectToDatabase();
    const adminUser = await AdminUser.findOne({ email: decoded.email });
    
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        userId: adminUser.userId,
        email: adminUser.email,
        name: adminUser.name,
        gmailConnected: !!adminUser.gmailAccessToken
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

module.exports = {
  startAdminAuth,
  handleAdminCallback,
  checkGmailStatus,
  disconnectGmail,
  refreshAccessToken,
  getAdminProfile,
  adminSignup,
  adminLogin,
  verifyToken,
  setPassword,
  changePassword,
  verifyAdminToken
};