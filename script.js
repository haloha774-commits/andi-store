let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];

/* TAMBAH */
function tambahKeKeranjang(nama, harga, deskripsi, btn) {
  let item = keranjang.find(i => i.nama === nama);

  if (item) {
    item.qty += 1;
  } else {
    keranjang.push({ nama, harga, deskripsi, qty: 1 });
  }

  simpan();
  update();
  animasiTerbang(btn);

  btn.textContent = "✓ Ditambahkan!";
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = "Tambah ke Keranjang";
    btn.disabled = false;
  }, 1200);
}

/* TOTAL */
function hitungTotal() {
  return keranjang.reduce((t, item) => t + item.harga * item.qty, 0);
}

/* UPDATE UI */
function update() {
  let container = document.getElementById("cart-items");
  let total = document.getElementById("total");
  let count = document.getElementById("cart-count");
  let kosong = document.getElementById("cart-kosong");
  let btnCheckout = document.getElementById("btn-checkout");

  container.innerHTML = "";

  keranjang.forEach((item, i) => {
    let div = document.createElement("div");
    div.classList.add("cart-item");

    div.innerHTML = `
      <div class="cart-item-top">
        <span class="cart-item-nama">${item.nama}</span>
        <button class="btn-hapus" onclick="hapusItem(${i}, event)" title="Hapus">🗑</button>
      </div>
      <div class="cart-item-bot">
        <div class="cart-item-qty">
          <button class="btn-qty" onclick="kurang(${i}, event)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="btn-qty" onclick="tambahQty(${i}, event)">+</button>
        </div>
        <span class="item-harga">¥${item.harga * item.qty}</span>
      </div>
    `;

    container.appendChild(div);
  });

  let ada = keranjang.length > 0;
  kosong.style.display = ada ? "none" : "block";
  btnCheckout.style.display = ada ? "block" : "none";
  total.textContent = hitungTotal();

  let totalQty = keranjang.reduce((t, i) => t + i.qty, 0);
  count.textContent = totalQty;
}

/* TAMBAH QTY */
function tambahQty(i, e) {
  e.stopPropagation(); // 🔥 penting
  keranjang[i].qty++;
  simpan();
  update();
}

function hapusItem(i, e) {
  e.stopPropagation();
  keranjang.splice(i, 1);
  simpan();
  update();
}

function kurang(i, e) {
  e.stopPropagation(); // 🔥 penting
  keranjang[i].qty--;

  if (keranjang[i].qty <= 0) {
    keranjang.splice(i, 1);
  }

  simpan();
  update();
}

/* SIMPAN */
function simpan() {
  localStorage.setItem("keranjang", JSON.stringify(keranjang));
}

/* TAMPILIN FORM */
function tampilForm() {
  if (keranjang.length === 0) {
    alert("Keranjang kosong!");
    return;
  }

  document.getElementById("formCheckout").classList.toggle("show");
}

/* VALIDASI */
function setError(id, pesan) {
  document.getElementById(id).textContent = pesan;
  document.getElementById(id.replace("err-", "")).classList.toggle("input-error", !!pesan);
}

function validasiForm(nama, alamat, hp) {
  let valid = true;

  if (nama.trim().length < 3) {
    setError("err-nama", "Nama minimal 3 karakter");
    valid = false;
  } else {
    setError("err-nama", "");
  }

  if (alamat.trim().length < 10) {
    setError("err-alamat", "Alamat terlalu pendek, minimal 10 karakter");
    valid = false;
  } else {
    setError("err-alamat", "");
  }

  if (hp && !/^[0-9+\s-]{8,15}$/.test(hp.trim())) {
    setError("err-hp", "Format nomor HP tidak valid");
    valid = false;
  } else {
    setError("err-hp", "");
  }

  return valid;
}

/* CHECKOUT WA */
function checkoutWA() {
  let nama = document.getElementById("nama").value;
  let alamat = document.getElementById("alamat").value;
  let hp = document.getElementById("hp").value;

  if (!validasiForm(nama, alamat, hp)) return;

  let baris = [`🛒 *ORDER ANDI STORE*\n`];

  keranjang.forEach((item, i) => {
    baris.push(`${i + 1}. ${item.nama} x${item.qty} - ¥${item.harga * item.qty}`);
  });

  let total = hitungTotal();
  baris.push(`\nTotal: ¥${total}\n`);
  baris.push(`Nama: ${nama}\nAlamat: ${alamat}`);
  if (hp) baris.push(`HP: ${hp}`);

  let pesan = encodeURIComponent(baris.join("\n"));

  const nomor = "6288224781707";

  window.open(`https://wa.me/${nomor}?text=${pesan}`, "_blank");

  // RESET
  keranjang = [];
  simpan();
  update();

  document.getElementById("formCheckout").classList.remove("show");
  document.getElementById("cart-popup").classList.remove("show");

  setTimeout(() => {
    document.getElementById("modal-sukses").classList.add("show");
  }, 500);
}

