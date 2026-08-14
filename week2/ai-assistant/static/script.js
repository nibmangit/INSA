const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const message = input.value;

    console.log("User message:", message);
});