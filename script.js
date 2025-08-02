class ServiceTrackApp {
  constructor() {
    this.requests = [];
    this.currentView = 'table';
    this.sortConfig = {
      key: 'id',
      direction: 'asc'
    };
    this.currentEditingId = null;
    this.pagination = {
      currentPage: 1,
      pageSize: 10,
      totalItems: 0
    };
    this.contextRequestId = null;
    
    this.initElements();
    this.initEventListeners();
    this.loadData();
    this.render();
    this.setupTheme();
  }
  
  initElements() {
    this.elements = {
      appContainer: document.querySelector('.app-layout'),
      sidebar: document.querySelector('.sidebar'),
      toggleSidebar: document.querySelector('#toggle-sidebar'),
      tableBody: document.getElementById('table-body'),
      cardsContainer: document.getElementById('cards-container'),
      searchInput: document.getElementById('search-input'),
      statusFilter: document.getElementById('status-filter'),
      urgencyFilter: document.getElementById('urgency-filter'),
      clearSearch: document.querySelector('.search-clear'),
      addRequestBtn: document.getElementById('add-request'),
      toggleViewBtn: document.querySelector('.view-switcher'),
      exportExcelBtn: document.getElementById('export-excel'),
      themeToggle: document.getElementById('theme-toggle'),
      requestModal: document.getElementById('request-modal'),
      requestForm: document.getElementById('request-form'),
      closeModalButtons: document.querySelectorAll('.close-modal'),
      clientInput: document.getElementById('client'),
      productInput: document.getElementById('product'),
      serviceIdInput: document.getElementById('service-id'),
      statusSelect: document.getElementById('status'),
      deadlineInput: document.getElementById('deadline'),
      urgentCheckbox: document.getElementById('urgent'),
      prevPageBtn: document.getElementById('prev-page'),
      nextPageBtn: document.getElementById('next-page'),
      pageSizeSelect: document.getElementById('page-size-select'),
      showingFrom: document.getElementById('showing-from'),
      showingTo: document.getElementById('showing-to'),
      totalItems: document.getElementById('total-items'),
      pageNumbers: document.getElementById('page-numbers'),
      selectAllCheckbox: document.getElementById('select-all'),
      notification: document.getElementById('notification'),
      contextMenu: document.getElementById('context-menu'),
      modalTitle: document.getElementById('modal-title')
    };
  }
  
  initEventListeners() {
    // Боковое меню
    this.elements.toggleSidebar.addEventListener('click', () => {
      this.elements.sidebar.classList.toggle('collapsed');
    });
    
    // Поиск и фильтры
    this.elements.searchInput.addEventListener('input', () => this.render());
    this.elements.statusFilter.addEventListener('change', () => this.render());
    this.elements.urgencyFilter.addEventListener('change', () => this.render());
    this.elements.clearSearch.addEventListener('click', () => {
      this.elements.searchInput.value = '';
      this.render();
    });
    
    // Кнопки управления
    this.elements.addRequestBtn.addEventListener('click', () => this.openAddModal());
    this.elements.toggleViewBtn.addEventListener('click', (e) => {
      if (e.target.closest('[data-view]')) {
        const view = e.target.closest('[data-view]').dataset.view;
        this.switchView(view);
      }
    });
    this.elements.exportExcelBtn.addEventListener('click', () => this.exportToExcel());
    this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
    
    // Навигация по aside меню
    document.querySelectorAll('.sidebar .nav-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.sidebar .nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const section = item.dataset.section;
        document.querySelectorAll('main section').forEach(sec => sec.style.display = 'none');
        if (section === 'reports') {
          document.getElementById('section-reports').style.display = 'block';
          this.renderReports();
        } else {
          document.querySelector('.content-area').style.display = 'block';
        }
      });
    });

    // Модальные окна
    this.elements.closeModalButtons.forEach(btn => {
      btn.addEventListener('click', () => this.closeModals());
    });
    
    // Форма
    this.elements.requestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveRequest();
    });
    
    // Пагинация
    this.elements.prevPageBtn.addEventListener('click', () => this.prevPage());
    this.elements.nextPageBtn.addEventListener('click', () => this.nextPage());
    this.elements.pageSizeSelect.addEventListener('change', () => {
      this.pagination.pageSize = parseInt(this.elements.pageSizeSelect.value);
      this.pagination.currentPage = 1;
      this.render();
    });
    
    // Выделение всех строк
    this.elements.selectAllCheckbox.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('.row-checkbox');
      checkboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
      });
    });
    
    // Сортировка таблицы
    document.querySelectorAll('#requests-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.getAttribute('data-sort');
        this.setSort(key);
      });
    });
    
    // Контекстное меню для строк таблицы
    document.addEventListener('contextmenu', (e) => {
      if (e.target.closest('tr[data-id]')) {
        this.showContextMenu(e, e.target.closest('tr'));
      }
    });
    
    // Закрытие контекстного меню при клике вне его
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#context-menu') && !e.target.closest('.action-buttons')) {
        this.hideContextMenu();
      }
    });

    // Dropdown меню
    document.querySelectorAll('.dropdown-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dropdown = e.target.closest('.dropdown');
        dropdown.classList.toggle('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
      }
    });

    // Сохранение/загрузка файлов
    const saveBtn = document.getElementById("save-file");
    if (saveBtn) saveBtn.addEventListener("click", () => this.saveToFile());

    const loadBtn = document.getElementById("load-file");
    const fileInput = document.getElementById("file-input");
    if (loadBtn && fileInput) {
      loadBtn.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
          this.loadFromFile(e.target.files[0]);
          e.target.value = "";
        }
      });
    }
  }
  
  loadData() {
    const savedData = localStorage.getItem('serviceRequests');
    this.requests = savedData ? JSON.parse(savedData) : this.getDefaultData();
    this.pagination.totalItems = this.requests.length;
    this.updatePagination();
  }
  
  getDefaultData() {
    return [
      {
        id: 1,
        date: new Date().toLocaleDateString('ru-RU'),
        client: "Иванов Иван Иванович",
        product: "Дрель электрическая DeWalt DCD777D2T",
        serviceId: "СЦ-2023-001",
        status: "Принят",
        updateDate: new Date().toLocaleDateString('ru-RU'),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
        comment: "Не включается, требуется диагностика",
        clientPhone: "+7 (999) 123-45-67",
        scPhone: "+7 (495) 123-45-67",
        scAddress: "г. Москва, ул. Сервисная, д. 15",
        manager: "Петров П.П.",
        urgent: false,
        history: [
          `[${new Date().toLocaleString('ru-RU')}] Заявка создана`
        ]
      },
      {
        id: 2,
        date: new Date().toLocaleDateString('ru-RU'),
        client: "Смирнова Анна Сергеевна",
        product: "Ноутбук Lenovo IdeaPad 5",
        serviceId: "СЦ-2023-002",
        status: "На диагностике",
        updateDate: new Date().toLocaleDateString('ru-RU'),
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
        comment: "Не заряжается, возможно проблема с разъёмом",
        clientPhone: "+7 (987) 654-32-10",
        scPhone: "+7 (495) 765-43-21",
        scAddress: "г. Москва, ул. Ремонтная, д. 8",
        manager: "Иванова И.И.",
        urgent: true,
        history: [
          `[${new Date().toLocaleString('ru-RU')}] Заявка создана`,
          `[${new Date().toLocaleString('ru-RU')}] Статус изменён на "На диагностике"`
        ]
      },
      {
        id: 3,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
        client: "Кузнецов Дмитрий Алексеевич",
        product: "Смартфон Samsung Galaxy S21",
        serviceId: "СЦ-2023-003",
        status: "Готов к выдаче",
        updateDate: new Date().toLocaleDateString('ru-RU'),
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
        comment: "Замена экрана выполнена, ожидает оплаты",
        clientPhone: "+7 (916) 123-45-67",
        scPhone: "+7 (495) 987-65-43",
        scAddress: "г. Москва, ул. Техническая, д. 12",
        manager: "Сидорова С.С.",
        urgent: false,
        history: [
          `[${new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString('ru-RU')}] Заявка создана`,
          `[${new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleString('ru-RU')}] Статус изменён на "На диагностике"`,
          `[${new Date().toLocaleString('ru-RU')}] Статус изменён на "Готов к выдаче"`
        ]
      }
    ];
  }
  
  saveData() {
    localStorage.setItem('serviceRequests', JSON.stringify(this.requests));
    this.pagination.totalItems = this.requests.length;
    this.updatePagination();
  }
  
  getFilteredData() {
    const searchTerm = this.elements.searchInput.value.toLowerCase();
    const statusFilter = this.elements.statusFilter.value;
    const urgencyFilter = this.elements.urgencyFilter.value;
    
    return this.requests.filter(request => {
      const matchesSearch = 
        request.client.toLowerCase().includes(searchTerm) ||
        request.product.toLowerCase().includes(searchTerm) ||
        (request.serviceId && request.serviceId.toLowerCase().includes(searchTerm));
      
      const matchesStatus = !statusFilter || request.status === statusFilter;
      
      let matchesUrgency = true;
      if (urgencyFilter) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = this.parseDate(request.deadline);
        
        if (urgencyFilter === 'urgent') {
          matchesUrgency = request.urgent;
        } else if (urgencyFilter === 'overdue') {
          matchesUrgency = deadlineDate && deadlineDate < today;
        }
      }
      
      return matchesSearch && matchesStatus && matchesUrgency;
    });
  }
  
  sortData(data) {
    const { key, direction } = this.sortConfig;
    
    return [...data].sort((a, b) => {
      if (key === 'deadline') {
        const dateA = this.parseDate(a.deadline) || new Date(0);
        const dateB = this.parseDate(b.deadline) || new Date(0);
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      let valueA = a[key];
      let valueB = b[key];
      
      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();
      
      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  setSort(key) {
    if (this.sortConfig.key === key) {
      this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortConfig.key = key;
      this.sortConfig.direction = 'asc';
    }
    
    document.querySelectorAll('#requests-table th').forEach(th => {
      th.innerHTML = th.innerHTML.replace(/&nbsp;▲|&nbsp;▼/g, '');
      if (th.getAttribute('data-sort') === this.sortConfig.key) {
        th.innerHTML += this.sortConfig.direction === 'asc' ? '&nbsp;▲' : '&nbsp;▼';
      }
    });
    
    this.render();
  }
  
  render() {
    const filteredData = this.getFilteredData();
    const sortedData = this.sortData(filteredData);
    this.pagination.totalItems = sortedData.length;
    this.updatePagination();
    
    const paginatedData = this.getPaginatedData(sortedData);
    
    if (this.currentView === 'table') {
      this.renderTableView(paginatedData);
    } else {
      this.renderCardsView(paginatedData);
    }
  }
  
  getPaginatedData(data) {
    const start = (this.pagination.currentPage - 1) * this.pagination.pageSize;
    const end = start + this.pagination.pageSize;
    return data.slice(start, end);
  }
  
  updatePagination() {
    const totalPages = Math.ceil(this.pagination.totalItems / this.pagination.pageSize);
    
    this.elements.showingFrom.textContent = ((this.pagination.currentPage - 1) * this.pagination.pageSize) + 1;
    this.elements.showingTo.textContent = Math.min(
      this.pagination.currentPage * this.pagination.pageSize,
      this.pagination.totalItems
    );
    this.elements.totalItems.textContent = this.pagination.totalItems;
    
    this.elements.prevPageBtn.disabled = this.pagination.currentPage === 1;
    this.elements.nextPageBtn.disabled = this.pagination.currentPage >= totalPages;
    
    // Обновление номеров страниц
    this.elements.pageNumbers.innerHTML = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `btn-icon ${i === this.pagination.currentPage ? 'active' : ''}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener('click', () => {
        this.pagination.currentPage = i;
        this.render();
      });
      this.elements.pageNumbers.appendChild(pageBtn);
    }
  }
  
  prevPage() {
    if (this.pagination.currentPage > 1) {
      this.pagination.currentPage--;
      this.render();
    }
  }
  
  nextPage() {
    const totalPages = Math.ceil(this.pagination.totalItems / this.pagination.pageSize);
    if (this.pagination.currentPage < totalPages) {
      this.pagination.currentPage++;
      this.render();
    }
  }
  
  renderTableView(data) {
    this.elements.tableBody.innerHTML = '';
    
    data.forEach(request => {
      const row = document.createElement('tr');
      row.dataset.id = request.id;
      
      const deadlineClass = this.getDeadlineClass(request.deadline);
      const statusBadge = this.getStatusBadge(request.status);
      
      row.innerHTML = `
        <td><input type="checkbox" class="row-checkbox" data-id="${request.id}"></td>
        <td>${request.id}</td>
        <td>${request.client}</td>
        <td>${request.product}</td>
        <td>${statusBadge}</td>
        <td>${request.date}</td>
        <td class="${deadlineClass.class}" title="${deadlineClass.tooltip}">
          ${request.deadline || '-'}
          ${request.urgent ? ' <i class="fas fa-exclamation-circle urgent-icon" title="Срочная заявка"></i>' : ''}
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon view-btn" data-id="${request.id}" title="Просмотр">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon edit-btn" data-id="${request.id}" title="Редактировать">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </td>
      `;
      
      this.elements.tableBody.appendChild(row);
    });
    
    // Назначаем обработчики событий для кнопок
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openDetailsModal(parseInt(btn.getAttribute('data-id'))));
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openEditModal(parseInt(btn.getAttribute('data-id'))));
    });
  }
  
  renderCardsView(data) {
    this.elements.cardsContainer.innerHTML = '';
    
    data.forEach(request => {
      const deadlineClass = this.getDeadlineClass(request.deadline);
      const statusBadge = this.getStatusBadge(request.status);

      const card = document.createElement('div');
      card.className = 'request-card';
      card.innerHTML = `
        <div class="card-header">
          <span class="card-id">#${request.id}</span>
          ${statusBadge}
        </div>
        <div class="card-body">
          <h3>${request.client}</h3>
          <p><strong>Товар:</strong> ${request.product}</p>
          <p><strong>Дата:</strong> ${request.date}</p>
          <p class="${deadlineClass.class}" title="${deadlineClass.tooltip}">
            <strong>Дедлайн:</strong> ${request.deadline || '-'}
            ${request.urgent ? ' <i class="fas fa-exclamation-circle urgent-icon" title="Срочная"></i>' : ''}
          </p>
        </div>
        <div class="card-footer">
          <button class="btn-icon view-btn" data-id="${request.id}" title="Просмотр">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-icon edit-btn" data-id="${request.id}" title="Редактировать">
            <i class="fas fa-edit"></i>
          </button>
        </div>
      `;
      this.elements.cardsContainer.appendChild(card);
    });

    // Обработчики кнопок
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openDetailsModal(parseInt(btn.getAttribute('data-id'))));
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openEditModal(parseInt(btn.getAttribute('data-id'))));
    });
  }
  
  switchView(view) {
    this.currentView = view;
    document.querySelectorAll('.view-switcher button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    if (view === 'table') {
      document.querySelector('.table-responsive').style.display = 'block';
      this.elements.cardsContainer.style.display = 'none';
    } else {
      document.querySelector('.table-responsive').style.display = 'none';
      this.elements.cardsContainer.style.display = 'grid';
    }
    this.render();
  }
  
  openAddModal() {
    this.currentEditingId = null;
    this.elements.modalTitle.textContent = 'Новая заявка';
    this.resetForm();
    this.openModal(this.elements.requestModal);
  }
  
  openEditModal(id) {
    const request = this.requests.find(r => r.id === id);
    if (!request) return;
    
    this.currentEditingId = id;
    this.elements.modalTitle.textContent = `Редактирование заявки #${id}`;
    
    this.elements.clientInput.value = request.client;
    this.elements.productInput.value = request.product;
    this.elements.serviceIdInput.value = request.serviceId || '';
    this.elements.statusSelect.value = request.status;
    
    if (request.deadline) {
      const [day, month, year] = request.deadline.split('.');
      this.elements.deadlineInput.value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      this.elements.deadlineInput.value = '';
    }
    
    this.elements.urgentCheckbox.checked = request.urgent;
    
    this.openModal(this.elements.requestModal);
  }
  
  openDetailsModal(id) {
    const request = this.requests.find(r => r.id === id);
    if (!request) return;

    const deadlineClass = this.getDeadlineClass(request.deadline);
    const statusBadge = this.getStatusBadge(request.status);

    const modalHTML = `
      <div class="modal active" id="details-modal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>Детали заявки #${request.id}</h3>
            <button class="btn-icon close-modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="detail-grid">
              <div class="form-section">
                <h3><i class="fas fa-info-circle"></i> Основная информация</h3>
                <div class="detail-item">
                  <span class="detail-label">Клиент:</span>
                  <span class="detail-value">${request.client}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Товар:</span>
                  <span class="detail-value">${request.product}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Номер обращения:</span>
                  <span class="detail-value">${request.serviceId || '-'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Статус:</span>
                  <span class="detail-value">${statusBadge}</span>
                </div>
              </div>
              <div class="form-section">
                <h3><i class="fas fa-calendar-alt"></i> Даты</h3>
                <div class="detail-item">
                  <span class="detail-label">Дата создания:</span>
                  <span class="detail-value">${request.date}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Дата обновления:</span>
                  <span class="detail-value">${request.updateDate}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Дедлайн:</span>
                  <span class="detail-value ${deadlineClass.class}" title="${deadlineClass.tooltip}">
                    ${request.deadline || '-'}
                    ${request.urgent ? ' <i class="fas fa-exclamation-circle urgent-icon" title="Срочная заявка"></i>' : ''}
                  </span>
                </div>
              </div>
              <div class="form-section full-width">
                <h3><i class="fas fa-comment"></i> Комментарий</h3>
                <div class="detail-comment">${request.comment || 'Нет комментария'}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary close-modal">Закрыть</button>
            <button class="btn btn-primary" id="edit-from-details">Редактировать</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.querySelectorAll('#details-modal .close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('details-modal').remove();
      });
    });
    
    document.getElementById('edit-from-details').addEventListener('click', () => {
      document.getElementById('details-modal').remove();
      this.openEditModal(id);
    });
  }
  
  saveRequest() {
    const client = this.elements.clientInput.value.trim();
    const product = this.elements.productInput.value.trim();
    
    if (!client || !product) {
      this.showNotification('Заполните обязательные поля: Клиент и Товар', 'error');
      return;
    }
    
    const now = new Date();
    const historyEntry = `[${now.toLocaleString('ru-RU')}] ${this.currentEditingId ? 'Заявка обновлена' : 'Заявка создана'}`;
    
    const requestData = {
      client,
      product,
      serviceId: this.elements.serviceIdInput.value.trim(),
      status: this.elements.statusSelect.value,
      deadline: this.elements.deadlineInput.value 
        ? this.formatDateForDisplay(this.elements.deadlineInput.value)
        : '',
      urgent: this.elements.urgentCheckbox.checked,
      updateDate: now.toLocaleDateString('ru-RU'),
      comment: "",
      clientPhone: "",
      scPhone: "",
      scAddress: "",
      manager: "Текущий пользователь"
    };
    
    if (this.currentEditingId) {
      const index = this.requests.findIndex(r => r.id === this.currentEditingId);
      if (index !== -1) {
        const oldRequest = this.requests[index];
        this.requests[index] = {
          ...oldRequest,
          ...requestData
        };
        
        if (!this.requests[index].history) {
          this.requests[index].history = [];
        }
        this.requests[index].history.push(historyEntry);
      }
    } else {
      const newId = this.requests.length > 0 
        ? Math.max(...this.requests.map(r => r.id)) + 1 
        : 1;
      
      this.requests.push({
        id: newId,
        date: now.toLocaleDateString('ru-RU'),
        history: [historyEntry],
        ...requestData
      });
    }
    
    this.saveData();
    this.render();
    this.closeModals();
    this.showNotification(
      `Заявка ${this.currentEditingId ? 'обновлена' : 'добавлена'} успешно`, 
      'success'
    );
  }
  
  deleteRequest(id) {
    if (confirm('Вы уверены, что хотите удалить эту заявку?')) {
      this.requests = this.requests.filter(request => request.id !== id);
      this.saveData();
      this.render();
      this.showNotification('Заявка удалена', 'success');
    }
  }
  
  resetForm() {
    this.elements.requestForm.reset();
    this.elements.deadlineInput.value = '';
    this.elements.urgentCheckbox.checked = false;
  }
  
  openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  closeModals() {
    this.elements.requestModal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  showContextMenu(event, row) {
    event.preventDefault();
    this.contextRequestId = parseInt(row.dataset.id);
    
    const contextMenu = this.elements.contextMenu;
    contextMenu.style.display = 'block';
    
    const x = Math.min(event.clientX, window.innerWidth - contextMenu.offsetWidth - 10);
    const y = Math.min(event.clientY, window.innerHeight - contextMenu.offsetHeight - 10);
    
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
  }
  
  hideContextMenu() {
    this.elements.contextMenu.style.display = 'none';
    this.contextRequestId = null;
  }
  
  handleContextAction(action) {
    if (!this.contextRequestId) return;
    
    switch(action) {
      case 'view':
        this.openDetailsModal(this.contextRequestId);
        break;
      case 'edit':
        this.openEditModal(this.contextRequestId);
        break;
      case 'delete':
        this.deleteRequest(this.contextRequestId);
        break;
    }
    
    this.hideContextMenu();
  }
  
  exportToExcel() {
    try {
      const data = this.requests.map(request => ({
        '№': request.id,
        'Дата заявки': request.date,
        'Клиент': request.client,
        'Товар': request.product,
        'Номер обращения': request.serviceId,
        'Статус': request.status,
        'Дата изменения': request.updateDate,
        'Дедлайн': request.deadline,
        'Срочная': request.urgent ? 'Да' : 'Нет',
        'Телефон клиента': request.clientPhone,
        'Телефон СЦ': request.scPhone,
        'Адрес СЦ': request.scAddress,
        'Менеджер': request.manager,
        'Комментарий': request.comment
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Заявки');
      XLSX.writeFile(workbook, 'Заявки_на_возврат.xlsx');
      
      this.showNotification('Экспорт в Excel выполнен успешно', 'success');
    } catch (error) {
      console.error('Ошибка при экспорте в Excel:', error);
      this.showNotification('Ошибка при экспорте в Excel', 'error');
    }
  }
  
  getDeadlineClass(deadlineStr) {
    if (!deadlineStr) return { class: '', tooltip: '' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadlineDate = this.parseDate(deadlineStr);
    if (!deadlineDate) return { class: '', tooltip: '' };
    
    const timeDiff = deadlineDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      return { 
        class: 'deadline-overdue', 
        tooltip: 'Просрочено' 
      };
    } else if (daysDiff === 0) {
      return { 
        class: 'deadline-today', 
        tooltip: 'Срок сдачи сегодня' 
      };
    }
    
    return { 
      class: '', 
      tooltip: `Осталось ${daysDiff} дней` 
    };
  }
  
  getStatusBadge(status) {
    const statusClass = this.getStatusClass(status);
    return `<span class="status-badge badge-${statusClass}">${status}</span>`;
  }
  
  getStatusClass(status) {
    switch (status) {
      case 'Принят': return 'accepted';
      case 'В пути': return 'in-transit';
      case 'На диагностике': return 'diagnostics';
      case 'Ожидает клиента': return 'waiting';
      case 'Готов к выдаче': return 'ready';
      case 'Закрыт': return 'closed';
      default: return 'info';
    }
  }
  
  renderReports() {
    // График статусов
    const statusCounts = {};
    this.requests.forEach(r => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });

    const ctx1 = document.getElementById('statusChart').getContext('2d');
    if (this.statusChart) this.statusChart.destroy();
    this.statusChart = new Chart(ctx1, {
      type: 'pie',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: ['#2b9348','#f8961e','#4cc9f0','#d62828','#7209b7','#577590']
        }]
      }
    });

    // График по датам
    const dateCounts = {};
    this.requests.forEach(r => {
      dateCounts[r.date] = (dateCounts[r.date] || 0) + 1;
    });

    const ctx2 = document.getElementById('dateChart').getContext('2d');
    if (this.dateChart) this.dateChart.destroy();
    this.dateChart = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: Object.keys(dateCounts),
        datasets: [{
          label: 'Заявки по датам',
          data: Object.values(dateCounts),
          backgroundColor: '#3a86ff'
        }]
      }
    });
  }
  
  parseDate(dateStr) {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('.');
    return new Date(`${year}-${month}-${day}`);
  }
  
  formatDateForDisplay(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  }
  
  showNotification(message, type = 'info') {
    const notification = this.elements.notification;
    notification.textContent = message;
    notification.className = 'notification';
    notification.classList.add(type, 'show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
  
  setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
  }
  
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
      this.elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i> <span>Тема</span>';
    } else {
      this.elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i> <span>Тема</span>';
    }
  }
  
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
  
  saveToFile() {
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `requests_${dateStr}.json`;
    const dataStr = JSON.stringify(this.requests, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    this.showNotification(`Файл сохранён: ${fileName}`, "success");
  }

  loadFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          this.requests = data;
          this.saveData();
          this.render();
          this.showNotification("Файл успешно загружен", "success");
        } else {
          throw new Error("Неверный формат");
        }
      } catch (err) {
        console.error("Ошибка загрузки файла:", err);
        this.showNotification("Ошибка загрузки файла", "error");
      }
    };
    reader.readAsText(file);
  }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  const app = new ServiceTrackApp();
  
  // Обработчики для контекстного меню
  document.getElementById('context-menu').addEventListener('click', (e) => {
    const actionItem = e.target.closest('li[data-action]');
    if (actionItem) {
      app.handleContextAction(actionItem.dataset.action);
    }
  });
});