function tutupSukses() {
  document.getElementById("modal-sukses").classList.remove("show");
}

/* ANIMASI PECAH & TERBANG */
function animasiTerbang(btn) {
  const produk = btn.closest(".produk");
  const img = produk.querySelector("img");
  const cart = document.querySelector(".cart-icon");

  const imgRect = img.getBoundingClientRect();
  const cartRect = cart.getBoundingClientRect();

  const COLS = 4;
  const ROWS = 4;
  const tileW = imgRect.width / COLS;
  const tileH = imgRect.height / ROWS;

  const cartCX = cartRect.left + cartRect.width / 2;
  const cartCY = cartRect.top + cartRect.height / 2;

  const fragments = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const canvas = document.createElement("canvas");
      canvas.width = tileW;
      canvas.height = tileH;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, c * tileW, r * tileH, tileW, tileH, 0, 0, tileW, tileH);

      const tile = document.createElement("div");
      tile.style.cssText = `
        position:fixed;
        left:${imgRect.left + c * tileW}px;
        top:${imgRect.top + r * tileH}px;
        width:${tileW}px;
        height:${tileH}px;
        overflow:hidden;
        z-index:1000;
        border-radius:2px;
        pointer-events:none;
        will-change:transform,opacity;
      `;
      tile.appendChild(canvas);
      document.body.appendChild(tile);
      fragments.push(tile);
    }
  }

  // Fase 1: serpihan meledak keluar dulu (0–300ms)
  fragments.forEach((tile, i) => {
    const angle = (i / fragments.length) * Math.PI * 2;
    const burst = 30 + Math.random() * 25;
    const bx = Math.cos(angle) * burst;
    const by = Math.sin(angle) * burst;
    const rot = (Math.random() - 0.5) * 40;

    tile.style.transition = "transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.28s";

    setTimeout(() => {
      tile.style.transform = `translate(${bx}px,${by}px) rotate(${rot}deg) scale(0.9)`;
    }, 10);
  });

  // Fase 2: semua serpihan terbang ke keranjang (300–900ms)
  fragments.forEach((tile, i) => {
    const tileRect = tile.getBoundingClientRect();
    const tileCX = tileRect.left + tileRect.width / 2;
    const tileCY = tileRect.top + tileRect.height / 2;

    const dx = cartCX - tileCX;
    const dy = cartCY - tileCY;

    const delay = 300 + i * 18;
    const duration = 480 + Math.random() * 80;

    setTimeout(() => {
      tile.style.transition = `transform ${duration}ms cubic-bezier(0.4,0,0.2,1), opacity ${duration * 0.6}ms ease ${duration * 0.4}ms`;
      tile.style.transform += ` translate(${dx}px,${dy}px) scale(0.05) rotate(${(Math.random()-0.5)*180}deg)`;
      tile.style.opacity = "0";
    }, delay);

    setTimeout(() => tile.remove(), delay + duration + 50);
  });

  // Keranjang goyang waktu item masuk
  const lastDelay = 300 + (fragments.length - 1) * 18 + 500;
  setTimeout(() => {
    cart.style.transition = "transform 0.1s";
    cart.style.transform = "scale(1.35) rotate(-8deg)";
    setTimeout(() => {
      cart.style.transform = "scale(1.2) rotate(6deg)";
      setTimeout(() => {
        cart.style.transform = "scale(1.1) rotate(-3deg)";
        setTimeout(() => {
          cart.style.transform = "scale(1) rotate(0deg)";
        }, 100);
      }, 100);
    }, 100);
  }, lastDelay);
}

/* TOGGLE CART */
function toggleCart() {
  document.getElementById("cart-popup").classList.toggle("show");
}

/* MODAL */
function bukaGambar(img) {
  const modal = document.getElementById("modal");
  modal.classList.add("show");
  document.getElementById("gambarBesar").src = img.src;
}

function tutupGambar() {
  document.getElementById("modal").classList.remove("show");
}

/* SPLASH */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash').classList.add('hide');
  }, 1800);
});

/* SCROLL REVEAL */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((el, i) => {
  setTimeout(() => observer.observe(el), i * 120);
});

/* LOAD */
update();

document.addEventListener("click", function (e) {
  const cart = document.getElementById("cart-popup");
  const icon = document.querySelector(".cart-icon");

  // kalau klik bukan di cart & bukan di icon
  if (!cart.contains(e.target) && !icon.contains(e.target)) {
    cart.classList.remove("show");
  }
});