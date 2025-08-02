// Основной класс приложения
class ServiceTrackApp {
  constructor() {
    this.requests = [];
    this.currentView = 'table';
    this.sortConfig = {
      key: 'id',
      direction: 'asc'
    };
    this.currentEditingId = null;
    
    this.initElements();
    this.initEventListeners();
    this.loadData();
    this.render();
    this.setupTheme();
  }
  
  // Инициализация DOM-элементов
  initElements() {
    this.elements = {
      appContainer: document.querySelector('.app-container'),
      tableBody: document.getElementById('table-body'),
      cardsContainer: document.getElementById('cards-container'),
      searchInput: document.getElementById('search-input'),
      statusFilter: document.getElementById('status-filter'),
      urgencyFilter: document.getElementById('urgency-filter'),
      clearSearch: document.getElementById('clear-search'),
      addRequestBtn: document.getElementById('add-request'),
      toggleViewBtn: document.getElementById('toggle-view'),
      exportExcelBtn: document.getElementById('export-excel'),
      themeToggle: document.getElementById('theme-toggle'),
      
      // Модальные окна
      requestModal: document.getElementById('request-modal'),
      detailsModal: document.getElementById('details-modal'),
      modalTitle: document.getElementById('modal-title'),
      requestForm: document.getElementById('request-form'),
      closeModalButtons: document.querySelectorAll('.close-modal'),
      
      // Форма
      clientInput: document.getElementById('client'),
      productInput: document.getElementById('product'),
      serviceIdInput: document.getElementById('service-id'),
      statusSelect: document.getElementById('status'),
      deadlineInput: document.getElementById('deadline'),
      urgentCheckbox: document.getElementById('urgent'),
      clientPhoneInput: document.getElementById('client-phone'),
      scPhoneInput: document.getElementById('sc-phone'),
      scAddressInput: document.getElementById('sc-address'),
      commentTextarea: document.getElementById('comment'),
      
      // Детали заявки
      editRequestBtn: document.getElementById('edit-request'),
      requestIdSpan: document.getElementById('request-id'),
      detailStatus: document.getElementById('detail-status'),
      detailUrgency: document.getElementById('detail-urgency'),
      detailClient: document.getElementById('detail-client'),
      detailProduct: document.getElementById('detail-product'),
      detailServiceId: document.getElementById('detail-service-id'),
      detailDate: document.getElementById('detail-date'),
      detailUpdateDate: document.getElementById('detail-update-date'),
      detailDeadline: document.getElementById('detail-deadline'),
      detailClientPhone: document.getElementById('detail-client-phone'),
      detailScPhone: document.getElementById('detail-sc-phone'),
      detailScAddress: document.getElementById('detail-sc-address'),
      detailManager: document.getElementById('detail-manager'),
      detailComment: document.getElementById('detail-comment'),
      detailHistory: document.getElementById('detail-history'),
      
      // Представления
      tableView: document.getElementById('table-view'),
      cardsView: document.getElementById('cards-view'),
      
      // Статистика
      acceptedCount: document.getElementById('accepted-count'),
      diagnosticsCount: document.getElementById('diagnostics-count'),
      readyCount: document.getElementById('ready-count'),
      overdueCount: document.getElementById('overdue-count'),
      
      // Уведомления
      notification: document.getElementById('notification')
    };
  }
  
