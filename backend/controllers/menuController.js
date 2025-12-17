import asyncHandler from 'express-async-handler';
import MenuItem from '../models/MenuItem.js';

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = asyncHandler(async (req, res) => {
  const menuItems = await MenuItem.find({});
  res.json(menuItems);
});

// @desc    Create a menu item
// @route   POST /api/menu
// @access  Private/Admin
const createMenuItem = asyncHandler(async (req, res) => {
  const { name, price, description, category, imageUrl, videoUrl } = req.body;
  
  let image = imageUrl;
  if (req.files && req.files.image) {
    image = req.files.image[0].path;
  }

  let video = videoUrl;
  if (req.files && req.files.video) {
    video = req.files.video[0].path;
  }

  if (!name || !price || !description || !image) {
    res.status(400);
    throw new Error('Please provide all fields including an image (file or URL)');
  }

  const menuItem = await MenuItem.create({
    name,
    price,
    description,
    image,
    video,
    category
  });

  res.status(201).json(menuItem);
});

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
const updateMenuItem = asyncHandler(async (req, res) => {
  const { name, price, description, category, isAvailable, imageUrl, videoUrl } = req.body;
  const menuItem = await MenuItem.findById(req.params.id);

  if (menuItem) {
    menuItem.name = name || menuItem.name;
    menuItem.price = price || menuItem.price;
    menuItem.description = description || menuItem.description;
    menuItem.category = category || menuItem.category;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;
    
    if (req.files && req.files.image) {
      menuItem.image = req.files.image[0].path;
    } else if (imageUrl) {
      menuItem.image = imageUrl;
    }

    if (req.files && req.files.video) {
      menuItem.video = req.files.video[0].path;
    } else if (videoUrl) {
      menuItem.video = videoUrl;
    }

    const updatedMenuItem = await menuItem.save();
    res.json(updatedMenuItem);
  } else {
    res.status(404);
    throw new Error('Menu item not found');
  }
});

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (menuItem) {
    await menuItem.deleteOne();
    res.json({ message: 'Menu item removed' });
  } else {
    res.status(404);
    throw new Error('Menu item not found');
  }
});

export { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem };
