document.addEventListener('DOMContentLoaded', () => {
    const heading = document.querySelector('h1');
    const subheading = document.querySelector('.subheading');
    const box1 = document.querySelector('.box-1');
    const box2 = document.querySelector('.box-2');
    let isAnimating = false;

    // Initially, ensure the elements are visible (in case of refresh)
    heading.classList.add('fade-in');
    subheading.classList.add('fade-in');

    document.addEventListener('click', () => {
        if (isAnimating) return;
        isAnimating = true;

        // Add fade-out (slide-out) classes for heading and subheading
        heading.classList.add('slide-out');
        subheading.classList.add('slide-out');

    setTimeout(() => {
        window.location.href = '../Html/LoginPage.html';
    }, 1000); // Adjust the timeout duration as needed
    });
});
