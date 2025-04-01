import json
import base64
import cv2  # type: ignore
import numpy as np  # type: ignore
import tensorflow as tf  # type: ignore
from fastapi import FastAPI, WebSocket  # type: ignore
import traceback

# Load trained emotion recognition model
model_path = r"C:\Users\USER\Downloads\emotion.h5" # Ensure this path is correct
model = tf.keras.models.load_model(model_path, compile=False)

# Define emotion labels
emotions = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]

app = FastAPI()

def generate_gradcam(img, model, predicted_class_idx):
    """
    Generate GradCAM heatmap for the specified class index.
    """
    target_layer_name = "conv5_4"  # Change this to the correct layer in your model
    try:
        last_conv_layer = model.get_layer(target_layer_name)
    except ValueError:
        print(f"⚠️ Layer {target_layer_name} not found, skipping GradCAM...")
        return np.ones((48, 48))  # Return a blank heatmap

    grad_model = tf.keras.models.Model(
        inputs=[model.inputs],
        outputs=[last_conv_layer.output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(tf.cast(img, tf.float32))
        loss = predictions[:, predicted_class_idx]
    
    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_outputs = conv_outputs[0]
    weighted_conv_outputs = tf.multiply(conv_outputs, pooled_grads)
    heatmap = tf.reduce_sum(weighted_conv_outputs, axis=-1)
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    return heatmap.numpy()

def create_gradcam_visualization(original_image, heatmap):
    """
    Create a superimposed visualization of the GradCAM heatmap on the original image.
    """
    heatmap_resized = cv2.resize(heatmap, (original_image.shape[1], original_image.shape[0]))
    heatmap_resized = np.uint8(255 * heatmap_resized)  # Convert to 0-255 scale
    heatmap_colored = cv2.applyColorMap(heatmap_resized, cv2.COLORMAP_JET)
    
    alpha = 0.4  # Transparency factor
    superimposed = cv2.addWeighted(heatmap_colored, alpha, original_image, 1 - alpha, 0)
    
    _, heatmap_buffer = cv2.imencode('.png', heatmap_colored)
    heatmap_base64 = base64.b64encode(heatmap_buffer).decode('utf-8')
    _, superimposed_buffer = cv2.imencode('.png', superimposed)
    superimposed_base64 = base64.b64encode(superimposed_buffer).decode('utf-8')
    
    return heatmap_base64, superimposed_base64

@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        payload = await websocket.receive_text()
        payload = json.loads(payload)
        imageByt64 = payload['data']['image'].split(',')[1]

        image_bytes = base64.b64decode(imageByt64)
        image_np = np.frombuffer(image_bytes, np.uint8)
        original_image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

        resized_image = cv2.resize(original_image, (48, 48))
        gray_image = cv2.cvtColor(resized_image, cv2.COLOR_BGR2GRAY)
        normalized_image = gray_image / 255.0
        model_input = np.expand_dims(normalized_image, axis=(0, -1))

        predictions = model.predict(model_input)
        predicted_class_idx = np.argmax(predictions[0])
        predicted_emotion = emotions[predicted_class_idx]

        try:
            heatmap = generate_gradcam(model_input, model, predicted_class_idx)
            heatmap_base64, superimposed_base64 = create_gradcam_visualization(original_image, heatmap)
            explanation_text = f"The model detected {predicted_emotion} emotion by focusing on the highlighted facial regions."

            emotion_explanations = {
                "angry": "Key indicators: furrowed brows, tight jaw, and narrowed eyes.",
                "disgust": "Usually shown through a wrinkled nose and raised upper lip.",
                "fear": "Typically identified by raised eyebrows and widened eyes.",
                "happy": "Recognized through a smile and crinkled eyes.",
                "neutral": "Characterized by relaxed facial muscles.",
                "sad": "Often shown with downturned mouth and raised inner eyebrows.",
                "surprise": "Identified by raised eyebrows and wide eyes."
            }
            explanation_text += " " + emotion_explanations.get(predicted_emotion, "")
        except Exception as e:
            print(f"⚠️ GradCAM failed: {str(e)}")
            heatmap_base64, superimposed_base64, explanation_text = "", "", f"Detected {predicted_emotion} but could not generate a heatmap."

        emotion_scores = {emotion: float(score) for emotion, score in zip(emotions, predictions[0])}

        response = {
            "predictions": emotion_scores,
            "emotion": predicted_emotion,
            "gradcam": {
                "heatmap": f"data:image/png;base64,{heatmap_base64}",
                "superimposed": f"data:image/png;base64,{superimposed_base64}",
                "explainability": explanation_text
            }
        }

        await websocket.send_json(response)
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        traceback.print_exc()
        try:
            await websocket.send_json({"error": str(e)})
        except:
            pass
    finally:
        await websocket.close()