// ===== DOM Elements =====
const urlInput = document.getElementById("url-input");
const generateBtn = document.getElementById("generate-btn");
const loading = document.getElementById("loading");
const errorMsg = document.getElementById("error-msg");
const resultSection = document.getElementById("result-section");
const qrImage = document.getElementById("qr-image");
const downloadBtn = document.getElementById("download-btn");
const copyBtn = document.getElementById("copy-btn");
const fillColorInput = document.getElementById("fill-color");
const bgColorInput = document.getElementById("bg-color");
const fillColorValue = document.getElementById("fill-color-value");
const bgColorValue = document.getElementById("bg-color-value");

// ===== Color Picker Sync =====
fillColorInput.addEventListener("input", () => {
    fillColorValue.textContent = fillColorInput.value;
});

bgColorInput.addEventListener("input", () => {
    bgColorValue.textContent = bgColorInput.value;
});

// ===== Generate QR Code =====
generateBtn.addEventListener("click", generateQR);

urlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") generateQR();
});

async function generateQR() {
    const url = urlInput.value.trim();

    // Reset states
    hideError();
    resultSection.classList.add("hidden");

    // Validate
    if (!url) {
        showError("Masukkan URL terlebih dahulu!");
        urlInput.focus();
        return;
    }

    // Show loading
    generateBtn.disabled = true;
    generateBtn.style.opacity = "0.6";
    loading.classList.remove("hidden");

    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                url: url,
                fill_color: fillColorInput.value,
                back_color: bgColorInput.value,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Gagal membuat QR Code");
        }

        // Show result
        qrImage.src = data.image;
        resultSection.classList.remove("hidden");

        // Smooth scroll to result
        resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (err) {
        showError(err.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
        generateBtn.disabled = false;
        generateBtn.style.opacity = "1";
        loading.classList.add("hidden");
    }
}

// ===== Download =====
downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = qrImage.src;
    link.click();
});

// ===== Copy to Clipboard =====
copyBtn.addEventListener("click", async () => {
    try {
        const res = await fetch(qrImage.src);
        const blob = await res.blob();
        await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
        ]);

        // Feedback
        copyBtn.classList.add("copied");
        const originalText = copyBtn.querySelector("span").textContent;
        copyBtn.querySelector("span").textContent = "Tersalin!";

        setTimeout(() => {
            copyBtn.classList.remove("copied");
            copyBtn.querySelector("span").textContent = originalText;
        }, 2000);
    } catch {
        // Fallback: open in new tab
        showError("Tidak bisa copy. Klik kanan gambar untuk menyalin.");
    }
});

// ===== Helpers =====
function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove("hidden");
}

function hideError() {
    errorMsg.classList.add("hidden");
    errorMsg.textContent = "";
}
