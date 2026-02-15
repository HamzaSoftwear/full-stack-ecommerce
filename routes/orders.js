const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/Orderitem');

// GET /orders/count  (admin-only via jwt isRevoked)
router.get('/count', async (req, res) => {
  try {
    const orderCount = await Order.countDocuments();
    res.status(200).json({ orderCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /orders  (admin-only via jwt isRevoked)
router.get('/', async (req, res) => {
  try {
    const OrderList = await Order.find()
      .populate({
        path: 'Orderitem',
        populate: { path: 'product' }
      })
      .populate('user');

    res.status(200).send(OrderList);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /orders  (allowed for authenticated users – jwt should NOT mark this admin-only)
router.post('/', async (req, res) => {
  try {
    // 1) Create order items
    const orderItemsIds = await Promise.all(
      req.body.Orderitem.map(async (item) => {
        let newOrderItem = new OrderItem({
          quantity: item.quantity,
          product: item.product
        });
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
      })
    );

    // 2) Calculate total price on server, not from client
    const totalPrices = await Promise.all(
      orderItemsIds.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        return orderItem.product.price * orderItem.quantity;
      })
    );
    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    // user comes from token, not from body
    const tokenUserId = req.auth && (req.auth.userId || req.auth.id);

    let order = new Order({
      Orderitem: orderItemsIds,
      address: req.body.address,
      city: req.body.city,
      phone: req.body.phone,
      status: req.body.status || 'Pending',
      totalPrice: totalPrice,
      user: tokenUserId,
      // dateOrdered will use default from schema
    });

    order = await order.save();
    res.status(201).send(order);
  } catch (err) {
    res.status(500).send('The order cannot be created: ' + err.message);
  }
});

// GET /orders/:id  (admin-only via jwt isRevoked)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'Orderitem',
        populate: { path: 'product' }
      })
      .populate('user');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.send(order);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /orders/:id  (admin-only via jwt isRevoked)
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!order) {
      return res.status(404).send('The order cannot be updated');
    }

    res.send(order);
  } catch (err) {
    res.status(500).send('The order cannot be updated: ' + err.message);
  }
});

// DELETE /orders/:id  (admin-only via jwt isRevoked)
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndRemove(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'order not found!' });
    }

    if (Array.isArray(order.Orderitem)) {
      await Promise.all(
        order.Orderitem.map((orderItem) =>
          OrderItem.findByIdAndDelete(orderItem)
        )
      );
    }

    res.status(200).json({ success: true, message: 'the order is deleted!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /orders/myorder/:userId  (user can only see their own orders)
router.get('/myorder/:userId', async (req, res) => {
  try {
    const tokenUserId = req.auth && (req.auth.userId || req.auth.id);
    const requestedUserId = req.params.userId;

    // enforce that user can only view their own orders
    if (!tokenUserId || String(tokenUserId) !== String(requestedUserId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const OrderList = await Order.find({ user: requestedUserId })
      .populate({
        path: 'Orderitem',
        populate: { path: 'product' }
      })
      .populate('user');

    res.send(OrderList);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
