/* ELVANOIR — shared cart engine, used across all pages */

const ELVANOIR_CATALOG = {
  jacket: {
    id: 'jacket',
    name: 'The Sovereign Jacket',
    material: 'Full-grain calfskin, horn buttons',
    price: 1240,
    img: 'images/product-jacket.jpg',
    gallery: ['images/product-jacket.jpg', 'images/product-jacket-2.jpg', 'images/product-jacket-3.jpg'],
    desc: 'Cut from full-grain calfskin and finished by hand, the Sovereign is built to soften and deepen in colour with every season it is worn.',
    details: 'Full-grain calfskin exterior, cupro lining, horn buttons, interior card slip. Made in small batches and finished by hand over four days.',
    sizes: ['46', '48', '50', '52', '54']
  },
  wallet: {
    id: 'wallet',
    name: 'The Meridian Wallet',
    material: 'Vegetable-tanned bridle leather',
    price: 165,
    img: 'images/product-wallet.jpg',
    gallery: ['images/product-wallet.jpg', 'images/product-wallet-2.jpg', 'images/product-wallet-3.jpg'],
    desc: 'A bifold cut from a single piece of bridle leather, burnished by hand so the edges never crack or fray.',
    details: 'Vegetable-tanned bridle leather, hand-burnished edges, six card slots, one currency pocket. Ages to a deep chestnut over time.',
    sizes: []
  },
  belt: {
    id: 'belt',
    name: 'The Ashworth Belt',
    material: 'Saddle leather, brushed brass',
    price: 210,
    img: 'images/product-belt.jpg',
    gallery: ['images/product-belt.jpg', 'images/product-belt-2.jpg', 'images/product-belt-3.jpg'],
    desc: 'A single strap of saddle leather set with a brushed brass buckle, engineered to outlast the wardrobe built around it.',
    details: 'Saddle leather strap, solid brass buckle with brushed finish, five adjustment points. Available cut-to-size.',
    sizes: ['32', '34', '36', '38', '40', '42']
  },
  bag: {
    id: 'bag',
    name: 'The Harrow Bag',
    material: 'Nubuck leather, brass hardware',
    price: 980,
    img: 'images/product-bag.jpg',
    gallery: ['images/product-bag.jpg', 'images/product-bag-2.jpg', 'images/product-bag-3.jpg'],
    desc: 'A structured carryall in brushed nubuck, roomy enough for the day and restrained enough for the room you walk into.',
    details: 'Nubuck leather exterior, suede lining, solid brass hardware, detachable shoulder strap, interior laptop sleeve.',
    sizes: []
  }
};

const Cart = {
  KEY: 'elvanoir_cart_v1',

  read(){
    try{
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  },

  write(items){
    localStorage.setItem(this.KEY, JSON.stringify(items));
    this.renderAll();
  },

  count(){
    return this.read().reduce((sum, i) => sum + i.qty, 0);
  },

  subtotal(){
    return this.read().reduce((sum, i) => {
      const p = ELVANOIR_CATALOG[i.id];
      return sum + (p ? p.price * i.qty : 0);
    }, 0);
  },

  add(id, qty = 1, size = null){
    const items = this.read();
    const existing = items.find(i => i.id === id && i.size === size);
    if(existing){ existing.qty += qty; }
    else{ items.push({ id, qty, size }); }
    this.write(items);
  },

  updateQty(id, size, qty){
    let items = this.read();
    if(qty <= 0){
      items = items.filter(i => !(i.id === id && i.size === size));
    }else{
      const it = items.find(i => i.id === id && i.size === size);
      if(it) it.qty = qty;
    }
    this.write(items);
  },

  remove(id, size){
    const items = this.read().filter(i => !(i.id === id && i.size === size));
    this.write(items);
  },

  renderAll(){
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = this.count();
    });
    const list = document.querySelector('[data-cart-items]');
    if(list) this.renderDrawer(list);
  },

  renderDrawer(list){
    const items = this.read();
    if(items.length === 0){
      list.innerHTML = '<p class="cart-empty">Your collection is empty.<br>Explore the pieces built to join it.</p>';
    }else{
      list.innerHTML = items.map(i => {
        const p = ELVANOIR_CATALOG[i.id];
        if(!p) return '';
        return `
          <div class="cart-item">
            <img src="${p.img}" alt="${p.name}">
            <div>
              <div class="ci-name">${p.name}</div>
              <div class="ci-price">$${p.price.toLocaleString()}${i.size ? ' · Size ' + i.size : ''}</div>
              <div class="ci-qty">
                <button aria-label="Decrease quantity" data-qty-down data-id="${i.id}" data-size="${i.size || ''}">−</button>
                <span>${i.qty}</span>
                <button aria-label="Increase quantity" data-qty-up data-id="${i.id}" data-size="${i.size || ''}">+</button>
              </div>
            </div>
            <a href="#" class="ci-remove" data-remove data-id="${i.id}" data-size="${i.size || ''}">Remove</a>
          </div>
        `;
      }).join('');
    }

    const sub = this.subtotal();
    const subEl = document.querySelector('[data-cart-subtotal]');
    const totEl = document.querySelector('[data-cart-total]');
    if(subEl) subEl.textContent = '$' + sub.toLocaleString();
    if(totEl) totEl.textContent = '$' + sub.toLocaleString();

    list.querySelectorAll('[data-qty-up]').forEach(btn => btn.addEventListener('click', () => {
      const items = this.read();
      const it = items.find(i => i.id === btn.dataset.id && (i.size || '') === btn.dataset.size);
      if(it) this.updateQty(it.id, it.size, it.qty + 1);
    }));
    list.querySelectorAll('[data-qty-down]').forEach(btn => btn.addEventListener('click', () => {
      const items = this.read();
      const it = items.find(i => i.id === btn.dataset.id && (i.size || '') === btn.dataset.size);
      if(it) this.updateQty(it.id, it.size, it.qty - 1);
    }));
    list.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      this.remove(btn.dataset.id, btn.dataset.size || null);
    }));
  }
};

