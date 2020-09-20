const socket = io()

socket.on('connect', () => {
    log("Connected!", "success")
});

socket.on('log', (text, state) => {
    log(text, state)
});

socket.on('disconnect', () => {
    log("Disconnected!", "error")
});

const log = (text, state) => {
    const con = document.querySelector(".logs")

    const indicator = document.createElement("span")
    indicator.classList.add("indicator")
    indicator.innerText = "-"

    const entry = document.createElement("li");
    entry.appendChild(indicator)
    entry.classList.add("entry")
    
    const COLORS = {
        "success": "#32CD32",
        "error": "red"
    }

    entry.style.color = COLORS[state]
    entry.appendChild(document.createTextNode(text)) 
    
    con.appendChild(entry)

    con.scrollTop = con.scrollHeight;
}