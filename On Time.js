// Function to check if the report is submitted on time
function isReportSubmittedOnTime(inputText) {
    // Extract dates from the input text
    const dueDateMatch = inputText.match(/Due Date: (\d{2}\/\d{2}\/\d{4})/);
    const submissionDateMatch = inputText.match(/Submission Date: (\d{2}\/\d{2}\/\d{4})/);

    // If dates are found, convert them to Date objects
    if (dueDateMatch && submissionDateMatch) {
        const dueDate = new Date(dueDateMatch[1]);
        const submissionDate = new Date(submissionDateMatch[1]);

        // Check if the submission date is on or before the due date
        const isOnTime = submissionDate <= dueDate;

        return isOnTime;
    } else {
        // Handle case where dates are not found in the input text
        console.error('Unable to extract dates from the input text.');
        return false;
    }
}

const table = document.querySelector('table');
const rows = table.querySelectorAll('tr');
const cells = rows[3].querySelectorAll('td');
const text = [];

cells.forEach(cell => {
  text.push(cell.textContent);
});

const inputText = text.join('\n');

// Check if the report is submitted on time using the function
const result = isReportSubmittedOnTime(inputText);

// Output the result
if (result) {
    console.log('Report is submitted on time.');
} else {
    console.log('Report is submitted late or due dates are not valid.');
}
