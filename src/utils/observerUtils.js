function handleIntersection(entry, observer) {
  if (entry.isIntersecting) {
    entry.target.classList.add('show-element');
    entry.target.classList.remove('hidden-element');
    observer.unobserve(entry.target);
  }
}

const observeElements = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      handleIntersection(entry, observer);
    });
  });

  const hiddenElements = document.querySelectorAll('.hidden-element');
  hiddenElements.forEach((element) => {
    observer.observe(element);
  });
};

export { observeElements };
