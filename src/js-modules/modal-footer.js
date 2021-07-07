import variables from './variables.js';

(() => {
    
  variables.openModalBtnFooter.addEventListener("click", openModalFooter);
  
    
  function openModalFooter(e) {     
    variables.modalFooter.classList.remove("footer-hidden");
    variables.body.classList.add('body-overflow')
        window.addEventListener("keydown", onPressEscapeFooter);
        variables.closeModalBtnFooter.addEventListener("click", closeModalFooter);
        variables.modalFooter.addEventListener("click", backdropCloseModalFooter);   
  };

  
    function closeModalFooter() {
      
      variables.closeModalBtnFooter.removeEventListener("click", closeModalFooter);
      variables.modalFooter.classList.add("footer-hidden");
      variables.body.classList.remove('body-overflow')
      variables.modalFooter.removeEventListener("click", closeModalFooter);
      window.removeEventListener('keydown', onPressEscapeFooter);
    }
    function onPressEscapeFooter(event) {
      if (event.code === 'Escape') {
        closeModalFooter();
      }
    }
    function backdropCloseModalFooter(event) {
      if (event.currentTarget === event.target) {
      closeModalFooter();
    }
    }
})();



(() => {
  variables.openModalBtnFooter.addEventListener('click', () => {    
    variables.modalFooter.classList.remove('footer-hidden');        
  });   
  variables.closeModalBtnFooter.addEventListener('click', () => {
    variables.modalFooter.classList.add('footer-hidden'); 
    document.querySelector('.footer-card-list .card-active').classList.remove('card-active');
  });
   
  const cardListRef = document.querySelector('.footer-card-list');
  cardListRef.addEventListener('click', (evt) => {
    const targetButton = evt.target.closest('.collapsible');
    if (!targetButton) return;
    const targetCard = targetButton.closest('.footer-card-list-item');
    const currentActiveCard = document.querySelector('.footer-card-list .card-active');
    if (targetCard === currentActiveCard) {
      targetCard.classList.remove('card-active');
      return
    };
    if (currentActiveCard) currentActiveCard.classList.remove('card-active');
    targetCard.classList.add('card-active')
    
  });
})();


