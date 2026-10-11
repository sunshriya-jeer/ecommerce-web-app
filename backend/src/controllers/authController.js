import { supabaseAdmin } from '../config/supabase.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { full_name, email, password, confirmPassword } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Sign up the user in Supabase Auth
    // Explicitly enforce role as 'user' to prevent privilege escalation
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        message: authError.message,
      });
    }

    const user = authData.user;
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Registration failed. User could not be created.',
      });
    }

    // Ensure profile record exists with role 'user'
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: user.id,
          full_name,
          email,
          role: 'user', // strictly hardcoded default role
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error during registration:', profileError);
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name,
          role: profile?.role || 'user',
        },
        session: authData.session,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({
        success: false,
        message: authError.message || 'Invalid email or password.',
      });
    }

    const user = authData.user;

    // Fetch user profile from database to get verified role
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // If profile record missing, create default user profile
      const fullName = user.user_metadata?.full_name || 'Customer';
      const { data: newProfile } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          full_name: fullName,
          email: user.email,
          role: 'user',
        })
        .select()
        .single();
      profile = newProfile;
    }

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: profile?.full_name || user.user_metadata?.full_name,
          role: profile?.role || 'user',
        },
        token: authData.session.access_token,
        session: authData.session,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current logged in user and profile
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Current user profile fetched successfully.',
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          full_name: req.userProfile?.full_name,
          role: req.userProfile?.role || 'user',
          created_at: req.userProfile?.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
