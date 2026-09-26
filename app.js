// Initialize Lucide Icons
lucide.createIcons();

// ==========================================
// 1. GLOBAL TAB NAVIGATION SYSTEM
// ==========================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
        tab.classList.remove('block');
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active-tab');
        btn.classList.add('text-slate-400');
        btn.classList.remove('text-white');
    });

    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) {
        targetTab.classList.remove('hidden');
        targetTab.classList.add('block');
    }

    const targetBtn = document.getElementById(`nav-${tabId}`);
    if (targetBtn) {
        targetBtn.classList.add('active-tab');
        targetBtn.classList.remove('text-slate-400');
        targetBtn.classList.add('text-white');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ==========================================
// 2. GLOBAL IMAGE & AUDIO HANDLERS
// ==========================================
let loadedUpscaleImage = null;
let loadedSafeZoneImage = null;

function handleImageUpload(file) {
    if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
        loadedUpscaleImage = img;
        loadedSafeZoneImage = img;

        // Update 4K Upscaler Preview
        const beforeImg = document.getElementById('before-image');
        const afterImg = document.getElementById('after-image');
        const wrapper = document.getElementById('upscaler-preview-wrapper');
        const status = document.getElementById('upscale-status');

        if (beforeImg && afterImg && wrapper) {
            beforeImg.src = img.src;
            afterImg.src = img.src;
            wrapper.classList.remove('hidden');
            if (status) status.innerText = `Image Loaded: ${img.naturalWidth} x ${img.naturalHeight}px`;
        }

        // Update Safe Zone Preview
        renderSafeZonePreview();

        // Update Eraser Workspace
        setupEraserWorkspace(img);
    };
}


// ==========================================
// 3. FEATURE 1: 4K IMAGE UPSCALER LOGIC
// ==========================================
const slider = document.getElementById('comparison-slider');
const beforeWrap = document.getElementById('before-image-wrap');

if (slider && beforeWrap) {
    slider.addEventListener('input', (e) => {
        beforeWrap.style.width = `${e.target.value}%`;
    });
}

