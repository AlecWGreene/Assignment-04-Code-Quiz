// ========== VARIABLES ==========

// ---------- FA Class strings ----------
/** The FA class for circle */
var icon_circle_class = "far fa-circle";
/** The FA class for circled checkmark */
var icon_circle_check_class = "fas fa-check-circle";
/** The FA class for a circled cross */
var icon_circle_cross_class = "fas fa-times-circle";
/** The FA class for a checkmark */
var icon_check_class = "fas fa-check";
/** The FA class for cross */
var icon_cross_class = "fas fa-times";

// ---------- DOM Elements ----------
/** The question list */
var nav_questionList = $(".n-question-list");
/** The array of questions the user has viewed */
var nav_questionItem_array = new Array();

// ---------- Global Variables ----------
/** The starting position of the question list */
var global_startX = $(".n-question-list").offset().left;
/** Determines which collections of questions to generate the quiz from */
var quiz_difficulty = -1;
/** Determines how long the quiz will be */
var quiz_length = 0;



// ========== NAVIGATION FUNCTIONS ==========

/**
 * Adds a span element to the question list 
 * 
 * @param {Int} a_index the index of the question being added
 * 
 * @returns {void}
 */
function AddQuestionItem(a_index){
    // Create the span to hold the Question list item
    var t_element = $("<span>").addClass("n-question-item");
    $(t_element).attr("data-index", a_index);
    $(t_element).text("Question " + (a_index + 1) + " ");
    t_element.on("mouseup", HandleNavItemClick);

    // Add a placeholder for the icon
    var t_icon = $("<i>").addClass(icon_circle_class);
    t_element.append(t_icon);

    // Add the item to the question list
    nav_questionList.append(t_element);
    nav_questionItem_array.push(t_element);
}

// TODO: actually call your fucking methods plz

/**
 * Applies a script to the object which allows the user to drag it along the x-axis using their mouse
 * 
 * @param {Element} a_element the element which the user should be able to manipulate
 * 
 * @returns {void}
 */
function EnableScrollableElement(a_element){
    /** Variables to help track the mouse and element position */
    var startX = 0, deltaX = 0;

    var t_item = null;

    // Add event listener
    $(a_element).on("mousedown", HandleMouseMovement);

    /**
     * Calls the appropriate methods to scroll the element when the mouse moves
     * 
     * @param {Event} a_event the event of mousedown
     */
    function HandleMouseMovement(a_event){
        a_event.preventDefault();

        // Grab the mouse position
        startX = a_event.clientX;
        startY = a_event.clientY;

        // Add listeners to the document
        $(document).on("mousemove", ScrollElement);
        $(document).on("mouseup", StopScrolling);
    }

    /**
     * Move the element along the X-axis corresponding to the user's mouse movement
     * 
     * @param {Event} a_event 
     * 
     * @returns {void}
     */
    function ScrollElement(a_event){
        a_event.preventDefault();
        
        // Do not trigger the mouseup event on the nav item
        DisableNavElement(a_event);

        // Update position variables
        deltaX = a_event.clientX - startX;
        startX = a_event.clientX;
        
        // Shift the nav question list 
        $(a_element).offset({top: $(a_element).offset().top, left: $(a_element).offset().left + deltaX}); 
        
    }

    /**
     * Disables the nav item in the event the user is scrolling the list
     * 
     * @param {Event} a_event the mousemove event triggered by n-question-list
     * 
     * @returns {void}
     */
    function DisableNavElement(a_event){
        t_item = a_event.target;
        $(t_item).off("mouseup");
    }

    /**
     * Removes the document listeners when the element isn't being scrolled
     * 
     * @returns {void}
     */
    function StopScrolling(){
        // Remove the listeners from the document
        $(document).off("mousemove", ScrollElement);
        $(document).off("mouseup", StopScrolling);

        // Reattach the nav item listener
        $(t_item).on("mouseup", HandleNavItemClick);

        // Correct the positioning of the elements
        CorrectFirstVisibleItem(a_element);
    }
}

/**
 * Freezes the position of the element by removing the mousedown listeners
 * 
 * @param {Element} a_element the scrollable element to freeze the movement of
 * 
 * @returns {void}
 */
function DisableScrollableElement(a_element){
    $(a_element).off("mousedown");
}

