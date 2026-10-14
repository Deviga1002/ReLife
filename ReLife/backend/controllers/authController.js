const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const RewardTransaction = require('../models/RewardTransaction');

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      role: user.role,
      rewardPoints: user.rewardPoints,
      avatar: user.avatar,
      authProvider: user.authProvider,
    },
  });
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, location } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered',
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  const user = await User.create({
    name,
    email,
    phone: phone || '',
    password,
    location: location || '',
    role: 'user',
    authProvider: 'local',
  });

  await RewardTransaction.create({
    user: user._id,
    points: 50,
    type: 'signup_bonus',
    description: 'Welcome bonus for joining ReLife',
  });
  user.rewardPoints = 50;
  await user.save();

  sendTokenResponse(user, 201, res);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password, selectedRole } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  if (!user.password) {
    return res.status(401).json({
      success: false,
      message: 'This account uses Google sign-in. Please continue with Google.',
    });
  }

  if (!(await user.matchPassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account has been deactivated',
    });
  }

  // Role selection validation – never trust client to escalate privileges
  const allowedRoles = ['user', 'admin', 'ngo', 'service_provider', 'delivery_partner'];
  if (selectedRole) {
    if (!allowedRoles.includes(selectedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role selected',
      });
    }
    if (user.role !== selectedRole) {
      return res.status(403).json({
        success: false,
        message: 'The selected role does not match your account.',
      });
    }
  }

  sendTokenResponse(user, 200, res);
});

exports.googleAuth = asyncHandler(async (req, res) => {
  const { credential, selectedRole } = req.body;

  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({
      success: false,
      message:
        'Google sign-in is not configured. Set GOOGLE_CLIENT_ID in the backend .env file.',
    });
  }

  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  if (!credential) {
    return res.status(400).json({
      success: false,
      message: 'Google credential is required',
    });
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    console.error('Google token verification failed:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired Google token',
    });
  }

  if (!payload || !payload.email_verified) {
    return res.status(401).json({
      success: false,
      message: 'Google email not verified',
    });
  }

  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({
    $or: [{ googleId }, { email: email.toLowerCase() }],
  });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
    }
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated',
      });
    }
  } else {
    user = await User.create({
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      googleId,
      avatar: picture || '',
      role: 'user',
      authProvider: 'google',
      phone: '',
      location: '',
    });

    await RewardTransaction.create({
      user: user._id,
      points: 50,
      type: 'signup_bonus',
      description: 'Welcome bonus for joining ReLife',
    });
    user.rewardPoints = 50;
    await user.save();
  }

  // Optional role selection check for Google login
  if (selectedRole) {
    const allowedRoles = ['user', 'admin', 'ngo', 'service_provider', 'delivery_partner'];
    if (!allowedRoles.includes(selectedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role selected',
      });
    }
    if (user.role !== selectedRole) {
      return res.status(403).json({
        success: false,
        message: 'The selected role does not match your account.',
      });
    }
  }

  sendTokenResponse(user, 200, res);
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link has been sent',
    });
  }

  if (!user.password) {
    return res.status(400).json({
      success: false,
      message: 'This account uses Google sign-in. Password reset is not available.',
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  res.status(200).json({
    success: true,
    message: 'Password reset token generated',
    ...(process.env.NODE_ENV === 'development' && {
      resetToken,
      resetUrl,
    }),
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

exports.updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    location: req.body.location,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!user.password) {
    return res.status(400).json({
      success: false,
      message: 'This account uses Google sign-in.',
    });
  }

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});
