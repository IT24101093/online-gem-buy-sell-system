function add(sender, text) {
    document.getElementById("chatbox").innerHTML +=
        `<p><b>${sender}:</b> ${text}</p>`;
}

function send() {
    let msg = document.getElementById("msg").value;

    add("You", msg);

    fetch("/api/chat", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({message: msg})
    })
    .then(r=>r.json())
    .then(d=>{
        add("Bot", d.reply);
        speak(d.reply);
    });
}

function voice() {
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.start();

    rec.onresult = e => {
        document.getElementById("msg").value =
            e.results[0][0].transcript;
        send();
    };
}

function speak(text) {
    const s = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(s);
}