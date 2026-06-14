const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://forxosuabfvmqeftkdqf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcnhvc3VhYmZ2bXFlZnRrZHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NTg0ODEsImV4cCI6MjA5NzAzNDQ4MX0.V4WaCae2Tra0Qlw6RTBpDpTbAqyVZjZl-cnxlU1reTw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing insert...");
  const { data, error } = await supabase.from('messages').insert([{ content: 'Test from script' }]);
  if (error) {
    console.log("Error details:");
    console.log(error);
  } else {
    console.log("Insert successful!");
  }
}

test();
