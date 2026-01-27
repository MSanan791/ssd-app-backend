// backend/scripts/seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Therapist, Patient } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('🔌 Connected to DB.');

    // 1. Create a Therapist (Password: 'password123')
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);

    const [therapist, created] = await Therapist.findOrCreate({
      where: { email: 'test@ssd.com' },
      defaults: {
        first_name: 'Test',
        last_name: 'Therapist',
        password_hash: hash,
        license_number: 'SLP-99999'
      }
    });

    if (created) console.log('✅ Created Therapist: test@ssd.com / password123');
    else console.log('ℹ️ Therapist already exists.');

    // 2. Create a Patient linked to this Therapist
    const [patient, pCreated] = await Patient.findOrCreate({
      where: { name: 'John Doe' },
      defaults: {
        therapist_id: therapist.id,
        age: 7,
        gender: 'Male',
        primary_language: 'English',
        initial_ssd_type: 'Phonological Disorder',
        initial_notes: 'Initial test patient'
      }
    });

    if (pCreated) console.log(`✅ Created Patient: John Doe (ID: ${patient.id})`);
    else console.log(`ℹ️ Patient John Doe already exists (ID: ${patient.id})`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Failed:', error);
    process.exit(1);
  }
}

seed();