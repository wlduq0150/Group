const openBtn = document.querySelector('.button--open');
const closeBtn = document.querySelector('.button--close');
const modal = document.querySelector('.modal--bg');

openBtn.addEventListener('click', showModal);
closeBtn.addEventListener('click', closeModal);

function showModal() {
    modal.classList.remove('hidden');
    modal.classList.add('visible');
}

function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('visible');
}