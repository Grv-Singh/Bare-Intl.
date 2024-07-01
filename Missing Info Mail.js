const elements = document.querySelectorAll('*');
const greyTextContents = [];

let previousText = ''; // Initialize a variable to store the previous TR text

elements.forEach(element => {
  const backgroundColor = element.style.backgroundColor;
  if (backgroundColor === 'rgb(128, 128, 128)') {
    let currentText = element.textContent.replaceAll(/\\n|\\r/g, '');

    if (currentText.includes('Please') || currentText.includes('If yes')) {
      const previousTextContent = element.previousElementSibling.textContent.replaceAll(/\\n|\\r/g, '');
      currentText = previousTextContent + currentText;
    }

    // Continue to the next iteration if the current text contains certain phrases
    if (currentText.includes('below 10') || currentText.includes('unsuccessful') || currentText.includes('N/As') || currentText.includes('Excluding')  || currentText.includes('exclusion') || currentText.includes('elaborate others') || currentText.includes('elaborate in case')) {
      return;
    }

    greyTextContents.push(previousText + '\n' + currentText);

    previousText = currentText; // Update the previous TR text
  }
});

// Split by a new line, remove duplicates, and join again by a new line
const uniqueLines = [...new Set(greyTextContents.join('\n').split('\n'))];

// Join by a new line while removing leading and trailing spaces
const result = uniqueLines.map(line => line.trim()).join('\n');

// Prepend a space before all characters which are like a capital letter then small
const formattedResult = result.replace(/([A-Z])([a-z])/g, ' $1$2');

// Replace matches of the format "\n 5.4.3.a" with ->
const formattedResultWithArrow = formattedResult.replace(/\n\d+\.\d+\.\d+\.[a-z]/g, ' -> ');

const formattedResultWithArrow2 = formattedResultWithArrow.replace(/\n\d+\.\d+\.\d+/g, ' -> ');

const formattedResultWithArrow3 = formattedResultWithArrow2.replace(/\n\d+\.\d+\.[a-z]/g, ' -> ');

// Remove strings like "N/A," "0/0," "1/1," "Yes No," or "0/1"
const finalResult = formattedResultWithArrow3.replace(/\b(N\/A|0\/0|1\/1|Yes No|0\/1)\b/g, '');

// Replace double new lines with a single new line
const resultWithSingleNewLine = finalResult.replace(/\n\n/g, '\n');

// Replace double spaces with a single space
const resultWithSingleSpace = resultWithSingleNewLine.replace(/ +/g, ' ');

// Get today's date
const today = new Date();
const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

const PCB = `${formattedDate} : GS : First Tier : Fully Edited : ${jobStatus}`;

// Get text from the element with class white16bold
const pageTitle = document.querySelector('.white16bold').textContent.trim();

// Get text from the span with class blue12bold
const locationText = document.querySelector('.blue12bold').textContent.trim();

// Check if locationText contains "Boutique", "Flagship", or "MDZ & Pop Up"
if (locationText.includes("Boutique") || locationText.includes("Flagship") || locationText.includes("MDZ & Pop Up")) {
    // Show a JavaScript alert to the user
    alert("This location is a direct store, Boutique, Flagship, or MDZ & Pop Up. Please mark the following questions as N/A: Q1.7, 2.14, and 2.15. i.e. on free of store/retailer created point of sale materials as well as on Environment - Competition");
}

function checkHairCareRadioButton() {
    // Find all radio buttons on the page
    const radioButtons = document.querySelectorAll('input[type="radio"]');

    // Iterate through each radio button
    for (const radioButton of radioButtons) {
        // Check if the radio button's label (text) contains "hair care"
        if (radioButton.textContent.toLowerCase().includes("Hair Care")) {
            // Check if the radio button is checked
            if (radioButton.checked) {
                // The "hair care" radio button is checked
                alert("The staff are referred to as stylists for hair care audits.");
                // You can perform additional actions here if needed
                break; // Exit the loop since we found the desired radio button
            }
        }
    }
}

// Call the function to check the radio button
checkHairCareRadioButton();

// Get selected option from the select element with name 'JobStatus'
const jobStatusSelect = document.querySelector('select[name="JobStatus"]');
const selectedOption = jobStatusSelect ? jobStatusSelect.options[jobStatusSelect.selectedIndex] : null;

// Check if any option is selected
const jobStatus = selectedOption ? selectedOption.textContent.trim() : 'N/A';

// Construct the additional text
const additionalText = `${PCB} \n\nDear Evaluator,\nI am reaching you out regarding the ${pageTitle} conducted at ${locationText}.\nReport's status is ${jobStatus}.\n\nPlease clarify the additional queries as follows :\n`;

// Append additional text and contact details
const finalEmailText = `${additionalText}${resultWithSingleSpace}\n\nThank you in advance, for your time and efforts 🙏 Please reply within a day.\n\nWith regards,\nGaurav Singh\nBARE International.`;

console.log(finalEmailText);
