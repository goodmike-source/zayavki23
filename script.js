// Основные DOM элементы
const tableBody = document.getElementById("table-body");
const statusFilter = document.getElementById("status-filter");
const searchBox = document.getElementById("search-box");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const spanClose = document.querySelector(".close");
const themeToggle = document.getElementById("theme-toggle");
const toggleViewBtn = document.getElementById("toggle-view-btn");
const cardsContainer = document.getElementById("cards-container");
const statusTable = document.getElementById("status-table");

// Состояние приложения
let currentView = "table";
let sortEnabled = false;

// Инициализация темы
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeToggle.innerHTML = savedTheme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Переключение темы
themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  themeToggle.innerHTML = newTheme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Переключение между таблицей и карточками
toggleViewBtn.addEventListener("click", toggleView);

function toggleView() {
  currentView = currentView === "table" ? "cards" : "table";
  
  if (currentView === "table") {
    toggleViewBtn.innerHTML = '<i class="fas fa-table"></i><span>Таблица</span>';
    statusTable.style.display = "table";
    cardsContainer.style.display = "none";
  } else {
    toggleViewBtn.innerHTML = '<i class="fas fa-th-large"></i><span>Карточки</span>';
    statusTable.style.display = "none";
    cardsContainer.style.display = "grid";
  }
  
  renderData(filterData(loadData()));
}

// Загрузка данных
function loadData() {
  const saved = localStorage.getItem("requestData");
  return saved ? JSON.parse(saved) : getDefaultData();
}

function getDefaultData() {
  return [
    {
      id: 1,
      date: new Date().toLocaleDateString("ru-RU"),
      client: "Иванов И.И.",
      product: "Шуруповёрт Deko",
      serviceId: "СЦ-001",
      status: "Принят",
      updateDate: new Date().toLocaleDateString("ru-RU"),
      comment: "Принят на складе",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("ru-RU"),
      scAddress: "ул. Сервисная, 15",
      scPhone: "+79991112233",
      clientPhone: "+79998887766",
      manager: "Козяев В.С.",
      urgent: true,
      history: [],
      images: { product: "", serial: "", act: "" }
    }
  ];
}

// Сохранение данных
function saveData(data) {
  localStorage.setItem("requestData", JSON.stringify(data));
  updateStatusSummary(data);
}

// Рендер данных
function renderData(data) {
  if (currentView === "table") {
    renderTable(data);
  } else {
    renderCards(data);
  }
}

// Рендер таблицы
function renderTable(data) {
  tableBody.innerHTML = "";
  
  data.forEach((item, index) => {
    const row = document.createElement("tr");
    row.dataset.id = item.id;
    
    const deadlineInfo = getDeadlineClass(item.deadline);
    const statusBadge = getStatusBadge(item.status);
    
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.date}</td>
      <td>${item.client}</td>
      <td>${item.product}</td>
      <td>${item.serviceId}</td>
      <td>${statusBadge}</td>
      <td>${item.updateDate}</td>
      <td class="deadline ${deadlineInfo.cls}" title="${deadlineInfo.tip}">
        ${item.deadline || "—"}
      </td>
      <td class="actions-cell">
        <select class="status-select">
          ${["Принят", "Отправлен", "На диагностике", "Готов к выдаче", "Требуется звонок", "Отказано"]
            .map(s => `<option value="${s}" ${item.status === s ? "selected" : ""}>${s}</option>`)
            .join("")}
        </select>
        <button class="action-btn update-btn" title="Обновить статус">
          <i class="fas fa-check"></i>
        </button>
        <button class="action-btn details-btn" title="Подробности">
          <i class="fas fa-search"></i>
        </button>
        <button class="action-btn delete-btn" title="Удалить">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    // Назначение обработчиков событий
    row.querySelector(".update-btn").addEventListener("click", () => updateStatus(item, data));
    row.querySelector(".details-btn").addEventListener("click", () => openModal(item, data));
    row.querySelector(".delete-btn").addEventListener("click", () => deleteRequest(item.id, data));
    
    tableBody.appendChild(row);
  });
}

