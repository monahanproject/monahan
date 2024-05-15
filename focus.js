document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('button, a, input, select, textarea').forEach((element) => {
      element.addEventListener('focus', () => {
        element.classList.add('focus-visible');
      });
      element.addEventListener('blur', () => {
        element.classList.remove('focus-visible');
      });
    });
  });
  