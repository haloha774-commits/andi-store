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

  container.innerHTML = "";

  keranjang.forEach((item, i) => {
    let div = document.createElement("div");
    div.classList.add("cart-item");

    div.innerHTML = `
      <div style="flex:1">
        <div><strong>${item.nama}</strong></div>
        <div style="font-size:12px;color:#666;">
          ${item.deskripsi || ""}
        </div>
      </div>

      <button onclick="kurang(${i}, event)">-</button>
      ${item.qty}
      <button onclick="tambahQty(${i}, event)">+</button>

      <span>¥${item.harga * item.qty}</span>
    `;

    container.appendChild(div);
  });

  total.textContent = hitungTotal();

  // 🔥 COUNT = TOTAL QTY (bukan jumlah item)
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

/* CHECKOUT WA */
function checkoutWA() {
  let nama = document.getElementById("nama").value;
  let alamat = document.getElementById("alamat").value;

  if (!nama || !alamat) {
    alert("Isi nama & alamat dulu!");
    return;
  }

  let pesan = `🛒 *ORDER ANDI STORE*%0A%0A`;

  keranjang.forEach((item, i) => {
    pesan += `${i + 1}. ${item.nama} x${item.qty} - ¥${item.harga * item.qty}%0A`;
  });

  let total = hitungTotal();

  pesan += `%0ATotal: ¥${total}%0A%0A`;
  pesan += `Nama: ${nama}%0AAlamat: ${alamat}`;

  const nomor = "6288224781707";

  window.open(`https://wa.me/${nomor}?text=${pesan}`, "_blank");

  // RESET
  keranjang = [];
  simpan();
  update();

  document.getElementById("formCheckout").classList.remove("show");
}

/* ANIMASI TERBANG */
function animasiTerbang(btn) {
  const produk = btn.closest(".produk");
  const img = produk.querySelector("img");
  const cart = document.querySelector(".cart-icon");

  const imgRect = img.getBoundingClientRect();
  const cartRect = cart.getBoundingClientRect();

  const clone = img.cloneNode(true);

  clone.style.position = "fixed";
  clone.style.left = imgRect.left + "px";
  clone.style.top = imgRect.top + "px";
  clone.style.width = imgRect.width + "px";
  clone.style.height = imgRect.height + "px";
  clone.style.transition = "transform 0.8s cubic-bezier(0.22,1,0.36,1), opacity 0.8s";
  clone.style.zIndex = "1000";

  document.body.appendChild(clone);

  const deltaX = cartRect.left - imgRect.left;
  const deltaY = cartRect.top - imgRect.top;

  setTimeout(() => {
    clone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.2)`;
    clone.style.opacity = "0.5";
  }, 10);

  setTimeout(() => {
    clone.remove();

    cart.style.transform = "scale(1.2)";
    setTimeout(() => {
      cart.style.transform = "scale(1)";
    }, 150);

  }, 800);
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