/**
 * Searches through nav_questionItem_array until it finds the leftmost element and shifts a_element array until the next element matches up to the brand
 * 
 * @param {Element} a_element
 * 
 * @returns {void}
 */
function CorrectFirstVisibleItem(a_element){
    var t_first_element = nav_questionItem_array[0];

    // Loop through the array to find the first element being occluded by the brand
    for(let i = 0; i < nav_questionItem_array.length; i++){
        // If the ith item is to the right of the global_startX then break the loop
        if($(nav_questionItem_array[i]).offset().left > global_startX){
            break;
        }
        // If the ith item is to the left of the global_startX then assign that to t_first_element
        else if($(nav_questionItem_array[i]).offset().left <= global_startX){
            t_first_element = nav_questionItem_array[i];
        }
    }

    // Create a variable to store how far to shift the element and it's current position
    var t_shift = 0;
    var t_position = $(a_element).offset().left;

    // If the first element's distance to global_startX is smaller than half the element's width
    if((global_startX - $(t_first_element).offset().left) < 0.8 * $(t_first_element).width()){
        t_shift = global_startX - $(t_first_element).offset().left;
    }
    else{
        // Grab the next element in the question array
        var t_next_index = $(t_first_element).data("index") + 1;
        t_first_element = nav_questionItem_array[t_next_index];

        // Store the value
        t_shift = global_startX - $(t_first_element).offset().left;
    }

    // Shift the element
    t_position += t_shift;
    $(a_element).offset({left: t_position});
}

/**
 * Displays the question corresponding to the index of the clicked nav item
 * 
 * @param {Event} a_event The event of a nav item being clicked
 * 
 * @returns {void}
 */
function HandleNavItemClick(a_event){
    a_event.preventDefault();

    // Display the question
    DisplayQuestion(questionArray[$(a_event.target).data("index")]);
}




// ========== MENU FUNCTIONS ==========
/** An array of UserScore objects representing the high scores */
var highScores = [];
/** Initialize high score array in session storage */
sessionStorage.setItem("highScoreArray",JSON.stringify([["Name", "Difficulty", "Score"]]));
/** The quiz timer */
var quiz_timer = null;

/**
 * An object representing a quiz attempt
 * 
 * @property {String} m_name The name of the user who attempted the quiz
 * 
 * @property {Number} m_difficulty The difficulty of the attempt
 * 
 * @property {Number} m_score The score the user achieved
 * 
 * @method ToTableRow Returns a DOM element consisting of a row made up of the properties
 */
class UserScore{
    constructor(a_name, a_difficulty, a_score){
        var t_this_object = this;
        this.m_name = a_name;

        if(typeof(a_difficulty) === "number"){
            // Store the difficulty as a string
            switch(a_difficulty){
                case 0:
                    t_this_object.m_difficulty = "Easy";
                    break;
                case 1:
                    t_this_object.m_difficulty = "Medium";
                    break;
                case 2:
                    t_this_object.m_difficulty = "Hard";
                    break;
                default:
                    t_this_object.m_difficulty = "NaN";
                    break;
            }
        }
        else{
            t_this_object.m_difficulty = a_difficulty;
        }

        this.m_score = a_score;
    }

    /**
     * Turns the object into a row of data
     * 
     * @returns {Element} A <tr> tag containing <td> tags with the user properties
     */
    ToTableRow(){
        var t_row = $("<tr>");

        var t_name_td = $("<td>").text(this.m_name.toString());
        var t_difficulty_td = $("<td>").text(this.m_difficulty.toString());
        var t_score_td = $("<td>").addClass("td-score").text(this.m_score.toString());

        t_row.append(t_name_td).append(t_difficulty_td).append(t_score_td);

        return t_row;
    }
}

/**
 * Grabs the high scores from session storage and puts them into a html table
 * 
 * @returns {Element} a table of high scores
 */
function GetHighScoreTable(){
    /** An array of @see UserScore objects */
    var t_string_array = JSON.parse(sessionStorage.getItem("highScoreArray"));

    /** The html table */
    var t_table = $("<table>");

    /** The html table headers */
    t_table.append($("<tr>").html("<th> Name </th> <th> Difficulty </th> <th class=\" td-score \"> Score </th>"))

    // For each element in the array
    for(let i = 1; i < t_string_array.length; i++){
        // JSON parse the element
        t_string_array[i] = JSON.parse(t_string_array[i]);
        
        // Create a new UserScore object
        var t_score = new UserScore(t_string_array[i].m_name, t_string_array[i].m_difficulty, t_string_array[i].m_score);

        // Append it as a row
        t_table.append(t_score.ToTableRow());
    }
    
    return $(t_table);
}

