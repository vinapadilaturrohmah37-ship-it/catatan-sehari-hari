
const $ = id => document.getElementById(id);

let kendaraan = JSON.parse(localStorage.getItem("dataParkir") || "[]");
let pelanggan = JSON.parse(localStorage.getItem("dataPelanggan") || "[]");

function simpanData() {
  localStorage.setItem("dataParkir", JSON.stringify(kendaraan));
}

function simpanPelanggan() {
  localStorage.setItem("dataPelanggan", JSON.stringify(pelanggan));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[c]);
}

function rupiah(value) {
  return "Rp" + Number(value).toLocaleString("id-ID");
}

function waktu(value) {
  return new Date(value).toLocaleString("id-ID");
}

function halaman(nama) {
  $("loginPage").classList.toggle("hidden", nama !== "login");
  $("appPage").classList.toggle("hidden", nama !== "admin");
  $("customerPage").classList.toggle("hidden", nama !== "customer");
}

// TAB LOGIN
function pilihTab(tab) {
  const admin = tab === "admin";

  $("adminTab").classList.toggle("active", admin);
  $("customerTab").classList.toggle("active", !admin);

  $("loginForm").classList.toggle("hidden", !admin);
  $("customerLoginForm").classList.toggle("hidden", admin);
  $("registerForm").classList.add("hidden");
}

$("adminTab").addEventListener("click", () => pilihTab("admin"));
$("customerTab").addEventListener("click", () => pilihTab("customer"));

// LOGIN ADMIN
$("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const username = $("username").value.trim();
  const password = $("password").value;

  if (username === "admin" && password === "12345") {
    sessionStorage.setItem("parkirRole", "admin");
    sessionStorage.removeItem("customerUsername");
    halaman("admin");
    renderData();
  } else {
    $("loginError").textContent = "Username atau password salah!";
  }
});

// TAMPILKAN FORM DAFTAR
$("showRegister").addEventListener("click", function(e) {
  e.preventDefault();
  $("customerLoginForm").classList.add("hidden");
  $("registerForm").classList.remove("hidden");
});

$("showCustomerLogin").addEventListener("click", function(e) {
  e.preventDefault();
  $("registerForm").classList.add("hidden");
  $("customerLoginForm").classList.remove("hidden");
});

// DAFTAR PELANGGAN
$("registerForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const nama = $("registerName").value.trim();
  const username = $("registerUsername").value.trim();
  const password = $("registerPassword").value;
  const plat = $("registerPlate").value.trim().toUpperCase();

  if (password.length < 6) {
    $("registerMessage").textContent = "Password minimal 6 karakter!";
    return;
  }

  if (pelanggan.some(p => p.username.toLowerCase() === username.toLowerCase())) {
    $("registerMessage").textContent = "Username sudah digunakan!";
    return;
  }

  if (pelanggan.some(p => p.plat.toUpperCase() === plat)) {
    $("registerMessage").textContent = "Nomor polisi sudah terdaftar!";
    return;
  }

  pelanggan.push({ nama, username, password, plat });
  simpanPelanggan();

  this.reset();
  $("registerMessage").style.color = "#4ade80";
  $("registerMessage").textContent = "Pendaftaran berhasil! Silakan login.";

  setTimeout(() => {
    $("registerForm").classList.add("hidden");
    $("customerLoginForm").classList.remove("hidden");
    $("registerMessage").textContent = "";
    $("registerMessage").style.color = "";
  }, 1200);
});

// LOGIN PELANGGAN
$("customerLoginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const username = $("customerUsername").value.trim();
  const password = $("customerPassword").value;

  const akun = pelanggan.find(p =>
    p.username.toLowerCase() === username.toLowerCase() &&
    p.password === password
  );

  if (!akun) {
    $("customerLoginError").textContent = "Username atau password salah!";
    return;
  }

  sessionStorage.setItem("parkirRole", "customer");
  sessionStorage.setItem("customerUsername", akun.username);

  halaman("customer");
  renderCustomer();
});

// INPUT KENDARAAN ADMIN
$("parkingForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const plat = $("plat").value.trim().toUpperCase();
  const jenis = $("jenis").value;

  if (kendaraan.some(k => k.plat === plat && k.status === "Masuk")) {
    alert("Kendaraan masih berada di area parkir!");
    return;
  }

  kendaraan.push({
    id: Date.now(),
    plat,
    jenis,
    masuk: new Date().toISOString(),
    keluar: null,
    biaya: 0,
    status: "Masuk"
  });

  simpanData();
  this.reset();
  renderData();

  alert("Kendaraan berhasil disimpan!");
});

