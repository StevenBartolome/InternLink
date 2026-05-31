async function testHead() {
  const url = "https://frscqubnkmncxlzngxsk.supabase.co/storage/v1/object/public/documents/pre-internship/signed-attendance-3c311c01-0330-44d7-a889-152f60ce89f3-1780080704495.pdf";
  try {
    const res = await fetch(url, { method: 'HEAD' });
    console.log('Status:', res.status);
    console.log('Content-Length:', res.headers.get('content-length'));
    console.log('Headers:', [...res.headers.entries()]);
  } catch (err) {
    console.error('Error:', err);
  }
}

testHead();
