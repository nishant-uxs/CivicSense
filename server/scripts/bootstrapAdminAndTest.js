require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const supabase = require('../utils/supabase');
const bcrypt = require('bcryptjs');

async function bootstrap() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@civicsense.local';
  console.log(`Looking for admin: ${adminEmail}`);

  const { data: existing } = await supabase
    .from('users')
    .select('id, role')
    .eq('email', adminEmail)
    .single();

  if (!existing) {
    const password_hash = await bcrypt.hash('admin123', 12);
    const { data: admin, error } = await supabase
      .from('users')
      .insert({
        name: 'Admin',
        email: adminEmail,
        password_hash,
        role: 'admin'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating admin:', error.message);
      return;
    }
    console.log(`✅ Admin user created: ${admin.email} (${admin.id})`);

    // Create a test complaint
    const { data: complaint, error: compError } = await supabase
      .from('complaints')
      .insert({
        title: 'Test Pothole on MG Road',
        description: 'Large pothole near the main intersection causing traffic issues',
        category: 'pothole',
        location_lng: 77.5946,
        location_lat: 12.9716,
        location_address: 'MG Road, Bangalore',
        city: 'Bangalore',
        pincode: '560001',
        reporter_id: admin.id,
        status: 'Reported'
      })
      .select()
      .single();

    if (compError) {
      console.error('Error creating test complaint:', compError.message);
    } else {
      await supabase.from('status_history').insert({
        complaint_id: complaint.id,
        status: 'Reported',
        timestamp: new Date().toISOString(),
        updated_by: admin.id
      });
      console.log(`✅ Test complaint created: ${complaint.title} (${complaint.id})`);
    }
  } else if (existing.role !== 'admin') {
    await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', existing.id);
    console.log(`✅ User ${adminEmail} upgraded to admin role`);
  } else {
    console.log(`ℹ️  Admin ${adminEmail} already exists`);
  }

  console.log('\n🎉 Bootstrap complete!');
  console.log(`   Login: ${adminEmail} / admin123`);
}

bootstrap().catch(err => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
