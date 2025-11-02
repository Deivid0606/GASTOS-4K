// Configuración inicial
const STORAGE_KEY = 'expenseTrackerData';
let exchangeRate = 7300; // Tipo de cambio inicial

// Elementos del DOM
const expenseForm = document.getElementById('expenseForm');
const expensesList = document.getElementById('expensesList');
const statusMessage = document.getElementById('statusMessage');
const loadingExpenses = document.getElementById('loadingExpenses');
const personalTotal = document.getElementById('personalTotal');
const businessTotal = document.getElementById('businessTotal');
const totalExpenses = document.getElementById('totalExpenses');
const exchangeRateInput = document.getElementById('exchangeRate');
const updateExchangeRateBtn = document.getElementById('updateExchangeRate');
const convertedAmount = document.getElementById('convertedAmount');
const exportDataBtn = document.getElementById('exportData');

// Variables globales
let expenses = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Establecer fecha actual como valor predeterminado
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expenseDate').value = today;
    
    // Cargar datos del localStorage
    loadFromLocalStorage();
    
    // Cargar gastos existentes
    loadExpenses();
    
    // Configurar eventos
    setupEventListeners();
    
    // Actualizar visualización del tipo de cambio
    updateExchangeRateDisplay();
    
    showStatus('Aplicación cargada correctamente', 'success');
});

function setupEventListeners() {
    // Envío del formulario
    expenseForm.addEventListener('submit', handleFormSubmit);
    
    // Cambio de pestañas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filterExpenses();
        });
    });
    
    // Cambio de pestañas de moneda
    document.querySelectorAll('.currency-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.currency-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filterExpenses();
        });
    });
    
    // Filtros
    document.getElementById('categoryFilter').addEventListener('change', filterExpenses);
    document.getElementById('monthFilter').addEventListener('change', filterExpenses);
    
    // Actualizar tipo de cambio
    updateExchangeRateBtn.addEventListener('click', updateExchangeRate);
    
    // Enter en el tipo de cambio
    exchangeRateInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            updateExchangeRate();
        }
    });
    
    // Exportar datos
    exportDataBtn.addEventListener('click', exportData);
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const expenseData = {
        type: document.getElementById('expenseType').value,
        description: document.getElementById('expenseDescription').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        currency: document.getElementById('expenseCurrency').value,
        category: document.getElementById('expenseCategory').value,
        date: document.getElementById('expenseDate').value,
        notes: document.getElementById('expenseNotes').value,
        timestamp: new Date().toISOString()
    };
    
    // Validación básica
    if (!expenseData.type || !expenseData.description || !expenseData.amount || !expenseData.category) {
        showStatus('Por favor completa todos los campos obligatorios', 'error');
        return;
    }
    
    if (expenseData.amount <= 0) {
        showStatus('El monto debe ser mayor a cero', 'error');
        return;
    }
    
    saveExpense(expenseData);
}

function saveExpense(expenseData) {
    showStatus('Guardando gasto...', 'success');
    
    // Simular delay de guardado
    setTimeout(() => {
        // Agregar a la lista local
        expenses.push(expenseData);
        
        // Guardar en localStorage
        saveToLocalStorage();
        
        // Actualizar la interfaz
        updateExpensesDisplay();
        updateTotals();
        
        // Limpiar formulario
        expenseForm.reset();
        
        // Establecer fecha actual
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expenseDate').value = today;
        
        // Establecer moneda predeterminada
        document.getElementById('expenseCurrency').value = 'PYG';
        
        showStatus('✅ Gasto guardado correctamente', 'success');
    }, 500);
}

