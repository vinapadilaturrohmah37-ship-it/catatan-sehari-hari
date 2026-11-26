
const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

function showDashboard() {
  loginPage.classList.add("hidden");
  dashboardPage.classList.remove("hidden");
}

function showLogin() {
  dashboardPage.classList.add("hidden");
  loginPage.classList.remove("hidden");
}

loginForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (username === "admin" && password === "12345") {
    sessionStorage.setItem("appkuLogin", "true");

    loginMessage.textContent = "";
    loginForm.reset();

    showDashboard();
  } else {
    loginMessage.textContent =
      "Username atau password salah.";
  }
});

document.getElementById("logoutBtn").addEventListener("click", function() {
  sessionStorage.removeItem("appkuLogin");
  showLogin();
});

if (sessionStorage.getItem("appkuLogin") === "true") {
  showDashboard();
} else {
  showLogin();
}
