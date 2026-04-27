import os
from dotenv import load_dotenv
from postgrest import SyncPostgrestClient

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

# We use SyncPostgrestClient directly to avoid the dependency issues with the full Supabase client
# The full Supabase client currently has a dependency (pyiceberg) that requires C++ Build Tools on Python 3.14
supabase_db = SyncPostgrestClient(f"{url}/rest/v1", headers={"apikey": key, "Authorization": f"Bearer {key}"})

def get_supabase():
    return supabase_db
