const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Therapist } = require('../models');
const { JWT_SECRET } = require('../config/auth');


exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, licenseNumber } = req.body;

    // Check if user exists
    const existingUser = await Therapist.findOne({ where: { email } });
    if (existingUser) return res.status(409).json({ message: 'Email already in use' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const therapist = await Therapist.create({
      first_name: firstName,
      last_name: lastName,
      email,
      password_hash: passwordHash,
      license_number: licenseNumber
    });

    res.status(201).json({ message: 'Therapist registered successfully', therapistId: therapist.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const therapist = await Therapist.findOne({ where: { email } });
    if (!therapist) return res.status(404).json({ message: 'User not found' });

    const validPass = await bcrypt.compare(password, therapist.password_hash);
    if (!validPass) return res.status(401).json({ message: 'Invalid credentials' });

    console.log("🔐 Login Secret Used:", JWT_SECRET);
    // Create Token
    const token = jwt.sign(
      { id: therapist.id, email: therapist.email },
      process.env.JWT_SECRET || 'fallback_secret', // Add JWT_SECRET to your .env
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: therapist.id,
        name: `${therapist.first_name} ${therapist.last_name}`,
        email: therapist.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};