// ========== DOM ELEMENTS ==========



// ========== DISPLAY FUNCTIONS ==========

/**
 * An object representing an object
 * 
 * @property {string} m_prompt The question prompt
 * 
 * @property {Array<string>} m_options The options for the user to choose from
 * 
 * @property {Int} m_answer The correct option for the question
 * 
 * @property {Int} m_status Indicates whether the question was answered correctly or not
 * 
 * @property {Int} m_selection Indicates the option that was chosen by the user
 * 
 * @property {Int} m_id An idenifier to be assigned when the quiz is generated
 * 
 * @property {Int} m_difficulty An integer between 0 and 2 representing the difficulty of the question
 * 
 * @method CollectAnswer Collects an answer and changes m_status 
 */
class Question{

    /** 
     * Constructs a new Question object
     * 
     * @param {string} a_prompt the text to present to the user
     * 
     * @param {Array<string>} a_options the strings representing choices
     * 
     * @param {Int} a_answer the correct choice
     * 
     * @returns {Question} 
    */
    constructor(a_prompt, a_options, a_answer, a_difficulty){
        // Throw error if the number of answers is not greater than 1
        if(!(a_options.length > 1)){
            console.log("ERROR: options passed to Question constructor was not greater than 1");
        }

        this.m_options = a_options;
        this.m_prompt = a_prompt;
        this.m_answer = a_answer;
        this.m_status = 0;
        this.m_selection = -1;
        this.m_id = 0;
        this.m_difficulty = a_difficulty;
    }   

    CollectAnswer(a_answer){
        this.m_selection = a_answer;

        if(a_answer === this.m_answer){
            this.m_status = 1;
        }
        else{
            this.m_status = -1;
        }
    }
}

/**
 * Creates a card using the information from the question
 * 
 * @param {Question} a_question the question the card will represent
 * 
 * @returns {void}
 */
function DisplayQuestion(a_question){
    // Detach all current cards
    $(".card").detach();

    // Create card DOM element and assign it an id as a data-index
    var t_card = $("<div>").addClass("card");
    t_card.attr("data-index", a_question.m_id);

    // Create card title div
    var t_title = "Question " + (a_question.m_id + 1) + ": ";
    var t_card_title = $("<h3>").addClass("card-title");
    $(t_card_title).text(t_title + a_question.m_prompt);
    t_card.append(t_card_title);

    // Create options div
    var t_option_list = $("<ol>").addClass("q-options-list");
    for(let i = 0; i < a_question.m_options.length; i++){
        // Create option li element with data-index i
        var t_option_item = $("<li>").addClass("q-options-item");
        t_option_item.attr("data-index", i);
        t_option_item.text(a_question.m_options[i]);

        // Add listener to the item
        t_option_item.on("click", {t_question: a_question, t_item: t_option_item}, HandleOptionClick);

        // Append item to list
        t_option_list.append(a_question, t_option_item);
    }

    // Append the list to the page
    $(t_card).append(t_option_list);
    $("#doc-body").append(t_card);

    // If the question has been answered then style the list
    if(a_question.m_status != 0){
        // Grab the selected element
        var t_element = $(`.q-options-list li[data-index=${a_question.m_selection}]`);

        // If the question was answered correctly
        if(a_question.m_status == 1){
            // Update option element
            $(t_element).addClass("q-options-correct");
            $(t_element).append($("<i>").addClass("q-answer-icon " + icon_check_class));
        }
        // If the question was answered incorrectly
        else{
            // Update option element
            $(t_element).addClass("q-options-incorrect");
            $(t_element).append($("<i>").addClass("q-answer-icon " + icon_cross_class));
        }
    }
}

