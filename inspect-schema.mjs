import dotenv from 'dotenv';

dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function inspect() {
  const res = await fetch(`${url}/rest/v1/`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const data = await res.json();
  console.log('Exposed paths/tables:');
  console.log(Object.keys(data.paths));
  console.log('Definitions:');
  console.log(Object.keys(data.definitions));
}

inspect();