  // Инициализация обработчиков событий
  initEventListeners() {
    // Фильтры и поиск
    this.elements.searchInput.addEventListener('input', () => this.render());
    this.elements.statusFilter.addEventListener('change', () => this.render());
    this.elements.urgencyFilter.addEventListener('change', () => this.render());
    this.elements.clearSearch.addEventListener('click', () => {
      this.elements.searchInput.value = '';
      this.render();
    });
    
    // Кнопки управления
    this.elements.addRequestBtn.addEventListener('click', () => this.openAddModal());
    this.elements.toggleViewBtn.addEventListener('click', () => this.toggleView());
    this.elements.exportExcelBtn.addEventListener('click', () => this.exportToExcel());
    this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
    
    // Модальные окна
    this.elements.closeModalButtons.forEach(btn => {
      btn.addEventListener('click', () => this.closeModals());
    });
    
    // Форма
    this.elements.requestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveRequest();
    });
    
    // Редактирование заявки
    this.elements.editRequestBtn.addEventListener('click', () => {
      this.closeModals();
      this.openEditModal(this.currentEditingId);
    });
    
    // Сортировка таблицы
    document.querySelectorAll('#requests-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.getAttribute('data-sort');
        this.setSort(key);
      });
    });
  }
  
  // Загрузка данных из localStorage
  loadData() {
    const savedData = localStorage.getItem('serviceRequests');
    this.requests = savedData ? JSON.parse(savedData) : this.getDefaultData();
    this.updateStats();
  }
  
  // Сохранение данных в localStorage
  saveData() {
    localStorage.setItem('serviceRequests', JSON.stringify(this.requests));
    this.updateStats();
  }
  
  // Получение тестовых данных
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
  
  // Фильтрация данных
  getFilteredData() {
    const searchTerm = this.elements.searchInput.value.toLowerCase();
    const statusFilter = this.elements.statusFilter.value;
    const urgencyFilter = this.elements.urgencyFilter.value;
    
    return this.requests.filter(request => {
      // Поиск по клиенту, товару или номеру обращения
      const matchesSearch = 
        request.client.toLowerCase().includes(searchTerm) ||
        request.product.toLowerCase().includes(searchTerm) ||
        (request.serviceId && request.serviceId.toLowerCase().includes(searchTerm));
      
      // Фильтр по статусу
      const matchesStatus = !statusFilter || request.status === statusFilter;
      
      // Фильтр по срочности
      let matchesUrgency = true;
      if (urgencyFilter) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = this.parseDate(request.deadline);
        
        if (urgencyFilter === 'urgent') {
          matchesUrgency = request.urgent;
        } else if (urgencyFilter === 'overdue') {
          matchesUrgency = deadlineDate && deadlineDate < today;
        } else if (urgencyFilter === 'today') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          matchesUrgency = deadlineDate && 
                          deadlineDate >= today && 
                          deadlineDate < tomorrow;
        } else if (urgencyFilter === 'tomorrow') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dayAfterTomorrow = new Date(tomorrow);
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
          matchesUrgency = deadlineDate && 
                          deadlineDate >= tomorrow && 
                          deadlineDate < dayAfterTomorrow;
        }
      }
      
      return matchesSearch && matchesStatus && matchesUrgency;
    });
  }
  
  // Сортировка данных
  sortData(data) {
    const { key, direction } = this.sortConfig;
    
    return [...data].sort((a, b) => {
      // Особый случай для дедлайна
      if (key === 'deadline') {
        const dateA = this.parseDate(a.deadline) || new Date(0);
        const dateB = this.parseDate(b.deadline) || new Date(0);
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Стандартная сортировка для других полей
      let valueA = a[key];
      let valueB = b[key];
      
      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();
      
      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  // Установка сортировки
  setSort(key) {
    // Если уже сортируется по этому ключу, меняем направление
    if (this.sortConfig.key === key) {
      this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // Иначе устанавливаем новый ключ и направление по умолчанию
      this.sortConfig.key = key;
      this.sortConfig.direction = 'asc';
    }
    
    // Обновляем иконки сортировки в заголовках таблицы
    document.querySelectorAll('#requests-table th').forEach(th => {
      th.innerHTML = th.innerHTML.replace(/&nbsp;▲|&nbsp;▼/g, '');
      if (th.getAttribute('data-sort') === this.sortConfig.key) {
        th.innerHTML += this.sortConfig.direction === 'asc' ? '&nbsp;▲' : '&nbsp;▼';
      }
    });
    
    this.render();
  }
  
  // Отрисовка данных
  render() {
    const filteredData = this.getFilteredData();
    const sortedData = this.sortData(filteredData);
    
    if (this.currentView === 'table') {
      this.renderTableView(sortedData);
    } else {
      this.renderCardsView(sortedData);
    }
  }
  
  // Отрисовка таблицы
  renderTableView(data) {
    this.elements.tableBody.innerHTML = '';
    
    data.forEach(request => {
      const row = document.createElement('tr');
      const deadlineClass = this.getDeadlineClass(request.deadline);
      const statusBadge = this.getStatusBadge(request.status);
      
      row.innerHTML = `
        <td>${request.id}</td>
        <td>${request.date}</td>
        <td>${request.client}</td>
        <td>${request.product}</td>
        <td>${request.serviceId || '-'}</td>
        <td>${statusBadge}</td>
        <td>${request.updateDate}</td>
        <td class="${deadlineClass.class}" title="${deadlineClass.tooltip}">
          ${request.deadline || '-'}
          ${request.urgent ? ' <i class="fas fa-exclamation-circle urgent-icon" title="Срочная заявка"></i>' : ''}
        </td>
        <td class="actions-cell">
          <button class="btn-icon view-details" data-id="${request.id}" title="Просмотр">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-icon edit-request" data-id="${request.id}" title="Редактировать">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-request" data-id="${request.id}" title="Удалить">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      
      this.elements.tableBody.appendChild(row);
    });
    
    // Назначаем обработчики событий для кнопок в строке
    document.querySelectorAll('.view-details').forEach(btn => {
      btn.addEventListener('click', () => this.openDetailsModal(parseInt(btn.getAttribute('data-id'))));
    });
    
    document.querySelectorAll('.edit-request').forEach(btn => {
      btn.addEventListener('click', () => this.openEditModal(parseInt(btn.getAttribute('data-id'))));
    });
    
    document.querySelectorAll('.delete-request').forEach(btn => {
      btn.addEventListener('click', () => this.deleteRequest(parseInt(btn.getAttribute('data-id'))));
    });
  }
  
  // Отрисовка карточек
  renderCardsView(data) {
    this.elements.cardsContainer.innerHTML = '';
    
    data.forEach(request => {
      const deadlineClass = this.getDeadlineClass(request.deadline);
      const statusBadge = this.getStatusBadge(request.status);
      
      const card = document.createElement('div');
      card.className = 'card';
      
      if (request.urgent) {
        card.innerHTML += '<div class="urgent-label">Срочно</div>';
      }
      
      card.innerHTML += `
        <div class="card-header">
          <h3 class="card-title">${request.client}</h3>
          <div class="card-status">${statusBadge}</div>
        </div>
        <div class="card-body">
          <div class="card-detail">
            <span class="detail-label">Товар:</span>
            <span class="detail-value">${request.product}</span>
          </div>
          <div class="card-detail">
            <span class="detail-label">№ обращения:</span>
            <span class="detail-value">${request.serviceId || '-'}</span>
          </div>
          <div class="card-detail">
            <span class="detail-label">Дата:</span>
            <span class="detail-value">${request.date}</span>
          </div>
          <div class="card-detail">
            <span class="detail-label">Обновлено:</span>
            <span class="detail-value">${request.updateDate}</span>
          </div>
          <div class="card-deadline ${deadlineClass.class}" title="${deadlineClass.tooltip}">
            <i class="far fa-calendar-alt"></i>
            <span>${request.deadline || 'Нет дедлайна'}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn-icon view-details" data-id="${request.id}" title="Просмотр">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-icon edit-request" data-id="${request.id}" title="Редактировать">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-request" data-id="${request.id}" title="Удалить">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `;
      
      this.elements.cardsContainer.appendChild(card);
    });
    
    // Назначаем обработчики событий для кнопок в карточках
    document.querySelectorAll('.view-details').forEach(btn => {
      btn.addEventListener('click', () => this.openDetailsModal(parseInt(btn.getAttribute('data-id'))));
    });
    
    document.querySelectorAll('.edit-request').forEach(btn => {
      btn.addEventListener('click', () => this.openEditModal(parseInt(btn.getAttribute('data-id'))));
    });
    
    document.querySelectorAll('.delete-request').forEach(btn => {
      btn.addEventListener('click', () => this.deleteRequest(parseInt(btn.getAttribute('data-id'))));
    });
  }
  
  // Переключение между таблицей и карточками
  toggleView() {
    this.currentView = this.currentView === 'table' ? 'cards' : 'table';
    
    if (this.currentView === 'table') {
      this.elements.tableView.style.display = 'block';
      this.elements.cardsView.style.display = 'none';
      this.elements.toggleViewBtn.innerHTML = '<i class="fas fa-th"></i> Карточки';
    } else {
      this.elements.tableView.style.display = 'none';
      this.elements.cardsView.style.display = 'block';
      this.elements.toggleViewBtn.innerHTML = '<i class="fas fa-table"></i> Таблица';
    }
    
    this.render();
  }
  
  // Открытие модального окна для добавления заявки
  openAddModal() {
    this.currentEditingId = null;
    this.elements.modalTitle.textContent = 'Новая заявка';
    this.resetForm();
    this.openModal(this.elements.requestModal);
  }
  
  // Открытие модального окна для редактирования заявки
  openEditModal(id) {
    const request = this.requests.find(r => r.id === id);
    if (!request) return;
    
    this.currentEditingId = id;
    this.elements.modalTitle.textContent = `Редактирование заявки #${id}`;
    
    // Заполняем форму данными
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
    this.elements.clientPhoneInput.value = request.clientPhone || '';
    this.elements.scPhoneInput.value = request.scPhone || '';
    this.elements.scAddressInput.value = request.scAddress || '';
    this.elements.commentTextarea.value = request.comment || '';
    
    this.openModal(this.elements.requestModal);
  }
  
  // Открытие модального окна с деталями заявки
  openDetailsModal(id) {
    const request = this.requests.find(r => r.id === id);
    if (!request) return;
    
    this.currentEditingId = id;
    this.elements.requestIdSpan.textContent = `#${request.id}`;
    
    // Устанавливаем статус
    this.elements.detailStatus.className = 'status-badge';
    this.elements.detailStatus.classList.add(`badge-${this.getStatusClass(request.status)}`);
    this.elements.detailStatus.innerHTML = this.getStatusBadge(request.status);
    
    // Устанавливаем срочность
    this.elements.detailUrgency.innerHTML = request.urgent 
      ? '<span class="urgent-label">Срочная заявка</span>' 
      : '';
    
    // Заполняем остальные данные
    this.elements.detailClient.textContent = request.client;
    this.elements.detailProduct.textContent = request.product;
    this.elements.detailServiceId.textContent = request.serviceId || '-';
    this.elements.detailDate.textContent = request.date;
    this.elements.detailUpdateDate.textContent = request.updateDate;
    
    const deadlineClass = this.getDeadlineClass(request.deadline);
    this.elements.detailDeadline.className = 'detail-value';
    this.elements.detailDeadline.classList.add(deadlineClass.class);
    this.elements.detailDeadline.textContent = request.deadline || '-';
    this.elements.detailDeadline.title = deadlineClass.tooltip;
    
    this.elements.detailClientPhone.textContent = request.clientPhone || '-';
    this.elements.detailScPhone.textContent = request.scPhone || '-';
    this.elements.detailScAddress.textContent = request.scAddress || '-';
    this.elements.detailManager.textContent = request.manager || '-';
    this.elements.detailComment.textContent = request.comment || 'Нет комментария';
    
    // Заполняем историю
    this.elements.detailHistory.innerHTML = '';
    if (request.history && request.history.length > 0) {
      request.history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        this.elements.detailHistory.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'История изменений отсутствует';
      this.elements.detailHistory.appendChild(li);
    }
    
    this.openModal(this.elements.detailsModal);
  }
  
  // Открытие модального окна
  openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  // Закрытие всех модальных окон
  closeModals() {
    this.elements.requestModal.classList.remove('active');
    this.elements.detailsModal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  // Сброс формы
  resetForm() {
    this.elements.requestForm.reset();
    this.elements.deadlineInput.value = '';
    this.elements.urgentCheckbox.checked = false;
  }
  
  // Сохранение заявки
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
      clientPhone: this.elements.clientPhoneInput.value.trim(),
      scPhone: this.elements.scPhoneInput.value.trim(),
      scAddress: this.elements.scAddressInput.value.trim(),
      comment: this.elements.commentTextarea.value.trim(),
      updateDate: now.toLocaleDateString('ru-RU')
    };
    
    if (this.currentEditingId) {
      // Редактирование существующей заявки
      const index = this.requests.findIndex(r => r.id === this.currentEditingId);
      if (index !== -1) {
        // Сохраняем старые данные для истории
        const oldRequest = this.requests[index];
        
        // Обновляем заявку
        this.requests[index] = {
          ...oldRequest,
          ...requestData
        };
        
        // Добавляем запись в историю
        if (!this.requests[index].history) {
          this.requests[index].history = [];
        }
        this.requests[index].history.push(historyEntry);
      }
    } else {
      // Создание новой заявки
      const newId = this.requests.length > 0 
        ? Math.max(...this.requests.map(r => r.id)) + 1 
        : 1;
      
      this.requests.push({
        id: newId,
        date: now.toLocaleDateString('ru-RU'),
        manager: 'Текущий пользователь', // Здесь можно добавить реального пользователя
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
  
  // Удаление заявки
  deleteRequest(id) {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return;
    
    this.requests = this.requests.filter(request => request.id !== id);
    this.saveData();
    this.render();
    this.showNotification('Заявка удалена', 'success');
  }
  
  // Экспорт в Excel
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
  
  // Обновление статистики
  updateStats() {
    const counts = {
      accepted: 0,
      diagnostics: 0,
      ready: 0,
      overdue: 0
    };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.requests.forEach(request => {
      if (request.status === 'Принят') counts.accepted++;
      if (request.status === 'На диагностике') counts.diagnostics++;
      if (request.status === 'Готов к выдаче') counts.ready++;
      
      const deadlineDate = this.parseDate(request.deadline);
      if (deadlineDate && deadlineDate < today) counts.overdue++;
    });
    
    this.elements.acceptedCount.textContent = counts.accepted;
    this.elements.diagnosticsCount.textContent = counts.diagnostics;
    this.elements.readyCount.textContent = counts.ready;
    this.elements.overdueCount.textContent = counts.overdue;
  }
  
  // Получение класса для дедлайна
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
    } else if (daysDiff === 1) {
      return { 
        class: 'deadline-tomorrow', 
        tooltip: 'Срок сдачи завтра' 
      };
    }
    
    return { 
      class: '', 
      tooltip: `Осталось ${daysDiff} дней` 
    };
  }
  
  // Получение бейджа статуса
  getStatusBadge(status) {
    const statusClass = this.getStatusClass(status);
    const icon = this.getStatusIcon(status);
    
    return `
      <span class="badge badge-${statusClass}">
        <i class="${icon}"></i> ${status}
      </span>
    `;
  }
  
  // Получение класса для статуса
  getStatusClass(status) {
    switch (status) {
      case 'Принят': return 'accepted';
      case 'Отправлен': return 'sent';
      case 'На диагностике': return 'diagnostics';
      case 'Готов к выдаче': return 'ready';
      case 'Требуется звонок': return 'call';
      case 'Отказано': return 'denied';
      default: return 'info';
    }
  }
  
  // Получение иконки для статуса
  getStatusIcon(status) {
    switch (status) {
      case 'Принят': return 'fas fa-check-circle';
      case 'Отправлен': return 'fas fa-paper-plane';
      case 'На диагностике': return 'fas fa-stethoscope';
      case 'Готов к выдаче': return 'fas fa-box-open';
      case 'Требуется звонок': return 'fas fa-phone';
      case 'Отказано': return 'fas fa-ban';
      default: return 'fas fa-info-circle';
    }
  }
  
  // Парсинг даты из строки формата "dd.mm.yyyy"
  parseDate(dateStr) {
    if (!dateStr) return null;
    
    const [day, month, year] = dateStr.split('.');
    return new Date(`${year}-${month}-${day}`);
  }
  
  // Форматирование даты для отображения (из формата "yyyy-mm-dd" в "dd.mm.yyyy")
  formatDateForDisplay(dateStr) {
    if (!dateStr) return '';
    
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  }
  
  // Показ уведомления
  showNotification(message, type = 'info') {
    const notification = this.elements.notification;
    notification.textContent = message;
    notification.className = 'notification';
    notification.classList.add(type, 'show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
  
  // Управление темой
  setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
  }
  
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
      this.elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      this.elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
  }
  
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  const app = new ServiceTrackApp();
  
  // Делаем app глобальной для доступа из консоли (для отладки)
  window.app = app;
});
