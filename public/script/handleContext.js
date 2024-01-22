function closeContext() {
    const ctxMenu = document.getElementById('user-context');

    ctxMenu.style.display = 'none';   
    ctxMenu.style.top = null;
    ctxMenu.style.left = null;
}

document.addEventListener('contextmenu',(e)=>{
    const ctxMenu = document.getElementById('user-context');
    if( ctxMenu.style.display === 'block') {
        closeContext()
    }

    if(!e.target.classList || !e.target.classList.contains('user-group-items')) {
        return
    }
    e.preventDefault();
        
    ctxMenu.style.display = 'block';
    
    ctxMenu.style.top = e.pageY+'px';
    ctxMenu.style.left = e.pageX+'px';
});

document.addEventListener('click', ()=> {
    closeContext()
});