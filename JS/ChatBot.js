const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');

async function sendMessage() {
    const messageText = userInput.value.trim();

    if (messageText) {
        try {
            appendMessage(`You: ${messageText}`, 'user-message');
            userInput.value = '';

            const typingIndicator = showTypingIndicator();
            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText })
            });

            const data = await response.json();
            typingIndicator.remove();

            if (data.error) throw new Error(data.error);
            appendMessage(`Bot: ${data.content}`, 'bot-message');
        } catch (error) {
            console.error('Error:', error);
            appendMessage('Error: Could not get response', 'error-message');
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
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', className);
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
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