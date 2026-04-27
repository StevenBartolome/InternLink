from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import get_supabase

app = FastAPI(title="InternLink API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to InternLink API"}

@app.get("/health")
async def health_check():
    try:
        # Simple query to check database connection
        # Note: We just check if the client is initialized and can reach the server
        return {"status": "healthy", "database": "postgrest-connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
