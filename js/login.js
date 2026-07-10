// ==============================
// KONFIGURASI LOGIN
// ==============================
const USERNAME = "admin";
const PASSWORD = "rahasia123";

// Jika sudah login, langsung masuk dashboard
if (sessionStorage.getItem("isLogin") === "true") {
    window.location.href = "monitoring.html";
}

// Ambil elemen
const form = document.getElementById("loginForm");
const error = document.getElementById("error");

// Event ketika tombol Login ditekan
form.addEventListener("submit", function (e) {

    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username === USERNAME && password === PASSWORD) {

        // Simpan status login
        sessionStorage.setItem("isLogin", "true");

        // Pindah ke dashboard
        window.location.href = "monitoring.html";

    } else {

        error.style.display = "block";
        error.textContent = "Username atau Password salah!";

    }

});