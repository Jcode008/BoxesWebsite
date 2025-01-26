const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'
    : 'https://boxes-vxnc.onrender.com';

const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');

async function sendMessage() {
    const messageText = userInput.value.trim();
    const token = localStorage.getItem('authToken');

    if (!token) {
        appendMessage('Error: Please login first', 'error-message');
        return;
    }

    if (messageText) {
        try {
            appendMessage(`You: ${messageText}`, 'user-message');
            userInput.value = '';

            const typingIndicator = showTypingIndicator();
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    message: messageText,
                    role: "user"
                })
            });

            const data = await response.json();
            typingIndicator.remove();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            const botResponse = data.content || data.message;
            if (!botResponse) {
                throw new Error('Empty response from bot');
            }

            appendMessage(`Bot: ${botResponse}`, 'bot-message');
            
        } catch (error) {
            console.error('Chat error:', error);
            appendMessage(`Error: ${error.message}`, 'error-message');
        }
    }
}

function showTypingIndicator() {
    const element = document.createElement('div');
    element.classList.add('message', 'bot-message');
    element.textContent = 'Bot is typing...';
    chatBox.appendChild(element);
    return element;
}

function appendMessage(message, className) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', className);
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Wait for DOM content to be loaded before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');

    if (!sendButton || !userInput) {
        console.error('Required elements not found');
        return;
    }

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});