// HITUNG BIAYA
function hitungBiaya(item) {
  const jam = Math.max(
    1,
    Math.ceil((Date.now() - new Date(item.masuk).getTime()) / 3600000)
  );

  const awal = item.jenis === "Motor" ? 3000 : 5000;
  const lanjut = item.jenis === "Motor" ? 2000 : 3000;

  return awal + (jam - 1) * lanjut;
}

// KENDARAAN KELUAR
function kendaraanKeluar(id) {
  const item = kendaraan.find(k => k.id === id);

  if (!item || item.status !== "Masuk") return;

  const biaya = hitungBiaya(item);

  if (!confirm("Plat: " + item.plat +
    "\nBiaya: " + rupiah(biaya) +
    "\n\nProses kendaraan keluar?")) return;

  item.status = "Keluar";
  item.keluar = new Date().toISOString();
  item.biaya = biaya;

  simpanData();
  renderData();
}

// RENDER ADMIN
function renderData() {
  const aktif = kendaraan.filter(k => k.status === "Masuk");
  const selesai = kendaraan.filter(k => k.status === "Keluar");

  $("totalMasuk").textContent = kendaraan.length;
  $("totalAktif").textContent = aktif.length;

  $("totalPendapatan").textContent = rupiah(
    selesai.reduce((total, k) => total + k.biaya, 0)
  );

  const keyword = $("search").value.trim().toLowerCase();

  const hasil = aktif.filter(k =>
    k.plat.toLowerCase().includes(keyword)
  );

  $("parkingList").innerHTML = hasil.length
    ? hasil.map((k, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHTML(k.plat)}</td>
        <td>${escapeHTML(k.jenis)}</td>
        <td>${waktu(k.masuk)}</td>
        <td class="status">● Masuk</td>
        <td><button class="exit-btn" onclick="kendaraanKeluar(${k.id})">Keluar</button></td>
      </tr>
    `).join("")
    : `<tr><td colspan="6" class="empty">Tidak ada kendaraan parkir</td></tr>`;

  $("historyList").innerHTML = selesai.length
    ? [...selesai].reverse().map(k => `
      <tr>
        <td>${escapeHTML(k.plat)}</td>
        <td>${escapeHTML(k.jenis)}</td>
        <td>${waktu(k.keluar)}</td>
        <td>${rupiah(k.biaya)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="4" class="empty">Belum ada riwayat</td></tr>`;
}

// DASHBOARD PELANGGAN
function renderCustomer() {
  const username = sessionStorage.getItem("customerUsername");
  const akun = pelanggan.find(p => p.username === username);

  if (!akun) {
    logoutPelanggan();
    return;
  }

  $("customerName").textContent = akun.nama;
  $("customerPlate").textContent = akun.plat;

  const dataSaya = kendaraan.filter(k =>
    k.plat.toUpperCase() === akun.plat.toUpperCase()
  );

  const aktif = dataSaya.find(k => k.status === "Masuk");
  const terakhir = dataSaya[dataSaya.length - 1];

  $("customerVehicleType").textContent =
    terakhir ? terakhir.jenis : "Belum ada data";

  $("customerVehicleStatus").textContent =
    aktif ? "Sedang parkir" : "Tidak sedang parkir";

  $("customerHistoryList").innerHTML = dataSaya.length
    ? [...dataSaya].reverse().map(k => `
      <tr>
        <td>${escapeHTML(k.plat)}</td>
        <td>${escapeHTML(k.jenis)}</td>
        <td>${waktu(k.masuk)}</td>
        <td>${k.keluar ? waktu(k.keluar) : "Belum keluar"}</td>
        <td>${k.status === "Keluar" ? rupiah(k.biaya) : "-"}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="5" class="empty">Belum ada riwayat parkir</td></tr>`;
}

// PENCARIAN
$("search").addEventListener("input", renderData);

// LOGOUT
function logoutPelanggan() {
  sessionStorage.removeItem("parkirRole");
  sessionStorage.removeItem("customerUsername");
  halaman("login");
  pilihTab("customer");
}

$("logoutBtn").addEventListener("click", function() {
  sessionStorage.removeItem("parkirRole");
  halaman("login");
  pilihTab("admin");
});

$("customerLogoutBtn").addEventListener("click", logoutPelanggan);

// TANGGAL
$("today").textContent = new Date().toLocaleDateString("id-ID", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});

// CEK LOGIN SAAT HALAMAN DIBUKA
const role = sessionStorage.getItem("parkirRole");

if (role === "admin") {
  halaman("admin");
  renderData();
} else if (role === "customer") {
  halaman("customer");
  renderCustomer();
} else {
  halaman("login");
  pilihTab("admin");
}
