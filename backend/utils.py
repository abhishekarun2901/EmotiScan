import cv2
import numpy as np

def load_and_preprocess_image(path):
    image = cv2.imread(path)
    return preprocess_image(image)
