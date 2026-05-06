const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim().replace(/[\"']/g, '');
const supabaseKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim().replace(/[\"']/g, '');
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const { data: restaurants } = await supabase.from('restaurants').select('id, name');
  console.log("Restaurants found:", restaurants);

  const kolachi = restaurants.find(r => r.name.toLowerCase().includes('kolachi'));
  const xanders = restaurants.find(r => r.name.toLowerCase().includes('xander'));

  if (kolachi) {
    console.log("Found Kolachi:", kolachi.id);
    const { error } = await supabase.from('users').update({ managed_restaurant_id: kolachi.id }).eq('email', 'kolachi@bitesync.com');
    if (error) console.error("Error updating Kolachi user:", error);
    else console.log("Successfully linked kolachi@bitesync.com to Kolachi");
  }

  if (xanders) {
    console.log("Found Xanders:", xanders.id);
    const { error } = await supabase.from('users').update({ managed_restaurant_id: xanders.id }).eq('email', 'xanders@bitesync.com');
    if (error) console.error("Error updating Xanders user:", error);
    else console.log("Successfully linked xanders@bitesync.com to Xanders");
  }
}
fix();
