require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || 'admin@sporlinefitness.com';
    const password = process.env.ADMIN_PASSWORD || 'Sporline2026!';
    const name = process.env.ADMIN_NAME || 'Sporline Admin';

    const exists = await User.findOne({ email });
    if (exists) {
        console.log('Admin kullanıcısı zaten mevcut:', email);
        process.exit(0);
    }

    await User.create({ name, email, password, role: 'admin' });
    console.log('Admin kullanıcısı oluşturuldu:', email);
    process.exit(0);
};

seedAdmin().catch(err => {
    console.error('Seed hatası:', err);
    process.exit(1);
});
