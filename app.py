from flask import Flask, render_template, request, jsonify
import qrcode
import io
import base64

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    url = data.get("url", "").strip()

    if not url:
        return jsonify({"error": "URL tidak boleh kosong"}), 400

    # Generate QR Code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    # Get colors from request (optional customization)
    fill_color = data.get("fill_color", "#000000")
    back_color = data.get("back_color", "#ffffff")

    img = qr.make_image(fill_color=fill_color, back_color=back_color)

    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return jsonify({"image": f"data:image/png;base64,{img_base64}"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
