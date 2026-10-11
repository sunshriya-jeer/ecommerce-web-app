import { supabaseAdmin } from '../config/supabase.js';

/**
 * Place a new order
 * POST /api/orders
 */
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      items,
      payment_method,
      shipping_name,
      shipping_email,
      shipping_phone,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_pincode,
    } = req.body;

    // Validate request body
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required and cannot be empty.',
      });
    }

    if (!payment_method || !['Cash on Delivery', 'Demo Payment'].includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Allowed: "Cash on Delivery", "Demo Payment".',
      });
    }

    if (
      !shipping_name ||
      !shipping_email ||
      !shipping_phone ||
      !shipping_address ||
      !shipping_city ||
      !shipping_state ||
      !shipping_pincode
    ) {
      return res.status(400).json({
        success: false,
        message: 'All shipping address fields are required.',
      });
    }

    // Fetch products to verify stock and price securely
    const productIds = items.map((i) => i.product_id);
    const { data: dbProducts, error: prodError } = await supabaseAdmin
      .from('products')
      .select('*')
      .in('id', productIds);

    if (prodError || !dbProducts) {
      throw new Error('Failed to retrieve product details for order verification.');
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let calculatedTotal = 0;
    const orderItemsToInsert = [];
    const stockUpdates = [];

    for (const item of items) {
      const product = productMap.get(item.product_id);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.product_id} no longer exists.`,
        });
      }

      const requestedQty = parseInt(item.quantity, 10);
      if (isNaN(requestedQty) || requestedQty <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product "${product.name}".`,
        });
      }

      if (product.stock < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
        });
      }

      const itemTotal = Number(product.price) * requestedQty;
      calculatedTotal += itemTotal;

      orderItemsToInsert.push({
        product_id: product.id,
        quantity: requestedQty,
        price: Number(product.price),
      });

      stockUpdates.push({
        id: product.id,
        newStock: product.stock - requestedQty,
      });
    }

    // 3. Insert Order with sanitized diagnostics
    const reqCorrelationId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.log(`[Diagnostic ${reqCorrelationId}] Step 1/3: Attempting INSERT into public.orders`);

    const { data: order, error: orderError, status: orderHttpStatus } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: calculatedTotal,
        status: 'Placed',
        payment_method,
        shipping_name: shipping_name.trim(),
        shipping_email: shipping_email.trim(),
        shipping_phone: shipping_phone.trim(),
        shipping_address: shipping_address.trim(),
        shipping_city: shipping_city.trim(),
        shipping_state: shipping_state.trim(),
        shipping_pincode: shipping_pincode.trim(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error(`[Diagnostic ${reqCorrelationId}] FAILED INSERT public.orders:`, {
        table: 'orders',
        httpStatus: orderHttpStatus,
        pgCode: orderError.code,
        message: orderError.message,
        hint: orderError.hint,
      });
      throw orderError;
    }

    console.log(`[Diagnostic ${reqCorrelationId}] Step 1/3 SUCCESS: Created order`);

    // 4. Insert Order Items with sanitized diagnostics
    console.log(`[Diagnostic ${reqCorrelationId}] Step 2/3: Attempting INSERT into public.order_items (${orderItemsToInsert.length} items)`);
    const itemsWithOrderId = orderItemsToInsert.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsInsertError, status: itemsHttpStatus } = await supabaseAdmin
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsInsertError) {
      console.error(`[Diagnostic ${reqCorrelationId}] FAILED INSERT public.order_items:`, {
        table: 'order_items',
        httpStatus: itemsHttpStatus,
        pgCode: itemsInsertError.code,
        message: itemsInsertError.message,
        hint: itemsInsertError.hint,
      });
      // Clean up orphaned parent order to preserve database integrity
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      throw itemsInsertError;
    }

    console.log(`[Diagnostic ${reqCorrelationId}] Step 2/3 SUCCESS: Inserted order items`);

    // 5. Decrement product stock in database
    console.log(`[Diagnostic ${reqCorrelationId}] Step 3/3: Decrementing inventory stock`);
    for (const update of stockUpdates) {
      const { error: stockError, status: stockHttpStatus } = await supabaseAdmin
        .from('products')
        .update({
          stock: update.newStock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', update.id);

      if (stockError) {
        console.error(`[Diagnostic ${reqCorrelationId}] Stock update warning:`, {
          table: 'products',
          httpStatus: stockHttpStatus,
          pgCode: stockError.code,
          message: stockError.message,
        });
      }
    }

    console.log(`[Diagnostic ${reqCorrelationId}] Complete order workflow succeeded`);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: {
        order_id: order.id,
        total_amount: order.total_amount,
        status: order.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get orders placed by current logged in user
 * GET /api/orders/my-orders
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          product_id,
          products (
            id,
            name,
            image_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single order by ID (Accessible by order owner or Admin)
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.userProfile?.role === 'admin';

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          product_id,
          products (
            id,
            name,
            image_url,
            category
          )
        ),
        profiles:user_id (
          id,
          full_name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Security check: order must belong to user or requester must be admin
    if (order.user_id !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this order.',
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders (Admin only)
 * GET /api/orders
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          product_id,
          products (
            name,
            image_url
          )
        ),
        profiles:user_id (
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'All') {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (Admin only)
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    const { data: updatedOrder, error } = await supabaseAdmin
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or update failed.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}".`,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};
