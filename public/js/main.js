const sendForm = document.getElementById("send-form");
const socket = io();

//  DOM elements
const mssgArea = document.getElementById("msg-area");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users-name");

// Getting username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Join ChatRooms
socket.emit("joinRoom", { username, room });

// Get room and Users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on("message", (message) => {
  outputMessage(message);
});

// Get the message box

sendForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const mssg = e.target.elements.msg.value;

  //   Emmiting a message to severe
  socket.emit("chatMessage", mssg);

  //   clear message box
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const mssgElement = document.createElement("p");
  mssgElement.classList = "d-block position-relative chat";
  mssgElement.innerHTML = `<span class="">${message.username} ${message.time}</span>
            ${message.text}
            </p>`;

  document.querySelector("#msg-area").appendChild(mssgElement);

  //   scroll down when any message come
  mssgArea.scrollTop = mssgArea.scrollHeight;
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerHTML = room;
}

// Add user to user list DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<h6>${user.username}</h6>`).join("")}
    `;
}
