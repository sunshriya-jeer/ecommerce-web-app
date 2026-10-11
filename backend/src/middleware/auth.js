import { supabaseAdmin } from '../config/supabase.js';

/**
 * Middleware to authenticate requests via Supabase JWT Bearer token
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token.',
      });
    }

    // Attach basic user info
    req.user = user;

    // Fetch user profile from database to get up-to-date role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // If profile doesn't exist yet, attach fallback
      req.userProfile = {
        id: user.id,
        email: user.email,
        role: 'user',
      };
    } else {
      req.userProfile = profile;
    }

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication verification.',
    });
  }
};

/**
 * Middleware to restrict access to Admins only.
 * Must be used AFTER authenticateUser.
 */
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.userProfile || req.userProfile.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Admin privileges required.',
      });
    }

    next();
  } catch (error) {
    console.error('Admin Middleware Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authorization check.',
    });
  }
};
