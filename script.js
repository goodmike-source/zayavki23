// === ГЛОБАЛЬНЫЕ ===
const tableBody = document.getElementById("table-body");
const statusFilter = document.getElementById("status-filter");
const searchBox = document.getElementById("search-box");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const spanClose = document.querySelector(".close");
let sortEnabled = true; // 🟢 добавил объявление
let currentView = "table"; // table | cards

// === КНОПКА СОРТИРОВКИ ===
const sortToggle = document.createElement("button");
sortToggle.id = "sort-toggle";
sortToggle.textContent = "🔽 Сортировка по дедлайну: ВКЛ";
sortToggle.style.margin = "10px";
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("controls").appendChild(sortToggle);
});
sortToggle.onclick = () => {
  sortEnabled = !sortEnabled;
  sortToggle.textContent = sortEnabled
    ? "🔽 Сортировка по дедлайну: ВКЛ"
    : "⬜ Сортировка по дедлайну: ВЫКЛ";
  renderData(filterData(loadData()));
};

// === ДАННЫЕ ===
const defaultData = [
  {
    id: 1,
    date: "19.07.2025",
    client: "Иванов И.И.",
    product: "Шуруповёрт Deko",
    serviceId: "СЦ-001",
    status: "Принят",
    updateDate: "19.07.2025",
    comment: "Принят на складе",
    deadline: "25.07.2025",
    scAddress: "ул. Сервисная, 15",
    scPhone: "+79991112233",
    clientPhone: "+79998887766",
    manager: "Козяев В.С.",
    urgent: true,
    history: [],
    images: { product: "", serial: "", act: "" }
  }
];

function saveData(data) {
  localStorage.setItem("requestData", JSON.stringify(data));
}
function loadData() {
  const saved = localStorage.getItem("requestData");
  return saved ? JSON.parse(saved) : defaultData;
}

// === BADGES ===
function getStatusBadge(status) {
  switch (status) {
    case "Принят": return `<span class="badge badge-green"><i class="fa-solid fa-circle-check"></i> Принят</span>`;
    case "Отправлен": return `<span class="badge badge-blue"><i class="fa-solid fa-paper-plane"></i> Отправлен</span>`;
    case "На диагностике": return `<span class="badge badge-orange"><i class="fa-solid fa-stethoscope"></i> Диагностика</span>`;
    case "Готов к выдаче": return `<span class="badge badge-purple"><i class="fa-solid fa-box"></i> Готово</span>`;
    case "Требуется звонок": return `<span class="badge badge-yellow"><i class="fa-solid fa-phone"></i> Звонок</span>`;
    case "Отказано": return `<span class="badge badge-red"><i class="fa-solid fa-ban"></i> Отказано</span>`;
    default: return `<span class="badge"><i class="fa-solid fa-circle-info"></i> ${status}</span>`;
  }
}

// === ДЕДЛАЙНЫ ===
function getDeadlineClass(deadlineStr) {
  if (!deadlineStr) return { cls: "", tip: "" };
  const [d, m, y] = deadlineStr.split(".");
  const deadline = new Date(`${y}-${m}-${d}`);
  const todayMid = new Date(); todayMid.setHours(0,0,0,0);
  const tomorrowMid = new Date(todayMid); tomorrowMid.setDate(tomorrowMid.getDate() + 1);

  if (deadline < todayMid) return { cls: "overdue", tip: "Просрочено" };
  if (deadline.getTime() === todayMid.getTime()) return { cls: "today", tip: "Дедлайн сегодня" };
  if (deadline.getTime() === tomorrowMid.getTime()) return { cls: "warning", tip: "Дедлайн завтра" };
  return { cls: "", tip: "" };
}

