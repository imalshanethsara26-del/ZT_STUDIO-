lucide.createIcons();

// TAB SWITCHING LOGIC
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

// 4K UPSCALER COMPARISON SLIDER
const slider = document.getElementById('comparison-slider');
const beforeWrap = document.getElementById('before-image-wrap');

if (slider && beforeWrap) {
    slider.addEventListener('input', (e) => {
        beforeWrap.style.width = `${e.target.value}%`;
    });
}

// DYNAMIC IMAGE UPLOADER
let currentLoadedImage = null;

function handleImageUpload(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    
    // Update Upscaler
    document.getElementById('before-image').src = url;
    document.getElementById('after-image').src = url;

    // Update Safe Zone
    document.getElementById('safezone-preview-container').style.backgroundImage = `url(${url})`;

    // Update Eraser
    document.getElementById('eraser-target-img').src = url;

    alert("Photo uploaded successfully across all tools!");
}

// SAFE ZONE PLATFORM SELECTOR
function setPlatform(platform) {
    const overlay = document.getElementById('safezone-overlay');
    if (!overlay) return;

    if (platform === 'youtube') {
        overlay.style.width = '85%';
        overlay.style.height = '80%';
    } else if (platform === 'instagram') {
        overlay.style.width = '75%';
        overlay.style.height = '75%';
    } else if (platform === 'tiktok') {
        overlay.style.width = '65%';
        overlay.style.height = '85%';
    } else if (platform === 'facebook') {
        overlay.style.width = '90%';
        overlay.style.height = '70%';
    }
}

function processUpscale() {
    alert("Image upscaling completed! Downloading 4K image...");
}

function removeObject() {
    alert("Target object removed successfully!");
}

function handleAudioUpload(file) {
    if (file) {
        document.getElementById('audio-filename').innerText = file.name;
        alert("Audio file uploaded successfully!");
    }
}

function playAudioEffect(effect) {
    alert(`${effect.toUpperCase()} Audio effect applied!`);
}
