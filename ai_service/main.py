import base64
import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from insightface.app import FaceAnalysis

app = FastAPI(title="SafeBallot Biometric AI Service")

# Allow CORS for direct or server-to-server testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize InsightFace
# buffalo_s is a lightweight model pack containing face detection (det_10g) and recognition models.
# It automatically downloads to ~/.insightface/models/ on first initialization.
try:
    print("Initializing FaceAnalysis app with buffalo_s model...")
    face_app = FaceAnalysis(name='buffalo_s', providers=['CPUExecutionProvider'])
    face_app.prepare(ctx_id=-1, det_size=(640, 640))
    print("FaceAnalysis initialization complete.")
except Exception as e:
    print(f"CRITICAL ERROR initializing FaceAnalysis: {e}")
    face_app = None

class ImagesPayload(BaseModel):
    images: List[str]  # Base64 string images

class SingleImagePayload(BaseModel):
    image: str  # Base64 string image

def decode_base64_image(base64_str: str) -> np.ndarray:
    try:
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        img_data = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Error decoding base64 image: {e}")
        return None

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": face_app is not None
    }

@app.post("/generate-embedding")
def generate_embedding(payload: ImagesPayload):
    if not face_app:
        raise HTTPException(status_code=500, detail="InsightFace model is not initialized on the server.")

    embeddings = []
    for idx, img_b64 in enumerate(payload.images):
        img = decode_base64_image(img_b64)
        if img is None:
            continue

        try:
            faces = face_app.get(img)
            if not faces:
                print(f"No face detected in image index {idx}")
                continue

            # Pick the largest face detected in the image
            faces = sorted(faces, key=lambda x: (x.bbox[2] - x.bbox[0]) * (x.bbox[3] - x.bbox[1]), reverse=True)
            largest_face = faces[0]
            
            # extract embedding
            if hasattr(largest_face, 'normed_embedding') and largest_face.normed_embedding is not None:
                embeddings.append(largest_face.normed_embedding)
            elif hasattr(largest_face, 'embedding') and largest_face.embedding is not None:
                # normalize it
                emb = largest_face.embedding
                norm_emb = emb / np.linalg.norm(emb)
                embeddings.append(norm_emb)
        except Exception as err:
            print(f"Error analyzing image index {idx}: {err}")
            continue

    if not embeddings:
        raise HTTPException(status_code=400, detail="Could not detect or extract a face embedding from any of the provided images.")

    # Compute average face embedding
    avg_embedding = np.mean(embeddings, axis=0)
    # Re-normalize to ensure Unit Vector representation
    avg_embedding = avg_embedding / np.linalg.norm(avg_embedding)

    return {"embedding": avg_embedding.tolist()}

@app.post("/verify-face")
def verify_face(payload: SingleImagePayload):
    if not face_app:
        raise HTTPException(status_code=500, detail="InsightFace model is not initialized on the server.")

    img = decode_base64_image(payload.image)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image encoding.")

    try:
        faces = face_app.get(img)
        if not faces:
            raise HTTPException(status_code=400, detail="No face detected in the captured image.")

        faces = sorted(faces, key=lambda x: (x.bbox[2] - x.bbox[0]) * (x.bbox[3] - x.bbox[1]), reverse=True)
        largest_face = faces[0]

        if hasattr(largest_face, 'normed_embedding') and largest_face.normed_embedding is not None:
            embedding = largest_face.normed_embedding
        elif hasattr(largest_face, 'embedding') and largest_face.embedding is not None:
            emb = largest_face.embedding
            embedding = emb / np.linalg.norm(emb)
        else:
            raise HTTPException(status_code=400, detail="Failed to extract embedding from the face.")

        return {"embedding": embedding.tolist()}
    except HTTPException as he:
        raise he
    except Exception as err:
        print(f"Error extracting embedding during verification: {err}")
        raise HTTPException(status_code=500, detail=f"AI inference error: {str(err)}")
