const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");

async function sendMessage() {
    const message = input.value;

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

    console.log("Server response:", data);
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    sendMessage();
});