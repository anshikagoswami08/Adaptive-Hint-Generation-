import pyautogui
import easyocr
import numpy as np

reader = easyocr.Reader(['en'])

def capture_and_extract_text():
    screenshot = pyautogui.screenshot()
    img = np.array(screenshot)

    result = reader.readtext(img)

    extracted_text = " ".join([text[1] for text in result])

    return extracted_text