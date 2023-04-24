const CLIENT_ID = "9Px4mqfUgPgZOJ1d";
const user = {
    name: getRandomName(),
    color: getRandomColor(),
};
const drone = new ScaleDrone(CLIENT_ID, {
    data: user,
});

let members = [];

drone.on("open", (error) => {
    if (error) {
        alert(error);
        return;
    }
    alert("Successfully connected to Scaledrone");

    const room = drone.subscribe("observable-room");
    room.on("open", (error) => {
        if (error) {
            alert(error);
            return;
        }
        alert("Successfully joined room");
    });

    room.on("members", (m) => {
        members = m;
    });
    room.on("memberJoin", (member) => {
        members.push(member);
    });
    room.on("memberLeave", ({ id }) => {
        const index = members.findIndex((member) => member.id === id);
        members.splice(index, 1);
    });
    room.on("data", (text, member) => {
        if (member) {
            addMessageToList(text, member);
        } 
    });
});

function getRandomName() {
    const randomName = [
        "Tokyo:",
        "Moscow:",
        "Berlin:",
        "Nairobi:",
        "Rio:",
        "Denver:",
        "Helsinki:",
        "The Professor:",
    ];
    return randomName[Math.floor(Math.random() * randomName.length)];
}

function getRandomColor() {
    return "#" + Math.floor(Math.random() * 0xffffff).toString(16);
}

const messages = document.querySelector(".messages");
const messageFormInput = document.querySelector(".messageFormInput");
const messageForm = document.querySelector(".messageForm");

messageForm.addEventListener("submit", sendMessage);

function sendMessage() {
    const value = messageFormInput.value.trim();
    if (value === "") {
        alert("Molim vas unesite poruku!")
        return;
    }
    messageFormInput.value = "";
    drone.publish({
        room: "observable-room",
        message: value,
    });
}

function createMemberElement(member) {
    const { name, color } = member.clientData;
    const el = document.createElement("div");
    el.appendChild(document.createTextNode(name));
    el.className = "member";
    el.style.color = color;

    return el;
}

function createMessageElement(text, member) {
    const { name } = member.clientData;
    const el = document.createElement("div");
    el.appendChild(createMemberElement(member));
    el.appendChild(document.createTextNode(text));
    el.className = name === user.name ? "active message" : "message";

    return el;
}

function addMessageToList(text, member) {
    const el = messages;
    const wasTop = el.scrollTop === el.scrollHeight - el.clientHeight;
    const message = createMessageElement(text, member);
    el.appendChild(message);
    if (wasTop) {
        el.scrollTop = el.scrollHeight - el.clientHeight;
    }
    message.scrollIntoView();
}