/**
* Changes the styling of the selected element and displays the next unanswered question
* 
* @param {Event} event the event calling the function containing the data @var a_question and @var a_item
* 
* @returns {void}
*/
function HandleOptionClick(event){
    event.preventDefault();

    // Create helping vars
    var t_question = event.data.t_question;
    var t_item = event.data.t_item;
        
    // If the question hasn't been answered
    if(t_question.m_status === 0){
        // Register answer
         t_question.CollectAnswer($(t_item).data("index"));

        // If the question was answered correctly
         if(t_question.m_status === 1){
            // Update option styling
            $(t_item).addClass("q-options-correct");
            $(t_item).append($("<i>").addClass("q-answer-icon " + icon_check_class));

            // Update nav element
            var t_element = GetNavItem(t_question.m_id);
            $(t_element).children("i").removeClass(icon_circle_class);
            $(t_element).children("i").addClass(icon_circle_check_class);
        }
        // If the question was answered incorrectly
        else if(t_question.m_status === -1){
            // Update option element
            $(t_item).addClass("q-options-incorrect");
            $(t_item).append($("<i>").addClass("q-answer-icon " + icon_cross_class));
            
            // Update nav element
            var t_element = GetNavItem(t_question.m_id);
            $(t_element).children("i").removeClass(icon_circle_class);
            $(t_element).children("i").addClass(icon_circle_cross_class);
        }

        //TODO: fix when user answers last question
        // Display next unanswered question
        var t_answered_count = 0;
        for(let i = t_question.m_id + 1; i < questionArray.length; i++){
            // If the question hasn't been answered, display it
            if(questionArray[i].m_status === 0){
                DisplayQuestion(questionArray[i]);
                break;
            }
            // Else if every question hasn't been checked and the end of the list has been reached
            else if(t_answered_count != questionArray.length && i === questionArray.length - 1){
                i = 0;
            }
            else{
                // TODO: put endscreen here
                break;
            }
        }
    }
}

/**
 * Retrieves a question item from the list of the navbar
 * 
 * @param {Int} a_index The desired index
 * 
 * @returns {Element} The element in n-question-list with a matching data-index attribute
 */
function GetNavItem(a_index){
    for(let i = 0; i < nav_questionItem_array.length; i++){
        if($(nav_questionItem_array[i]).data("index") == a_index){
            return nav_questionItem_array[i];
        }
    }
}

// ========== GENERATION FUNCTIONS ==========

/**
 * Selects questions for the quiz using difficulties below the parameter
 * 
 * @param {Int} a_difficulty An integer between 0 and 2 representing the difficulty
 * 
 * @param {Int} a_number The number of questions to return
 * 
 * @returns {Array<Question>} The generated array of questions
 */
function GenerateQuiz(a_difficulty, a_number){
    // Helper arrays to store picked indices
    var t_questions = new Array(3);
    var t_chosen_questions = [];
    t_questions[0] = Array.from(quiz_easyArray);
    t_questions[1] = Array.from(quiz_mediumArray);
    t_questions[2] = Array.from(quiz_hardArray);

    // Iterate through the requested number of questions
    for(let i = 0; i < a_number; i++){
        // Aleternate between available difficulties
        var t_choose_difficulty = i % (a_difficulty + 1);
        /** The question to add to the array */
        var t_question;

        // Select a random question
        if(t_choose_difficulty === 0 || (t_questions[2].length === 0 && t_questions[1].length === 0)){
            // Pick a random index
            t_index = Math.floor(t_questions[0].length * Math.random());

            // Splice the index out of the array
            t_question = t_questions[0][t_index];
            t_questions[0].splice(t_index,1); 
        }
        else if(t_choose_difficulty === 1 || t_questions[2].length === 0){
            // Pick a random index
            t_index = Math.floor(t_questions[1].length * Math.random());

            // Splice the index out of the array
            t_question = t_questions[1][t_index];
            t_questions[1].splice(t_index,1);  
        }
        else if(t_choose_difficulty === 2){
            // Pick a random index
            t_index = Math.floor(t_questions[0].length * Math.random());

            // Splice the index out of the array
            t_question = t_questions[2][t_index];
            t_questions[2].splice(t_index,1); 
        }
        else{
            console.log("ERROR: Chosen difficulty was not a valid value");
            break;
        }

        // Push the chosen question to the array
        t_chosen_questions.push(t_question);
    }

    // Return the question array
    return t_chosen_questions;
}




