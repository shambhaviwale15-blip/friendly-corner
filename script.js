const navLinks = document.querySelectorAll(".nav-menu .nav-link")
const menuOpenButton = document.querySelector("#menu-open-button")
const menuCloseButton = document.querySelector("#menu-close-button")

menuOpenButton.addEventListener("click", () => {
    // Toggle mobile menu visibility 
    document.body.classList.toggle("show-mobile-menu");

});
// Close menu when the close button is clicked 
menuCloseButton.addEventListener("click", () => menuOpenButton.click ())

// Close menu when the nav link is clicked 

navLinks.forEach(link => {
  link.addEventListener("click", () => menuOpenButton.click ());
})
// Chat section styling 
let username = "";

// ------------------- LOGIN -------------------
function login() {
  const input = document.getElementById('username').value.trim();
  if (input !== "") {
    username = input;
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('chatWhiteboardContainer').style.display = 'flex';
    
    addMember(username);
    loadMessages();
    displayMembers();
    loadCanvas(); // load whiteboard on login
  } else {
    alert("Please enter your name.");
  }
}

// ------------------- MEMBERS -------------------
function addMember(user) {
  let members = JSON.parse(localStorage.getItem('qcMembers') || '[]');
  const timestamp = Date.now();
  const existing = members.find(m => m.user === user);
  if (existing) {
    existing.status = 'online';
    existing.time = timestamp;
  } else {
    members.push({ user: user, status: 'online', time: timestamp });
  }
  localStorage.setItem('qcMembers', JSON.stringify(members));
}

function cleanMembers() {
  let members = JSON.parse(localStorage.getItem('qcMembers') || '[]');
  const now = Date.now();
  members = members.filter(m => now - m.time < 24*60*60*1000);
  localStorage.setItem('qcMembers', JSON.stringify(members));
}

function displayMembers() {
  cleanMembers();
  const membersDiv = document.getElementById('membersOnline');
  membersDiv.innerHTML = '';
  let members = JSON.parse(localStorage.getItem('qcMembers') || '[]');

  members.forEach(m => {
    const div = document.createElement('div');
    div.classList.add('member');
    
    const dot = document.createElement('span');
    dot.classList.add('status-dot');
    dot.classList.add(m.status === 'online' ? 'online' : 'offline');
    
    div.appendChild(dot);
    div.appendChild(document.createTextNode(m.user));
    membersDiv.appendChild(div);
  });

  setTimeout(displayMembers, 10000); // refresh every 10s
}

// Mark offline on tab close
window.addEventListener('beforeunload', () => {
  let members = JSON.parse(localStorage.getItem('qcMembers') || '[]');
  const user = members.find(m => m.user === username);
  if (user) user.status = 'offline';
  localStorage.setItem('qcMembers', JSON.stringify(members));
});

// ------------------- CHAT -------------------
function sendMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (msg !== "") {
    const timestamp = Date.now();
    const messageObj = { user: username, text: msg, time: timestamp };
    
    let messages = JSON.parse(localStorage.getItem('qcMessages') || '[]');
    messages.push(messageObj);
    localStorage.setItem('qcMessages', JSON.stringify(messages));
    
    input.value = '';
    displayMessages();
  }
}

function displayMessages() {
  const messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML = '';
  
  let messages = JSON.parse(localStorage.getItem('qcMessages') || '[]');
  
  const now = Date.now();
  messages = messages.filter(m => now - m.time < 24*60*60*1000);
  localStorage.setItem('qcMessages', JSON.stringify(messages));
  
  messages.forEach(m => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.textContent = `${m.user}: ${m.text}`;
    messagesDiv.appendChild(div);
  });
  
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function loadMessages() {
  displayMessages();
  setInterval(displayMessages, 5000);
}

// ------------------- WHITEBOARD -------------------
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
let drawing = false;

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
  if (drawing) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = "#ff66cc";
    ctx.lineWidth = 2;
    ctx.stroke();
    saveCanvas(); // save after each stroke
  }
});

canvas.addEventListener('mouseup', () => { drawing = false; });
canvas.addEventListener('mouseleave', () => { drawing = false; });

function clearBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  localStorage.setItem('qcCanvas', canvas.toDataURL());
}

function saveCanvas() {
  localStorage.setItem('qcCanvas', canvas.toDataURL());
}

function loadCanvas() {
  const dataURL = localStorage.getItem('qcCanvas');
  if (dataURL) {
    const img = new Image();
    img.src = dataURL;
    img.onload = () => { ctx.drawImage(img, 0, 0); }
  }
}

// Refresh canvas every 1 second to sync
setInterval(loadCanvas, 1000);

//Playlist Storage
// Load playlist from Local Storage
let playlist = JSON.parse(localStorage.getItem('sharedPlaylist')) || [];

// Display playlist on page load
displayPlaylist();

// Add song form submission
document.getElementById('add-song-form').addEventListener('submit', function(e) {
    e.preventDefault();

    let title = document.getElementById('song-title').value.trim();
    let artist = document.getElementById('song-artist').value.trim();
    let link = document.getElementById('song-link').value.trim();

    if (title && artist) {
        playlist.push({ title, artist, link });
        savePlaylist();
        displayPlaylist();
        this.reset();
    }
});

// Display playlist
function displayPlaylist() {
    let list = document.getElementById('playlist');
    list.innerHTML = '';

    playlist.forEach((song, index) => {
        let li = document.createElement('li');
        li.innerHTML = `
            <strong>${song.title}</strong> - ${song.artist}
            ${song.link ? `<a href="${song.link}" target="_blank">Listen</a>` : ''}
            <button class="delete-btn" data-index="${index}">❌</button>
        `;
        list.appendChild(li);
    });

    // Attach delete event to each button
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            let i = this.getAttribute('data-index');
            playlist.splice(i, 1); // remove the song
            savePlaylist();
            displayPlaylist();
        });
    });
}

// Save playlist to Local Storage
function savePlaylist() {
    localStorage.setItem('sharedPlaylist', JSON.stringify(playlist));
}

const firebaseConfig = {
  apiKey: "AIzaSy...something...",
  authDomain: "quietconnect.firebaseapp.com",
  databaseURL: "https://quietconnect-default-rtdb.firebaseio.com",
  projectId: "quietconnect",
  storageBucket: "quietconnect.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123"
};


//Live Hangout 
// Optional: show alert when button clicked
const zoomBtn = document.querySelector('.zoom-btn');

zoomBtn.addEventListener('click', () => {
    alert("You are joining the live Google Meet Hangout! Enjoy Chatting! 😊");
});



//Safety Guidelines
