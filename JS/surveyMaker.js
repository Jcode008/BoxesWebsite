const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'
    : 'https://boxes-vxnc.onrender.com';

let questionCounter = 0;
let currentSurveyId = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    currentSurveyId = Date.now().toString();
    refreshSurveyList();
});

async function createNewSurvey() {
    currentSurveyId = Date.now().toString();
    document.getElementById('survey-list-section').classList.add('hidden');
    document.getElementById('survey-builder').classList.remove('hidden');
    clearSurveyBuilder();
}

function clearSurveyBuilder() {
    document.getElementById('survey-title').value = '';
    document.getElementById('questions').innerHTML = '';
    document.getElementById('preview').innerHTML = '';
    questionCounter = 0;
}

function returnToList() {
    document.getElementById('survey-list-section').classList.remove('hidden');
    document.getElementById('survey-builder').classList.add('hidden');
    refreshSurveyList();
}

async function refreshSurveyList() {
    const surveyList = document.getElementById('survey-list');
    
    try {
        const response = await fetch(`${API_URL}/api/surveys`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch surveys');
        
        const surveys = await response.json();
        surveyList.innerHTML = surveys.length === 0 ? '<p>No surveys available</p>' : '';

        surveys.forEach(survey => {
            const listItem = document.createElement('li');
            listItem.textContent = survey.title;
            surveyList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching surveys:', error);
    }
}

async function saveSurvey() {
    const title = document.getElementById('survey-title').value;
    if (!title.trim()) {
        alert('Please enter a survey title');
        return;
    }

    try {
        const survey = {
            id: currentSurveyId,
            title: title,
            questions: Array.from(document.querySelectorAll('.question-container')).map(questionDiv => ({
                type: questionDiv.dataset.type,
                text: questionDiv.querySelector('.question-text').value,
                options: questionDiv.dataset.type === 'multiple-choice' 
                    ? Array.from(questionDiv.querySelectorAll('.option-text')).map(opt => opt.value)
                    : []
            }))
        };

        const response = await fetch(`${API_URL}/api/surveys`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(survey)
        });

        if (!response.ok) throw new Error('Failed to save survey');
        
        returnToList();
    } catch (error) {
        console.error('Error saving survey:', error);
        alert('Failed to save survey');
    }
}

// Original functions for adding questions and options
function addMultipleChoice() {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-container';
    questionDiv.dataset.type = 'multiple-choice';
    questionDiv.dataset.id = questionCounter++;

    questionDiv.innerHTML = `
        <input type="text" placeholder="Enter question" class="question-text">
        <div class="options-container">
            <div class="option">
                <input type="text" placeholder="Option 1" class="option-text">
            </div>
        </div>
        <button onclick="addOption(this)">Add Option</button>
        <button class="delete-btn" onclick="deleteQuestion(this)">Delete Question</button>
    `;

    document.getElementById('questions').appendChild(questionDiv);
}

function addWrittenResponse() {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-container';
    questionDiv.dataset.type = 'written';
    questionDiv.dataset.id = questionCounter++;

    questionDiv.innerHTML = `
        <input type="text" placeholder="Enter question" class="question-text">
        <textarea placeholder="Response will appear here in preview" disabled></textarea>
        <button class="delete-btn" onclick="deleteQuestion(this)">Delete Question</button>
    `;

    document.getElementById('questions').appendChild(questionDiv);
}

function addOption(button) {
    const optionsContainer = button.previousElementSibling;
    const optionCount = optionsContainer.children.length + 1;
    
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option';
    optionDiv.innerHTML = `
        <input type="text" placeholder="Option ${optionCount}" class="option-text">
    `;

    optionsContainer.appendChild(optionDiv);
}

function deleteQuestion(button) {
    button.parentElement.remove();
}

function previewSurvey() {
    const previewDiv = document.getElementById('preview');
    const surveyTitle = document.getElementById('survey-title').value || 'Untitled Survey';
    
    previewDiv.innerHTML = `
        <h2>${surveyTitle}</h2>
    `;

    const questions = document.querySelectorAll('.question-container');
    questions.forEach((question, index) => {
        const questionText = question.querySelector('.question-text').value || 'Untitled Question';
        const previewQuestion = document.createElement('div');
        previewQuestion.className = 'question-container';

        if (question.dataset.type === 'multiple-choice') {
            const options = question.querySelectorAll('.option-text');
            let optionsHTML = '';
            options.forEach((option, optIndex) => {
                const optionText = option.value || `Option ${optIndex + 1}`;
                optionsHTML += `
                    <div>
                        <input type="radio" name="question${index}" id="q${index}o${optIndex}">
                        <label for="q${index}o${optIndex}">${optionText}</label>
                    </div>
                `;
            });

            previewQuestion.innerHTML = `
                <p><strong>Q${index + 1}. ${questionText}</strong></p>
                ${optionsHTML}
            `;
        } else {
            previewQuestion.innerHTML = `
                <p><strong>Q${index + 1}. ${questionText}</strong></p>
                <textarea placeholder="Enter your response"></textarea>
            `;
        }

        previewDiv.appendChild(previewQuestion);
    });
}