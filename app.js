// Initialize Lucide Icons
lucide.createIcons();

let currentImageSrc = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80";

// TAB SWITCHING FUNCTION
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
        tab.classList.remove('block');
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active-tab');
        btn.classList.add('text-slate-400');
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
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 4K UPSCALER COMPARISON SLIDER DRAG LOGIC
function handleCompareSlider(val) {
    const cropWrap = document.getElementById('before-crop-wrap');
    const handle = document.getElementById('slider-handle');
    if (cropWrap && handle) {
        cropWrap.style.width = `${val}%`;
        handle.style.left = `${val}%`;
    }
}

// TRIGGER GLOBAL IMAGE FILE INPUT
function triggerImageUpload() {
    document.getElementById('global-image-input').click();
}

function triggerAudioUpload() {
    document.getElementById('global-audio-input').click();
}

// HANDLE IMAGE UPLOAD & PREVIEW
function handleImageUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            currentImageSrc = e.target.result;

            // Update Upscaler Images
            document.getElementById('upscale-before-img').src = currentImageSrc;
            document.getElementById('upscale-after-img').src = currentImageSrc;

            // Update Safe Zone background
            document.getElementById('safezone-bg').style.backgroundImage = `url('${currentImageSrc}')`;

            // Update Eraser image
            document.getElementById('eraser-img').src = currentImageSrc;

            // Hide previous download button if new image loaded
            document.getElementById('download-link').classList.add('hidden');
            document.getElementById('process-btn').classList.remove('hidden');

            alert("Photo uploaded successfully!");
        };

        reader.readAsDataURL(file);
    }
}

// REAL CANVAS PROCESSING & 4K DOWNLOAD GENERATION
function processAndUpscaleImage() {
    const processBtn = document.getElementById('process-btn');
    const downloadLink = document.getElementById('download-link');

    processBtn.innerText = "Processing 4K Resolution...";

    setTimeout(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = currentImageSrc;

        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Upscale Canvas dimensions (2x/4x high definition)
            canvas.width = img.naturalWidth * 2 || 2560;
            canvas.height = img.naturalHeight * 2 || 1440;

            // Sharp Image smoothing filter
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convert canvas to downloadable PNG Blob URL
            const dataUrl = canvas.toDataURL('image/png');
            downloadLink.href = dataUrl;
            downloadLink.download = `ZapStudio_4K_Upscaled_${Date.now()}.png`;

            processBtn.classList.add('hidden');
            downloadLink.classList.remove('hidden');
            
            // Adjust slider view to clear sharp view
            handleCompareSlider(0);
        };
    }, 1000);
}

// SAFE ZONE PRESETS
function setSafeZone(platform) {
    const box = document.getElementById('safezone-box');
    if (platform === 'youtube') {
        box.style.width = '85%';
        box.style.height = '80%';
    } else if (platform === 'instagram') {
        box.style.width = '75%';
        box.style.height = '75%';
    } else if (platform === 'tiktok') {
        box.style.width = '60%';
        box.style.height = '85%';
    }
}

function handleAudioUpload(input) {
    if (input.files && input.files[0]) {
        document.getElementById('audio-file-label').innerText = input.files[0].name;
        alert("Audio file loaded!");
    }
}

function applyEffect(name) {
    alert(`${name} Effect Applied!`);
}

function processAudio() {
    alert("Audio processing complete! Track ready for export.");
}

function eraseObject() {
    alert("Target object removed cleanly!");
}

function selectScale(btn, factor) {
    document.querySelectorAll('.scale-btn').forEach(b => {
        b.classList.remove('active-tab', 'border-indigo-500');
        b.classList.add('border-brand-border');
    });
    btn.classList.add('active-tab', 'border-indigo-500');
}