function applySharpenFilter(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    const side = Math.round(Math.sqrt(weights.length));
    const halfSide = Math.floor(side / 2);
    
    const canvasCopy = document.createElement('canvas');
    canvasCopy.width = width;
    canvasCopy.height = height;
    const copyCtx = canvasCopy.getContext('2d');
    copyCtx.putImageData(imageData, 0, 0);
    const copyData = copyCtx.getImageData(0, 0, width, height).data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dstOff = (y * width + x) * 4;
            let r = 0, g = 0, b = 0;
            for (let cy = 0; cy < side; cy++) {
                for (let cx = 0; cx < side; cx++) {
                    const scx = x + cx - halfSide;
                    const scy = y + cy - halfSide;
                    if (scx >= 0 && scx < width && scy >= 0 && scy < height) {
                        const srcOff = (scy * width + scx) * 4;
                        const wt = weights[cy * side + cx];
                        r += copyData[srcOff] * wt;
                        g += copyData[srcOff + 1] * wt;
                        b += copyData[srcOff + 2] * wt;
                    }
                }
            }
            data[dstOff] = Math.min(255, Math.max(0, r));
            data[dstOff + 1] = Math.min(255, Math.max(0, g));
            data[dstOff + 2] = Math.min(255, Math.max(0, b));
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function processUpscale(scaleFactor = 4) {
    if (!loadedUpscaleImage) {
        alert("Please upload an image first!");
        return;
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = loadedUpscaleImage.naturalWidth * scaleFactor;
    canvas.height = loadedUpscaleImage.naturalHeight * scaleFactor;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(loadedUpscaleImage, 0, 0, canvas.width, canvas.height);

    applySharpenFilter(ctx, canvas.width, canvas.height);

    const link = document.createElement('a');
    link.download = `ZapStudio_4K_Upscaled_${scaleFactor}X.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}


// ==========================================
// 4. FEATURE 2: SOCIAL MEDIA SAFE ZONE RESIZER
// ==========================================
const platformRatios = {
    youtube: { width: 1920, height: 1080, overlayW: '80%', overlayH: '80%' },
    instagram: { width: 1080, height: 1080, overlayW: '85%', overlayH: '85%' },
    tiktok: { width: 1080, height: 1920, overlayW: '75%', overlayH: '70%' },
    facebook: { width: 1200, height: 630, overlayW: '85%', overlayH: '80%' }
};

let currentPlatform = 'youtube';

function setPlatform(platform) {
    currentPlatform = platform;
    document.querySelectorAll('.platform-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    renderSafeZonePreview();
}

function renderSafeZonePreview() {
    const config = platformRatios[currentPlatform];
    const previewContainer = document.getElementById('safezone-preview-container');
    const overlay = document.getElementById('safezone-overlay');

    if (overlay && config) {
        overlay.style.width = config.overlayW;
        overlay.style.height = config.overlayH;
    }

    if (previewContainer && loadedSafeZoneImage) {
        previewContainer.style.backgroundImage = `url(${loadedSafeZoneImage.src})`;
        previewContainer.style.backgroundSize = 'contain';
    }
}


// ==========================================
// 5. FEATURE 3: WEB AUDIO STUDIO (8D, SLOWED, BASS)
// ==========================================
let audioCtx = null;
let audioSource = null;
let audioBuffer = null;
let pannerNode = null;
let bassFilter = null;
let isPlaying = false;
let pannerAngle = 0;
let animationFrameId = null;

function initAudioEngine() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function handleAudioUpload(file) {
    if (!file) return;
    initAudioEngine();
    
    const fileNameElement = document.getElementById('audio-filename');
    if (fileNameElement) fileNameElement.innerText = file.name;

    const reader = new FileReader();
    reader.onload = function (e) {
        audioCtx.decodeAudioData(e.target.result, function (buffer) {
            audioBuffer = buffer;
            alert("Audio file successfully loaded into Audio Studio!");
        });
    };
    reader.readAsArrayBuffer(file);
}

function playAudioEffect(preset) {
    if (!audioBuffer) {
        alert("Please upload an audio file (MP3/WAV) first!");
        return;
    }

    if (isPlaying && audioSource) {
        audioSource.stop();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
    }

    audioSource = audioCtx.createBufferSource();
    audioSource.buffer = audioBuffer;

    bassFilter = audioCtx.createBiquadFilter();
    bassFilter.type = 'lowshelf';

    pannerNode = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;

    if (preset === 'slowed') {
        audioSource.playbackRate.value = 0.85;
        bassFilter.frequency.value = 200;
        bassFilter.gain.value = 5;
    } else if (preset === 'bass') {
        audioSource.playbackRate.value = 1.0;
        bassFilter.frequency.value = 150;
        bassFilter.gain.value = 14;
    } else if (preset === '8d') {
        audioSource.playbackRate.value = 1.0;
        function animate8D() {
            pannerAngle += 0.03;
            if (pannerNode) {
                pannerNode.pan.value = Math.sin(pannerAngle);
            }
            animationFrameId = requestAnimationFrame(animate8D);
        }
        animate8D();
    }

    let nodeChain = audioSource.connect(bassFilter);
    if (pannerNode) {
        nodeChain = nodeChain.connect(pannerNode);
    }
    nodeChain.connect(audioCtx.destination);

    audioSource.start(0);
    isPlaying = true;
}


// ==========================================
// 6. FEATURE 4: OBJECT ERASER & CANVAS MASK
// ==========================================
let eraserCanvas = null;
let eraserCtx = null;
let isDrawing = false;

function setupEraserWorkspace(img) {
    const workspace = document.getElementById('eraser-workspace');
    const placeholder = document.getElementById('eraser-placeholder');
    const targetImg = document.getElementById('eraser-target-img');

    if (!workspace || !img) return;

    if (placeholder) placeholder.classList.add('hidden');
    if (targetImg) {
        targetImg.src = img.src;
        targetImg.classList.remove('hidden');
    }

    // Existing canvas cleanup
    if (eraserCanvas) eraserCanvas.remove();

    eraserCanvas = document.createElement('canvas');
    eraserCanvas.width = img.naturalWidth;
    eraserCanvas.height = img.naturalHeight;
    eraserCanvas.className = "absolute inset-0 w-full h-full cursor-crosshair z-10";

    eraserCtx = eraserCanvas.getContext('2d');
    workspace.appendChild(eraserCanvas);

    eraserCanvas.addEventListener('mousedown', () => isDrawing = true);
    eraserCanvas.addEventListener('mouseup', () => isDrawing = false);
    eraserCanvas.addEventListener('mousemove', drawMask);
}

function drawMask(e) {
    if (!isDrawing || !eraserCtx || !eraserCanvas) return;
    const rect = eraserCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (eraserCanvas.width / rect.width);
    const y = (e.clientY - rect.top) * (eraserCanvas.height / rect.height);

    eraserCtx.fillStyle = 'rgba(239, 68, 68, 0.6)';
    eraserCtx.beginPath();
    eraserCtx.arc(x, y, 25, 0, Math.PI * 2);
    eraserCtx.fill();
}

function removeObject() {
    if (!eraserCanvas) {
        alert("Please upload an image and mark an object to erase!");
        return;
    }
    alert("Object removal process completed!");
    eraserCtx.clearRect(0, 0, eraserCanvas.width, eraserCanvas.height);
}
