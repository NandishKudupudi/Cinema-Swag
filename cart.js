document.addEventListener('DOMContentLoaded', renderCart);

function renderCart() {
  const cart = JSON.parse(localStorage.getItem('cinemaswag_cart')) || [];
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const grandEl = document.getElementById('cartGrandTotal');

  document.querySelectorAll('#cartCount').forEach(el => el.textContent = cart.length);

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:4rem 2rem;color:var(--muted);">
        <p style="font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:3px;margin-bottom:.5rem;">CART IS EMPTY</p>
        <p style="font-size:14px;color:var(--muted);margin-bottom:1.5rem;font-family:'Barlow',sans-serif;">No tees yet? That's a crime against swag.</p>
        <a href="shop.html" class="btn-primary">Shop Tees</a>
      </div>`;
    if (totalEl) totalEl.textContent = '₹0';
    if (grandEl) grandEl.textContent = '₹0';
    return;
  }

  const grouped = {};
  cart.forEach(item => {
    grouped[item.id] = grouped[item.id]
      ? { ...grouped[item.id], qty: grouped[item.id].qty + 1 }
      : { ...item, qty: 1 };
  });

  fetch('data/products.json')
    .then(r => r.json())
    .then(products => {
      let total = 0;
      let html = '';

      Object.values(grouped).forEach(item => {
        const p = products.find(x => x.id === item.id);
        if (!p) return;
        const line = p.price * item.qty;
        total += line;

        html += `
          <div style="display:grid;grid-template-columns:90px 1fr auto;gap:1.25rem;align-items:center;padding:1.25rem 0;border-bottom:1px solid var(--border);">
            <div style="width:90px;height:110px;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;">
              <img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'">
            </div>
            <div>
              <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--red);margin-bottom:3px;font-family:'Barlow Condensed',sans-serif;font-weight:700;">${p.type}</p>
              <p style="font-size:15px;font-weight:600;margin-bottom:4px;">${p.name}</p>
              <p style="font-family:'Teko',sans-serif;font-size:14px;color:var(--red);font-style:italic;">"${p.vibe}"</p>
              <p style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:#fff;margin-top:6px;">₹${p.price.toLocaleString()}</p>
              <div style="display:flex;align-items:center;gap:.75rem;margin-top:10px;">
                <button onclick="changeQty(${p.id},-1)" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);width:28px;height:28px;cursor:pointer;font-size:16px;line-height:1;">−</button>
                <span style="font-size:14px;font-weight:600;">${item.qty}</span>
                <button onclick="changeQty(${p.id},1)" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);width:28px;height:28px;cursor:pointer;font-size:16px;line-height:1;">+</button>
              </div>
            </div>
            <div style="text-align:right;">
              <p style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--red);">₹${line.toLocaleString()}</p>
              <button onclick="removeItem(${p.id})" style="background:transparent;border:none;color:var(--muted);font-size:11px;cursor:pointer;margin-top:8px;letter-spacing:1px;text-transform:uppercase;font-family:'Barlow Condensed',sans-serif;">Remove</button>
            </div>
          </div>`;
      });

      container.innerHTML = html;
      const fmt = '₹' + total.toLocaleString();
      if (totalEl) totalEl.textContent = fmt;
      if (grandEl) grandEl.textContent = fmt;
    });
}

function changeQty(id, delta) {
  let cart = JSON.parse(localStorage.getItem('cinemaswag_cart')) || [];
  if (delta > 0) {
    cart.push({ id });
  } else {
    const idx = cart.findIndex(i => i.id === id);
    if (idx > -1) cart.splice(idx, 1);
  }
  localStorage.setItem('cinemaswag_cart', JSON.stringify(cart));
  renderCart();
}

function removeItem(id) {
  let cart = JSON.parse(localStorage.getItem('cinemaswag_cart')) || [];
  cart = cart.filter(i => i.id !== id);
  localStorage.setItem('cinemaswag_cart', JSON.stringify(cart));
  renderCart();
}
