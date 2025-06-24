// Data state
const state = {
    addons: [],
    files: new Map(),
    conflicts: new Set(),
    manifest: null,
    currentPreview: null
};

// DOM Elements
const dropZone = document.getElementById('dropZone');
const browseBtn = document.getElementById('browseBtn');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const fileTree = document.getElementById('fileTree');
const previewContent = document.getElementById('previewContent');
const processBtn = document.getElementById('processBtn');
const resetBtn = document.getElementById('resetBtn');
const progressBar = document.getElementById('progressBar');
const statusMessage = document.getElementById('statusMessage');
const emptyMessage = document.getElementById('emptyMessage');

// Metadata inputs
const addonName = document.getElementById('addonName');
const addonDesc = document.getElementById('addonDesc');
const addonVersion = document.getElementById('addonVersion');
const engineVersion = document.getElementById('engineVersion');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    browseBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('drop', handleDrop);
    processBtn.addEventListener('click', startMergeProcess);
    resetBtn.addEventListener('click', resetAll);
    
    // Set default values
    addonName.value = "Addon Gabungan";
    addonDesc.value = "Hasil penggabungan beberapa addon";
});

// Handle file selection
function handleFileSelect(e) {
    const files = e.target.files;
    processFiles(files);
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
}

// Handle drop
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.backgroundColor = '';
    
    const files = e.dataTransfer.files;
    processFiles(files);
}

// Process uploaded files
function processFiles(files) {
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name.toLowerCase();
        
        if (fileName.endsWith('.mcpack') || 
            fileName.endsWith('.mcaddon') || 
            fileName.endsWith('.zip')) {
            
            // Add to state
            state.addons.push(file);
            
            // Extract and analyze addon
            analyzeAddon(file);
        }
    }
    
    updateFileList();
    updateStatus(`Berhasil mengunggah ${files.length} file addon`, 'success');

    // Tampilkan mainSections setelah upload
    document.getElementById('mainSections').style.display = 'block';
}

// Analyze addon contents
function analyzeAddon(file) {
    const reader = new FileReader();

    reader.onload = function(e) {
        const arrayBuffer = e.target.result;

        JSZip.loadAsync(arrayBuffer).then(zip => {
            const manifestFile = zip.file('manifest.json');

            if (manifestFile) {
                manifestFile.async('string').then(manifestStr => {
                    try {
                        const manifest = JSON.parse(manifestStr);
                        state.manifest = manifest;

                        // Simpan referensi JSZip instance untuk lazy preview
                        if (!file._zip) file._zip = zip;

                        // Hanya simpan path, jangan ekstrak blob sekarang
                        zip.forEach((relativePath, zipEntry) => {
                            if (!zipEntry.dir) {
                                state.files.set(relativePath, {
                                    path: relativePath,
                                    name: relativePath.split('/').pop(),
                                    file: file,
                                    ready: false,
                                    blob: null
                                });
                            }
                        });

                        updateFileTree();
                    } catch (e) {
                        updateStatus(`Gagal memproses manifest: ${e.message}`, 'error');
                    }
                });
            } else {
                updateStatus(`File ${file.name} tidak memiliki manifest.json`, 'warning');
            }
        });
    };

    reader.readAsArrayBuffer(file);
}

// Update file list UI
function updateFileList() {
    if (state.addons.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }
    
    emptyMessage.style.display = 'none';
    fileList.innerHTML = '';
    
    state.addons.forEach((addon, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        fileItem.innerHTML = `
            <div class="file-icon">📦</div>
            <div class="file-info">
                <div class="file-name">${addon.name}</div>
                <div class="file-type">${formatFileSize(addon.size)}</div>
            </div>
            <div class="file-actions">
                <button onclick="removeAddon(${index})" title="Hapus">🗑️</button>
            </div>
        `;
        
        fileList.appendChild(fileItem);
    });
}

