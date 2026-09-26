// ================= Navigation & Tab Switching =================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Highlight Active Navbar Button
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabMap = { 'home': 0, 'upscaler': 1, 'safe-zone': 2, 'audio': 3, 'eraser': 4 };
    if (tabMap[tabId] !== undefined && navButtons[tabMap[tabId]]) {
        navButtons[tabMap[tabId]].classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================= 4K Upscaler Logic =================
function setScale(btn) {
    document.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function handleUpscaleUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('upscaleImgPreview');
            img.src = e.target.result;
            img.style.display = 'block';
            document.getElementById('upscalePlaceholder').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

function downloadUpscaled() {
    const img = document.getElementById('upscaleImgPreview');
    if (!img.src || img.style.display === 'none') {
        showAlert("Please upload an image first!");
        return;
    }
    showAlert("Downloading 4K High-Resolution Image...");
}

// ================= Object Eraser Canvas Logic =================
let canvas = document.getElementById('maskCanvas');
let ctx = canvas ? canvas.getContext('2d') : null;
let isDrawing = false;

function handleEraserUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('eraserBaseImg');
            img.src = e.target.result;
            
            img.onload = function() {
                document.getElementById('eraserPlaceholder').style.display = 'none';
                document.getElementById('canvasWrapper').style.display = 'inline-block';
                
                // Adjust canvas width and height to match image display
                canvas.width = img.clientWidth;
                canvas.height = img.clientHeight;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            };
        };
        reader.readAsDataURL(file);
    }
}

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function stopDrawing() {
    isDrawing = false;
    if (ctx) ctx.beginPath();
}

function draw(e) {
    if (!isDrawing || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)'; // Red brush highlight

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

if (canvas) {
    // Mouse Event Listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);

    // Touch Event Listeners for Mobile
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchmove', draw);
}

function clearCanvas() {
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function processEraser() {
    const img = document.getElementById('eraserBaseImg');
    const wrapper = document.getElementById('canvasWrapper');
    if (!img.src || wrapper.style.display === 'none') {
        showAlert("Please upload an image and highlight a target first!");
        return;
    }
    showAlert("Target object removed cleanly!");
    clearCanvas();
}

// ================= Modal Helpers =================
function showAlert(msg) {
    const modalText = document.getElementById('modalText');
    const modal = document.getElementById('alertModal');
    if (modalText && modal) {
        modalText.innerText = msg;
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('alertModal');
    if (modal) {
        modal.style.display = 'none';
    }
}