/* -------------------- Drawer open/close -------------------- */

function initCartDrawer(){
  const overlay = document.querySelector('[data-cart-overlay]');
  const drawer = document.querySelector('[data-cart-drawer]');
  const openers = document.querySelectorAll('[data-cart-open]');
  const closer = document.querySelector('[data-cart-close]');

  function open(){
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close(){
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }
  openers.forEach(el => el.addEventListener('click', (e) => { e.preventDefault(); open(); }));
  closer && closer.addEventListener('click', close);
  overlay && overlay.addEventListener('click', close);
  window.__elvanoirOpenCart = open;
}

/* -------------------- Toast -------------------- */

function showToast(msg){
  let toast = document.querySelector('.toast');
  if(!toast){
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* -------------------- Fly-to-cart animation -------------------- */

function flyToCart(imgEl){
  const cartBtn = document.querySelector('[data-cart-open]');
  if(!cartBtn || !imgEl) return;
  const startRect = imgEl.getBoundingClientRect();
  const endRect = cartBtn.getBoundingClientRect();

  const ghost = document.createElement('img');
  ghost.src = imgEl.src;
  ghost.className = 'fly-ghost';
  ghost.style.left = startRect.left + 'px';
  ghost.style.top = startRect.top + 'px';
  ghost.style.width = startRect.width + 'px';
  ghost.style.height = startRect.height + 'px';
  ghost.style.opacity = '0.95';
  document.body.appendChild(ghost);

  requestAnimationFrame(() => {
    ghost.style.left = (endRect.left + endRect.width/2 - 10) + 'px';
    ghost.style.top = (endRect.top + endRect.height/2 - 10) + 'px';
    ghost.style.width = '20px';
    ghost.style.height = '20px';
    ghost.style.opacity = '0';
    ghost.style.transform = 'rotate(8deg)';
  });

  setTimeout(() => {
    ghost.remove();
    const countEl = cartBtn.querySelector('[data-cart-count]');
    if(countEl){
      countEl.classList.add('bump');
      setTimeout(() => countEl.classList.remove('bump'), 350);
    }
  }, 700);
}

/* -------------------- Add-to-cart buttons (event delegation) -------------------- */

function initAddToCart(){
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-to-cart]');
    if(!btn) return;
    e.preventDefault();
    const id = btn.dataset.id;
    const qtyInput = document.querySelector(btn.dataset.qtySelector || '[data-qty-value]');
    const sizeInput = document.querySelector(btn.dataset.sizeSelector || '[data-size-selected]');
    const qty = qtyInput ? parseInt(qtyInput.textContent || qtyInput.value || '1', 10) : 1;
    const size = sizeInput ? (sizeInput.dataset.value || sizeInput.value || null) : null;

    const card = btn.closest('[data-product-card]') || document;
    const imgEl = card.querySelector('img');
    if(imgEl) flyToCart(imgEl);

    Cart.add(id, qty || 1, size);
    showToast('Added to your collection.');
  });
}

/* -------------------- Scroll reveal -------------------- */

function initReveal(){
  const els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => io.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  Cart.renderAll();
  initCartDrawer();
  initAddToCart();
  initReveal();
});
