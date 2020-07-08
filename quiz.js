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

        // Display next unanswered question
        var t_answered_count = 0;
        var t_index = t_question.m_id + 1;
        while(t_answered_count < questionArray.length){

            // If the question at t_index hasn't been answered
            if(questionArray[t_index] != null && questionArray[t_index].m_status === 0){
                //Display question
                DisplayQuestion(questionArray[t_index]);

                // Get the nav item corresponding to the displayed question
                var t_nav_item = $(".n-question-item").filter(function(a_index){
                    return a_index === questionArray[t_index].m_id;
                });

                // Shift the nav items so that the displayed question's nav item is first
                var t_x_offset = t_nav_item.offset().left - global_startX;
                $(".n-question-list").offset({left: ($(".n-question-list").offset().left - t_x_offset + 137.5)});
                break;
            }
            // Else if the end of the array is reached
            else if(t_index >= questionArray.length - 1){
                t_index = -1;
            }
            // Else display the end screen 
            else{
                // TODO: display end screen
            }

            // Increment helper variables
            t_index++;
            t_answered_count++;
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



   
// ========== TIMER FUNCTIONS ==========

/** The timer element for the quiz */
var timerElement = $("#quiz-timer");

/**
 * Create the DOM elements for the timer
 * 
 * @returns {void}
 */
function InitTimer(){
    // Insert a div for the quiz-timer
    $("<div>").attr("id","quiz-timer").css("position","absolute").insertAfter($(".navbar"));
    
    // Format the quiz timer div
    $("#quiz-timer").width($(".navbar-brand").width()).height($(".navbar-brand").outerHeight()).css("padding-top", 0.15 * $("#quiz-timer").height())
    
    // Shift the quiz timer div to the left so that it's under the brand
    $("#quiz-timer").offset({left: 0.5 * ($(".navbar-brand").innerWidth() - $(".navbar-brand").width())});
}

/**
 * Starts a timer from a_duration, calling a function when the time runs out
 * 
 * @param {Number} a_duration The time in seconds to run the timer for
 * 
 * @param {Function} a_callback The function to call when the time reaches 0
 * 
 * @returns {void}
 */
function StartTimer(a_duration, a_callback){
    // Store the duration of the timer
    StartTimer.time = a_duration;
    DisplayTimerText(a_duration);

    /** Counts down from a_duration then calls a_callback */
    var t_timerInterval = setInterval( function(){
        // Countdown 1 second
        DisplayTimerText(StartTimer.time);
        StartTimer.time--;
        

        // If the timer has reached below 0 trigger callback function and clear interval
        if(StartTimer.time < 0){
            a_callback();
            clearInterval(t_timerInterval);
        }

    },1000);
}

/**
 * Display a_time in the timer element as a string of "minutes : seconds"
 * 
 * @param {Number} a_time The time in seconds to display
 * 
 * @returns {void}
 */
function DisplayTimerText(a_time){
    // Calculate the minutes and seconds of the time
    var t_minutes = Math.floor(a_time / 60);
    var t_seconds = Math.floor(a_time) % 60;

    // Change the text of the timer
    // THE FUCK $(timerElement).text(t_minutes.toString() + " : " + t_seconds.toString());
    $("#quiz-timer").text(t_minutes.toString() + " : " + ((t_seconds >= 10)?"":"0") + t_seconds.toString());
}

function SubtractTime(a_amount){
    StartTimer.time -= a_amount;
    // $("#quiz-timer").css("color","red");
    // setTimeout(function(){ $("#quiz-timer").css("color","black") }, 1000);
    
    $("#quiz-timer").animate({color: "#aa0000"}, 1000);
}


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