// === РЕНДЕР ТАБЛИЦЫ ===
function renderTable(data) {
  tableBody.innerHTML = "";
  let draggedIndex = null;

  data.forEach((item, index) => {
    const row = document.createElement("tr");
    row.setAttribute("draggable", "true");
    row.dataset.index = index;
    const deadlineInfo = getDeadlineClass(item.deadline);

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.date}</td>
      <td>${item.client}</td>
      <td>${item.product}</td>
      <td>${item.serviceId}</td>
      <td class="status">${getStatusBadge(item.status)}</td>
      <td>${item.updateDate}</td>
      <td>${item.comment}</td>
      <td class="${deadlineInfo.cls}" title="${deadlineInfo.tip}">${item.deadline || ""}</td>
      <td>
        <select class="status-select">
          ${["Принят", "Отправлен", "На диагностике", "Готов к выдаче", "Требуется звонок", "Отказано"]
            .map(s => `<option ${item.status === s ? "selected" : ""}>${s}</option>`).join("")}
        </select>
        <button class="update-btn">OK</button>
        <button class="details-btn">🔍</button>
        <button class="delete-btn">🗑️</button>
      </td>
    `;

    // drag & drop
    row.addEventListener("dragstart", e => { draggedIndex = index; row.style.opacity = "0.4"; e.dataTransfer.effectAllowed = "move"; });
    row.addEventListener("dragover", e => { e.preventDefault(); row.style.borderTop = "2px solid #007bff"; });
    row.addEventListener("dragleave", () => row.style.borderTop = "");
    row.addEventListener("drop", e => {
      e.preventDefault(); row.style.borderTop = "";
      if (draggedIndex !== null && draggedIndex !== index) {
        const draggedItem = data[draggedIndex];
        data.splice(draggedIndex, 1);
        data.splice(index, 0, draggedItem);
        saveData(data);
        renderTable(filterData(data));
      }
    });
    row.addEventListener("dragend", () => row.style.opacity = "1");

    // update status
    row.querySelector(".update-btn").onclick = () => {
      const newStatus = row.querySelector(".status-select").value;
      const now = new Date();
      item.status = newStatus;
      item.updateDate = now.toLocaleDateString("ru-RU");
      item.history.push(`[${now.toLocaleString("ru-RU")}] Статус изменён на "${newStatus}"`);
      saveData(data);
      renderTable(filterData(data));
    };

    // details
    row.querySelector(".details-btn").onclick = () => openModal(item, data);

    // delete
    row.querySelector(".delete-btn").onclick = () => {
      if (confirm("Удалить заявку?")) {
        row.classList.add("fade-out");
        setTimeout(() => {
          data.splice(index, 1);
          saveData(data);
          renderTable(filterData(data));
        }, 300);
      }
    };

    tableBody.appendChild(row);
  });

  updateStatusSummary(data);
}

// === СТАТИСТИКА ===
function updateStatusSummary(data) {
  const counts = { "Принят":0, "Отправлен":0, "На диагностике":0, "Готов к выдаче":0, "Требуется звонок":0, "Отказано":0 };
  data.forEach(d => counts[d.status]++);
  document.getElementById("status-summary").innerText =
    `🟢 Принят: ${counts["Принят"]} | 🛫 Отправлен: ${counts["Отправлен"]} | 🔧 Диагностика: ${counts["На диагностике"]} | 📦 Готово: ${counts["Готов к выдаче"]} | ☎ Звонок: ${counts["Требуется звонок"]} | ❌ Отказ: ${counts["Отказано"]}`;
}

// === МОДАЛЬНОЕ ОКНО ===
function openModal(item, data) {
  if (!item.history) item.history = [];

  modalBody.innerHTML = `
    <div class="modal-section">
      <h3>📌 Основное</h3>
      <label>Клиент:<input value="${item.client}" id="edit-client" /></label>
      <label>Товар:<input value="${item.product}" id="edit-product" /></label>
      <label>Комментарий:<input value="${item.comment}" id="edit-comment" /></label>
      <label>Номер обращения:<input value="${item.serviceId}" id="edit-serviceId" /></label>
      <label>Дедлайн:<input type="date" value="${item.deadline ? formatForInput(item.deadline) : ''}" id="edit-deadline" /></label>
    </div>

    <div class="modal-section">
      <h3>📞 Контакты</h3>
      <label>Адрес СЦ:<input value="${item.scAddress || ""}" id="edit-scAddress" /></label>
      <label>Телефон СЦ:<input value="${item.scPhone || ""}" id="edit-scPhone" /></label>
      <label>Телефон клиента:<input value="${item.clientPhone || ""}" id="edit-clientPhone" /></label>
      ${item.clientPhone ? `<a href="tel:${item.clientPhone}" class="call-btn">📞 Позвонить</a>` : ""}
    </div>

    <div class="modal-section">
      <h3>📚 История изменений</h3>
      <ul class="history-list">${item.history.map(h => `<li>${h}</li>`).join("") || "<li>Пока нет</li>"}</ul>
    </div>

    <div class="modal-actions">
      <button id="save-modal" class="primary-btn">💾 Сохранить</button>
    </div>
  `;

  modal.style.display = "block";
  document.getElementById("save-modal").onclick = () => {
    const now = new Date().toLocaleString("ru-RU");
    const newData = {
      client: document.getElementById("edit-client").value,
      product: document.getElementById("edit-product").value,
      comment: document.getElementById("edit-comment").value,
      serviceId: document.getElementById("edit-serviceId").value,
      deadline: document.getElementById("edit-deadline").value ? formatForDisplay(document.getElementById("edit-deadline").value) : "",
      scAddress: document.getElementById("edit-scAddress").value,
      scPhone: document.getElementById("edit-scPhone").value,
      clientPhone: document.getElementById("edit-clientPhone").value
    };

    for (let key in newData) {
      if (item[key] !== newData[key]) {
        item.history.push(`[${now}] Обновлено поле ${key}`);
        item[key] = newData[key];
      }
    }

    saveData(data);
    renderTable(filterData(data));
    modal.style.display = "none";
  };
}
function formatForInput(dateStr) { const [d,m,y] = dateStr.split("."); return `${y}-${m}-${d}`; }
function formatForDisplay(dateStr) { const [y,m,d] = dateStr.split("-"); return `${d}.${m}.${y}`; }
spanClose.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

// === ФИЛЬТР ===
function filterData(data) {
  const statusVal = statusFilter.value;
  const searchText = searchBox.value.toLowerCase();
  return data.filter(item => {
    const matchesStatus = !statusVal || item.status === statusVal;
    const matchesSearch = item.client.toLowerCase().includes(searchText) || item.product.toLowerCase().includes(searchText);
    return matchesStatus && matchesSearch;
  });
}
statusFilter.onchange = () => renderTable(filterData(loadData()));
searchBox.oninput = () => renderTable(filterData(loadData()));

// === ДОБАВЛЕНИЕ ===
document.getElementById("add-request-btn").onclick = () => {
  const client = document.getElementById("new-client").value.trim();
  const product = document.getElementById("new-product").value.trim();
  const serviceId = document.getElementById("new-service-id").value.trim();
  const comment = document.getElementById("new-comment").value.trim();

  if (!client || !product) { alert("Заполните минимум поля Клиент и Товар."); return; }

  const data = loadData();
  const now = new Date().toLocaleDateString("ru-RU");
  const newId = data.length ? Math.max(...data.map(d => d.id)) + 1 : 1;

  const newItem = {
    id: newId, date: now, client, product, serviceId,
    status: "Принят", updateDate: now, comment,
    deadline: "", scAddress: "", scPhone: "", clientPhone: "",
    manager: "", urgent: false,
    history: [`[${now}] Заявка создана оператором`],
    images: { product: "", serial: "", act: "" }
  };

  data.push(newItem); saveData(data); renderTable(filterData(data));
  document.getElementById("new-client").value = "";
  document.getElementById("new-product").value = "";
  document.getElementById("new-service-id").value = "";
  document.getElementById("new-comment").value = "";
};

// === ТЁМНАЯ ТЕМА ===
const themeToggle = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") { document.body.classList.add("dark-theme"); themeToggle.textContent = "☀️"; }
themeToggle.onclick = () => {
  document.body.classList.toggle("dark-theme");
  const isDark = document.body.classList.contains("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
};

// === ЭКСПОРТ / ИМПОРТ ===
document.getElementById("export-btn").onclick = () => {
  const data = loadData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "zayavki.json"; a.click(); URL.revokeObjectURL(url);
};
document.getElementById("import-btn").onclick = () => document.getElementById("import-file").click();
document.getElementById("import-file").onchange = e => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try { const data = JSON.parse(reader.result); saveData(data); renderTable(filterData(data)); alert("Заявки успешно загружены!"); }
    catch { alert("Ошибка при чтении файла."); }
  };
  reader.readAsText(file);
};

// === ВИД (ТАБЛИЦА / КАРТОЧКИ) ===
document.getElementById("toggle-view-btn").onclick = () => {
  currentView = currentView === "table" ? "cards" : "table";
  document.getElementById("toggle-view-btn").textContent = currentView === "table" ? "📊 Таблица" : "🗂️ Карточки";
  renderData(filterData(loadData()));
};
function renderData(data) {
  const table = document.getElementById("status-table");
  const cards = document.getElementById("cards-container");
  if (currentView === "table") { table.style.display = "table"; cards.style.display = "none"; renderTable(data); }
  else { table.style.display = "none"; cards.style.display = "grid"; renderCards(data); }
}
function renderCards(data) {
  let container = document.getElementById("cards-container"); container.innerHTML = "";
  data.forEach((item, index) => {
    const card = document.createElement("div"); card.className = "card";
    card.innerHTML = `
      ${getStatusBadge(item.status)}
      <h3>${item.client}</h3>
      <p><strong>📦 Товар:</strong> ${item.product}</p>
      <p><strong>№:</strong> ${item.serviceId}</p>
      <p><strong>Комментарий:</strong> ${item.comment}</p>
      <p><strong>Дедлайн:</strong> ${item.deadline || "—"}</p>
      <div class="card-actions">
        <button class="details-btn">🔍</button>
        <button class="delete-btn">🗑️</button>
      </div>`;
    card.querySelector(".details-btn").onclick = () => openModal(item, data);
    card.querySelector(".delete-btn").onclick = () => { if (confirm("Удалить заявку?")) { data.splice(index, 1); saveData(data); renderData(filterData(data)); } };
    container.appendChild(card);
  });
  updateStatusSummary(data);
}

// === ПЕРВЫЙ РЕНДЕР ===
renderData(filterData(loadData()));

function renderData(data) {
  const table = document.getElementById("status-table");
  const cards = document.getElementById("cards-container");

  if (currentView === "table") {
    table.style.display = "table";
    cards.style.display = "none";
    renderTable(data);
  } else {
    table.style.display = "none";
    cards.style.display = "grid";
    renderCards(data);
  }
}

function renderCards(data) {
  let container = document.getElementById("cards-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "cards-container";
    container.className = "cards-grid";
    document.querySelector(".container").appendChild(container);
  }
  container.innerHTML = "";

  data.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
  ${getStatusBadge(item.status)}
  <h3>${item.client}</h3>
  <p><strong>📦 Товар:</strong> ${item.product}</p>
  <p><strong>№:</strong> ${item.serviceId}</p>
  <p><strong>Комментарий:</strong> ${item.comment}</p>
  <p><strong>Дедлайн:</strong> ${item.deadline || "—"}</p>
  <div class="card-actions">
    <button class="details-btn">🔍</button>
    <button class="delete-btn">🗑️</button>
  </div>
`;

    // --- Кнопки внутри карточки ---
    card.querySelector(".details-btn").onclick = () => openModal(item, data);
    card.querySelector(".delete-btn").onclick = () => {
      if (confirm("Удалить заявку?")) {
        data.splice(index, 1);
        saveData(data);
        renderData(filterData(data));
      }
    };

    container.appendChild(card);
  });

  updateStatusSummary(data);
}