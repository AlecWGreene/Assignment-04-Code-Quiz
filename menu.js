ScrollableElement($(".n-question-list"));

var global_startX = $(".n-question-list").offset().left;

function ScrollableElement(a_element){
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

        console.log("Mouse movement detected");

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
        console.log("ScrollElement called");
        a_event.preventDefault();
        a_event.stopPropagation();
        
        // Update position variables
        deltaX = a_event.clientX - startX;
        startX = a_event.clientX;
        
        if(($(a_element).offset().left + deltaX) > global_startX){
            $(a_element).offset({top: $(a_element).offset().top, left: $(a_element).offset().left + deltaX});
        }
        else{ // Clamp the scroll to the left
            $(a_element).offset({left: global_startX});
        }
        
    }

    /**
     * Removes the document listeners when the element isn't being scrolled
     * 
     * @returns {void}
     */
    function StopScrolling(){
        console.log("Stopped Scrolling");
        // Remove the listeners from the document
        $(document).off("mousemove", ScrollElement);
        $(document).off("mouseup", StopScrolling);
    }
}