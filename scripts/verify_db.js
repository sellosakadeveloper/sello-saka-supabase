import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://yojgevlpwiigxwywresj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvamdldmxwd2lpZ3h3eXdyZXNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU4OTI4NCwiZXhwIjoyMDc5MTY1Mjg0fQ.zrxZ7hFJKpGBX33lCyXUCWdFcaZnXtB5mMc_uyS0E4Y";

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
    console.log('Verifying database tables...');

    const tables = ['contact_messages', 'applications', 'donations', 'competition_entries'];

    for (const table of tables) {
        console.log(`Checking table: ${table}`);
        // Try to select one row to see if table exists and is accessible
        const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact' })
            .limit(1);

        if (error) {
            console.error(`Error accessing table ${table}:`, error);
        } else {
            console.log(`Table ${table} exists. Count: ${count}. Data sample:`, data);
        }
    }

    // Try a test insert into contact_messages
    console.log('Attempting test insert into contact_messages...');
    const { data: insertData, error: insertError } = await supabase
        .from('contact_messages')
        .insert([{
            name: 'Script Test',
            email: 'script@test.com',
            message: 'Test from verification script',
            subject: 'Script Test'
        }])
        .select();

    if (insertError) {
        console.error('Test insert failed:', insertError);
    } else {
        console.log('Test insert successful:', insertData);
    }
}

verifyTables();
