

const uri = process.env.MONGODB_URI;



let questionCounter = 0;
let currentSurveyId = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    refreshSurveyList();
});

function createNewSurvey() {
    let currentSurveyId = Date.now().toString();
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

function getSurveyList() {
    const surveys = localStorage.getItem('surveyList');
    return surveys ? JSON.parse(surveys) : [];
}

function refreshSurveyList() {
    const surveyList = document.getElementById('survey-list');
    const surveys = getSurveyList();
    
    surveyList.innerHTML = surveys.length === 0 ? 
        '<p>No surveys created yet. Click "Create New Survey" to get started!</p>' : '';

    surveys.forEach(survey => {
        const surveyItem = document.createElement('div');
        surveyItem.className = 'survey-item';
        surveyItem.innerHTML = `
            <span class="survey-item-title">${survey.title || 'Untitled Survey'}</span>
            <span class="survey-item-date">${new Date(parseInt(survey.id)).toLocaleDateString()}</span>
            <button onclick="editSurvey('${survey.id}')" class="edit-btn">Edit</button>
            <button onclick="deleteSurvey('${survey.id}')" class="delete-btn">Delete</button>
        `;
        surveyList.appendChild(surveyItem);
    });
}

function editSurvey(surveyId) {
    const surveys = getSurveyList();
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return;

    currentSurveyId = surveyId;
    document.getElementById('survey-list-section').classList.add('hidden');
    document.getElementById('survey-builder').classList.remove('hidden');
    
    // Load survey data
    document.getElementById('survey-title').value = survey.title;
    document.getElementById('questions').innerHTML = '';
    questionCounter = 0;

    survey.questions.forEach(question => {
        if (question.type === 'multiple-choice') {
            addMultipleChoice();
            const questionDiv = document.querySelector('.question-container:last-child');
            questionDiv.querySelector('.question-text').value = question.text;
            
            questionDiv.querySelector('.options-container').innerHTML = '';
            question.options.forEach(optionText => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.innerHTML = `
                    <input type="text" value="${optionText}" class="option-text">
                `;
                questionDiv.querySelector('.options-container').appendChild(optionDiv);
            });
        } else {
            addWrittenResponse();
            const questionDiv = document.querySelector('.question-container:last-child');
            questionDiv.querySelector('.question-text').value = question.text;
        }
    });
}

function deleteSurvey(surveyId) {
    if (!confirm('Are you sure you want to delete this survey?')) return;
    
    const surveys = getSurveyList();
    const updatedSurveys = surveys.filter(s => s.id !== surveyId);
    localStorage.setItem('surveyList', JSON.stringify(updatedSurveys));
    refreshSurveyList();
}

async function saveSurvey() {
    const title = document.getElementById('survey-title').value;
    if (!title.trim()) {
        alert('Please enter a survey title');
        return;
    }



    const client = new MongoClient(uri);

    try{

        const {MongoClient} = require('mongodb');
        await client.connect();

        const db = client.db('test');

        const collection = db.collection('surveys');

        const survey = {
            id: currentSurveyId,
            title: title,
            questions: []
             
        };

        const result = await collection.insertOne(survey);
        console.log(`Survey created with the following id: ${result.insertedId}`);
    }
    catch(e){
        console.error(e);
    }
    

    document.querySelectorAll('.question-container').forEach(questionDiv => {
        const question = {
            type: questionDiv.dataset.type,
            text: questionDiv.querySelector('.question-text').value
        };

        if (question.type === 'multiple-choice') {
            question.options = Array.from(questionDiv.querySelectorAll('.option-text'))
                .map(option => option.value);
        }

        survey.questions.push(question);
    });

    // Update survey list
    const surveys = getSurveyList();
    const existingIndex = surveys.findIndex(s => s.id === currentSurveyId);
    if (existingIndex >= 0) {
        surveys[existingIndex] = survey;
    } else {
        surveys.push(survey);
    }
    
    localStorage.setItem('surveyList', JSON.stringify(surveys));
    alert('Survey saved successfully!');
    returnToList();
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