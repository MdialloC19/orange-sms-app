from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.api.routes import api_router
from app.core.config import settings

# Création de l'application FastAPI pour Orange SMS Pro Senegal
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API pour l'envoi de SMS via Orange SMS Pro Senegal",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configuration CORS sécurisée pour permettre les requêtes frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Authorization", "Content-Type"],
    max_age=86400,
)

# Gestion des erreurs de validation
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": "http://localhost:5173"}
    )

# Gestion des exceptions générales
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Erreur interne du serveur: {str(exc)}"},
        headers={"Access-Control-Allow-Origin": "http://localhost:5173"}
    )

# Middleware pour intercepter toutes les exceptions et assurer les en-têtes CORS
@app.middleware("http")
async def exception_handling_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        # Ajouter manuellement les en-têtes CORS si nécessaire
        if "Access-Control-Allow-Origin" not in response.headers:
            response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        return response
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": f"Erreur serveur: {str(e)}"},
            headers={"Access-Control-Allow-Origin": "http://localhost:5173"}
        )

# Inclure toutes les routes d'API définies dans les modules
app.include_router(api_router, prefix=settings.API_V1_STR)

# Page d'accueil
@app.get("/")
def root():
    return {"message": "API Orange SMS Pro Senegal. Accédez à /docs pour la documentation."}

# Route spéciale pour les requêtes OPTIONS (preflight CORS)
@app.options("/{full_path:path}")
async def options_route(full_path: str):
    return {"detail": "Preflight request successful"}
