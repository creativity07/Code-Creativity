const state = {
  users: JSON.parse(localStorage.getItem("users")) || [],
  posts: JSON.parse(localStorage.getItem("posts")) || [],
  currentUser: localStorage.getItem("currentUser"),
  theme: localStorage.getItem("theme") || "light"
};

const authSection = document.getElementById("auth");
const appSection = document.getElementById("app");
const profileSection = document.getElementById("profile");
const postsDiv = document.getElementById("posts");
const profileTitle = document.getElementById("profileTitle");
const profilePosts = document.getElementById("profilePosts");

init();

function init() {
  applyTheme();
  toggleUI();
  renderPosts();
}

// -------------------- AUTH --------------------
function register() {
  if (!email.value || !password.value) return alert("Fill all fields");

  if (state.users.find(u => u.email === email.value))
    return alert("User already exists");

  state.users.push({ email: email.value, password: password.value });
  persist();
  alert("Registered successfully");
}

function login() {
  const user = state.users.find(
    u => u.email === email.value && u.password === password.value
  );

  if (!user) return alert("Invalid credentials");

  state.currentUser = user.email;
  localStorage.setItem("currentUser", state.currentUser);
  toggleUI();
}

function logout() {
  localStorage.removeItem("currentUser");
  location.reload();
}

function toggleUI() {
  const loggedIn = !!state.currentUser;
  authSection.hidden = loggedIn;
  appSection.hidden = !loggedIn;
  profileSection.hidden = true;
}

// -------------------- POSTS --------------------
function addPost() {
  if (!postText.value.trim()) return alert("Write something first");

  const file = document.getElementById("media").files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      createPost(reader.result);
    };
    reader.readAsDataURL(file);
  } else {
    createPost(null);
  }
}

function createPost(mediaData) {
  state.posts.unshift({
    id: crypto.randomUUID(),
    user: state.currentUser,
    text: postText.value,
    media: mediaData,
    likes: 0,
    comments: [],
    time: new Date().toLocaleString()
  });

  postText.value = "";
  media.value = "";
  persist();
  renderPosts();
}

function likePost(id) {
  const post = state.posts.find(p => p.id === id);
  post.likes++;
  persist();
  renderPosts();
}

function editPost(id) {
  const post = state.posts.find(p => p.id === id);
  const newText = prompt("Edit your post:", post.text);
  if (newText !== null) {
    post.text = newText;
    persist();
    renderPosts();
  }
}

function deletePost(id) {
  if (!confirm("Delete this post?")) return;
  state.posts = state.posts.filter(p => p.id !== id);
  persist();
  renderPosts();
}

function comment(id, text) {
  if (!text.trim()) return;
  const post = state.posts.find(p => p.id === id);
  post.comments.push(text);
  persist();
  renderPosts();
}

function renderPosts() {
  postsDiv.innerHTML = "";

  state.posts.forEach(p => {
    postsDiv.innerHTML += `
      <div class="post">
        <div class="post-header">
          <span onclick="openProfile('${p.user}')"
                style="cursor:pointer;color:var(--primary)">
            ${p.user}
          </span>
          <span>${p.time}</span>
        </div>
        <p>${p.text}</p>
        ${p.media ? (p.media.startsWith("data:video")
          ? `<video controls src="${p.media}"></video>`
          : `<img src="${p.media}">`) : ""}

        <div class="post-actions">
          <button onclick="likePost('${p.id}')">❤️ ${p.likes}</button>
          ${p.user === state.currentUser ? `<button onclick="editPost('${p.id}')">Edit</button>
          <button onclick="deletePost('${p.id}')">Delete</button>` : ""}
        </div>

        <input placeholder="Write a comment..."
          onkeydown="if(event.key==='Enter') { comment('${p.id}', this.value); this.value=''; }">

        ${p.comments.map(c => `<div class="comment">💬 ${c}</div>`).join("")}
      </div>
    `;
  });
}

// -------------------- PROFILE --------------------
function openProfile(userEmail) {
  profileTitle.textContent = `${userEmail}'s Profile`;
  appSection.hidden = true;
  profileSection.hidden = false;

  profilePosts.innerHTML = "";
  state.posts
    .filter(p => p.user === userEmail)
    .forEach(p => {
      profilePosts.innerHTML += `
        <div class="post">
          <div class="post-header">
            <span>${p.user}</span>
            <span>${p.time}</span>
          </div>
          <p>${p.text}</p>
          ${p.media ? (p.media.startsWith("data:video")
            ? `<video controls src="${p.media}"></video>`
            : `<img src="${p.media}">`) : ""}
        </div>
      `;
    });
}

function closeProfile() {
  profileSection.hidden = true;
  appSection.hidden = false;
}

// -------------------- THEME --------------------
function toggleTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  applyTheme();
  localStorage.setItem("theme", state.theme);
}

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
}

// -------------------- STORAGE --------------------
function persist() {
  localStorage.setItem("users", JSON.stringify(state.users));
  localStorage.setItem("posts", JSON.stringify(state.posts));
}
