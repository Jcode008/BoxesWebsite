const fileUpload = document.getElementById('file-upload');
const sendButton = document.getElementById('send-file');
const analysisResult = document.getElementById('analysis-result');
const loadingIndicator = document.getElementById('loading');

let selectedFile = null;

fileUpload.addEventListener('change', (event) => {
    selectedFile = event.target.files[0];
    if (selectedFile) {
        sendButton.disabled = false;
    }
});

sendButton.addEventListener('click', async () => {
    if (!selectedFile) return;

    // Show loading
    loadingIndicator.style.display = 'block';
    analysisResult.innerHTML = '';
    sendButton.disabled = true;

    try {
        // Analyze file
        const analysis = await analyzeFile(selectedFile);

        // Hide loading
        loadingIndicator.style.display = 'none';

        // Display result
        analysisResult.innerHTML = `
            <h3>File Analysis</h3>
            <p>${analysis}</p>
        `;

        // Reset button
        sendButton.disabled = false;
    } catch (error) {
        loadingIndicator.style.display = 'none';
        analysisResult.innerHTML = `Error: ${error.message}`;
        sendButton.disabled = false;
    }
});

const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'
    : 'https://boxes-vxnc.onrender.com';

async function analyzeFile(file) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to analyze file');
        }

        const data = await response.json();
        return data.analysis;
    } catch (error) {
        console.error('Analysis error:', error);
        throw error;
    }
}