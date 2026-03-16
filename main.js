// ─── CART ───
let cart = JSON.parse(localStorage.getItem('cinemaswag_cart')) || [];

function updateCartCount() {
  document.querySelectorAll('#cartCount').forEach(el => el.textContent = cart.length);
}

function addToCart(id, name) {
  cart.push({ id, name });
  localStorage.setItem('cinemaswag_cart', JSON.stringify(cart));
  updateCartCount();
  showToast('Added to cart!');
}

// ─── TOAST ───
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ─── RENDER PRODUCT CARD ───
function renderCard(p) {
  const badge = p.badge
    ? `<span class="product-badge ${p.badgeType === 'white' ? 'wb' : ''}">${p.badge}</span>`
    : '';
  const old = p.oldPrice
    ? `<span class="old">₹${p.oldPrice.toLocaleString()}</span>`
    : '';
  const sizes = p.sizes.map(s => `<span class="size-tag">${s}</span>`).join('');

  return `
    <div class="product-card">
      <div class="product-img">
        <div class="product-bg"></div>
        <img
          src="${p.image}"
          alt="${p.name}"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        />
        <div class="product-img-placeholder" style="display:none;">
          <svg width="44" height="52" viewBox="0 0 44 52" fill="none">
            <path d="M10 0L0 13L8 16V52H36V16L44 13L34 0L26 6L18 6Z" stroke="#c1121f" stroke-width="1" fill="none" opacity="0.3"/>
          </svg>
          <span>PHOTO HERE</span>
        </div>
        ${badge}
        <div class="product-dialogue">
          <p>"${p.vibe}"</p>
          <span>${p.type.toUpperCase()} · CINEMA SWAG™</span>
        </div>
      </div>
      <div class="product-info">
        <div class="product-type">${p.type}</div>
        <h3>${p.name}</h3>
        <div class="product-price">₹${p.price.toLocaleString()} ${old}</div>
        <div class="size-row">${sizes}</div>
        <button class="add-to-cart" onclick="addToCart(${p.id}, '${p.name}')">Add to Cart</button>
      </div>
    </div>`;
}

// ─── LOAD PRODUCTS ───
async function loadProducts(containerId, filterFn) {
  const container = document.getElementById(containerId);
  if (!container) return;
  try {
    const res = await fetch('data/products.json');
    const products = await res.json();
    const list = filterFn ? products.filter(filterFn) : products;
    container.innerHTML = list.length
      ? list.map(renderCard).join('')
      : `<p style="color:var(--muted);letter-spacing:2px;font-size:13px;font-family:'Barlow Condensed',sans-serif;">No products found.</p>`;
  } catch (e) {
    console.error('Product load error:', e);
  }
}

// ─── FILTER BUTTONS ───
function initFilters() {
  const btns = document.querySelectorAll('[data-filter]');
  btns.forEach(btn => {
    btn.addEventListener('click', async () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      await loadProducts('allProducts', cat === 'all' ? null : p => p.category === cat);
    });
  });
}

// ─── MOBILE MENU ───
function toggleMenu() {
  const nav = document.querySelector('.nav-links');
  if (nav) nav.classList.toggle('open');
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  loadProducts('featuredProducts', p => p.featured);
  loadProducts('allProducts', null);
  initFilters();

  // URL param filter for shop page
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  if (cat) {
    const btn = document.querySelector(`[data-filter="${cat}"]`);
    if (btn) {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadProducts('allProducts', p => p.category === cat);
    }
  }
});
