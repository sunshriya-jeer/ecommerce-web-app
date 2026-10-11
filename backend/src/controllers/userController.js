import { supabaseAdmin } from '../config/supabase.js';

/**
 * Get all users / profiles (Admin only)
 * GET /api/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID (Admin only or self)
 * GET /api/users/:id
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isSelf = req.user.id === id;
    const isAdmin = req.userProfile?.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
