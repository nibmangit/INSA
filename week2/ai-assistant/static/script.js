const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    sendMessage();
});

function addMessage(message, type) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", type);

    const content = document.createElement("div");
    content.classList.add("message-content");
    content.textContent = message;

    messageElement.appendChild(content);
    chatBox.appendChild(messageElement);
}


async function sendMessage() {
    const message = input.value;

    addMessage(message, "user-message");
    input.value = "";

    const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: message
        })
    });

    const data = await response.json();

    addMessage(data.response, "ai-message"); 
}