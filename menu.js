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
    $(t_slider).attr("max", 50).attr("min", 1);
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

            if(questionArray.length > 9){
                EnableScrollableElement($(".n-question-list"));
            }

            DisplayQuestion(questionArray[0]);
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

// TODO: add document.on(ready)
DisplayMenu();