/**
 * Updates the session storage variable highScoreArray with a new score
 * 
 * @param {UserScore} a_score The user submitted score
 * 
 * @returns {void}
 */
function StoreHighScore(a_score){
    // Stringify the user score
    var t_string = JSON.stringify(a_score);

    // Pull the table from session storage
    var t_string_array = Array.from(JSON.parse(sessionStorage.getItem("highScoreArray")));

    // Add the score to the table
    t_string_array.push(t_string);

    // Update session storage variable
    sessionStorage.setItem("highScoreArray", JSON.stringify(t_string_array));
}

/**
 * Displays the main menu featuring buttons and input sliders for different quiz options
 * 
 * @returns {void}
 */
function DisplayMenu(){
    // Detach all current cards
    $(".card").remove();

    // Create card DOM element
    var t_card = $("<div>").addClass("card");

    // Create card title div
    var t_title = "Welcome to my code quiz\!";
    var t_card_title = $("<h3>").addClass("card-title").css("text-align","center");
    $(t_card_title).text(t_title);
    t_card.append(t_card_title);

    // Create the difficulty and header
    var t_header_difficulty = $("<h4>").text("Choose a difficulty: ").css("text-align","center").css("font-weight","bold").css("padding-top","2rem");
    var t_difficulty_span = $("<span>").attr("id","difficulty-span");
    t_header_difficulty.append(t_difficulty_span);

    // Create the difficulty buttons
    var t_btn_ul = $("<ul>").addClass("menu-section");
    var t_btn = $("<button>").addClass("btn btn-success btn-difficulty").attr("data-index",0); $(t_btn_ul).append(t_btn); $(t_btn).text("Easy"); $(t_btn).on("click",HandleMenuClick);
    t_btn = $("<button>").addClass("btn btn-warning btn-difficulty").attr("data-index",1).css("color","white"); $(t_btn_ul).append(t_btn); $(t_btn).text("Medium"); $(t_btn).on("click",HandleMenuClick);
    t_btn = $("<button>").addClass("btn btn-danger btn-difficulty").attr("data-index",2); $(t_btn_ul).append(t_btn); $(t_btn).text("Hard"); $(t_btn).on("click",HandleMenuClick);
    $(t_card).append(t_header_difficulty);
    $(t_card).append(t_btn_ul);


    // Create the length slider
    var t_header_length = $("<h4>").text("Change the length: ").css("text-align","center").css("font-weight","bold").css("padding-top","2rem");
    t_header_length.append($("<span>").attr("id","length-span"));
    var t_slider = $("<input>").attr("type","range").attr("id","length-slider");
    $(t_slider).attr("max", 13).attr("min", 1);
    $(t_card).append(t_header_length);
    $(t_slider).on("input", HandleSliderChange); $(t_card).append(t_slider);

    // Create the Generate button
    var t_generate_btn = $("<button>").addClass("btn btn-info btn-generate").text("Start Quiz");
    $(t_generate_btn).css("width","25%").css("margin", "3rem auto 0 auto");
    $(t_generate_btn).on("click",HandleMenuClick);
    $(t_card).append(t_generate_btn);

    // Append the menu to the page
    $("#doc-body").append(t_card);

}

/**
 * Displays a card asking the user for their information 
 * 
 * @returns {void}
 */
function DisplayEndCard(){
    // Detach any existing cards
    $(".card").detach();

    // Stop timer
    quiz_timer.StopTimer();

    // Create card DOM element
    var t_card = $("<div>").addClass("card");

    // Create card title var
    var t_title = "";

    // Assign an appropriate message to t_title
    if(quiz_timer.time <= 0){
        t_title = "Time's Up\!";
    }
    else{
        t_title = "You're all done\!"
    }

    // Put the title on the card
    var t_card_title = $("<h3>").addClass("card-title").css("text-align","center");
    $(t_card_title).text(t_title);
    t_card.append(t_card_title);

    // Get the high scores and add them to the card
    var t_div = $("<div>").addClass("body-end");
    t_div.append(GetHighScoreTable());

    // Create a boostrap text field and button
    var t_input_group = $("<form>").addClass("input-group").on("submit", HandleScoreSubmit);
    t_input_group.append($("<div>").addClass("input-group-prepend").append($("<span>").addClass("input-group-text").text("Please enter your name: ")));
    t_input_group.append($("<input>").attr("type","text"));
    t_input_group.offset({left: t_input_group.offset().left - 100});
    t_div.append(t_input_group);

    // Append div to card
    t_card.append(t_div);

    // Add restart handler to brand
    $(".navbar-brand").on("click", Restart);

    // Append card to body
    $("#doc-body").append(t_card);
}