// ========== VARIABLES ==========

// ---------- Icon Class Strings ----------
var icon_circle_class = "far fa-circle";
var icon_circle_check_class = "fas fa-check-circle";
var icon_circle_cross_class = "fas fa-times-circle";
var icon_check_class = "fas fa-check";
var icon_cross_class = "fas fa-times";

// ---------- Global Variables ----------
/** The questions to give to the user */
var questionArray = [];
/** The questions to be inserted into hard quizes */
var quiz_hardArray = [];
/** The questions to be inserted into medium quizes */
var quiz_mediumArray = [new Question("How do you declare an anonymous function?", // Medium Question 0
                                    ["function(){ \/\/ Code goes here }",
                                     "function { \/\/ Code goes here }",
                                     "(){ \/\/ Code goes here }",
                                     "anon(){ \/\/ Code goes here }"], 0),
                        new Question("What is JSON?", // Medium Question 1
                                    ["A programming language",
                                     "A package for storing Javascript objects",
                                     "A Javascript event",
                                     "The company who created Javascript"], 1)];
/** The questions to be inserted into easy quizes */
var quiz_easyArray = [new Question("Which of the following is a valid Javascript function declaration?", // Easy Question 0
                                    ["public void Foo(){ \/\/ Code goes here }",
                                     "Foo(){ \/\/ Code goes here }",
                                     "Foo{ \/\/ Code goes here }",
                                     "function Foo(){ \/\/ Code goes here }"], 3),
                      new Question("Which of the following is NOT a loop", // Easy Question 1
                                    ["foreach",
                                     "for",
                                     "if",
                                     "while"], 2),
                      new Question("What terminology is used when a function is written into a line of code?", // Easy Question 2
                                    ["The function is called",
                                     "The function is assigned",
                                     "The function is performed",
                                     "The function is calculated"], 0),
                      new Question("What does a script refer to?", // Easy Question 3
                                    ["A Javascript function",
                                     "A Javascript file",
                                     "A Javascript comment",
                                     "A Javascript delegate"], 1),
                      new Question("What best describes the reason Javascript is used?", // Easy Question 4
                                    ["To display text and images",
                                     "To get user input",
                                     "To dynamically alter page elements",
                                     "To improve the pages' aesthetics"], 2),
                      new Question("Which option describes how to assign a string to a variable in Javascript?", // Easy Question 6
                                     ["string x = \"\";",
                                      "x = \"\";",
                                      "var x = \"\";",
                                      "new String(); "], 2),
                      new Question("What does DOM stand for?", // Easy Question 7
                                     ["Document Object Module",
                                      "Document Oriented Model",
                                      "Design Oriented Model",
                                      "Document Object Model"], 3),
                      new Question("Which tag displays the largest text?", // Easy Question 8
                                     ["<h1>",
                                      "<title>",
                                      "<p>",
                                      "<h4>"], 0),
                      new Question("Which of the follwing is NOT a valid html attribute?", // Easy Question 9
                                     ["class",
                                      "id",
                                      "href",
                                      "parent"], 3),
                      new Question("", // Easy Question 9
                                     ["",
                                      "",
                                      "",
                                      ""], 3)];

// ========== TEST FUNCTIONS ==========

/**
 * Loads a test question for debugging purposes
 */
function TestQuestion(){

}

/**
 * Initializes the quiz and displays the first 
 * 
 * 
 * 
 * 
 */
function InitQuiz(a_difficulty, a_number){
        // Create an array of questions
        questionArray = Array.from(GenerateQuiz(a_difficulty,a_number));

        // Assign the appropriate ids and create the nav items
        for(let i = 0; i < questionArray.length; i++){
            questionArray[i].m_id = i;
            AddQuestionItem(i);
        }
        
        EnableScrollableElement($(".n-question-list"));
        DisplayQuestion(questionArray[0]);
}
