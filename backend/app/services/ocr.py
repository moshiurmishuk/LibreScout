import io
from PIL import Image
import numpy as np

_reader = None


def _get_reader():
    global _reader
    if _reader is None:
        import easyocr
        _reader = easyocr.Reader(["en"], gpu=False)
    return _reader


def extract_text_from_image_bytes(data: bytes) -> str:
    img = Image.open(io.BytesIO(data)).convert("RGB")
    np_img = np.array(img)

    reader = _get_reader()
    results = reader.readtext(np_img)

    texts = [t[1].strip() for t in results if t and isinstance(t[1], str) and t[1].strip()]
    combined = " ".join(texts)
    return " ".join(combined.split())
