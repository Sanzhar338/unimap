import qrcode

BASE_URL = "https://hung-unreprehensible-kindra.ngrok-free.dev/room/2/610/"

rooms = ["A101", "A102", "B201"]

img = qrcode.make(BASE_URL)
img.save(f"{"qr"}.png")
