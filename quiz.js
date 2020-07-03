/**
 * An object representing an object
 * 
 * @property {Array} m_options the options for the user to choose from
 * 
 * @property {Int} m_answer the correct option for the question
 * 
 * @property {Int} m_status indicates whether the question was answered correctly or not
 * 
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
     * @returns {void}
    */
    constructor(a_prompt, a_options, a_answer){
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

    /** The user's selection */
    m_selection = -1;
    /** The integer representing whether or not the question was answered correctly */
    m_status = 0;
}

/**
 * Creates a card using the information from the question
 * 
 * @param {Question} a_question the question the card will represent
 */
function DisplayQuestion(a_question){
    // Create card DOM element and assign it an id as a data-index
    var t_card = $("<div>").addClass("card");
    t_card.attr("data-index", a_question.m_id);

    // Create card title div
    var t_title = "Question " + a_question.m_id + ": ";
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
}

/**
* Handles the event of a question option being clicked
* 
* @param {Event} event the event calling the function containing the data @var a_question and @var a_item
*/
function HandleOptionClick(event){
    event.preventDefault();

    // Create helping vars
    var t_question = event.data.t_question;
    var t_item = event.data.t_item;
        
    // Assign the q-options-correct and q-options-incorrect classes 
    if(t_question.m_status === 0){
        // Register answer
         t_question.CollectAnswer($(t_item).data("index"));

        // Add the appropriate the classes
         if(t_question.m_status === 1){
            $(t_item).addClass("q-options-correct");
            $(t_item).append($("<i>").addClass("q-answer-icon " + icon_check_class));
        }
        else if(t_question.m_status === -1){
            $(t_item).addClass("q-options-incorrect");
            $(t_item).append($("<i>").addClass("q-answer-icon " + icon_cross_class));
        }
    }
}

function TestQuestion(){
    // Create a question
    var test_question = new Question("This is a test question",["First Answer", "Second Answer", "Correct Answer", "Fourth Answer"],2);

    DisplayQuestion(test_question);
}

// ========== VARIABLES ==========
var icon_circle_class = "far fa-circle";
var icon_circle_check_class = "fas fa-check-circle";
var icon_circle_cross_class = "fas fa-times-circle";
var icon_check_class = "fas fa-check";
var icon_cross_class = "fas fa-times";


