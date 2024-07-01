// Get all elements on the page
const allElements = document.querySelectorAll('*');

// Iterate through each element
allElements.forEach((element) => {
    // Get the computed background color of the element
    const computedColor = getComputedStyle(element).backgroundColor;

    // Check if the computed color matches rgb(128, 128, 128)
    if (computedColor === 'rgb(128, 128, 128)') {
        // Remove the element from the DOM
        element.remove();
    }
});