// Update file tree UI
function updateFileTree() {
    if (state.files.size === 0) {
        fileTree.innerHTML = `
            <div class="preview-placeholder">
                <div>📁</div>
                <p>Belum ada file untuk dipratinjau</p>
                <p>Unggah addon terlebih dahulu</p>
            </div>
        `;
        return;
    }
    
    fileTree.innerHTML = '';
    
    // Organize files by directory
    const fileStructure = {};
    
    state.files.forEach((blob, path) => {
        const parts = path.split('/');
        let currentLevel = fileStructure;
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            
            if (i === parts.length - 1) {
                // It's a file
                currentLevel[part] = {
                    type: 'file',
                    path: path,
                    name: part
                };
            } else {
                // It's a directory
                if (!currentLevel[part]) {
                    currentLevel[part] = {
                        type: 'dir',
                        children: {}
                    };
                }
                currentLevel = currentLevel[part].children;
            }
        }
    });
    
    // Render file tree
    renderTree(fileStructure, fileTree);
}

// Recursive function to render file tree
function renderTree(structure, parentElement, depth = 0) {
    for (const name in structure) {
        const item = structure[name];
        
        const itemElement = document.createElement('div');
        itemElement.className = 'tree-item';
        itemElement.style.paddingLeft = `${depth * 20}px`;
        
        if (item.type === 'dir') {
            itemElement.innerHTML = `
                <i class="folder-icon">📁</i> ${name}
            `;
            parentElement.appendChild(itemElement);
            
            // Render children
            const childrenContainer = document.createElement('div');
            renderTree(item.children, childrenContainer, depth + 1);
            parentElement.appendChild(childrenContainer);
        } else {
            // File item
            const icon = getFileIcon(name);
            itemElement.innerHTML = `
                <i>${icon}</i> ${name}
            `;
            itemElement.dataset.path = item.path;
            itemElement.addEventListener('click', () => previewFile(item.path, item.name));
            parentElement.appendChild(itemElement);
        }
    }
}

// Preview file
function previewFile(path, name) {
    state.currentPreview = path;
    const fileObj = state.files.get(path);

    previewContent.innerHTML = '';

    // Jika belum diekstrak, ekstrak dulu
    if (!fileObj.ready) {
        updateStatus('Memuat preview...', 'warning');
        // Ambil JSZip instance dari file terkait
        const zip = fileObj.file._zip;
        zip.file(path).async('blob').then(blob => {
            fileObj.blob = blob;
            fileObj.ready = true;
            showPreviewContent(blob, name);
        });
    } else {
        showPreviewContent(fileObj.blob, name);
    }
}

