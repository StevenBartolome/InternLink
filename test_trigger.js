import { supabaseAdmin } from './server/database.js';

async function test() {
    console.log('Testing trigger...');
    const { data, error } = await supabaseAdmin.from('student_internships').select('id').limit(1);
    if (error) {
        console.error('Fetch error:', error);
        return;
    }
    
    if (data && data.length > 0) {
        const { error: updateErr } = await supabaseAdmin
            .from('student_internships')
            .update({ final_grade: 95 })
            .eq('id', data[0].id);
        console.log('Update error:', updateErr);
        
        const { data: logData } = await supabaseAdmin.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(2);
        console.log('Latest logs:', logData);
    } else {
        console.log('No student internships found');
    }
}

test();
