const quizData = [
  {
    question: 'Which planet is known as the Red Planet?',
    a : 'Earth', 
    b : 'Mars',
    c : 'Jupiter',
    d : 'Venus',
    correct : 'b'
  }, {
    question: 'Who wrote the play Romeo and Juliet?',
    a : 'William Shakespeare',
    b : 'Mark Twain',
    c : 'Jane Austen',
    d : 'Charles Dickens',
    correct : 'a' // Correct answer is William Shakespeare
  },
  {
    question: 'What is the largest ocean on Earth?',
    a : 'Atlantic Ocean',
    b : 'Indian Ocean',
    c : 'Arctic Ocean',
    d : 'Pacific Ocean',
    correct : 'd' // Correct answer is Pacific Ocean
  },
  {
    question: 'Which element has the chemical symbol O?',
    a : 'Oxygen',
    b : 'Osmium',
    c : 'Ozone',
    d : 'Oganesson',
    correct : 'a' // Correct answer is Oxygen
  },
  {
    question: 'What is the capital of Japan?',
    a : 'Seoul',
    b : 'Beijing',
    c : 'Tokyo',
    d : 'Bangkok',
    correct: 'c' // Correct answer is Tokyo
  }
];

const answerELs = document.querySelectorAll('.answer');
const quiz = document.getElementById('quiz');
const questionEl = document.getElementById('question');
const a_text = document.getElementById('a_text');
const b_text = document.getElementById('b_text');
const c_text = document.getElementById('c_text');
const d_text = document.getElementById('d_text');
const submitBtn = document.getElementById('submit');

let currentQuiz = 0;
let score = 0;

loadQuiz();

function loadQuiz() {
  deselectAnswers();

  const currentQuizData = quizData[currentQuiz];
  questionEl.innerText = currentQuizData.question;

  a_text.innerText = currentQuizData.a;
  b_text.innerText = currentQuizData.b;
  c_text.innerText = currentQuizData.c;
  d_text.innerText = currentQuizData.d;
}

function getSelected(){
  let answer = undefined;

  answerELs.forEach((answerEl)=>{
    if(answerEl.checked){
      answer = answerEl.id;
    }
  });

  return answer;
}

function deselectAnswers(){
    answerELs.forEach((answerEl)=>{
    answerEl.checked = false;
  });
}


submitBtn.addEventListener("click", () => {

  const answer = getSelected();

  if(answer === quizData[currentQuiz].correct){
  score++;
  currentQuiz++;
  if(currentQuiz < quizData.length){
    loadQuiz();
  } else {
    quiz.innerHTML = `<h2>You answered correctly at ${score}/${quizData.length} questions.</h2>
    
    <button onclick="location.reload()">Reload</button>
    `;
  }
  }
})
