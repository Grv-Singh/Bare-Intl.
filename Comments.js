const textareas = document.querySelectorAll('textarea');
const text = Array.from(textareas).map(textarea => textarea.value).join('\n');

console.log(text);