function loadExpenses() {
    loadingExpenses.style.display = 'block';
    expensesList.innerHTML = '';
    
    // Simular carga de datos
    setTimeout(() => {
        // Si no hay datos en localStorage, usar datos de ejemplo
        if (expenses.length === 0) {
            expenses = [
                {
                    type: 'personal',
                    description: 'Supermercado semanal',
                    amount: 185000,
                    currency: 'PYG',
                    category: 'alimentos',
                    date: new Date().toISOString().split('T')[0],
                    notes: 'Compra para toda la semana',
                    timestamp: new Date().toISOString()
                },
                {
                    type: 'business',
                    description: 'Material de oficina',
                    amount: 45.00,
                    currency: 'USD',
                    category: 'insumos',
                    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                    notes: 'Papelería y útiles de oficina',
                    timestamp: new Date(Date.now() - 86400000).toISOString()
                }
            ];
            
            // Guardar datos de ejemplo en localStorage
            saveToLocalStorage();
        }
        
        updateExpensesDisplay();
        updateTotals();
        loadingExpenses.style.display = 'none';
    }, 1000);
}

function updateExpensesDisplay() {
    filterExpenses();
}

function filterExpenses() {
    const activeTab = document.querySelector('.tab.active').dataset.tab;
    const activeCurrencyTab = document.querySelector('.currency-tab.active').dataset.currency;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const monthFilter = document.getElementById('monthFilter').value;
    
    let filteredExpenses = expenses;
    
    // Filtrar por tipo (pestaña activa)
    if (activeTab !== 'all') {
        filteredExpenses = filteredExpenses.filter(expense => expense.type === activeTab);
    }
    
    // Filtrar por moneda
    if (activeCurrencyTab !== 'all') {
        filteredExpenses = filteredExpenses.filter(expense => expense.currency === activeCurrencyTab);
    }
    
    // Filtrar por categoría
    if (categoryFilter) {
        filteredExpenses = filteredExpenses.filter(expense => expense.category === categoryFilter);
    }
    
    // Filtrar por mes
    if (monthFilter) {
        filteredExpenses = filteredExpenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === parseInt(monthFilter);
        });
    }
    
    // Ordenar por fecha (más reciente primero)
    filteredExpenses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Mostrar gastos filtrados
    displayExpenses(filteredExpenses);
}

function displayExpenses(expensesToDisplay) {
    if (expensesToDisplay.length === 0) {
        expensesList.innerHTML = '<div class="empty-state"><p>📭 No hay gastos que mostrar</p><p>Agrega tu primer gasto usando el formulario</p></div>';
        return;
    }
    
    expensesList.innerHTML = '';
    
    expensesToDisplay.forEach(expense => {
        const expenseElement = document.createElement('div');
        expenseElement.className = `expense-item ${expense.type}`;
        
        const formattedDate = new Date(expense.date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const typeText = expense.type === 'personal' ? '👤 Personal' : '💼 Laboral';
        const currencySymbol = expense.currency === 'PYG' ? 'Gs.' : '$';
        const formattedAmount = expense.currency === 'PYG' 
            ? formatCurrency(expense.amount) 
            : expense.amount.toFixed(2);
        
        // Calcular monto equivalente en la otra moneda
        let equivalentAmount = '';
        if (expense.currency === 'PYG') {
            const usdEquivalent = expense.amount / exchangeRate;
            equivalentAmount = `($${usdEquivalent.toFixed(2)} USD)`;
        } else {
            const pygEquivalent = expense.amount * exchangeRate;
            equivalentAmount = `(Gs. ${formatCurrency(pygEquivalent)})`;
        }
        
        const categoryIcon = getCategoryIcon(expense.category);
        const categoryName = getCategoryName(expense.category);
        
        expenseElement.innerHTML = `
            <div class="expense-details">
                <h3>${expense.description}</h3>
                <p><strong>${categoryIcon} Categoría:</strong> ${categoryName}</p>
                <p><strong>📅 Fecha:</strong> ${formattedDate}</p>
                <p><strong>Tipo:</strong> ${typeText}</p>
                ${expense.notes ? `<p><strong>📝 Notas:</strong> ${expense.notes}</p>` : ''}
            </div>
            <div class="expense-amount">
                <div>${currencySymbol} ${formattedAmount}</div>
                <div class="expense-currency">${equivalentAmount}</div>
            </div>
            <
