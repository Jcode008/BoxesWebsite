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
        // Read file as text
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
            const fileContent = e.target.result;

            // Analyze file
            const analysis = await analyzeFile(fileContent);

            // Hide loading
            loadingIndicator.style.display = 'none';

            // Display result
            analysisResult.innerHTML = `
                <h3>File Analysis</h3>
                <p>${analysis}</p>
            `;

            // Reset button
            sendButton.disabled = false;
        };
        fileReader.readAsText(selectedFile);
    } catch (error) {
        loadingIndicator.style.display = 'none';
        analysisResult.innerHTML = `Error: ${error.message}`;
        sendButton.disabled = false;
    }
});

async function analyzeFile(content) {
    const apiKey = 'YOUR_OPENAI_API_KEY';
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system", 
                        content: "Analyze the following document and provide a concise overview:"
                    },
                    {
                        role: "user",
                        content: content
                    }
                ]
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        return `Analysis failed: ${error.message}`;
    }
}