function showPreviewContent(blob, name) {
    previewContent.innerHTML = '';
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
        const url = URL.createObjectURL(blob);
        const img = document.createElement('img');
        img.src = url;
        img.className = 'preview-image';
        img.alt = name;
        previewContent.appendChild(img);
    } else if (name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const json = JSON.parse(e.target.result);
                const pre = document.createElement('pre');
                pre.className = 'preview-json';
                pre.textContent = JSON.stringify(json, null, 2);
                previewContent.appendChild(pre);
            } catch (error) {
                previewContent.innerHTML = `
                    <div class="preview-placeholder">
                        <div>❌</div>
                        <p>Gagal memparsing file JSON</p>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        };
        reader.readAsText(blob);
    } else if (name.endsWith('.js')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const pre = document.createElement('pre');
            pre.className = 'preview-js';
            pre.textContent = e.target.result;
            previewContent.appendChild(pre);
        };
        reader.readAsText(blob);
    } else {
        previewContent.innerHTML = `
            <div class="preview-placeholder">
                <div>ℹ️</div>
                <p>Pratinjau tidak tersedia untuk file ini</p>
                <p>Format file: ${name.split('.').pop().toUpperCase()}</p>
            </div>
        `;
    }
}

// Get file icon based on extension
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    
    switch(ext) {
        case 'json': return '📄';
        case 'js': return '📜';
        case 'png': case 'jpg': case 'jpeg': return '🖼️';
        case 'txt': case 'log': return '📝';
        case 'mcfunction': return '⚙️';
        default: return '📄';
    }
}

// Start merge process
function startMergeProcess() {
    if (state.addons.length === 0) {
        updateStatus('Silakan unggah setidaknya satu addon terlebih dahulu', 'error');
        return;
    }
    
    // Validate metadata
    if (!addonName.value.trim()) {
        updateStatus('Nama addon tidak boleh kosong', 'error');
        return;
    }
    
    // Update progress
    updateProgress(10);
    updateStatus('Memulai proses penggabungan...');
    
    // Create new manifest
    createNewManifest();
    
    // Simulate process (in a real app, this would be the actual merging)
    setTimeout(() => {
        updateProgress(50);
        updateStatus('Menggabungkan file dan folder...');
        
        setTimeout(() => {
            updateProgress(80);
            updateStatus('Membuat file output...');
            
            setTimeout(() => {
                updateProgress(100);
                updateStatus('Penggabungan berhasil! File siap diunduh', 'success');

                // Simulate download
                createAndDownloadZip();
            }, 1500);
        }, 1500);
    }, 1000);
}

// Create new manifest
function createNewManifest() {
    const newManifest = {
        format_version: 2,
        metadata: {
            authors: ["Addon Merger"],
            license: "MIT",
            url: "",
            generated_with: {
                tool: "Minecraft Addon Merger",
                version: "1.0.0"
            }
        },
        header: {
            name: addonName.value,
            description: addonDesc.value,
            min_engine_version: engineVersion.value.split('.').map(Number),
            uuid: uuid.v4(),
            version: addonVersion.value.split('.').map(Number)
        },
        modules: [],
        dependencies: [],
        subpacks: []
    };
    
    // For demo purposes, we'll just log it
    console.log('Manifest baru:', newManifest);
    state.manifest = newManifest;
}

// Membuat file ZIP hasil gabungan dan mengunduhnya
async function createAndDownloadZip() {
    const zip = new JSZip();

    // Tambahkan manifest baru
    zip.file('manifest.json', JSON.stringify(state.manifest, null, 2));

    // Tambahkan semua file dari state.files
    let added = 0;
    for (const [path, fileObj] of state.files.entries()) {
        // Skip manifest.json (sudah diganti)
        if (path === 'manifest.json') continue;

        // Ekstrak blob jika belum ada
        let blob = fileObj.blob;
        if (!blob) {
            // Ekstrak dari zip aslinya
            const zipInstance = fileObj.file._zip;
            blob = await zipInstance.file(path).async('blob');
        }
        zip.file(path, blob);
        added++;
    }

    // Generate ZIP
    const content = await zip.generateAsync({ type: "blob" });

    // Download
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    if (state.addons.length > 1) {
        a.download = 'addon-gabungan.mcaddon';
    } else {
        a.download = 'addon-gabungan.mcpack';
    }
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    updateStatus(`Berhasil menggabungkan ${added} file!`, 'success');
}

// Reset all
function resetAll() {
    state.addons = [];
    state.files.clear();
    state.conflicts.clear();
    state.manifest = null;
    state.currentPreview = null;
    
    addonName.value = "Addon Gabungan";
    addonDesc.value = "Hasil penggabungan beberapa addon";
    addonVersion.value = "1.0.0";
    engineVersion.value = "1.21.90";
    
    updateFileList();
    updateFileTree();
    previewContent.innerHTML = `
        <div class="preview-placeholder">
            <div>🔍</div>
            <p>Pilih file untuk dipratinjau</p>
            <p>Format yang didukung: PNG, JSON</p>
        </div>
    `;
    
    updateProgress(0);
    updateStatus('Siap untuk memulai proses penggabungan');
    document.getElementById('mainSections').style.display = 'none';
}

// Remove addon
function removeAddon(index) {
    state.addons.splice(index, 1);
    updateFileList();
    updateStatus(`Addon dihapus, sisa: ${state.addons.length}`, 'warning');
}

// Update progress bar
function updateProgress(percent) {
    progressBar.style.width = `${percent}%`;
}

// Update status message
function updateStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message';
    
    if (type === 'success') {
        statusMessage.classList.add('success');
    } else if (type === 'warning') {
        statusMessage.classList.add('warning');
    } else if (type === 'error') {
        statusMessage.classList.add('error');
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