// Рендер карточек
function renderCards(data) {
  cardsContainer.innerHTML = "";
  
  data.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = item.id;
    
    const deadlineInfo = getDeadlineClass(item.deadline);
    const statusBadge = getStatusBadge(item.status);
    
    card.innerHTML = `
      <div class="card-header">
        ${statusBadge}
        <h3>${item.client}</h3>
      </div>
      <div class="card-body">
        <p><strong><i class="fas fa-box"></i> Товар:</strong> ${item.product}</p>
        <p><strong><i class="fas fa-hashtag"></i> Номер:</strong> ${item.serviceId}</p>
        <p><strong><i class="fas fa-calendar-day"></i> Дата:</strong> ${item.date}</p>
        <p><strong><i class="fas fa-comment"></i> Комментарий:</strong> ${item.comment || "—"}</p>
        <p class="deadline ${deadlineInfo.cls}" title="${deadlineInfo.tip}">
          <strong><i class="fas fa-clock"></i> Дедлайн:</strong> ${item.deadline || "—"}
        </p>
      </div>
      <div class="card-actions">
        <select class="status-select">
          ${["Принят", "Отправлен", "На диагностике", "Готов к выдаче", "Требуется звонок", "Отказано"]
            .map(s => `<option value="${s}" ${item.status === s ? "selected" : ""}>${s}</option>`)
            .join("")}
        </select>
        <button class="action-btn update-btn" title="Обновить статус">
          <i class="fas fa-check"></i>
        </button>
        <button class="action-btn details-btn" title="Подробности">
          <i class="fas fa-search"></i>
        </button>
        <button class="action-btn delete-btn" title="Удалить">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    // Назначение обработчиков событий
    card.querySelector(".update-btn").addEventListener("click", () => updateStatus(item, data));
    card.querySelector(".details-btn").addEventListener("click", () => openModal(item, data));
    card.querySelector(".delete-btn").addEventListener("click", () => deleteRequest(item.id, data));
    
    cardsContainer.appendChild(card);
  });
}

// Бейдж статуса
function getStatusBadge(status) {
  const badges = {
    "Принят": { icon: "fa-check-circle", class: "badge-accepted" },
    "Отправлен": { icon: "fa-paper-plane", class: "badge-sent" },
    "На диагностике": { icon: "fa-stethoscope", class: "badge-diagnostics" },
    "Готов к выдаче": { icon: "fa-box-open", class: "badge-ready" },
    "Требуется звонок": { icon: "fa-phone", class: "badge-call" },
    "Отказано": { icon: "fa-ban", class: "badge-denied" }
  };
  
  const badge = badges[status] || { icon: "fa-info-circle", class: "" };
  
  return `
    <span class="status-badge ${badge.class}">
      <i class="fas ${badge.icon}"></i>
      ${status}
    </span>
  `;
}

// Класс дедлайна
function getDeadlineClass(deadlineStr) {
  if (!deadlineStr) return { cls: "", tip: "" };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [d, m, y] = deadlineStr.split(".");
  const deadline = new Date(`${y}-${m}-${d}`);
  
  const diffDays = Math.floor((deadline - today) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { cls: "overdue", tip: "Просрочено" };
  if (diffDays === 0) return { cls: "today", tip: "Дедлайн сегодня" };
  if (diffDays === 1) return { cls: "warning", tip: "Дедлайн завтра" };
  return { cls: "", tip: "" };
}

// Обновление статуса
function updateStatus(item, data) {
  const newStatus = document.querySelector(`[data-id="${item.id}"] .status-select`).value;
  
  if (item.status !== newStatus) {
    const now = new Date();
    item.status = newStatus;
    item.updateDate = now.toLocaleDateString("ru-RU");
    item.history.push(`[${now.toLocaleString("ru-RU")}] Статус изменён на "${newStatus}"`);
    
    saveData(data);
    renderData(filterData(data));
  }
}

// Удаление заявки
function deleteRequest(id, data) {
  if (confirm("Вы уверены, что хотите удалить эту заявку?")) {
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data.splice(index, 1);
      saveData(data);
      renderData(filterData(data));
    }
  }
}

// Модальное окно
function openModal(item, data) {
  if (!item.history) item.history = [];
  
  modalBody.innerHTML = `
    <div class="modal-section">
      <h4><i class="fas fa-info-circle"></i> Основная информация</h4>
      <div class="form-grid">
        <div class="form-group">
          <label>Клиент</label>
          <input type="text" id="edit-client" value="${item.client}">
        </div>
        <div class="form-group">
          <label>Товар</label>
          <input type="text" id="edit-product" value="${item.product}">
        </div>
        <div class="form-group">
          <label>Номер обращения</label>
          <input type="text" id="edit-serviceId" value="${item.serviceId}">
        </div>
        <div class="form-group">
          <label>Дедлайн</label>
          <input type="date" id="edit-deadline" value="${item.deadline ? formatForInput(item.deadline) : ''}">
        </div>
        <div class="form-group full-width">
          <label>Комментарий</label>
          <textarea id="edit-comment">${item.comment || ""}</textarea>
        </div>
      </div>
    </div>
    
    <div class="modal-section">
      <h4><i class="fas fa-address-book"></i> Контактная информация</h4>
      <div class="form-grid">
        <div class="form-group">
          <label>Адрес СЦ</label>
          <input type="text" id="edit-scAddress" value="${item.scAddress || ""}">
        </div>
        <div class="form-group">
          <label>Телефон СЦ</label>
          <input type="text" id="edit-scPhone" value="${item.scPhone || ""}">
        </div>
        <div class="form-group">
          <label>Телефон клиента</label>
          <input type="text" id="edit-clientPhone" value="${item.clientPhone || ""}">
        </div>
      </div>
      ${item.clientPhone ? `<a href="tel:${item.clientPhone}" class="primary-btn call-btn"><i class="fas fa-phone"></i> Позвонить клиенту</a>` : ""}
    </div>
    
    <div class="modal-section">
      <h4><i class="fas fa-history"></i> История изменений</h4>
      <ul class="history-list">
        ${item.history.length ? item.history.map(h => `<li>${h}</li>`).join("") : "<li>Нет записей в истории</li>"}
      </ul>
    </div>
    
    <div class="modal-actions">
      <button id="save-modal" class="primary-btn"><i class="fas fa-save"></i> Сохранить изменения</button>
    </div>
  `;
  
  modal.classList.add("show");
  
  document.getElementById("save-modal").addEventListener("click", () => saveModalChanges(item, data));
}

function saveModalChanges(item, data) {
  const now = new Date();
  const changes = {
    client: document.getElementById("edit-client").value,
    product: document.getElementById("edit-product").value,
    serviceId: document.getElementById("edit-serviceId").value,
    comment: document.getElementById("edit-comment").value,
    deadline: document.getElementById("edit-deadline").value ? formatForDisplay(document.getElementById("edit-deadline").value) : "",
    scAddress: document.getElementById("edit-scAddress").value,
    scPhone: document.getElementById("edit-scPhone").value,
    clientPhone: document.getElementById("edit-clientPhone").value
  };
  
  Object.keys(changes).forEach(key => {
    if (item[key] !== changes[key]) {
      item.history.push(`[${now.toLocaleString("ru-RU")}] Изменено поле "${key}": "${item[key]}" → "${changes[key]}"`);
      item[key] = changes[key];
    }
  });
  
  saveData(data);
  renderData(filterData(data));
  modal.classList.remove("show");
}

// Форматирование даты
function formatForInput(dateStr) {
  const [d, m, y] = dateStr.split(".");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function formatForDisplay(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

// Фильтрация данных
function filterData(data) {
  const statusVal = statusFilter.value;
  const searchText = searchBox.value.toLowerCase();
  
  return data.filter(item => {
    const matchesStatus = !statusVal || item.status === statusVal;
    const matchesSearch = !searchText || 
      item.client.toLowerCase().includes(searchText) || 
      item.product.toLowerCase().includes(searchText) ||
      item.serviceId.toLowerCase().includes(searchText);
    
    return matchesStatus && matchesSearch;
  });
}

// Обновление статистики
function updateStatusSummary(data) {
  const counts = {
    "Принят": 0,
    "Отправлен": 0,
    "На диагностике": 0,
    "Готов к выдаче": 0,
    "Требуется звонок": 0,
    "Отказано": 0
  };
  
  data.forEach(d => counts[d.status]++);
  
  document.querySelector(".summary-item.accepted span").textContent = counts["Принят"];
  document.querySelector(".summary-item.diagnostics span").textContent = counts["На диагностике"];
  document.querySelector(".summary-item.ready span").textContent = counts["Готов к выдаче"];
}

// Добавление новой заявки
document.getElementById("add-request-btn").addEventListener("click", addNewRequest);

function addNewRequest() {
  const client = document.getElementById("new-client").value.trim();
  const product = document.getElementById("new-product").value.trim();
  const serviceId = document.getElementById("new-service-id").value.trim();
  const comment = document.getElementById("new-comment").value.trim();
  
  if (!client || !product) {
    alert("Пожалуйста, заполните поля Клиент и Товар");
    return;
  }
  
  const data = loadData();
  const now = new Date();
  const newId = data.length ? Math.max(...data.map(d => d.id)) + 1 : 1;
  
  const newItem = {
    id: newId,
    date: now.toLocaleDateString("ru-RU"),
    client,
    product,
    serviceId,
    status: "Принят",
    updateDate: now.toLocaleDateString("ru-RU"),
    comment,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("ru-RU"),
    scAddress: "",
    scPhone: "",
    clientPhone: "",
    manager: "",
    urgent: false,
    history: [`[${now.toLocaleString("ru-RU")}] Заявка создана`],
    images: { product: "", serial: "", act: "" }
  };
  
  data.push(newItem);
  saveData(data);
  renderData(filterData(data));
  
  // Очистка полей
  document.getElementById("new-client").value = "";
  document.getElementById("new-product").value = "";
  document.getElementById("new-service-id").value = "";
  document.getElementById("new-comment").value = "";
}

// Экспорт/импорт данных
document.getElementById("export-btn").addEventListener("click", exportData);
document.getElementById("import-btn").addEventListener("click", () => document.getElementById("import-file").click());
document.getElementById("import-file").addEventListener("change", importData);

function exportData() {
  const data = loadData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `service-desk-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (confirm(`Импортировать ${data.length} заявок? Текущие данные будут заменены.`)) {
        saveData(data);
        renderData(filterData(data));
      }
    } catch (err) {
      alert("Ошибка при чтении файла. Убедитесь, что файл в правильном формате.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}

// Закрытие модального окна
spanClose.addEventListener("click", () => modal.classList.remove("show"));
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("show");
});

// Инициализация приложения
function initApp() {
  initTheme();
  renderData(filterData(loadData()));
  
  // Обработчики событий фильтрации
  statusFilter.addEventListener("change", () => renderData(filterData(loadData())));
  searchBox.addEventListener("input", () => renderData(filterData(loadData())));
}

// Запуск приложения
document.addEventListener("DOMContentLoaded", initApp);
