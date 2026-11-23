/* ============================================
   DORDER DASHBOARD — JavaScript Engine
============================================ */

/* ---------- DEFAULT DATA (first run) ---------- */
const DEFAULT_STATE = {
  shop: {
    name: 'Ali Kirana Store',
    location: 'Lahore · Grocery',
    threshold: 10, // low stock threshold
  },
  items: [
    { id: 'i1', name: 'Basmati Rice 5kg', category: 'Grocery', price: 1200, stock: 3, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&q=80' },
    { id: 'i2', name: 'Cooking Oil 1L', category: 'Grocery', price: 450, stock: 5, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=80&q=80' },
    { id: 'i3', name: 'Milk Pack 1L', category: 'Dairy', price: 220, stock: 8, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=80&q=80' },
    { id: 'i4', name: 'Bread Large', category: 'Bakery', price: 150, stock: 12, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=80&q=80' },
    { id: 'i5', name: 'Sugar 1kg', category: 'Grocery', price: 180, stock: 45, image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=80&q=80' },
    { id: 'i6', name: 'Tea Pack 250g', category: 'Beverage', price: 320, stock: 30, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=80&q=80' },
  ],
  orders: [
    { id: '1048', customer: 'Hamza Ali', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80', items: 4, total: 2340, status: 'paid', time: '2 min ago' },
    { id: '1047', customer: 'Sara Khan', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=80', items: 2, total: 890, status: 'paid', time: '14 min ago' },
    { id: '1046', customer: 'Bilal Ahmed', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&q=80', items: 7, total: 4120, status: 'pending', time: '32 min ago' },
    { id: '1045', customer: 'Ayesha Malik', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&q=80', items: 1, total: 450, status: 'paid', time: '1 hr ago' },
    { id: '1044', customer: 'Usman Sheikh', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&q=80', items: 3, total: 1670, status: 'refunded', time: '2 hr ago' },
  ],
  staff: [
    { id: 's1', name: 'Ahmed Raza', role: 'Manager', email: 'ahmed@shop.pk' },
    { id: 's2', name: 'Fatima Noor', role: 'Cashier', email: 'fatima@shop.pk' },
  ],
  weekSales: [45, 62, 38, 78, 95, 70, 55], // percentages
};

/* ---------- STATE MANAGEMENT ---------- */
let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem('dorder_state');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState() {
  localStorage.setItem('dorder_state', JSON.stringify(state));
}

/* ---------- HELPERS ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function money(n) {
  return 'Rs ' + Number(n).toLocaleString('en-PK');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message, type = 'success') {
  const icons = { success: 'fa-check', error: 'fa-xmark', info: 'fa-info' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type]}"></i><span>${escapeHtml(message)}</span>`;
  $('#toastWrap').appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

/* ---------- MODAL ---------- */
function openModal(html) {
  $('#modal').innerHTML = html;
  $('#modalOverlay').classList.add('active');
}

function closeModal() {
  $('#modalOverlay').classList.remove('active');
}

$('#modalOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'modalOverlay') closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/* ---------- ROUTER ---------- */
let currentPage = 'overview';

function navigate(page) {
  currentPage = page;
  $$('#sideNav a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
  render();
}

$$('#sideNav a').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    navigate(a.dataset.page);
  });
});

/* ---------- MAIN RENDER ---------- */
function render() {
  updateBadges();
  updateShopInfo();
  const main = $('#mainContent');
  switch (currentPage) {
    case 'overview':  main.innerHTML = renderOverview();  bindOverview(); break;
    case 'inventory': main.innerHTML = renderInventory(); bindInventory(); break;
    case 'orders':    main.innerHTML = renderOrders();    bindOrders(); break;
    case 'reports':   main.innerHTML = renderReports();   bindReports(); break;
    case 'staff':     main.innerHTML = renderStaff();     bindStaff(); break;
    case 'scan':      main.innerHTML = renderScan();      bindScan(); break;
    case 'settings':  main.innerHTML = renderSettings();  bindSettings(); break;
    default:          main.innerHTML = renderOverview();  bindOverview();
  }
}

function updateBadges() {
  $('#badgeInventory').textContent = state.items.length;
  const pendingOrders = state.orders.filter(o => o.status === 'pending').length;
  $('#badgeOrders').textContent = pendingOrders;
  $('#badgeOrders').style.display = pendingOrders > 0 ? 'inline-block' : 'none';
}

function updateShopInfo() {
  $('#shopName').textContent = state.shop.name;
  $('#shopLoc').textContent = state.shop.location;
}

/* ============================================
   PAGE: OVERVIEW
============================================ */
function renderOverview() {
  const totalSales = state.orders.filter(o => o.status === 'paid').reduce((s, o) => s + o.total, 0);
  const totalOrders = state.orders.length;
  const totalItems = state.items.reduce((s, i) => s + i.stock, 0);
  const lowStock = state.items.filter(i => i.stock <= state.shop.threshold);
  const recent = state.orders.slice(0, 5);

  return `
    <div class="page">
      <div class="page-head">
        <div>
          <h1>Overview</h1>
          <p>Here's what's happening at your shop today.</p>
        </div>
        <div class="page-actions">
          <button class="btn-add" onclick="openAddItemModal()">
            <i class="fa-solid fa-plus"></i> Add item
          </button>
        </div>
      </div>

      <section class="stat-row">
        <div class="stat-card">
          <div class="stat-top">
            <span class="stat-icon green"><i class="fa-solid fa-money-bill-trend-up"></i></span>
            <span class="stat-change up"><i class="fa-solid fa-arrow-up"></i> 12.4%</span>
          </div>
          <span class="stat-label">Today's sales</span>
          <span class="stat-value">${money(totalSales)}</span>
          <span class="stat-sub">From ${state.orders.filter(o => o.status === 'paid').length} paid orders</span>
        </div>
        <div class="stat-card">
          <div class="stat-top">
            <span class="stat-icon gold"><i class="fa-solid fa-receipt"></i></span>
            <span class="stat-change up"><i class="fa-solid fa-arrow-up"></i> 8.2%</span>
          </div>
          <span class="stat-label">Orders today</span>
          <span class="stat-value">${totalOrders}</span>
          <span class="stat-sub">${state.orders.filter(o => o.status === 'pending').length} pending</span>
        </div>
        <div class="stat-card">
          <div class="stat-top">
            <span class="stat-icon teal"><i class="fa-solid fa-box"></i></span>
            <span class="stat-change down"><i class="fa-solid fa-arrow-down"></i> 3.1%</span>
          </div>
          <span class="stat-label">Items in stock</span>
          <span class="stat-value">${totalItems.toLocaleString()}</span>
          <span class="stat-sub">Across ${state.items.length} products</span>
        </div>
        <div class="stat-card warn">
          <div class="stat-top">
            <span class="stat-icon amber"><i class="fa-solid fa-triangle-exclamation"></i></span>
            <span class="stat-change warn-text">Needs attention</span>
          </div>
          <span class="stat-label">Low stock alerts</span>
          <span class="stat-value">${lowStock.length}</span>
          <span class="stat-sub">Reorder soon</span>
        </div>
      </section>

      <section class="mid-row">
        <div class="panel chart-panel">
          <div class="panel-head">
            <div>
              <h2>Sales this week</h2>
              <p>Daily revenue overview</p>
            </div>
            <div class="panel-tabs">
              <button class="active">7D</button>
              <button>30D</button>
              <button>90D</button>
            </div>
          </div>
          <div class="chart">
            <div class="chart-bars">
              ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => `
                <div class="bar-wrap">
                  <div class="bar ${i === 4 ? 'active' : ''}" style="--h:${state.weekSales[i]}%"></div>
                  <span>${d}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="chart-footer">
            <div class="chart-legend">
              <span class="legend-dot"></span>
              <span>This week</span>
            </div>
            <span class="chart-total">Peak day: Friday</span>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head">
            <div>
              <h2>Low stock</h2>
              <p>Items running out</p>
            </div>
            <a href="#" class="panel-link" onclick="navigate('inventory'); return false;">View all <i class="fa-solid fa-arrow-right"></i></a>
          </div>
          ${lowStock.length === 0 ? `
            <div class="empty-state" style="padding:30px 10px;">
              <i class="fa-solid fa-check"></i>
              <p>All items well stocked</p>
            </div>
          ` : `
            <ul class="stock-list">
              ${lowStock.slice(0, 4).map(item => `
                <li>
                  <span class="stock-img" style="background-image: url('${item.image}')"></span>
                  <div class="stock-info">
                    <strong>${escapeHtml(item.name)}</strong>
                    <span>Only ${item.stock} left</span>
                  </div>
                  <span class="stock-badge ${item.stock === 0 ? 'urgent' : 'soft'}">
                    ${item.stock === 0 ? 'Out' : 'Low'}
                  </span>
                </li>
              `).join('')}
            </ul>
          `}
        </div>
      </section>

      <section class="panel table-panel">
        <div class="panel-head">
          <div>
            <h2>Recent orders</h2>
            <p>Latest transactions</p>
          </div>
          <a href="#" class="panel-link" onclick="navigate('orders'); return false;">View all <i class="fa-solid fa-arrow-right"></i></a>
        </div>
        ${recent.length === 0 ? `
          <div class="empty-state"><i class="fa-solid fa-receipt"></i><h3>No orders yet</h3><p>Orders will appear here once you make a sale.</p></div>
        ` : `
          <div class="table-wrap">
            <table class="order-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>
                ${recent.map(o => `
                  <tr>
                    <td><strong>#${o.id}</strong></td>
                    <td><div class="cust"><span class="cust-avatar" style="background-image:url('${o.avatar}')"></span>${escapeHtml(o.customer)}</div></td>
                    <td>${o.items} items</td>
                    <td>${money(o.total)}</td>
                    <td><span class="status ${o.status}">${o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span></td>
                    <td>${o.time}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </section>
    </div>
  `;
}

function bindOverview() {
  // tabs (visual only)
  $$('.panel-tabs button').forEach(b => {
    b.addEventListener('click', () => {
      $$('.panel-tabs button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    });
  });
}

/* ============================================
   PAGE: INVENTORY
============================================ */
function renderInventory(filter = '') {
  const items = state.items.filter(i =>
    i.name.toLowerCase().includes(filter.toLowerCase()) ||
    i.category.toLowerCase().includes(filter.toLowerCase())
  );

  return `
    <div class="page">
      <div class="page-head">
        <div>
          <h1>Inventory</h1>
          <p>Manage all your products in one place.</p>
        </div>
        <div class="page-actions">
          <div class="search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="invSearch" placeholder="Search items..." value="${escapeHtml(filter)}">
          </div>
          <button class="btn-add" onclick="openAddItemModal()">
            <i class="fa-solid fa-plus"></i> Add item
          </button>
        </div>
      </div>

      <section class="panel table-panel">
        ${items.length === 0 ? `
          <div class="empty-state">
            <i class="fa-solid fa-box-open"></i>
            <h3>No items found</h3>
            <p>${filter ? 'Try a different search.' : 'Add your first product to get started.'}</p>
          </div>
        ` : `
          <div class="table-wrap">
            <table class="inv-table">
              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
              <tbody>
                ${items.map(i => {
                  const stockClass = i.stock === 0 ? 'out' : (i.stock <= state.shop.threshold ? 'low' : 'ok');
                  return `
                    <tr>
                      <td>
                        <div class="inv-product">
                          <span class="inv-img" style="background-image:url('${i.image}')"></span>
                          <div class="inv-info">
                            <strong>${escapeHtml(i.name)}</strong>
                            <span>ID: ${i.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>${escapeHtml(i.category)}</td>
                      <td>${money(i.price)}</td>
                      <td><span class="stock-chip ${stockClass}">${i.stock} left</span></td>
                      <td>
                        <div class="row-actions">
                          <button class="row-btn" onclick="openEditItemModal('${i.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
                          <button class="row-btn danger" onclick="deleteItem('${i.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </section>
    </div>
  `;
}

function bindInventory() {
  const search = $('#invSearch');
  if (search) {
    search.addEventListener('input', (e) => {
      const val = e.target.value;
      $('#mainContent').innerHTML = renderInventory(val);
      bindInventory();
      const newSearch = $('#invSearch');
      newSearch.focus();
      newSearch.setSelectionRange(val.length, val.length);
    });
  }
}

/* ---------- ADD / EDIT ITEM MODAL ---------- */
function openAddItemModal() {
  openModal(`
    <div class="modal-head">
      <h3>Add new item</h3>
      <button class="modal-close" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <form onsubmit="saveItem(event)">
      <div class="form-group">
        <label>Item name</label>
        <input type="text" name="name" placeholder="e.g. Sugar 1kg" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Category</label>
          <input type="text" name="category" placeholder="Grocery" required>
        </div>
        <div class="form-group">
          <label>Price (Rs)</label>
          <input type="number" name="price" placeholder="200" required min="0">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Stock</label>
          <input type="number" name="stock" placeholder="10" required min="0">
        </div>
        <div class="form-group">
          <label>Image URL (optional)</label>
          <input type="url" name="image" placeholder="https://...">
        </div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-add">Save item</button>
      </div>
    </form>
  `);
}

function openEditItemModal(id) {
  const item = state.items.find(i => i.id === id);
  if (!item) return;
  openModal(`
    <div class="modal-head">
      <h3>Edit item</h3>
      <button class="modal-close" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <form onsubmit="saveItem(event, '${id}')">
      <div class="form-group">
        <label>Item name</label>
        <input type="text" name="name" value="${escapeHtml(item.name)}" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Category</label>
          <input type="text" name="category" value="${escapeHtml(item.category)}" required>
        </div>
        <div class="form-group">
          <label>Price (Rs)</label>
          <input type="number" name="price" value="${item.price}" required min="0">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Stock</label>
          <input type="number" name="stock" value="${item.stock}" required min="0">
        </div>
        <div class="form-group">
          <label>Image URL</label>
          <input type="url" name="image" value="${escapeHtml(item.image || '')}">
        </div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-add">Update item</button>
      </div>
    </form>
  `);
}

function saveItem(e, editId) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = {
    name: fd.get('name').trim(),
    category: fd.get('category').trim(),
    price: Number(fd.get('price')),
    stock: Number(fd.get('stock')),
    image: fd.get('image') || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&q=80',
  };

  if (editId) {
    const idx = state.items.findIndex(i => i.id === editId);
    if (idx >= 0) state.items[idx] = { ...state.items[idx], ...data };
    showToast('Item updated', 'success');
  } else {
    state.items.push({ id: 'i' + Date.now(), ...data });
    showToast('Item added', 'success');
  }

  saveState();
  closeModal();
  render();
}

function deleteItem(id) {
  const item = state.items.find(i => i.id === id);
  if (!item) return;
  if (!confirm(`Delete "${item.name}"?`)) return;
  state.items = state.items.filter(i => i.id !== id);
  saveState();
  showToast('Item deleted', 'info');
  render();
}

/* ============================================
   PAGE: ORDERS
============================================ */
function renderOrders() {
  return `
    <div class="page">
      <div class="page-head">
        <div>
          <h1>Orders</h1>
          <p>Track and manage all your orders.</p>
        </div>
        <div class="page-actions">
          <button class="btn-add" onclick="newOrder()">
            <i class="fa-solid fa-plus"></i> New order
          </button>
        </div>
      </div>

      <section class="panel table-panel">
        <div class="table-wrap">
          <table class="order-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${state.orders.length === 0 ? `
                <tr><td colspan="6">
                  <div class="empty-state"><i class="fa-solid fa-receipt"></i><h3>No orders yet</h3><p>Create your first order.</p></div>
                </td></tr>
              ` : state.orders.map(o => `
                <tr>
                  <td><strong>#${o.id}</strong></td>
                  <td><div class="cust"><span class="cust-avatar" style="background-image:url('${o.avatar}')"></span>${escapeHtml(o.customer)}</div></td>
                  <td>${o.items}</td>
                  <td>${money(o.total)}</td>
                  <td><span class="status ${o.status}">${o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span></td>
                  <td>
                    <div class="row-actions">
                      <button class="row-btn" onclick="cycleOrderStatus('${o.id}')" title="Change status"><i class="fa-solid fa-rotate"></i></button>
                      <button class="row-btn danger" onclick="deleteOrder('${o.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function bindOrders() {}

function newOrder() {
  const id = String(1049 + state.orders.length);
  const total = Math.floor(Math.random() * 4000) + 500;
  state.orders.unshift({
    id,
    customer: 'Walk-in Customer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&q=80',
    items: Math.floor(Math.random() * 6) + 1,
    total,
    status: 'pending',
    time: 'just now',
  });
  saveState();
  showToast(`Order #${id} created`, 'success');
  render();
}

function cycleOrderStatus(id) {
  const order = state.orders.find(o => o.id === id);
  if (!order) return;
  const cycle = { pending: 'paid', paid: 'refunded', refunded: 'pending' };
  order.status = cycle[order.status];
  saveState();
  showToast(`Order #${id} → ${order.status}`, 'info');
  render();
}

function deleteOrder(id) {
  if (!confirm(`Delete order #${id}?`)) return;
  state.orders = state.orders.filter(o => o.id !== id);
  saveState();
  showToast('Order deleted', 'info');
  render();
}

/* ============================================
   PAGE: REPORTS
============================================ */
function renderReports() {
  const paid = state.orders.filter(o => o.status === 'paid');
  const total = paid.reduce((s, o) => s + o.total, 0);
  const avg = paid.length ? Math.round(total / paid.length) : 0;

  return `
    <div class="page">
      <div class="page-head">
        <div>
          <h1>Reports</h1>
          <p>Understand your business at a glance.</p>
        </div>
      </div>

      <section class="stat-row">
        <div class="stat-card">
          <div class="stat-top"><span class="stat-icon green"><i class="fa-solid fa-coins"></i></span></div>
          <span class="stat-label">Total revenue</span>
          <span class="stat-value">${money(total)}</span>
          <span class="stat-sub">${paid.length} paid orders</span>
        </div>
        <div class="stat-card">
          <div class="stat-top"><span class="stat-icon gold"><i class="fa-solid fa-calculator"></i></span></div>
          <span class="stat-label">Average order</span>
          <span class="stat-value">${money(avg)}</span>
          <span class="stat-sub">Per transaction</span>
        </div>
        <div class="stat-card">
          <div class="stat-top"><span class="stat-icon teal"><i class="fa-solid fa-box"></i></span></div>
          <span class="stat-label">Items in stock</span>
          <span class="stat-value">${state.items.reduce((s, i) => s + i.stock, 0)}</span>
          <span class="stat-sub">${state.items.length} products</span>
        </div>
        <div class="stat-card warn">
          <div class="stat-top"><span class="stat-icon amber"><i class="fa-solid fa-triangle-exclamation"></i></span></div>
          <span class="stat-label">Low stock</span>
          <span class="stat-value">${state.items.filter(i => i.stock <= state.shop.threshold).length}</span>
          <span class="stat-sub">Reorder needed</span>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div><h2>Weekly sales pattern</h2><p>Revenue by day</p></div>
        </div>
        <div class="chart">
          <div class="chart-bars" style="height:200px;">
            ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => `
              <div class="bar-wrap">
                <div class="bar ${i === 4 ? 'active' : ''}" style="--h:${state.weekSales[i]}%"></div>
                <span>${d}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    </div>
  `;
}

function bindReports() {}

/* ============================================
   PAGE: STAFF
============================================ */
function renderStaff() {
  return `
    <div class="page">
      <div class="page-head">
        <div>
          <h1>Staff</h1>
          <p>Manage your team members.</p>
        </div>
        <div class="page-actions">
          <button class="btn-add" onclick="openAddStaffModal()">
            <i class="fa-solid fa-plus"></i> Add staff
          </button>
        </div>
      </div>

      <section class="panel">
        ${state.staff.length === 0 ? `
          <div class="empty-state"><i class="fa-solid fa-users"></i><h3>No staff yet</h3><p>Add your first team member.</p></div>
        ` : `
          <ul class="stock-list">
            ${state.staff.map(s => `
              <li>
                <span class="side-avatar" style="width:42px;height:42px;font-size:0.85rem;">${s.name.split(' ').map(n => n[0]).join('').slice(0,2)}</span>
                <div class="stock-info" style="flex:1;">
                  <strong>${escapeHtml(s.name)}</strong>
                  <span>${escapeHtml(s.role)} · ${escapeHtml(s.email)}</span>
                </div>
                <button class="row-btn danger" onclick="deleteStaff('${s.id}')"><i class="fa-solid fa-trash"></i></button>
              </li>
            `).join('')}
          </ul>
        `}
      </section>
    </div>
  `;
}

function bindStaff() {}

function openAddStaffModal() {
  openModal(`
    <div class="modal-head">
      <h3>Add staff member</h3>
      <button class="modal-close" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <form onsubmit="saveStaff(event)">
      <div class="form-group"><label>Full name</label><input type="text" name="name" required></div>
      <div class="form-row">
        <div class="form-group"><label>Role</label><input type="text" name="role" placeholder="Cashier" required></div>
        <div class="form-group"><label>Email</label><input type="email" name="email" required></div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-add">Add member</button>
      </div>
    </form>
  `);
}

function saveStaff(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  state.staff.push({ id: 's' + Date.now(), name: fd.get('name'), role: fd.get('role'), email: fd.get('email') });
  saveState();
  closeModal();
  showToast('Staff added', 'success');
  render();
}

function deleteStaff(id) {
  state.staff = state.staff.filter(s => s.id !== id);
  saveState();
  showToast('Staff removed', 'info');
  render();
}

/* ============================================
   PAGE: SCAN
============================================ */
function renderScan() {
  return `
    <div class="page">
      <div class="page-head">
        <div><h1>Scan Item</h1><p>Point your camera at a barcode — or type manually.</p></div>
      </div>

      <section class="panel" style="max-width:520px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#01411c,#046a38,#0a8f4c);border-radius:16px;aspect-ratio:4/3;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;">
          <div style="width:70%;aspect-ratio:1;border:2px dashed rgba(255,255,255,0.4);border-radius:16px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;color:#fff;">
            <i class="fa-solid fa-camera" style="font-size:2.5rem;opacity:0.9;"></i>
            <span style="font-size:0.85rem;font-weight:600;">Camera preview</span>
            <span style="font-size:0.7rem;opacity:0.7;">(Demo mode)</span>
          </div>
        </div>

        <div class="form-group" style="margin-top:20px;">
          <label>Or type barcode manually</label>
          <input type="text" id="barcodeInput" placeholder="e.g. 8901234567890">
        </div>
        <button class="btn-add" style="width:100%;justify-content:center;" onclick="simulateScan()">
          <i class="fa-solid fa-magnifying-glass"></i> Look up barcode
        </button>
        <p style="font-size:0.75rem;color:var(--ink-muted);margin-top:14px;text-align:center;">
          In the real app, this uses your phone camera. For now, type anything to simulate.
        </p>
      </section>
    </div>
  `;
}

function bindScan() {}

function simulateScan() {
  const code = $('#barcodeInput').value.trim();
  if (!code) { showToast('Enter a barcode', 'error'); return; }
  const randomItem = state.items[Math.floor(Math.random() * state.items.length)];
  if (randomItem) {
    openEditItemModal(randomItem.id);
    showToast(`Found: ${randomItem.name}`, 'success');
  }
}

/* ============================================
   PAGE: SETTINGS
============================================ */
function renderSettings() {
  return `
    <div class="page">
      <div class="page-head">
        <div><h1>Settings</h1><p>Configure your shop preferences.</p></div>
      </div>

      <section class="panel" style="max-width:640px;">
        <form onsubmit="saveSettings(event)">
          <div class="form-group">
            <label>Shop name</label>
            <input type="text" name="name" value="${escapeHtml(state.shop.name)}" required>
          </div>
          <div class="form-group">
            <label>Location</label>
            <input type="text" name="location" value="${escapeHtml(state.shop.location)}" required>
          </div>
          <div class="form-group">
            <label>Low stock threshold</label>
            <input type="number" name="threshold" value="${state.shop.threshold}" min="1" required>
          </div>
          <div class="modal-actions" style="justify-content:flex-start;">
            <button type="submit" class="btn-add">Save changes</button>
            <button type="button" class="btn-secondary" onclick="resetAllData()">Reset all data</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function bindSettings() {}

function saveSettings(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  state.shop.name = fd.get('name');
  state.shop.location = fd.get('location');
  state.shop.threshold = Number(fd.get('threshold'));
  saveState();
  showToast('Settings saved', 'success');
  render();
}

function resetAllData() {
  if (!confirm('Reset ALL data to default? This cannot be undone.')) return;
  localStorage.removeItem('dorder_state');
  state = loadState();
  showToast('Data reset', 'info');
  render();
}

/* ============================================
   BOOT
============================================ */
render();