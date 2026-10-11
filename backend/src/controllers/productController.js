import { supabaseAdmin } from '../config/supabase.js';

/**
 * Get all products with optional filtering, search, and sorting
 * GET /api/products
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;

    let query = supabaseAdmin.from('products').select('*');

    if (category && category.trim().toLowerCase() !== 'all') {
      query = query.ilike('category', category.trim());
    }

    if (search && search.trim()) {
      const term = search.trim();
      query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`);
    }

    if (sort === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price-desc') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: products, error } = await query;

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product by ID
 * GET /api/products/:id
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new product (Admin only)
 * POST /api/products
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, image_url, stock } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Product name is required.',
      });
    }

    if (price === undefined || isNaN(price) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Product price must be a valid non-negative number.',
      });
    }

    if (!category || category.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category is required.',
      });
    }

    if (stock === undefined || isNaN(stock) || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a non-negative integer.',
      });
    }

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: name.trim(),
        description: description?.trim() || '',
        price: Number(price),
        category: category.trim(),
        image_url: image_url?.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        stock: parseInt(stock, 10),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product (Admin only)
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image_url, stock } = req.body;

    // Check if product exists
    const { data: existingProduct, error: checkError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) {
      if (name.trim() === '') return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
      updates.name = name.trim();
    }
    if (description !== undefined) updates.description = description.trim();
    if (price !== undefined) {
      if (isNaN(price) || Number(price) < 0) return res.status(400).json({ success: false, message: 'Price must be positive.' });
      updates.price = Number(price);
    }
    if (category !== undefined) {
      if (category.trim() === '') return res.status(400).json({ success: false, message: 'Category cannot be empty.' });
      updates.category = category.trim();
    }
    if (image_url !== undefined) updates.image_url = image_url.trim();
    if (stock !== undefined) {
      if (isNaN(stock) || Number(stock) < 0) return res.status(400).json({ success: false, message: 'Stock must be non-negative.' });
      updates.stock = parseInt(stock, 10);
    }

    const { data: updated, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product (Admin only)
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
