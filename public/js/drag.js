
//Make the DIV element draggagle:
dragElement(document.getElementById("dragMe"), false);
dragElement(document.getElementById("create_group_modal_drag_me"), true);
dragElement(document.getElementById("group_manage_drag_me"), true);
dragElement(document.getElementById("profile_modal_logout_drag_me"), true);
dragElement(document.getElementById("profile_modal_login_drag_me"), true);
dragElement(document.getElementById("friend_list_modal_drag_me"), true);
dragElement(document.getElementById("friend_request_modal_drag_me"), true);


function dragElement(elmnt, leftDraggable) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        /* if present, the header is where you move the DIV from:*/
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        if (leftDraggable) {
            pos1 = pos3 - e.clientX;
            pos3 = e.clientX;
            elmnt.parentElement.style.left = (elmnt.parentElement.offsetLeft - pos1) + "px";
        }
        console.log(elmnt.parentElement.style.left, elmnt.parentElement.style.top)
        pos2 = pos4 - e.clientY;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.parentElement.style.top = (elmnt.parentElement.offsetTop - pos2) + "px";
        
        if (Number(elmnt.parentElement.style.top.replace("px", "")) < 0) {
            elmnt.parentElement.style.top = "0px"
        }
        if (Number(elmnt.parentElement.style.top.replace("px", "")) > window.innerHeight - (window.innerHeight * 0.1)) {
            elmnt.parentElement.style.top = `${window.innerHeight - (window.innerHeight * 0.1)}px`
        }
        
        if (Number(elmnt.parentElement.style.left.replace("px", "")) < 0) {
            elmnt.parentElement.style.left = "0px"
        }
        if (Number(elmnt.parentElement.style.left.replace("px", "")) > window.innerWidth - (window.innerWidth * 0.1)) {
            elmnt.parentElement.style.left = `${window.innerWidth - (window.innerWidth * 0.1)}px`
        }
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}