/**
 * A method to call appropriate functions when a menu button is clicked
 * 
 * @param {Event} a_event An event representing a button click
 * 
 * @returns {void}
 */
function HandleMenuClick(a_event){
    a_event.preventDefault();

    // Sort the handling methods by the element that called the handler
    if($(a_event.target).hasClass("btn-difficulty")){ // If the button was a difficulty button
        quiz_difficulty = $(a_event.target).data("index");
        $(".btn-difficulty").each(function(a_index, a_element){ 
            $(a_element).removeClass("active");
        });
        $(a_event.target).addClass("active");
        $("#difficulty-span").text($(a_event.target).text());
    }
    else if($(a_event.target).hasClass("btn-generate")){ // If the button was the generate button
        if(quiz_length > 0 && quiz_difficulty != -1){
            questionArray = Array.from(GenerateQuiz(quiz_difficulty, quiz_length));
            
            for(let i = 0; i < questionArray.length; i++){
                if(questionArray[i] != undefined){
                    questionArray[i].m_id = i;
                    AddQuestionItem(i);
                }
                else{
                    break;
                }
            }

            // If there are more than 9 elements, allow user to scroll the question list
            if(questionArray.length > 9){
                EnableScrollableElement($(".n-question-list"));
            }

            // Display the first question
            DisplayQuestion(questionArray[0]);

            // Initialize the timer
            var t_time = 5 * (3 - quiz_difficulty) * questionArray.length;
            quiz_timer = new Timer(t_time);

            // Start the timer
            quiz_timer.StartTimer(DisplayEndCard);
        }
    }
}

/**
 * When the slider is changed, change the value of length
 * 
 * @param {Event} a_event An event to be called on input from a slider
 * 
 * @returns {void} 
 */
function HandleSliderChange(a_event){
    a_event.preventDefault();

    // Set length to the value of the slider
    quiz_length = $("#length-slider").val();
    $("#length-span").text(quiz_length);
}

/**
 * When the user hits enter in the text field from the end card, this stores the score
 * 
 * @param {Event} a_event The event to be called on input into the text field 
 * 
 * @returns {void}
 */
function HandleScoreSubmit(a_event){
    a_event.preventDefault();

    // Get name from text field
    var t_name = $("input").val();

    // Calculate what percentage of the alloted time was not used
    var t_time_left = 1 - (quiz_timer.time / (5 * (3 - quiz_difficulty) * questionArray.length));

    // For each question in the array
    var t_question_score = 0;
    for(let i = 0; i < questionArray.length; i++){
        // Add or subtract points based on the status of the question
        t_question_score += questionArray[i].m_status * (1 + questionArray[i].m_difficulty);
    }

    // Store the new score
    var t_score = new UserScore(t_name, quiz_difficulty, t_time_left * t_question_score );
    StoreHighScore(t_score);
    $(a_event.target).text("");

    // Add a row to the table
    var t_row = t_score.ToTableRow();
    $("table").append(t_row);
}

/**
 * Restarts the quiz and displays the starting menu
 * 
 * @param {Event} a_event The event of the user clicking on code quiz brand
 * 
 * @returns {void}
 */
function Restart(a_event){
    a_event.preventDefault();

    // Reset all questions
    for(let i = 0; i < questionArray.length; i++){
        questionArray[i].Reset();
    }

    questionArray = null;
    // Deatch all nav question items
    $(".n-question-list").children().each(function(a_index, a_element){$(a_element).remove() });
    quiz_difficulty = -1;
    quiz_length = 0;
    nav_questionItem_array = [];

    quiz_timer = null;

    DisplayMenu();
}

// When the document loads
$( document ).ready(DisplayMenu);
