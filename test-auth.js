
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://wxpxcjyubfewvgmjaxce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHhjanl1YmZld3ZnbWpheGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzOTI2NzEsImV4cCI6MjA5ODk2ODY3MX0.XBAjPdFETbUBKJV-xLUDY_p_EA3gDjnxo7Kt7CHuJOw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('SIGNUP:');
  const r1 = await supabase.auth.signUp({
    email: 'testlogin500@dailymanager.app',
    password: 'password123',
  });
  console.log(r1);

  console.log('SIGNIN:');
  const r2 = await supabase.auth.signInWithPassword({
    email: 'testlogin500@dailymanager.app',
    password: 'password123',
  });
  console.log(r2);
}
test();
