// --- IIFE (Immediately Invoked Function Expression) to avoid global scope pollution ---
(function() {
    // --- Global State Variables ---
    let currentUser = null; 
    let currentView = 'shoppingList';
    
    let zIndexCounter = 999;

    // Shopping List State
    let shoppingLists = {};
    let currentListId = 'default-list';
    let shoppingItems = []; // This is a reference to the items of the current list
    let itemDatabase = new Set();
    const MAX_DATABASE_SIZE = 100;
    let draggedItem = null;
    let lastDeletedItem = null;
    let undoTimeout;

    // Ledger State (NEW STRUCTURE)
    let ledgers = {};
    let currentLedgerId = 'default-ledger';
    let currentLedgerView = 'main';
    let currentCustomerId = null;
    const customerColors = ['#e57373', '#81c784', '#64b5f6', '#ffb74d', '#9575cd', '#4db6ac', '#f06292', '#7986cb'];


    // Common DOM Elements
    const body = document.body;
    const mainContainer = document.getElementById('mainContainer');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const infoButton = document.getElementById('infoButton');
    const toastContainer = document.getElementById('toastContainer');
    const loader = document.getElementById('loader');
    
    // Auth View DOM Elements
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');
    const signInBtn = document.getElementById('signInBtn');
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
    const signOutBtn = document.getElementById('signOutBtn');


    // View Switcher DOM Elements
    const showShoppingListBtn = document.getElementById('showShoppingListBtn');
    const showLedgerBtn = document.getElementById('showLedgerBtn');
    const shoppingListSection = document.getElementById('shoppingListSection');
    const ledgerSection = document.getElementById('ledgerSection');
    
    // Shopping List DOM Elements
    const itemNameInput = document.getElementById('itemName');
    const itemQuantityInput = document.getElementById('itemQuantity');
    const itemPriceInput = document.getElementById('itemPrice');
    const itemPriorityInput = document.getElementById('itemPriority');
    const shoppingListDiv = document.getElementById('shoppingList');
    const totalAmountSpan = document.getElementById('totalAmount');
    const currentListSelector = document.getElementById('currentListSelector');
    const voiceInputButton = document.getElementById('voiceInputButton');
    const autocompleteSuggestions = document.getElementById('autocompleteSuggestions');
    const shoppingListSearchInput = document.getElementById('shoppingListSearchInput'); // NEW Search Input
    
    // Ledger DOM Elements (NEW)
    const currentLedgerSelector = document.getElementById('currentLedgerSelector');
    const ledgerMainView = document.getElementById('ledgerMainView');
    const ledgerCustomerView = document.getElementById('ledgerCustomerView');
    const customerListDiv = document.getElementById('customerList');
    const fabAddCustomerBtn = document.getElementById('fabAddCustomerBtn');
    const addCustomerModal = document.getElementById('addCustomerModal');
    const editCustomerModal = document.getElementById('editCustomerModal');
    const backToLedgerMainBtn = document.getElementById('backToLedgerMainBtn');
    const customerViewName = document.getElementById('customerViewName');
    const customerViewPhone = document.getElementById('customerViewPhone');
    const customerViewBalance = document.getElementById('customerViewBalance');
    const customerOptionsBtn = document.getElementById('customerOptionsBtn');
    const customerOptionsMenu = document.getElementById('customerOptionsMenu');

    const gaveAmountInput = document.getElementById('gaveAmountInput');
    const receivedAmountInput = document.getElementById('receivedAmountInput');
    const transactionDescriptionInput = document.getElementById('transactionDescriptionInput');
    const transactionDateInput = document.getElementById('transactionDateInput');
    const transactionDateLabel = document.getElementById('transactionDateLabel');
    const confirmTransactionBtn = document.getElementById('confirmTransactionBtn');
    const customerSearchInput = document.getElementById('customerSearchInput');
    const txConfirmModal = document.getElementById('txConfirmModal');
    
    const transactionDetailModal = document.getElementById('transactionDetailModal');
    const editTransactionModal = document.getElementById('editTransactionModal');
    let activeEditingTx = { customerId: null, txId: null };
    let activeEditingCustomer = null;

    // Common Action Buttons
    const shareBtn = document.getElementById('shareBtn');
    const reportBtn = document.getElementById('reportBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const clearBtn = document.getElementById('clearBtn');


    // PDF rendering elements
    const pdfItemsContainer = document.getElementById('pdfItemsContainer');
    const pdfLedgerContent = document.getElementById('pdfLedgerContent');

    // Custom Modals DOM elements
    const alertModal = document.getElementById('alertModal');
    const alertMessage = document.getElementById('alertMessage');
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const confirmButton = document.getElementById('confirmButton');
    const cancelButton = document.getElementById('cancelButton');
    let confirmPromiseResolve;
    const promptModal = document.getElementById('promptModal');
    const promptTitle = document.getElementById('promptTitle');
    const promptLabel = document.getElementById('promptLabel');
    const promptInput = document.getElementById('promptInput');
    const promptSubmitButton = document.getElementById('promptSubmitButton');
    const promptCancelButton = document.getElementById('promptCancelButton');
    let promptPromiseResolve;
    const editItemModal = document.getElementById('editItemModal');
    const editItemNameInput = document.getElementById('editItemName');
    const editItemQuantityInput = document.getElementById('editItemQuantity');
    const editItemPriceInput = document.getElementById('editItemPrice');
    const editItemPriorityInput = document.getElementById('editItemPriority');
    const editItemSaveButton = document.getElementById('editItemSaveButton');
    const editItemCancelButton = document.getElementById('editItemCancelButton');
    
    const monthlySpendingModal = document.getElementById('monthlySpendingModal');
    const LAST_MONTHLY_REPORT_KEY = 'lastMonthlyReportShown';

    // Share Modal elements
    const shareModalOverlay = document.getElementById('shareModalOverlay');
    const shareableTextPre = document.getElementById('shareableText');
    const shareModalTitle = document.getElementById('shareModalTitle');

    // Report Page Elements
    const reportPage = document.getElementById('reportPage');
    const backFromReportBtn = document.getElementById('backFromReportBtn');
    const reportListFilter = document.getElementById('reportListFilter');
    const reportStartDateInput = document.getElementById('reportStartDate');
    const reportEndDateInput = document.getElementById('reportEndDate');
    const applyDateFilterButton = document.getElementById('applyDateFilter');
    const reportSummaryTotalLists = document.getElementById('reportSummaryTotalLists');
    const reportSummaryTotalItems = document.getElementById('reportSummaryTotalItems');
    const reportSummaryOverallTotal = document.getElementById('reportSummaryOverallTotal');
    const reportSummaryBoughtItemsCount = document.getElementById('reportSummaryBoughtItemsCount');
    const reportSummaryBoughtItemsTotal = document.getElementById('reportSummaryBoughtItemsTotal');
    const reportSummaryUnboughtItemsCount = document.getElementById('reportSummaryUnboughtItemsCount');
    const reportSummaryUnboughtItemsTotal = document.getElementById('reportSummaryUnboughtItemsTotal');
    const reportMonthlySpendingDiv = document.getElementById('reportMonthlySpending');
    const reportAnnualSpendingDiv = document.getElementById('reportAnnualSpending');
    const noMonthlyData = document.getElementById('noMonthlyData');
    const noAnnualData = document.getElementById('noAnnualData');
    const reportPriorityFilter = document.getElementById('reportPriorityFilter');
    const reportPriorityItemsDiv = document.getElementById('reportPriorityItems');
    const noPriorityData = document.getElementById('noPriorityData');
    const reportPriorityTotal = document.getElementById('reportPriorityTotal');
    const reportPriorityTotalAmount = document.getElementById('reportPriorityTotalAmount');
    const reportTopSpendingItemsDiv = document.getElementById('reportTopSpendingItems');
    const noTopSpendingData = document.getElementById('noTopSpendingData');
    const reportAllBoughtItemsDiv = document.getElementById('reportAllBoughtItems');
    const noBoughtItemsData = document.getElementById('noBoughtItemsData');
    const reportBoughtTotal = document.getElementById('reportBoughtTotal');
    const reportBoughtTotalAmount = document.getElementById('reportBoughtTotalAmount');
    const reportAllUnboughtItemsDiv = document.getElementById('reportAllUnboughtItems');
    const noUnboughtItemsData = document.getElementById('noUnboughtItemsData');
    const reportUnboughtTotal = document.getElementById('reportUnboughtTotal');
    const reportUnboughtTotalAmount = document.getElementById('reportUnboughtTotalAmount');
    
    // NEW: Customer Report Page Elements
    const customerReportPage = document.getElementById('customerReportPage');
    const backFromCustomerReportBtn = document.getElementById('backFromCustomerReportBtn');
    const customerReportPageName = document.getElementById('customerReportPageName');
    const customerReportPageContent = document.getElementById('customerReportPageContent');
    const customerReportPageFooterContainer = document.getElementById('customerReportPageFooterContainer');
    const customerReportPdfBtn = document.getElementById('customerReportPdfBtn');
    const customerReportShareBtn = document.getElementById('customerReportShareBtn');
    const customerReportCopyBtn = document.getElementById('customerReportCopyBtn');


    // Font Size Controls
    const decreaseFontButton = document.getElementById('decreaseFont');
    const resetFontButton = document.getElementById('resetFont');
    const increaseFontButton = document.getElementById('increaseFont');
    const defaultFontSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--default-font-size'));
    let currentFontSize = defaultFontSize;

    let recognition; // For Web Speech API
    
    // --- Authentication Functions ---
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            loginView.style.display = 'none';
            appView.style.display = 'flex';
            loader.style.display = 'flex'; 
            
            const profileUserNameDiv = document.getElementById('profileUserName');
            if (profileUserNameDiv) {
                profileUserNameDiv.textContent = user.displayName || 'ব্যবহারকারী';
            }
            
            loadDataFromFirestore();
            
        } else {
            currentUser = null;
            loginView.style.display = 'flex';
            appView.style.display = 'none';
        }
    });

    function signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then(result => {
                const user = result.user;
                if (user) {
                    showToast(`স্বাগতম, ${user.displayName}`);
                }
            })
            .catch(error => {
                console.error("Sign-in error:", error);
                customAlert("সাইন ইন করা যায়নি। আপনার ব্রাউজারে পপ-আপ ব্লক করা থাকলে তা বন্ধ করে আবার চেষ্টা করুন।");
            });
    }

    async function signOutWithConfirmation() {
        const confirmed = await customConfirm("আপনি কি নিশ্চিতভাবে লগ আউট করতে চান?");
        if (confirmed) {
            auth.signOut().catch(error => {
                console.error("Sign-out error:", error);
            });
        }
    }
    
    async function changeUserName() {
        if (!currentUser) return;

        const newName = await customPrompt(
            "নাম পরিবর্তন করুন",
            "আপনার নতুন নাম দিন:",
            currentUser.displayName || ''
        );

        if (newName && newName.trim() !== '') {
            try {
                await currentUser.updateProfile({ displayName: newName.trim() });
                const profileUserNameDiv = document.getElementById('profileUserName');
                if (profileUserNameDiv) {
                    profileUserNameDiv.textContent = newName.trim();
                }
                showToast("আপনার নাম সফলভাবে পরিবর্তন করা হয়েছে।");
            } catch (error) {
                console.error("Error updating profile:", error);
                customAlert("নাম পরিবর্তন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
            }
        }
    }


    // --- Helper Functions ---
    const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const bengaliMonthNames = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    const priorityDisplayNames = { "low": "কম জরুরি", "medium": "জরুরি", "high": "অতি জরুরি" };

    function toBengaliNumber(numberStr) {
        if (typeof numberStr !== 'string') numberStr = String(numberStr);
        return numberStr.split('').map(digit => {
            if (digit === '.' || digit === '-') return digit;
            const num = parseInt(digit, 10);
            return isNaN(num) ? digit : bengaliNumerals[num];
        }).join('');
    }

    function formatCurrency(amount, withSymbol = true) {
        if (typeof amount !== 'number') amount = 0;
        const fixedAmountStr = amount.toFixed(2);
        const formatted = toBengaliNumber(fixedAmountStr);
        return withSymbol ? `৳${formatted}` : formatted;
    }

    function getBengaliMonthName(monthIndex) { return bengaliMonthNames[monthIndex]; }
    
    function formatShortDateForDisplay(date) {
        if (!(date instanceof Date) || isNaN(date)) return '';
         return `${toBengaliNumber(String(date.getDate()))} ${getBengaliMonthName(date.getMonth())}`;
    }
    
    function formatLongDateForDisplay(date) {
        if (!(date instanceof Date) || isNaN(date)) return '';
        const day = String(date.getDate()).padStart(2, '0');
        return `${toBengaliNumber(day)} ${getBengaliMonthName(date.getMonth())}, ${toBengaliNumber(String(date.getFullYear()))}`;
    }

    function formatTransactionDateForDisplay(dateString) {
        if (!dateString) return { datePart: '', yearPart: '', timePart: '' };
        const date = new Date(dateString);
        if (isNaN(date)) return { datePart: '', yearPart: '', timePart: '' };

        const datePart = `${toBengaliNumber(String(date.getDate()).padStart(2, '0'))} ${getBengaliMonthName(date.getMonth())},`;
        const yearPart = toBengaliNumber(String(date.getFullYear()));
        const timePart = date.toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit', hour12: true });
        
        return { datePart, yearPart, timePart };
    }

    function formatDateForInput(date) {
        if (!(date instanceof Date) || isNaN(date)) return '';
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    function getPriorityDisplayName(priority) { return priorityDisplayNames[priority] || priority; }
    
    function timeAgo(date) {
        if (!date) return '';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `${toBengaliNumber(String(Math.floor(interval)))} বছর আগে`;
        interval = seconds / 2592000;
        if (interval > 1) return `${toBengaliNumber(String(Math.floor(interval)))} মাস আগে`;
        interval = seconds / 86400;
        if (interval > 1) return `${toBengaliNumber(String(Math.floor(interval)))} দিন আগে`;
        interval = seconds / 3600;
        if (interval > 1) return `${toBengaliNumber(String(Math.floor(interval)))} ঘন্টা আগে`;
        interval = seconds / 60;
        if (interval > 1) return `${toBengaliNumber(String(Math.floor(interval)))} মিনিট আগে`;
        return 'এইমাত্র';
    }

    // --- START: Toast Notification Function ---
    function showToast(message, options = {}) {
        const { duration = 4000, type = 'info', undoCallback = null } = options;
        const toast = document.createElement('div');
        toast.className = 'toast';
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        toast.appendChild(messageSpan);
        let toastTimeout;
        if (undoCallback && typeof undoCallback === 'function') {
            const undoButton = document.createElement('button');
            undoButton.className = 'toast-undo-button';
            undoButton.textContent = 'Undo';
            undoButton.onclick = () => {
                clearTimeout(toastTimeout);
                undoCallback();
                toast.classList.remove('show');
                toast.addEventListener('transitionend', () => toast.remove());
            };
            toast.appendChild(undoButton);
        }
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        const hideDuration = undoCallback ? 7000 : duration;
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, hideDuration);
    }
    // --- END: Toast Notification Function ---

    // --- Data Persistence with Firebase Firestore (REFACTORED) ---
    
    async function updateFirestore(updateData) {
        if (!currentUser) return;
        try {
            await db.collection('userData').doc(currentUser.uid).set(updateData, { merge: true });
            console.log('Firestore updated successfully with:', Object.keys(updateData).join(', '));
        } catch (error) {
            console.error("Firestore update failed:", error);
            showToast("আপনার পরিবর্তনগুলো সেভ করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করুন।");
            throw error; // Re-throw for caller function to handle if needed
        }
    }
    
    function migrateLedgerData() {
        let dataWasMigrated = false;
        Object.values(ledgers).forEach(ledger => {
            if (ledger && ledger.transactions && Array.isArray(ledger.transactions)) {
                dataWasMigrated = true;
                console.log(`Old ledger format detected in "${ledger.name}". Migrating...`);
                const oldTransactions = ledger.transactions;
                if (oldTransactions.length > 0) {
                    ledger.customers = [{
                        id: 'customer-migrated-' + Date.now(),
                        name: 'সাধারণ খাতা',
                        phone: '',
                        transactions: oldTransactions,
                        createdAt: new Date().toISOString()
                    }];
                } else {
                    ledger.customers = [];
                }
                delete ledger.transactions;
            }
        });
        if (dataWasMigrated) {
             updateFirestore({ ledgers });
        }
    }

    async function loadDataFromFirestore() {
        if (!currentUser) return;
        
        try {
            const userDocRef = db.collection('userData').doc(currentUser.uid);
            const doc = await userDocRef.get();

            if (doc.exists) {
                const data = doc.data();
                shoppingLists = data.shoppingLists || { 'default-list': { name: 'আমার তালিকা', items: [] } };
                currentListId = data.currentListId || 'default-list';
                ledgers = data.ledgers || { 'default-ledger': { name: 'আমার খাতা', customers: [] } };
                currentLedgerId = data.currentLedgerId || 'default-ledger';
                itemDatabase = new Set(data.itemDatabase || []);
                
                if (data.darkMode) body.classList.add('dark-mode'); else body.classList.remove('dark-mode');
                updateDarkModeToggleIcon(body.classList.contains('dark-mode'));
                
                currentFontSize = data.fontSize || defaultFontSize;
                applyFontSize(currentFontSize);
                
            } else {
                console.log("New user detected, creating default data structure.");
                shoppingLists = { 'default-list': { name: 'আমার তালিকা', items: [] } };
                currentListId = 'default-list';
                ledgers = { 'default-ledger': { name: 'আমার খাতা', customers: [] } };
                currentLedgerId = 'default-ledger';
                itemDatabase = new Set();
                await updateFirestore({ shoppingLists, currentListId, ledgers, currentLedgerId, itemDatabase: [], darkMode: false, fontSize: defaultFontSize });
            }

            if (!shoppingLists[currentListId]) {
                currentListId = Object.keys(shoppingLists)[0] || 'default-list';
            }
            shoppingItems = shoppingLists[currentListId].items;
            
            migrateLedgerData();
            populateListSelector();
            populateLedgerSelector();
            populateReportListFilter();
            renderList();
            renderLedger();
            
        } catch (error) {
            console.error("Error loading data from Firestore: ", error);
            customAlert("আপনার ডেটা লোড করা যায়নি। অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করুন।");
        } finally {
            loader.style.display = 'none';
        }
    }

    // --- Initialization ---
    document.addEventListener('DOMContentLoaded', () => {
        updateCurrentYear();
        initializeVoiceInput();
        setupAutocomplete();
        setupEventListeners();
        switchView('shoppingList');
    });
    
    function updateTimeAgoElements() {
         if (currentView !== 'ledger') return;

        if (currentLedgerView === 'main') {
            const customerItems = customerListDiv.querySelectorAll('.customer-list-item[data-customer-id]');
            customerItems.forEach(item => {
                const customer = findCustomerById(item.dataset.customerId);
                if (customer) {
                    const sortedTransactions = [...(customer.transactions || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
                    const lastTx = sortedTransactions.length > 0 ? sortedTransactions[0] : null;
                    const lastUpdateTime = lastTx ? timeAgo(lastTx.date) : timeAgo(customer.createdAt);
                    const timeAgoEl = item.querySelector('.last-updated');
                    if (timeAgoEl) timeAgoEl.textContent = lastUpdateTime;
                }
            });
        } else if (currentLedgerView === 'customer') {
            const customer = findCustomerById(currentCustomerId);
            if (customer) {
                const sortedTransactions = [...(customer.transactions || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
                const lastTx = sortedTransactions.length > 0 ? sortedTransactions[0] : null;
                const lastUpdateTime = lastTx ? timeAgo(lastTx.date) : timeAgo(customer.createdAt);
                document.getElementById('customerViewLastUpdated').textContent = `(${lastUpdateTime})`;
            }
        }
    }

    function updateCurrentYear() {
        document.getElementById('currentYear').textContent = toBengaliNumber(String(new Date().getFullYear()));
    }

    // --- View Management ---
    function switchView(view) {
        currentView = view;
        mainContainer.style.display = 'block';
        reportPage.style.display = 'none';
        customerReportPage.style.display = 'none';
        document.body.style.overflow = '';

        shoppingListSection.style.display = 'none';
        ledgerSection.style.display = 'none';
        if(fabAddCustomerBtn) fabAddCustomerBtn.style.display = 'none';
        
        showShoppingListBtn.classList.remove('active');
        showLedgerBtn.classList.remove('active');

        shareBtn.style.display = 'none';
        reportBtn.style.display = 'none';
        downloadPdfBtn.style.display = 'none';
        clearBtn.style.display = 'none';

        if (view === 'shoppingList') {
            shoppingListSection.style.display = 'block';
            showShoppingListBtn.classList.add('active');
            
            shareBtn.style.display = 'inline-flex';
            reportBtn.style.display = 'inline-flex';
            downloadPdfBtn.style.display = 'inline-flex';
            clearBtn.style.display = 'inline-flex';
            
            renderList();
        } else if (view === 'ledger') {
            ledgerSection.style.display = 'block';
            if(fabAddCustomerBtn) fabAddCustomerBtn.style.display = 'flex';
            showLedgerBtn.classList.add('active');

            renderLedger();
        }
    }

    // --- Multiple Lists Management (Shopping List) ---
    function populateListSelector() {
        currentListSelector.innerHTML = '';
        for (const id in shoppingLists) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = shoppingLists[id].name;
            currentListSelector.appendChild(option);
        }
        currentListSelector.value = currentListId;
    }
    
    function switchList(newId) {
        if (newId === currentListId || !shoppingLists[newId]) return;
        currentListId = newId;
        shoppingItems = shoppingLists[currentListId].items;
        renderList();
        currentListSelector.value = currentListId;
        updateFirestore({ currentListId: newId });
    }

    async function addNewList() {
        const listName = await customPrompt("নতুন তালিকা", "নতুন তালিকার নাম দিন:");
        if (listName && listName.trim() !== '') {
            const trimmedName = listName.trim();
            const newListId = 'list-' + Date.now();
            shoppingLists[newListId] = { name: trimmedName, items: [] };
            populateListSelector();
            populateReportListFilter();
            switchList(newListId); // This will render and save currentListId
            await updateFirestore({ shoppingLists }); // Save the new lists object
            showToast(`"${trimmedName}" তালিকা তৈরি হয়েছে!`);
        } else if (listName !== null) {
            customAlert("তালিকার নাম খালি হতে পারে না।", "ত্রুটি");
        }
    }
    
    async function renameList() {
        const currentList = shoppingLists[currentListId];
        if (!currentList) return;
        const newName = await customPrompt(`তালিকার নাম পরিবর্তন করুন`, `"${currentList.name}" তালিকার নতুন নাম দিন:`, currentList.name);
        if (newName && newName.trim() !== '') {
            const trimmedName = newName.trim();
            shoppingLists[currentListId].name = trimmedName;
            populateListSelector();
            populateReportListFilter();
            const updateKey = `shoppingLists.${currentListId}.name`;
            await updateFirestore({ [updateKey]: trimmedName });
            showToast(`তালিকার নাম পরিবর্তন করা হয়েছে।`);
        } else if (newName !== null) {
            customAlert("তালিকার নাম খালি হতে পারে না।", "ত্রুটি");
        }
    }

    async function deleteCurrentList() {
        if (Object.keys(shoppingLists).length <= 1) {
            customAlert("কমপক্ষে একটি তালিকা থাকতে হবে। আপনি এই তালিকাটি মুছে ফেলতে পারবেন না।", "অপারেশন ব্যর্থ");
            return;
        }
        const confirmDelete = await customConfirm(`আপনি কি নিশ্চিত যে আপনি "${shoppingLists[currentListId].name}" তালিকাটি মুছে ফেলতে চান?`);
        if (confirmDelete) {
            const deletedListName = shoppingLists[currentListId].name;
            delete shoppingLists[currentListId];
            const newCurrentListId = Object.keys(shoppingLists)[0];
            populateListSelector();
            populateReportListFilter();
            switchList(newCurrentListId);
            await updateFirestore({ shoppingLists, currentListId: newCurrentListId });
            showToast(`"${deletedListName}" তালিকা মুছে ফেলা হয়েছে!`, { type: 'info' });
        }
    }
    
    // --- Multiple Ledgers Management (Hisaab Khata) ---
    function populateLedgerSelector() {
        currentLedgerSelector.innerHTML = '';
        for (const id in ledgers) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = ledgers[id].name;
            currentLedgerSelector.appendChild(option);
        }
        currentLedgerSelector.value = currentLedgerId;
    }

    function switchLedger(newId) {
        if (newId === currentLedgerId || !ledgers[newId]) return;
        currentLedgerId = newId;
        renderLedger();
        currentLedgerSelector.value = newId;
        updateFirestore({ currentLedgerId: newId });
    }

    async function addNewLedger() {
        const ledgerName = await customPrompt("নতুন খাতা", "নতুন খাতার নাম দিন:");
        if (ledgerName && ledgerName.trim() !== '') {
            const trimmedName = ledgerName.trim();
            const newLedgerId = 'ledger-' + Date.now();
            ledgers[newLedgerId] = { name: trimmedName, customers: [] };
            populateLedgerSelector();
            switchLedger(newLedgerId);
            await updateFirestore({ ledgers });
            showToast(`"${trimmedName}" খাতা তৈরি হয়েছে!`);
        } else if (ledgerName !== null) {
            customAlert("খাতার নাম খালি হতে পারে না।", "ত্রুটি");
        }
    }

    async function renameLedger() {
        const currentLedger = ledgers[currentLedgerId];
        if (!currentLedger) return;
        const newName = await customPrompt(`খাতার নাম পরিবর্তন করুন`, `"${currentLedger.name}" খাতার নতুন নাম দিন:`, currentLedger.name);
        if (newName && newName.trim() !== '') {
            const trimmedName = newName.trim();
            ledgers[currentLedgerId].name = trimmedName;
            populateLedgerSelector();
            const updateKey = `ledgers.${currentLedgerId}.name`;
            await updateFirestore({ [updateKey]: trimmedName });
            showToast(`খাতার নাম পরিবর্তন করা হয়েছে।`);
        } else if (newName !== null) {
            customAlert("খাতার নাম খালি হতে পারে না।", "ত্রুটি");
        }
    }

    async function deleteCurrentLedger() {
        if (Object.keys(ledgers).length <= 1) {
            customAlert("কমপক্ষে একটি খাতা থাকতে হবে। আপনি এই খাতাটি মুছে ফেলতে পারবেন না।", "অপারেশন ব্যর্থ");
            return;
        }
        const confirmDelete = await customConfirm(`আপনি কি নিশ্চিত যে আপনি "${ledgers[currentLedgerId].name}" খাতাটি মুছে ফেলতে চান?`);
        if (confirmDelete) {
            const deletedLedgerName = ledgers[currentLedgerId].name;
            delete ledgers[currentLedgerId];
            const newCurrentLedgerId = Object.keys(ledgers)[0];
            populateLedgerSelector();
            switchLedger(newCurrentLedgerId);
            await updateFirestore({ ledgers, currentLedgerId: newCurrentLedgerId });
            showToast(`"${deletedLedgerName}" খাতা মুছে ফেলা হয়েছে!`, { type: 'info' });
        }
    }

    // --- Custom Modals ---
    function customAlert(message, title = 'সতর্কতা') {
        alertModal.querySelector('h3').textContent = title;
        alertMessage.innerHTML = message;
        zIndexCounter++;
        alertModal.style.zIndex = zIndexCounter;
        alertModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        alertModal.querySelector('.confirm-btn').focus();
    }
    function closeAlertModal() {
        alertModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    function customPrompt(title, message, defaultValue = '') {
        return new Promise((resolve) => {
            promptTitle.textContent = title;
            promptLabel.textContent = message;
            promptInput.value = defaultValue;
            
            zIndexCounter++;
            promptModal.style.zIndex = zIndexCounter;
            promptModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(() => promptInput.focus(), 50);
            promptPromiseResolve = resolve;

            const handleSubmit = () => {
                closeAndResolve(promptInput.value);
            };
            const handleCancel = () => {
                closeAndResolve(null);
            };
            const handleKey = (e) => {
                if (e.key === 'Enter') handleSubmit();
                if (e.key === 'Escape') handleCancel();
            };

            const closeAndResolve = (value) => {
                promptModal.classList.remove('active');
                document.body.style.overflow = '';
                if (promptPromiseResolve) promptPromiseResolve(value);
                promptPromiseResolve = null;
                promptSubmitButton.removeEventListener('click', handleSubmit);
                promptCancelButton.removeEventListener('click', handleCancel);
                promptInput.removeEventListener('keydown', handleKey);
            }

            promptSubmitButton.addEventListener('click', handleSubmit);
            promptCancelButton.addEventListener('click', handleCancel);
            promptInput.addEventListener('keydown', handleKey);
        });
    }
    function cancelCustomPrompt() {
        promptModal.classList.remove('active');
        document.body.style.overflow = '';
        if (promptPromiseResolve) {
            promptPromiseResolve(null);
            promptPromiseResolve = null;
        }
    }
    function customConfirm(message) {
        return new Promise((resolve) => {
            confirmationMessage.textContent = message;
            zIndexCounter++;
            confirmationModal.style.zIndex = zIndexCounter;
            confirmationModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            confirmPromiseResolve = resolve;
            confirmButton.focus();
        });
    }
    function handleConfirm(isConfirmed) {
        confirmationModal.classList.remove('active');
        document.body.style.overflow = '';
        if (confirmPromiseResolve) confirmPromiseResolve(isConfirmed);
        confirmPromiseResolve = null;
    }

    // --- Autocomplete & Voice Input ---
    function addToItemDatabase(itemName) {
        itemDatabase.add(itemName);
        if (itemDatabase.size > MAX_DATABASE_SIZE) {
            itemDatabase.delete(itemDatabase.values().next().value);
        }
        updateFirestore({ itemDatabase: Array.from(itemDatabase) });
    }
    function setupAutocomplete() {
        let selectedSuggestionIndex = -1;
        itemNameInput.addEventListener('input', () => {
            const query = itemNameInput.value.trim().toLowerCase();
            autocompleteSuggestions.innerHTML = '';
            selectedSuggestionIndex = -1;
            if (query.length < 1) { autocompleteSuggestions.style.display = 'none'; return; }
            const suggestions = Array.from(itemDatabase).filter(item => item.toLowerCase().includes(query)).slice(0, 5);
            if (suggestions.length > 0) {
                suggestions.forEach((suggestion) => {
                    const div = document.createElement('div');
                    div.textContent = suggestion;
                    div.addEventListener('click', () => {
                        itemNameInput.value = suggestion;
                        autocompleteSuggestions.style.display = 'none';
                        itemQuantityInput.focus();
                    });
                    autocompleteSuggestions.appendChild(div);
                });
                autocompleteSuggestions.style.display = 'block';
            } else { autocompleteSuggestions.style.display = 'none'; }
        });
        itemNameInput.addEventListener('keydown', (e) => {
            const suggestions = autocompleteSuggestions.querySelectorAll('div');
            if (suggestions.length === 0 || autocompleteSuggestions.style.display === 'none') return;
            
            if (e.key === 'ArrowDown') { e.preventDefault(); selectedSuggestionIndex = (selectedSuggestionIndex + 1) % suggestions.length; updateSelectedSuggestion(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); selectedSuggestionIndex = (selectedSuggestionIndex - 1 + suggestions.length) % suggestions.length; updateSelectedSuggestion(); }
            else if (e.key === 'Enter' && selectedSuggestionIndex > -1) { e.preventDefault(); suggestions[selectedSuggestionIndex].click(); }
            else if (e.key === 'Escape') { autocompleteSuggestions.style.display = 'none'; }
        });
        function updateSelectedSuggestion() {
            const suggestions = autocompleteSuggestions.querySelectorAll('div');
            suggestions.forEach((s, i) => {
                s.classList.toggle('selected', i === selectedSuggestionIndex);
                if (i === selectedSuggestionIndex) s.scrollIntoView({ block: 'nearest' });
            });
        }
        document.addEventListener('click', (e) => {
            if (!itemNameInput.contains(e.target) && !autocompleteSuggestions.contains(e.target)) {
                autocompleteSuggestions.style.display = 'none';
            }
        });
    }
    function initializeVoiceInput() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = false; recognition.lang = 'bn-BD';
            recognition.onresult = (event) => { itemNameInput.value = event.results[0][0].transcript; };
            recognition.onerror = (event) => { customAlert(`ভয়েস ইনপুট এ সমস্যা: ${event.error}`, "ভয়েস ইনপুট ত্রুটি"); };
            recognition.onend = () => { voiceInputButton.classList.remove('listening'); voiceInputButton.innerHTML = '<i class="fas fa-microphone"></i>'; };
            voiceInputButton.addEventListener('click', () => {
                if (voiceInputButton.classList.contains('listening')) { recognition.stop(); } 
                else {
                    try {
                        recognition.start();
                        voiceInputButton.classList.add('listening');
                        voiceInputButton.innerHTML = '<i class="fas fa-stop-circle"></i>';
                    } catch (e) {
                        customAlert('মাইক্রোফোন শুরু করা যায়নি। অনুমতি দেওয়া আছে কিনা দেখুন।', 'ত্রুটি');
                    }
                }
            });
        } else { voiceInputButton.style.display = 'none'; }
    }
    
    // --- Core Shopping List Functions (REFACTORED) ---
    function renderList() {
        const searchTerm = shoppingListSearchInput.value.trim().toLowerCase();
        const itemsToRender = searchTerm
            ? shoppingItems.filter(item => item.name.toLowerCase().includes(searchTerm))
            : shoppingItems;

        shoppingListDiv.innerHTML = '';
        let total = 0;

        if (itemsToRender.length === 0) {
            const message = searchTerm ? `"${shoppingListSearchInput.value}" নামে কোনো পণ্য পাওয়া যায়নি।` : "তালিকা এখনো খালি। কিছু পণ্য যোগ করুন!";
            shoppingListDiv.innerHTML = `<p style="text-align:center; padding: 20px;">${message}</p>`;
        } else {
            itemsToRender.forEach((item) => {
                // We need the original index for actions like delete/toggle
                const originalIndex = shoppingItems.findIndex(i => i === item);
                const listItemDiv = createShoppingListItemElement(item, originalIndex);
                shoppingListDiv.appendChild(listItemDiv);
                if (!item.bought) {
                    total += (item.quantity || 1) * (item.price || 0);
                }
            });
        }
        totalAmountSpan.textContent = formatCurrency(total);
    }

    function createShoppingListItemElement(item, index) {
        const listItemDiv = document.createElement('div');
        listItemDiv.className = `list-item ${item.bought ? 'bought' : ''}`;
        listItemDiv.dataset.id = index;
        listItemDiv.setAttribute('draggable', 'true');
        
        listItemDiv.addEventListener('dragstart', dragStart);
        listItemDiv.addEventListener('dragover', dragOver);
        listItemDiv.addEventListener('drop', dropItem);
        listItemDiv.addEventListener('dragend', dragEnd);

        const priorityIndicator = document.createElement('div');
        priorityIndicator.className = `item-priority-indicator priority-${item.priority || 'low'}`;

        const itemMainDetailsDiv = document.createElement('div');
        itemMainDetailsDiv.className = 'item-main-details';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'item-name';
        nameSpan.textContent = item.name;
        const totalItemPriceSpan = document.createElement('span');
        totalItemPriceSpan.className = 'item-total-price';
        const calculatedItemTotal = (item.quantity || 1) * (item.price || 0);
        totalItemPriceSpan.textContent = formatCurrency(calculatedItemTotal);
        itemMainDetailsDiv.append(nameSpan, totalItemPriceSpan);

        const itemSubDetailsAndActionsDiv = document.createElement('div');
        itemSubDetailsAndActionsDiv.className = 'item-sub-details-and-actions';
        const itemPriceDetailsDiv = document.createElement('div');
        itemPriceDetailsDiv.className = 'item-price-details';
        const quantitySpan = document.createElement('span');
        quantitySpan.className = 'item-quantity';
        quantitySpan.textContent = `${toBengaliNumber(String(item.quantity || 1))} x`;
        const pricePerUnitSpan = document.createElement('span');
        pricePerUnitSpan.className = 'item-price-per-unit';
        pricePerUnitSpan.textContent = `${formatCurrency(item.price || 0)}/ইউনিট`;
        itemPriceDetailsDiv.append(quantitySpan, pricePerUnitSpan);

        const itemActionsDiv = document.createElement('div');
        itemActionsDiv.className = 'item-actions';
        const toggleBoughtButton = document.createElement('button');
        toggleBoughtButton.className = 'toggle-bought-btn';
        toggleBoughtButton.innerHTML = item.bought ? '<i class="fas fa-check-circle"></i>' : '<i class="far fa-circle"></i>';
        toggleBoughtButton.title = item.bought ? 'কেনা হয়নি হিসাবে চিহ্নিত করুন' : 'কেনা হয়েছে হিসাবে চিহ্নিত করুন';
        toggleBoughtButton.onclick = (event) => { event.stopPropagation(); toggleBought(index); };
        
        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.title = 'পণ্যের বিস্তারিত সম্পাদনা করুন';
        editButton.onclick = (event) => { event.stopPropagation(); openEditItemModal(index); };
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteButton.title = 'পণ্যটি মুছুন';
        deleteButton.onclick = (event) => { event.stopPropagation(); deleteItem(index); };
        
        itemActionsDiv.append(toggleBoughtButton, editButton, deleteButton);
        itemSubDetailsAndActionsDiv.append(itemPriceDetailsDiv, itemActionsDiv);
        listItemDiv.append(priorityIndicator, itemMainDetailsDiv, itemSubDetailsAndActionsDiv);

        return listItemDiv;
    }

    function dragStart(e) {
        draggedItem = this; 
        setTimeout(() => this.classList.add('dragging'), 0);
    }

    function dragOver(e) { e.preventDefault(); }

    async function dropItem(e) {
        e.preventDefault();
        if (draggedItem !== this) {
             const draggedIndex = parseInt(draggedItem.dataset.id);
             const targetIndex = parseInt(this.dataset.id);
             const [removed] = shoppingItems.splice(draggedIndex, 1);
             shoppingItems.splice(targetIndex, 0, removed);
             
             const updateKey = `shoppingLists.${currentListId}.items`;
             await updateFirestore({ [updateKey]: shoppingItems });
             renderList();
        }
    }
    function dragEnd() { 
        this.classList.remove('dragging'); 
        draggedItem = null;
    }

    function addItem() {
        const itemName = itemNameInput.value.trim();
        const itemQuantity = parseInt(itemQuantityInput.value) || 1;
        const itemPrice = parseFloat(itemPriceInput.value) || 0;
        const itemPriority = itemPriorityInput.value;

        if (itemName === '') {
            customAlert('অনুগ্রহ করে পণ্যের নাম লিখুন।', "ইনপুট ত্রুটি");
            itemNameInput.focus(); return;
        }
        shoppingItems.push({ name: itemName, quantity: itemQuantity, price: itemPrice, priority: itemPriority, bought: false, addedDate: new Date().toISOString(), listId: currentListId });
        addToItemDatabase(itemName);
        
        itemNameInput.value = ''; itemQuantityInput.value = '1'; itemPriceInput.value = ''; itemPriorityInput.value = 'low'; itemNameInput.focus();
        
        const updateKey = `shoppingLists.${currentListId}.items`;
        updateFirestore({ [updateKey]: shoppingItems });
        renderList(); 
        showToast('পণ্য যোগ করা হয়েছে।');
    }
    
    async function commitLastDeletion() {
        if (lastDeletedItem) {
            const updateKey = `shoppingLists.${currentListId}.items`;
            await updateFirestore({ [updateKey]: shoppingItems });
            console.log('Deletion committed for:', lastDeletedItem.item.name);
            lastDeletedItem = null;
        }
    }

    function undoLastDeletion() {
        if (lastDeletedItem) {
            clearTimeout(undoTimeout);
            shoppingItems.splice(lastDeletedItem.index, 0, lastDeletedItem.item);
            renderList();
            const updateKey = `shoppingLists.${currentListId}.items`;
            updateFirestore({ [updateKey]: shoppingItems });
            showToast('পণ্যটি পুনরুদ্ধার করা হয়েছে।');
            lastDeletedItem = null;
        }
    }
    
    function deleteItem(index) {
        commitLastDeletion();
        clearTimeout(undoTimeout);

        const itemToDelete = shoppingItems[index];
        lastDeletedItem = { item: itemToDelete, index: index };
        
        shoppingItems.splice(index, 1);
        renderList();
        
        showToast(`"${itemToDelete.name}" মোছা হয়েছে।`, {
            undoCallback: undoLastDeletion
        });

        undoTimeout = setTimeout(commitLastDeletion, 7000);
    }

    let editingItemIndex = -1;
    function openEditItemModal(index) {
        editingItemIndex = index;
        const currentItem = shoppingItems[index];
        editItemNameInput.value = currentItem.name;
        editItemQuantityInput.value = currentItem.quantity || 1;
        editItemPriceInput.value = currentItem.price || 0;
        editItemPriorityInput.value = currentItem.priority || 'low';
        zIndexCounter++;
        editItemModal.style.zIndex = zIndexCounter;
        editItemModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        editItemNameInput.focus();
    }
    function closeEditItemModal() {
        editItemModal.classList.remove('active');
        document.body.style.overflow = '';
        editingItemIndex = -1;
    }

    async function saveEditedItem() {
        const newName = editItemNameInput.value.trim();
        if (newName === '') {
            customAlert('অনুগ্রহ করে পণ্যের নাম লিখুন।', "ইনপুট ত্রুটি");
            return;
        }
        shoppingItems[editingItemIndex].name = newName;
        shoppingItems[editingItemIndex].quantity = parseInt(editItemQuantityInput.value) || 1;
        shoppingItems[editingItemIndex].price = parseFloat(editItemPriceInput.value) || 0;
        shoppingItems[editingItemIndex].priority = editItemPriorityInput.value;
        
        const updateKey = `shoppingLists.${currentListId}.items`;
        await updateFirestore({ [updateKey]: shoppingItems });
        renderList(); 
        closeEditItemModal();
        showToast('পণ্যটি সফলভাবে সম্পাদন করা হয়েছে।');
    }

    async function toggleBought(index) {
        shoppingItems[index].bought = !shoppingItems[index].bought;
        renderList(); 
        const updateKey = `shoppingLists.${currentListId}.items`;
        await updateFirestore({ [updateKey]: shoppingItems });
    }

    // --- Core Ledger Functions (REBUILT & REFACTORED) ---
    function renderLedger() {
        if (currentView !== 'ledger') return;

        if (currentLedgerView === 'main') {
            renderLedgerMainView();
            ledgerMainView.style.display = 'block';
            ledgerCustomerView.style.display = 'none';
            if(fabAddCustomerBtn) fabAddCustomerBtn.style.display = 'flex';

        } else if (currentLedgerView === 'customer') {
            renderLedgerCustomerView();
            ledgerMainView.style.display = 'none';
            ledgerCustomerView.style.display = 'flex';
            if(fabAddCustomerBtn) fabAddCustomerBtn.style.display = 'none';
        }
    }

    function renderLedgerMainView(searchTerm = '') {
        const currentLedger = ledgers[currentLedgerId];
        if (!currentLedger) return;

        customerListDiv.innerHTML = '';
        const customers = currentLedger.customers || [];
        let totalReceivable = 0, totalPayable = 0;
        
        customers.forEach(customer => {
            const balance = calculateCustomerBalance(customer);
            if (balance > 0) totalReceivable += balance;
            if (balance < 0) totalPayable += Math.abs(balance);
        });

        document.getElementById('ledger-total-receivable').textContent = formatCurrency(totalReceivable, false);
        document.getElementById('ledger-total-payable').textContent = formatCurrency(totalPayable, false);
        
        const sortedCustomers = [...customers].sort((a, b) => {
            const lastTxA = a.transactions && a.transactions.length > 0 ? new Date(a.transactions.sort((t1, t2) => new Date(t2.date) - new Date(t1.date))[0].date) : new Date(a.createdAt);
            const lastTxB = b.transactions && b.transactions.length > 0 ? new Date(b.transactions.sort((t1, t2) => new Date(t2.date) - new Date(t1.date))[0].date) : new Date(b.createdAt);
            return lastTxB - lastTxA;
        });
        
        const filteredCustomers = sortedCustomers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

        if (filteredCustomers.length === 0) {
             const message = searchTerm ? `"${searchTerm}" নামে কোনো গ্রাহক পাওয়া যায়নি।` : `কোনো গ্রাহক যোগ করা হয়নি। শুরু করতে '+' বাটনে ক্লিক করুন।`;
             customerListDiv.innerHTML = `<p style="text-align:center; padding: 20px;">${message}</p>`;
        }

        filteredCustomers.forEach((customer) => {
            const itemDiv = createCustomerListItemElement(customer);
            customerListDiv.appendChild(itemDiv);
        });
    }
    
    function createCustomerListItemElement(customer) {
        const balance = calculateCustomerBalance(customer);
        const sortedTransactions = [...(customer.transactions || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
        const lastTx = sortedTransactions.length > 0 ? sortedTransactions[0] : null;
        const lastUpdateTime = lastTx ? timeAgo(lastTx.date) : timeAgo(customer.createdAt);
        const initial = customer.name.trim().charAt(0).toUpperCase() || '?';
        const color = customerColors[Math.abs(customer.name.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)) % customerColors.length];

        const itemDiv = document.createElement('div');
        itemDiv.className = 'customer-list-item';
        itemDiv.dataset.customerId = customer.id;
        itemDiv.onclick = () => showCustomerView(customer.id);

        let balanceClass = '';
        if (balance > 0) balanceClass = 'positive';
        if (balance < 0) balanceClass = 'negative';

        itemDiv.innerHTML = `
            <div class="customer-initial-circle" style="background-color: ${color};">${initial}</div>
            <div class="customer-info">
                <div class="name">${customer.name}</div>
                <div class="last-updated">${lastUpdateTime}</div>
            </div>
            <div class="customer-balance ${balanceClass}">
                ${formatCurrency(Math.abs(balance), false)}
                <i class="fas fa-chevron-right"></i>
            </div>
        `;
        return itemDiv;
    }

    function renderLedgerCustomerView() {
        const customer = findCustomerById(currentCustomerId);
        if (!customer) return;

        const initialHeaderDiv = document.getElementById('customerViewInitialHeader');
        const lastUpdatedDiv = document.getElementById('customerViewLastUpdated');

        const totalBalance = calculateCustomerBalance(customer);
        customerViewName.textContent = customer.name;
        
        if (customer.phone) {
            const formattedPhone = customer.phone.startsWith('0') ? `+88${customer.phone}` : `+88${customer.phone}`;
            customerViewPhone.innerHTML = `<a href="tel:${formattedPhone}"><i class="fas fa-phone-alt"></i> ${toBengaliNumber(formattedPhone)}</a>`;
        } else {
            customerViewPhone.innerHTML = '';
        }
        
        const initial = customer.name.trim().charAt(0).toUpperCase() || '?';
        const color = customerColors[Math.abs(customer.name.split("").reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) % customerColors.length];
        initialHeaderDiv.textContent = initial;
        initialHeaderDiv.style.backgroundColor = color;
        
        const sortedTransactions = [...(customer.transactions || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
        const lastTx = sortedTransactions.length > 0 ? sortedTransactions[0] : null;
        const lastUpdateTime = lastTx ? timeAgo(lastTx.date) : timeAgo(customer.createdAt);
        lastUpdatedDiv.textContent = `(${lastUpdateTime})`;
        
        let balanceText = '';
        let balanceClass = 'balance';
        if (totalBalance > 0) {
            balanceText = `পাবো ${formatCurrency(totalBalance)}`;
            balanceClass += ' positive';
        } else if (totalBalance < 0) {
            balanceText = `দেবো ${formatCurrency(Math.abs(totalBalance))}`;
            balanceClass += ' negative';
        } else {
            balanceText = 'কোনো দেনা-পাওনা নেই';
        }
        customerViewBalance.textContent = balanceText;
        customerViewBalance.className = balanceClass;

        gaveAmountInput.value = '';
        receivedAmountInput.value = '';
        transactionDescriptionInput.value = '';
        transactionDateInput.value = formatDateForInput(new Date());
        transactionDateLabel.textContent = formatShortDateForDisplay(new Date());
        updateConfirmButtonState();
    }
    
    function updateConfirmButtonState() {
         const gaveAmount = parseFloat(gaveAmountInput.value) || 0;
         const receivedAmount = parseFloat(receivedAmountInput.value) || 0;
         if(gaveAmount > 0 || receivedAmount > 0) {
             confirmTransactionBtn.classList.remove('disabled');
         } else {
             confirmTransactionBtn.classList.add('disabled');
         }
    }

    function calculateCustomerBalance(customer) {
        return (customer.transactions || []).reduce((acc, tx) => {
            if (tx.type === 'gave') return acc + tx.amount;
            if (tx.type === 'received') return acc - tx.amount;
            return acc;
        }, 0);
    }
    
    function findCustomerById(id) {
        return ledgers[currentLedgerId]?.customers?.find(c => c.id === id);
    }

    function findTransactionById(customerId, txId) {
        const customer = findCustomerById(customerId);
        if (!customer || !customer.transactions) return null;
        return customer.transactions.find(tx => tx.id === txId);
    }

    function showCustomerView(customerId) {
        currentCustomerId = customerId;
        currentLedgerView = 'customer';
        renderLedger();
    }

    function showMainLedgerView() {
        currentCustomerId = null;
        currentLedgerView = 'main';
        renderLedger();
    }
    
    function openAddCustomerModal() {
        const customerNameInput = document.getElementById('customerNameInput');
        const customerPhoneInput = document.getElementById('customerPhoneInput');
        customerNameInput.value = customerSearchInput.value;
        customerPhoneInput.value = '';

        const phoneWrapper = customerPhoneInput.closest('.phone-input-wrapper');
        phoneWrapper.classList.remove('input-invalid');
        document.getElementById('addCustomerConfirmBtn').disabled = false;


        zIndexCounter++;
        addCustomerModal.style.zIndex = zIndexCounter;
        addCustomerModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        customerNameInput.focus();
    }

    function closeAddCustomerModal() {
        addCustomerModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    async function addCustomer() {
        const name = document.getElementById('customerNameInput').value.trim();
        const phone = document.getElementById('customerPhoneInput').value.trim();

        if (!name) { customAlert('অনুগ্রহ করে গ্রাহকের নাম লিখুন।'); return; }

        const newCustomer = {
            id: 'customer-' + Date.now(),
            name: name, phone: phone, transactions: [],
            createdAt: new Date().toISOString()
        };

        if (!ledgers[currentLedgerId].customers) ledgers[currentLedgerId].customers = [];
        ledgers[currentLedgerId].customers.push(newCustomer);
        
        const updateKey = `ledgers.${currentLedgerId}.customers`;
        await updateFirestore({ [updateKey]: ledgers[currentLedgerId].customers });
        
        showToast(`"${name}"-কে যোগ করা হয়েছে।`);
        closeAddCustomerModal();
        customerSearchInput.value = '';
        renderLedgerMainView();
    }

    async function addTransactionToCustomer() {
        if (confirmTransactionBtn.classList.contains('disabled')) return;

        const customer = findCustomerById(currentCustomerId);
        if (!customer) return;

        const gaveAmount = parseFloat(gaveAmountInput.value) || 0;
        const receivedAmount = parseFloat(receivedAmountInput.value) || 0;
        
        if (gaveAmount > 0 && receivedAmount > 0) { customAlert('একই সাথে "টাকা দিলাম" এবং "টাকা পেলাম" যোগ করা যাবে না।'); return; }
        if (gaveAmount === 0 && receivedAmount === 0) { customAlert('অনুগ্রহ করে টাকার পরিমাণ লিখুন।'); return; }
        
        const prevBalance = calculateCustomerBalance(customer);
        
        const dateVal = transactionDateInput.value;
        const txDate = new Date(dateVal + 'T00:00:00');

        const transaction = {
            id: 'tx-' + Date.now(),
            type: gaveAmount > 0 ? 'gave' : 'received',
            amount: gaveAmount > 0 ? gaveAmount : receivedAmount,
            description: transactionDescriptionInput.value.trim(),
            date: new Date().toISOString()
        };
        const finalDate = new Date(transaction.date);
        finalDate.setFullYear(txDate.getFullYear());
        finalDate.setMonth(txDate.getMonth());
        finalDate.setDate(txDate.getDate());
        transaction.date = finalDate.toISOString();
        
        if (!customer.transactions) customer.transactions = [];
        customer.transactions.push(transaction);
        
        const newBalance = calculateCustomerBalance(customer);

        const updateKey = `ledgers.${currentLedgerId}.customers`;
        await updateFirestore({ [updateKey]: ledgers[currentLedgerId].customers });
        
        renderLedgerCustomerView();
        showTransactionConfirmation(customer, transaction, prevBalance, newBalance);
    }

    function showTransactionConfirmation(customer, tx, prevBalance, newBalance) {
        const customerInfoDiv = document.getElementById('txConfirmCustomerInfo');
        const detailsDiv = document.getElementById('txConfirmDetails');
        
        const initial = customer.name.trim().charAt(0).toUpperCase() || '?';
        const color = customerColors[Math.abs(customer.name.split("").reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) % customerColors.length];
        
        customerInfoDiv.innerHTML = `
            <div class="initial-circle" style="background-color: ${color};">${initial}</div>
            <div class="name">${customer.name}</div>
        `;
        
        const gaveText = formatCurrency(tx.type === 'gave' ? tx.amount : 0);
        const receivedText = formatCurrency(tx.type === 'received' ? tx.amount : 0);

        let descriptionHTML = '';
        if (tx.description) {
            descriptionHTML = `
                <div class="tx-detail-item description">
                    <span>বিবরণ</span>
                    <span style="text-align: right; white-space: pre-wrap;">${tx.description}</span>
                </div>
            `;
        }

        let prevBalanceType = 'ব্যালেন্স';
        if (prevBalance > 0) prevBalanceType = 'পূর্বের পাবো';
        else if (prevBalance < 0) prevBalanceType = 'পূর্বের দেবো';

        let newBalanceType = 'বর্তমান ব্যালেন্স';
        if (newBalance > 0) newBalanceType = 'বর্তমান পাবো';
        else if (newBalance < 0) newBalanceType = 'বর্তমান দেবো';


        detailsDiv.innerHTML = `
            <div class="tx-detail-item">
                <span>${prevBalanceType}</span>
                <span>${formatCurrency(Math.abs(prevBalance))}</span>
            </div>
            <div class="tx-detail-item">
                <span>দিলাম</span>
                <span class="gave">${gaveText}</span>
            </div>
            <div class="tx-detail-item">
                <span>পেলাম</span>
                <span class="received">${receivedText}</span>
            </div>
            <div class="tx-detail-item final-balance">
                <span>${newBalanceType}</span>
                <span>${formatCurrency(Math.abs(newBalance))}</span>
            </div>
            ${descriptionHTML}
        `;
        
        const shareText = `**লেনদেন রেকর্ড**\nগ্রাহক: ${customer.name}\n\n${prevBalanceType}: ${formatCurrency(Math.abs(prevBalance))}\nদিলাম: ${gaveText}\nপেলাম: ${receivedText}\n------------------\n${newBalanceType}: ${formatCurrency(Math.abs(newBalance))}\n${tx.description ? 'বিবরণ: ' + tx.description + '\n' : ''}\n- Talika.xyz`;

        document.getElementById('txConfirmCopyBtn').onclick = () => {
             navigator.clipboard.writeText(shareText.replace(/\*\*/g, ''));
             showToast('তথ্য কপি করা হয়েছে!');
             closeTxConfirmModal();
        };
        document.getElementById('txConfirmShareBtn').onclick = () => {
            if (navigator.share) {
                navigator.share({ title: `লেনদেন রেকর্ড - ${customer.name}`, text: shareText.replace(/\*\*/g, ''), url: window.location.href });
            } else {
                customAlert('আপনার ব্রাউজার এই ফিচারটি সমর্থন করে না।');
            }
             closeTxConfirmModal();
        };

        zIndexCounter++;
        txConfirmModal.style.zIndex = zIndexCounter;
        txConfirmModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeTxConfirmModal() {
        txConfirmModal.classList.remove('active');
        document.body.style.overflow = '';
        showMainLedgerView();
    }

    // --- Common Functions for Both Views ---
    async function clear() {
        if (currentView === 'shoppingList') {
            if (shoppingItems.length === 0) { customAlert("তালিকাটি ইতোমধ্যে খালি।", "তথ্য"); return; }
            const confirmClear = await customConfirm('আপনি কি নিশ্চিত যে আপনি সম্পূর্ণ তালিকা পরিষ্কার করতে চান? এই কাজটি Undo করা যাবে না।');
            if (confirmClear) { 
                shoppingItems = []; 
                const updateKey = `shoppingLists.${currentListId}.items`;
                await updateFirestore({ [updateKey]: [] });
                renderList(); 
                showToast('তালিকা পরিষ্কার করা হয়েছে!', {type: 'info'}); 
            }
        } else { // Ledger view
            if (!ledgers[currentLedgerId]?.customers?.length) { customAlert("খাতাটি ইতোমধ্যে খালি।", "তথ্য"); return; }
            const confirmClear = await customConfirm('আপনি কি নিশ্চিত যে আপনি সম্পূর্ণ খাতা পরিষ্কার করতে চান? এই কাজটি ফেরানো যাবে না।');
            if (confirmClear) {
                ledgers[currentLedgerId].customers = [];
                const updateKey = `ledgers.${currentLedgerId}.customers`;
                await updateFirestore({ [updateKey]: [] });
                renderLedger();
                showToast('খাতা পরিষ্কার করা হয়েছে!', { type: 'info' });
            }
        }
    }
    
    async function downloadPdf() {
        const pdfButton = document.getElementById('downloadPdfBtn');
        pdfButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        pdfButton.disabled = true;

        try {
            if (currentView === 'shoppingList') {
                await downloadShoppingListPdf();
            } else {
                await downloadCustomerReportPdf(currentCustomerId);
            }
        } catch (error) {
            console.error("PDF generation failed:", error);
            customAlert("PDF তৈরি করতে একটি সমস্যা হয়েছে।", "ব্যর্থ");
        } finally {
            pdfButton.innerHTML = '<i class="fas fa-file-pdf"></i>';
            pdfButton.disabled = false;
        }
    }
    async function downloadShoppingListPdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const PAGE_WIDTH = doc.internal.pageSize.getWidth();
        const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
        const MARGIN = 10;
        const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);
        let y = MARGIN;

        const checkAndAddPage = async (requiredHeight) => {
            if (y + requiredHeight > PAGE_HEIGHT - MARGIN) {
                doc.addPage();
                y = MARGIN;
            }
        };
        
        const pdfHeader = document.getElementById('pdfHeader');
        pdfHeader.textContent = `কেনাকাটার তালিকা - ${shoppingLists[currentListId].name}`;
        const headerCanvas = await html2canvas(pdfHeader, { scale: 2, backgroundColor: null });
        const headerImgData = headerCanvas.toDataURL('image/png');
        const headerImgHeight = (headerCanvas.height * CONTENT_WIDTH) / headerCanvas.width;
        await checkAndAddPage(headerImgHeight);
        doc.addImage(headerImgData, 'PNG', MARGIN, y, CONTENT_WIDTH, headerImgHeight);
        y += headerImgHeight + 5;

        const pdfHeaderCols = document.getElementById('pdfHeaderCols');
        const headerColsCanvas = await html2canvas(pdfHeaderCols, { scale: 2, backgroundColor: null });
        const headerColsImgData = headerColsCanvas.toDataURL('image/png');
        const headerColsImgHeight = (headerColsCanvas.height * CONTENT_WIDTH) / headerColsCanvas.width;
        await checkAndAddPage(headerColsImgHeight);
        doc.addImage(headerColsImgData, 'PNG', MARGIN, y, CONTENT_WIDTH, headerColsImgHeight);
        y += headerColsImgHeight;

        pdfItemsContainer.innerHTML = '';
        if(shoppingItems.length > 0) {
            for (let i = 0; i < shoppingItems.length; i++) {
                const item = shoppingItems[i];
                const itemDiv = document.createElement('div');
                itemDiv.className = `pdf-item ${item.bought ? 'bought-pdf' : ''}`;
                itemDiv.style.width = '700px'; 
                
                const pdfPriorityIndicator = document.createElement('div');
                pdfPriorityIndicator.className = `pdf-priority-indicator priority-${item.priority || 'low'}`;
                itemDiv.appendChild(pdfPriorityIndicator);
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'pdf-name';
                nameSpan.textContent = `${item.bought ? "[কেনা হয়েছে] " : ""}${toBengaliNumber(String(i + 1))}. ${item.name}`;
                
                const quantityPriceSpan = document.createElement('span');
                quantityPriceSpan.textContent = `${toBengaliNumber(String(item.quantity || 1))} x ${formatCurrency(item.price || 0)}/ইউনিট`;
                
                const totalItemPriceSpan = document.createElement('span');
                totalItemPriceSpan.className = 'pdf-total';
                const calculatedItemTotal = (item.quantity || 1) * (item.price || 0);
                totalItemPriceSpan.textContent = formatCurrency(calculatedItemTotal);
                
                itemDiv.appendChild(nameSpan);
                itemDiv.appendChild(quantityPriceSpan);
                itemDiv.appendChild(totalItemPriceSpan);
                
                pdfItemsContainer.appendChild(itemDiv);

                const itemCanvas = await html2canvas(itemDiv, { scale: 2, backgroundColor: null });
                const itemImgData = itemCanvas.toDataURL('image/png');
                const itemImgHeight = (itemCanvas.height * CONTENT_WIDTH) / itemCanvas.width;

                await checkAndAddPage(itemImgHeight);
                doc.addImage(itemImgData, 'PNG', MARGIN, y, CONTENT_WIDTH, itemImgHeight);
                y += itemImgHeight;

                pdfItemsContainer.removeChild(itemDiv);
            }
        } else {
            doc.text("তালিকায় কোনো পণ্য নেই।", PAGE_WIDTH / 2, y + 20, { align: 'center' });
        }

        let totalBought = 0, totalUnbought = 0, overallTotal = 0;
        shoppingItems.forEach(item => {
            const itemTotal = (item.quantity || 1) * (item.price || 0);
            overallTotal += itemTotal;
            if(item.bought) totalBought += itemTotal;
            else totalUnbought += itemTotal;
        });

        document.getElementById('pdfBoughtTotal').textContent = formatCurrency(totalBought);
        document.getElementById('pdfUnboughtTotal').textContent = formatCurrency(totalUnbought);
        document.getElementById('pdfOverallTotal').textContent = formatCurrency(overallTotal);

        const summaryEl = document.getElementById('pdfTotalAmount');
        const summaryCanvas = await html2canvas(summaryEl, { scale: 2, backgroundColor: null });
        const summaryImgData = summaryCanvas.toDataURL('image/png');
        const summaryImgHeight = (summaryCanvas.height * CONTENT_WIDTH) / summaryCanvas.width;
        
        await checkAndAddPage(summaryImgHeight + 5);
        y += 5;
        doc.addImage(summaryImgData, 'PNG', MARGIN, y, CONTENT_WIDTH, summaryImgHeight);

        doc.save(`কেনাকাটার-তালিকা-${shoppingLists[currentListId].name}.pdf`);
    }
    
    async function downloadCustomerReportPdf(customerId) {
        const button = document.getElementById('customerReportPdfBtn');
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        button.disabled = true;

        try {
            const customer = findCustomerById(customerId);
            if (!customer) throw new Error("Customer not found");

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            const PAGE_WIDTH = doc.internal.pageSize.getWidth();
            const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
            const MARGIN = 10;
            const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);
            let y = MARGIN;
            let pageNumber = 1;
            
            const checkAndAddPage = (requiredHeight) => {
                if (y + requiredHeight > PAGE_HEIGHT - MARGIN - 10) { 
                    doc.addPage();
                    pageNumber++;
                    y = MARGIN;
                    return true;
                }
                return false;
            };

            const renderElementToPdf = async (element) => {
                const canvas = await html2canvas(element, { scale: 2, backgroundColor: null, useCORS: true });
                const imgData = canvas.toDataURL('image/png');
                const imgHeight = (canvas.height * CONTENT_WIDTH) / canvas.width;
                return { imgData, imgHeight };
            };
            
            pdfLedgerContent.innerHTML = '';

            const reportDate = new Date();
            const reportGeneratedAt = reportDate.toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit', hour12: true });

            const headerDiv = document.createElement('div');
            headerDiv.innerHTML = `
                <div class="pdf-report-header">
                    <div class="pdf-report-header-left">
                        <p class="name">${customer.name}</p>
                        <p class="phone">${customer.phone ? 'মোবাইল: ' + toBengaliNumber(customer.phone) : ''}</p>
                    </div>
                    <div class="pdf-report-header-right"><p class="logo">📕 হিসাব খাতা</p></div>
                </div>`;
            pdfLedgerContent.appendChild(headerDiv);
            const { imgData: headerImg, imgHeight: headerHeight } = await renderElementToPdf(headerDiv);
            checkAndAddPage(headerHeight);
            doc.addImage(headerImg, 'PNG', MARGIN, y, CONTENT_WIDTH, headerHeight);
            y += headerHeight;
            pdfLedgerContent.innerHTML = '';

            const transactions = [...(customer.transactions || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
            const subheaderDiv = document.createElement('div');
            subheaderDiv.innerHTML = `
                 <div class="pdf-report-subheader">
                    <div class="pdf-report-subheader-left">
                        <p class="title">বাকি হিসাব রিপোর্ট</p>
                        <p class="date">${formatLongDateForDisplay(reportDate)}</p>
                    </div>
                    <div class="pdf-report-subheader-right">
                        <p>হিসাবের সংখ্যা: ${toBengaliNumber(String(transactions.length))}</p>
                        <p>রিপোর্ট তৈরি: ${reportGeneratedAt}</p>
                    </div>
                </div>`;
            pdfLedgerContent.appendChild(subheaderDiv);
            const { imgData: subheaderImg, imgHeight: subheaderHeight } = await renderElementToPdf(subheaderDiv);
            checkAndAddPage(subheaderHeight);
            doc.addImage(subheaderImg, 'PNG', MARGIN, y, CONTENT_WIDTH, subheaderHeight);
            y += subheaderHeight + 2;
            pdfLedgerContent.innerHTML = '';

            const tableHeaderTable = document.createElement('table');
            tableHeaderTable.className = 'pdf-report-table';
            tableHeaderTable.innerHTML = `
                <thead>
                    <tr>
                        <th class="col-details">বিবরণ</th>
                        <th class="col-gave">দিলাম</th>
                        <th class="col-received">পেলাম</th>
                    </tr>
                </thead>`;
            pdfLedgerContent.appendChild(tableHeaderTable);
            const { imgData: tableHeaderImg, imgHeight: tableHeaderHeight } = await renderElementToPdf(tableHeaderTable.querySelector('thead'));
            pdfLedgerContent.innerHTML = '';
            
            const addTableHeader = () => {
                doc.addImage(tableHeaderImg, 'PNG', MARGIN, y, CONTENT_WIDTH, tableHeaderHeight);
                y += tableHeaderHeight;
            };
            
            addTableHeader();

            for (const tx of transactions) {
                const rowTable = document.createElement('table');
                rowTable.className = 'pdf-report-table';
                const { datePart, yearPart, timePart } = formatTransactionDateForDisplay(tx.date);
                const description = tx.description ? `<span class="tx-description-pdf">${tx.description}</span>` : '';

                rowTable.innerHTML = `
                    <tbody>
                        <tr>
                            <td class="col-details">${datePart} ${yearPart}<br><span class="tx-time-pdf">${timePart}</span>${description}</td>
                            <td class="col-gave gave-amount">${tx.type === 'gave' ? formatCurrency(tx.amount, false) : ''}</td>
                            <td class="col-received received-amount">${tx.type === 'received' ? formatCurrency(tx.amount, false) : ''}</td>
                        </tr>
                    </tbody>`;
                pdfLedgerContent.appendChild(rowTable);
                const { imgData: rowImg, imgHeight: rowHeight } = await renderElementToPdf(rowTable.querySelector('tbody tr'));
                 pdfLedgerContent.innerHTML = '';

                if (checkAndAddPage(rowHeight)) {
                    addTableHeader();
                }
                doc.addImage(rowImg, 'PNG', MARGIN, y, CONTENT_WIDTH, rowHeight);
                y += rowHeight;
            }
            
            let totalGave = 0, totalReceived = 0;
            transactions.forEach(tx => {
                if (tx.type === 'gave') totalGave += tx.amount;
                if (tx.type === 'received') totalReceived += tx.amount;
            });
            const finalBalance = totalGave - totalReceived;

            const footerTable = document.createElement('table');
            footerTable.className = 'pdf-report-table';
            footerTable.innerHTML = `
                 <tfoot>
                    <tr class="total-row">
                        <td class="col-details">মোট</td>
                        <td class="col-gave gave-amount">${formatCurrency(totalGave, false)}</td>
                        <td class="col-received received-amount">${formatCurrency(totalReceived, false)}</td>
                    </tr>
                    <tr class="net-balance-row">
                        <td class="col-details">${finalBalance >= 0 ? 'পাবো' : 'দেবো'}</td>
                        ${finalBalance >= 0 
                            ? `<td class="col-gave gave-amount">${formatCurrency(finalBalance, false)}</td><td class="col-received"></td>` 
                            : `<td class="col-gave"></td><td class="col-received received-amount">${formatCurrency(Math.abs(finalBalance), false)}</td>`
                        }
                    </tr>
                </tfoot>`;
            pdfLedgerContent.appendChild(footerTable);
            const { imgData: footerImg, imgHeight: footerHeight } = await renderElementToPdf(footerTable.querySelector('tfoot'));
            if(checkAndAddPage(footerHeight)) {}
            doc.addImage(footerImg, 'PNG', MARGIN, y, CONTENT_WIDTH, footerHeight);
            y += footerHeight;
            pdfLedgerContent.innerHTML = '';

            doc.save(`${customer.name}-রিপোর্ট.pdf`);

        } catch (error) {
            console.error("PDF generation failed:", error);
            customAlert("PDF তৈরি করতে একটি সমস্যা হয়েছে।", "ব্যর্থ");
        } finally {
            button.innerHTML = '<i class="fas fa-file-pdf"></i>';
            button.disabled = false;
            pdfLedgerContent.innerHTML = '';
        }
    }


    // --- Dark Mode & Font Size ---
    function toggleDarkMode() {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');
        updateDarkModeToggleIcon(isDarkMode);
        updateFirestore({ darkMode: isDarkMode });
    }
    function updateDarkModeToggleIcon(isDarkMode) {
        darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        darkModeToggle.title = isDarkMode ? 'লাইট মোড' : 'ডার্ক মোড';
    }
    function applyFontSize(size) {
        document.body.style.fontSize = `${size}px`;
        currentFontSize = size;
        updateFirestore({ fontSize: size });
    }
    
    // --- Modal Controls & Share Functionality ---
    function openInfoModal() { 
        zIndexCounter++;
        document.getElementById('infoModalOverlay').style.zIndex = zIndexCounter;
        document.getElementById('infoModalOverlay').classList.add('active'); 
        document.body.style.overflow = 'hidden'; 
    }
    function closeInfoModal() { document.getElementById('infoModalOverlay').classList.remove('active'); document.body.style.overflow = ''; }
    function openShareModal() {
        if (currentView === 'shoppingList') {
            openShoppingListShareModal();
        } else {
            openLedgerShareModal();
        }
    }
    function openShoppingListShareModal() {
        shareModalTitle.textContent = 'তালিকা শেয়ার করুন';
        let shareText = `কেনাকাটার তালিকা: ${shoppingLists[currentListId].name}\n\n`;
        shareText += `পণ্যের তালিকা:\n`;
        let totalBought = 0, totalUnbought = 0, overallTotal = 0;
        if (shoppingItems.length === 0) { shareText += "তালিকায় কোনো পণ্য নেই।"; } 
        else {
            shoppingItems.forEach((item, index) => {
                const itemTotal = (item.quantity || 1) * (item.price || 0);
                shareText += `${toBengaliNumber(String(index + 1))}. ${item.name} - ${toBengaliNumber(String(item.quantity || 1))} x ${formatCurrency(item.price || 0)} = ${formatCurrency(itemTotal)} (${getPriorityDisplayName(item.priority || 'low')})${item.bought ? ' [কেনা হয়েছে]' : ' [কেনা হয়নি]'}\n`;
                overallTotal += itemTotal;
                if (item.bought) { totalBought += itemTotal; } else { totalUnbought += itemTotal; }
            });
            shareText += `\n--------------------------\n`;
            shareText += `কেনা পণ্যের মোট মূল্য: ${formatCurrency(totalBought)}\n`;
            shareText += `কেনা হয়নি পণ্যের মোট মূল্য: ${formatCurrency(totalUnbought)}\n`;
            shareText += `সামগ্রিক মোট মূল্য: ${formatCurrency(overallTotal)}\n`;
        }
        shareText += `\nTalika.xyz থেকে পাঠানো হয়েছে`;
        shareableTextPre.textContent = shareText;
        zIndexCounter++;
        shareModalOverlay.style.zIndex = zIndexCounter;
        shareModalOverlay.classList.add('active'); 
        document.body.style.overflow = 'hidden';
    }
    function openLedgerShareModal() {
        shareModalTitle.textContent = 'হিসাব খাতা শেয়ার করুন';
        const currentLedgerName = ledgers[currentLedgerId].name;
        let shareText = `হিসাব খাতা: ${currentLedgerName}\n\n`;

        let totalReceivable = 0, totalPayable = 0;
        (ledgers[currentLedgerId].customers || []).forEach(customer => {
             const balance = calculateCustomerBalance(customer);
             if (balance > 0) totalReceivable += balance;
             if (balance < 0) totalPayable += Math.abs(balance);
        });
        
        shareText += `মোট পাবো: ${formatCurrency(totalReceivable)}\n`;
        shareText += `মোট দেবো: ${formatCurrency(totalPayable)}\n`;
        shareText += `--------------------------\n`;
        
        (ledgers[currentLedgerId].customers || []).forEach(customer => {
            const balance = calculateCustomerBalance(customer);
            if (balance !== 0) {
                const balanceType = balance > 0 ? 'পাবো' : 'দেবো';
                shareText += `${customer.name}: ${formatCurrency(Math.abs(balance))} (${balanceType})\n`;
            }
        });

        shareText += `\nশেয়ার করা হয়েছে Talika.xyz থেকে`;

        shareableTextPre.textContent = shareText;
        zIndexCounter++;
        shareModalOverlay.style.zIndex = zIndexCounter;
        shareModalOverlay.classList.add('active'); 
        document.body.style.overflow = 'hidden';
    }
    function closeShareModal() { shareModalOverlay.classList.remove('active'); document.body.style.overflow = ''; }
    function copyShareableText() {
        navigator.clipboard.writeText(shareableTextPre.textContent).then(() => {
            showToast('তথ্য কপি করা হয়েছে!');
        }).catch(err => customAlert('কপি করতে ব্যর্থ। অনুগ্রহ করে ম্যানুয়ালি কপি করুন।', "ব্যর্থ"));
    }
    function shareViaWebAPI() {
        const title = currentView === 'shoppingList' ? `কেনাকাটার তালিকা: ${shoppingLists[currentListId].name}` : `হিসাব খাতা: ${ledgers[currentLedgerId].name}`;
        if (navigator.share) {
            navigator.share({ title: title, text: shareableTextPre.textContent, url: window.location.href })
            .catch(err => console.log('Share failed:', err));
        } else { customAlert('আপনার ব্রাউজার এই ফিচারটি সমর্থন করে না। আপনি ম্যানুয়ালি টেক্সট কপি করতে পারেন।', 'ব্যর্থ'); }
    }

    // --- Report Page Functions ---
    function showReportPage() {
        mainContainer.style.display = 'none';
        reportPage.style.display = 'flex';
        
        const today = new Date(), firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        reportStartDateInput.value = formatDateForInput(firstDayOfMonth);
        reportEndDateInput.value = formatDateForInput(today);
        document.getElementById('dateFilterResults').style.display = 'none';
        reportPriorityFilter.value = 'low'; reportListFilter.value = 'all';
        updateReportContent();
    }

    function hideReportPage() {
        reportPage.style.display = 'none';
        mainContainer.style.display = 'block';
    }

    function openReportModalFromMonthly() { closeMonthlySpendingModal(); showReportPage(); }
    
    function populateReportListFilter() {
        reportListFilter.innerHTML = '<option value="all">সমস্ত তালিকার মোট</option>';
        for (const id in shoppingLists) {
            const option = document.createElement('option'); option.value = id; option.textContent = shoppingLists[id].name; reportListFilter.appendChild(option);
        }
        reportListFilter.value = 'all';
    }
    function calculateReportSummary(items) {
        let summary = { totalItems: 0, overallTotal: 0, boughtItemsCount: 0, boughtItemsTotal: 0, unboughtItemsCount: 0, unboughtItemsTotal: 0, listIds: new Set() };
        items.forEach(item => {
            summary.totalItems++; const itemTotal = (item.quantity || 1) * (item.price || 0); summary.overallTotal += itemTotal; summary.listIds.add(item.listId);
            if (item.bought) { summary.boughtItemsCount++; summary.boughtItemsTotal += itemTotal; } else { summary.unboughtItemsCount++; summary.unboughtItemsTotal += itemTotal; }
        });
        return summary;
    }
    function renderSummaryBlock(items) {
        const summary = calculateReportSummary(items);
        reportSummaryTotalLists.textContent = toBengaliNumber(String(summary.listIds.size));
        reportSummaryTotalItems.textContent = toBengaliNumber(String(summary.totalItems)); reportSummaryOverallTotal.textContent = formatCurrency(summary.overallTotal);
        reportSummaryBoughtItemsCount.textContent = toBengaliNumber(String(summary.boughtItemsCount)); reportSummaryBoughtItemsTotal.textContent = formatCurrency(summary.boughtItemsTotal);
        reportSummaryUnboughtItemsCount.textContent = toBengaliNumber(String(summary.unboughtItemsCount)); reportSummaryUnboughtItemsTotal.textContent = formatCurrency(summary.unboughtItemsTotal);
    }
    function getFilteredItems() {
        const selectedListId = reportListFilter.value; let allItems = [];
        if (selectedListId === 'all') { for (const listId in shoppingLists) { allItems = allItems.concat(shoppingLists[listId].items.map(item => ({...item, listName: shoppingLists[listId].name }))); } }
        else if (shoppingLists[selectedListId]) { allItems = shoppingLists[selectedListId].items.map(item => ({...item, listName: shoppingLists[selectedListId].name })); }
        return allItems;
    }
    function updateReportContent() {
         const filteredItems = getFilteredItems(); 
         renderSummaryBlock(filteredItems);
         const hide = (el) => el.style.display = 'none'; const show = (el) => el.style.display = 'block';
         [noMonthlyData, noAnnualData, noTopSpendingData, noPriorityData, noBoughtItemsData, noUnboughtItemsData, reportPriorityTotal, reportBoughtTotal, reportUnboughtTotal].forEach(hide);
         renderMonthlySpending(filteredItems); 
         renderAnnualSpending(filteredItems); 
         renderPriorityItemsReport(reportPriorityFilter.value, filteredItems); 
         renderTopSpendingItems(filteredItems); 
         renderAllBoughtItems(filteredItems); 
         renderAllUnboughtItems(filteredItems);
         if (filteredItems.length === 0) { [noMonthlyData, noAnnualData, noTopSpendingData, noPriorityData, noBoughtItemsData, noUnboughtItemsData].forEach(show); }
    }
    function renderMonthlySpending(items) {
        reportMonthlySpendingDiv.innerHTML = ''; const monthlySpending = {};
        items.filter(item => item.bought && item.addedDate).forEach(item => {
            const date = new Date(item.addedDate);
            const monthYearKey = `${getBengaliMonthName(date.getMonth())}, ${toBengaliNumber(String(date.getFullYear()))} ইং`;
            if (!monthlySpending[monthYearKey]) monthlySpending[monthYearKey] = 0;
            monthlySpending[monthYearKey] += ((item.quantity || 1) * (item.price || 0));
        });
        if (Object.keys(monthlySpending).length > 0) { const ul = document.createElement('ul');
            Object.keys(monthlySpending).sort().forEach(monthYear => {
                const li = document.createElement('li'); li.innerHTML = `<span>${monthYear}:</span> <span class="report-amount">${formatCurrency(monthlySpending[monthYear])}</span>`; ul.appendChild(li);
            }); reportMonthlySpendingDiv.appendChild(ul); noMonthlyData.style.display = 'none';
        } else { noMonthlyData.style.display = 'block'; }
    }
    function renderAnnualSpending(items) {
        reportAnnualSpendingDiv.innerHTML = ''; const annualSpending = {};
        items.filter(item => item.bought && item.addedDate).forEach(item => {
            const date = new Date(item.addedDate); const yearKey = `${toBengaliNumber(String(date.getFullYear()))} ইং`;
            if (!annualSpending[yearKey]) annualSpending[yearKey] = 0;
            annualSpending[yearKey] += ((item.quantity || 1) * (item.price || 0));
        });
        if (Object.keys(annualSpending).length > 0) { const ul = document.createElement('ul');
            Object.keys(annualSpending).sort().forEach(year => {
                const li = document.createElement('li'); li.innerHTML = `<span>${year}:</span> <span class="report-amount">${formatCurrency(annualSpending[year])}</span>`; ul.appendChild(li);
            }); reportAnnualSpendingDiv.appendChild(ul); noAnnualData.style.display = 'none';
        } else { noAnnualData.style.display = 'block'; }
    }
    function renderPriorityItemsReport(selectedPriority, items) {
        reportPriorityItemsDiv.innerHTML = ''; let total = 0;
        const priorityItems = items.filter(item => (item.priority || 'low') === selectedPriority);
        if (priorityItems.length > 0) { const ul = document.createElement('ul');
            priorityItems.forEach(item => {
                const li = document.createElement('li'); const itemTotal = (item.quantity || 1) * (item.price || 0); const status = item.bought ? ' (কেনা হয়েছে)' : ' (কেনা হয়নি)';
                li.innerHTML = `<span>${item.name} (${toBengaliNumber(String(item.quantity || 1))} x ${formatCurrency(item.price || 0)}/ইউনিট${status}) - ${item.listName}:</span> <span class="report-amount">${formatCurrency(itemTotal)}</span>`;
                ul.appendChild(li); total += itemTotal;
            });
            reportPriorityItemsDiv.appendChild(ul); reportPriorityTotalAmount.textContent = formatCurrency(total); reportPriorityTotal.style.display = 'block'; noPriorityData.style.display = 'none';
        } else { noPriorityData.style.display = 'block'; reportPriorityTotal.style.display = 'none'; }
    }
    function renderTopSpendingItems(items) {
        reportTopSpendingItemsDiv.innerHTML = ''; const itemSpendingMap = {};
        items.forEach(item => { if (!itemSpendingMap[item.name]) itemSpendingMap[item.name] = 0; itemSpendingMap[item.name] += ((item.quantity || 1) * (item.price || 0)); });
        const sortedItems = Object.entries(itemSpendingMap).sort(([, a], [, b]) => b - a).slice(0, 5);
        if (sortedItems.length > 0) { const ul = document.createElement('ul');
            sortedItems.forEach(([name, amount]) => {
                const li = document.createElement('li'); li.innerHTML = `<span>${name}:</span> <span class="report-amount">${formatCurrency(amount)}</span>`; ul.appendChild(li);
            }); reportTopSpendingItemsDiv.appendChild(ul); noTopSpendingData.style.display = 'none';
        } else { noTopSpendingData.style.display = 'block'; }
    }
    function renderAllBoughtItems(items) {
        reportAllBoughtItemsDiv.innerHTML = ''; let total = 0; const boughtItems = items.filter(item => item.bought);
        if (boughtItems.length > 0) { const ul = document.createElement('ul');
            boughtItems.forEach(item => {
                const li = document.createElement('li'); const itemTotal = (item.quantity || 1) * (item.price || 0);
                li.innerHTML = `<span>${item.name} (${toBengaliNumber(String(item.quantity || 1))} x ${formatCurrency(item.price || 0)}/ইউনিট) - ${item.listName}:</span> <span class="report-amount">${formatCurrency(itemTotal)}</span>`;
                ul.appendChild(li); total += itemTotal;
            });
            reportAllBoughtItemsDiv.appendChild(ul); reportBoughtTotalAmount.textContent = formatCurrency(total); reportBoughtTotal.style.display = 'block'; noBoughtItemsData.style.display = 'none';
        } else { noBoughtItemsData.style.display = 'block'; reportBoughtTotal.style.display = 'none'; }
    }
    function renderAllUnboughtItems(items) {
        reportAllUnboughtItemsDiv.innerHTML = ''; let total = 0; const unboughtItems = items.filter(item => !item.bought);
        if (unboughtItems.length > 0) { const ul = document.createElement('ul');
            unboughtItems.forEach(item => {
                const li = document.createElement('li'); const itemTotal = (item.quantity || 1) * (item.price || 0);
                li.innerHTML = `<span>${item.name} (${toBengaliNumber(String(item.quantity || 1))} x ${formatCurrency(item.price || 0)}/ইউনিট) - ${item.listName}:</span> <span class="report-amount">${formatCurrency(itemTotal)}</span>`;
                ul.appendChild(li); total += itemTotal;
            });
            reportAllUnboughtItemsDiv.appendChild(ul); reportUnboughtTotalAmount.textContent = formatCurrency(total); reportUnboughtTotal.style.display = 'block'; noUnboughtItemsData.style.display = 'none';
        } else { noUnboughtItemsData.style.display = 'block'; reportUnboughtTotal.style.display = 'none'; }
    }
    function applyDateFilter() {
         const startDateStr = reportStartDateInput.value, endDateStr = reportEndDateInput.value;
         if (!startDateStr || !endDateStr) { customAlert("অনুগ্রহ করে শুরুর এবং শেষের উভয় তারিখ নির্বাচন করুন।"); return; }
         const start = new Date(startDateStr); start.setHours(0, 0, 0, 0); const end = new Date(endDateStr); end.setHours(23, 59, 59, 999);
         const filteredByList = getFilteredItems();
         const dateFilteredItems = filteredByList.filter(item => { const itemDate = item.addedDate ? new Date(item.addedDate) : null; return itemDate && itemDate >= start && itemDate <= end; });
         let total = 0, boughtTotal = 0, unboughtTotal = 0;
         dateFilteredItems.forEach(item => { const itemTotal = (item.quantity || 1) * (item.price || 0); total += itemTotal; if (item.bought) boughtTotal += itemTotal; else unboughtTotal += itemTotal; });
         document.getElementById('dateFilterTotalAmount').textContent = formatCurrency(total);
         document.getElementById('dateFilterBoughtTotal').textContent = formatCurrency(boughtTotal);
         document.getElementById('dateFilterUnboughtTotal').textContent = formatCurrency(unboughtTotal);
         document.getElementById('displayDateRange').innerHTML = `তারিখ: <br>${formatLongDateForDisplay(start)} থেকে ${formatLongDateForDisplay(end)} পর্যন্ত`;
         renderDateFilterItems(dateFilteredItems); document.getElementById('dateFilterResults').style.display = 'block';
    }
    function renderDateFilterItems(items) {
         const container = document.getElementById('dateFilterItemsList'); const noDataMsg = document.getElementById('noDateFilterItemsData'); container.innerHTML = '';
         if (items.length > 0) { const ul = document.createElement('ul');
            items.forEach(item => {
                const li = document.createElement('li'); const itemTotal = (item.quantity || 1) * (item.price || 0); const status = item.bought ? '(কেনা হয়েছে)' : '(কেনা হয়নি)'; const itemDate = new Date(item.addedDate);
                const formattedDate = `${toBengaliNumber(String(itemDate.getDate()))}/${toBengaliNumber(String(itemDate.getMonth() + 1))}/${toBengaliNumber(String(itemDate.getFullYear()))}`;
                    li.innerHTML = `<span>${item.name} (${formattedDate}) ${status} - ${item.listName}</span> <span class="report-amount">${formatCurrency(itemTotal)}</span>`;
                    ul.appendChild(li);
                }); container.appendChild(ul); noDataMsg.style.display = 'none';
             } else { noDataMsg.style.display = 'block'; }
        }

        // --- Welcome & Monthly Modals ---
        function closeMonthlySpendingModal() { monthlySpendingModal.classList.remove('active'); document.body.style.overflow = ''; }

        // --- Event Listener Setup ---
        function setupEventListeners() {
            // Auth Buttons
            signInBtn.addEventListener('click', signInWithGoogle);
            signOutBtn.addEventListener('click', signOutWithConfirmation);
            document.getElementById('changeNameBtn').addEventListener('click', changeUserName);

            // View Switcher
            showShoppingListBtn.addEventListener('click', () => switchView('shoppingList'));
            showLedgerBtn.addEventListener('click', () => switchView('ledger'));

            // Header controls
            infoButton.addEventListener('click', openInfoModal);
            darkModeToggle.addEventListener('click', toggleDarkMode);
            decreaseFontButton.addEventListener('click', () => applyFontSize(Math.max(13, currentFontSize - 1)));
            resetFontButton.addEventListener('click', () => applyFontSize(defaultFontSize));
            increaseFontButton.addEventListener('click', () => applyFontSize(Math.min(25, currentFontSize + 1)));
            
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
            });

            // List management controls
            document.getElementById('addNewListBtn').addEventListener('click', addNewList);
            document.getElementById('renameListBtn').addEventListener('click', renameList);
            document.getElementById('deleteCurrentListBtn').addEventListener('click', deleteCurrentList);
            currentListSelector.addEventListener('change', (e) => switchList(e.target.value));

            // Item input controls
            document.getElementById('addItemBtn').addEventListener('click', addItem);
            itemNameInput.addEventListener('keydown', (e) => { 
                if (e.key === 'Enter' && autocompleteSuggestions.style.display === 'none') {
                    e.preventDefault();
                    addItem(); 
                }
            });
            shoppingListSearchInput.addEventListener('input', renderList); // NEW Search Listener

            // Ledger management controls
            document.getElementById('addNewLedgerBtn').addEventListener('click', addNewLedger);
            document.getElementById('renameLedgerBtn').addEventListener('click', renameLedger);
            document.getElementById('deleteCurrentLedgerBtn').addEventListener('click', deleteCurrentLedger);
            currentLedgerSelector.addEventListener('change', (e) => switchLedger(e.target.value));
            
            // NEW Ledger Event Listeners
            fabAddCustomerBtn.addEventListener('click', openAddCustomerModal);
            backToLedgerMainBtn.addEventListener('click', showMainLedgerView);
            confirmTransactionBtn.addEventListener('click', addTransactionToCustomer);
            customerSearchInput.addEventListener('input', (e) => renderLedgerMainView(e.target.value));
            
            gaveAmountInput.addEventListener('input', () => { 
                if(gaveAmountInput.value) receivedAmountInput.value = '';
                updateConfirmButtonState();
            });
            receivedAmountInput.addEventListener('input', () => { 
                if(receivedAmountInput.value) gaveAmountInput.value = '';
                updateConfirmButtonState();
            });
            
            transactionDateInput.addEventListener('change', () => {
                const date = transactionDateInput.valueAsDate || new Date();
                transactionDateLabel.textContent = formatShortDateForDisplay(date);
            });
            
            // Main action buttons
            shareBtn.addEventListener('click', openShareModal);
            reportBtn.addEventListener('click', showReportPage);
            downloadPdfBtn.addEventListener('click', downloadPdf);
            clearBtn.addEventListener('click', clear);

            // Modal & Page close buttons
            document.getElementById('closeInfoModalBtn').addEventListener('click', closeInfoModal);
            document.getElementById('closeShareModalBtn').addEventListener('click', closeShareModal);
            backFromReportBtn.addEventListener('click', hideReportPage);
            backFromCustomerReportBtn.addEventListener('click', hideCustomerReportPage);
            document.getElementById('closeAlertModalBtn').addEventListener('click', closeAlertModal);
            document.getElementById('alertOkBtn').addEventListener('click', closeAlertModal);
            document.getElementById('closeConfirmationModalBtn').addEventListener('click', () => handleConfirm(false));
            document.getElementById('closePromptModalBtn').addEventListener('click', cancelCustomPrompt);
            document.getElementById('closeEditModalBtn').addEventListener('click', closeEditItemModal);
            document.getElementById('closeMonthlyModalBtn').addEventListener('click', closeMonthlySpendingModal);
            document.getElementById('closeMonthlyModalBtn2').addEventListener('click', closeMonthlySpendingModal);
            document.getElementById('closeAddCustomerModalBtn').addEventListener('click', closeAddCustomerModal);
            document.getElementById('closeTxConfirmModalBtn').addEventListener('click', closeTxConfirmModal);
            
            transactionDetailModal.querySelector('.custom-modal-close').addEventListener('click', () => transactionDetailModal.classList.remove('active'));
            editTransactionModal.querySelector('.custom-modal-close').addEventListener('click', () => editTransactionModal.classList.remove('active'));
            editTransactionModal.querySelector('.cancel-btn').addEventListener('click', () => editTransactionModal.classList.remove('active'));
            document.getElementById('saveEditedTransactionBtn').addEventListener('click', saveEditedTransaction);
            
            editCustomerModal.querySelector('.custom-modal-close').addEventListener('click', () => editCustomerModal.classList.remove('active'));
            editCustomerModal.querySelector('.cancel-btn').addEventListener('click', () => editCustomerModal.classList.remove('active'));
            document.getElementById('saveEditedCustomerBtn').addEventListener('click', saveEditedCustomer);


            // Modal action buttons
            document.getElementById('copyShareTextBtn').addEventListener('click', copyShareableText);
            document.getElementById('shareViaApiBtn').addEventListener('click', shareViaWebAPI);
            confirmButton.addEventListener('click', () => handleConfirm(true));
            cancelButton.addEventListener('click', () => handleConfirm(false));
            editItemSaveButton.addEventListener('click', saveEditedItem);
            editItemCancelButton.addEventListener('click', closeEditItemModal);
            document.getElementById('addCustomerConfirmBtn').addEventListener('click', addCustomer);
            document.getElementById('addCustomerCancelBtn').addEventListener('click', closeAddCustomerModal);
            document.getElementById('monthlyToFullReportBtn').addEventListener('click', openReportModalFromMonthly);
            
            // Phone validation listeners
            setupPhoneValidation(document.getElementById('customerPhoneInput'), document.getElementById('addCustomerConfirmBtn'));
            setupPhoneValidation(document.getElementById('editCustomerPhoneInput'), document.getElementById('saveEditedCustomerBtn'));
            
            // Report filters
            reportListFilter.addEventListener('change', updateReportContent);
            reportPriorityFilter.addEventListener('change', () => renderPriorityItemsReport(reportPriorityFilter.value, getFilteredItems()));
            applyDateFilterButton.addEventListener('click', applyDateFilter);
            
            document.addEventListener('click', (e) => {
                const activeModal = document.querySelector('.modal-overlay.active, .custom-modal.active');
                if (activeModal && (e.target.classList.contains('modal-overlay') || e.target.classList.contains('custom-modal'))) {
                    activeModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
                if (profileMenu && !profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
                    profileMenu.style.display = 'none';
                }
                if (customerOptionsBtn && customerOptionsMenu && !customerOptionsBtn.contains(e.target) && !customerOptionsMenu.contains(e.target)) {
                    customerOptionsMenu.style.display = 'none';
                }
            });
            document.addEventListener('keydown', (e) => {
                 if (e.key === 'Escape') {
                    const activeModal = document.querySelector('.modal-overlay.active, .custom-modal.active');
                    if (activeModal) {
                         activeModal.classList.remove('active');
                         document.body.style.overflow = '';
                    }
                    if(profileMenu && profileMenu.style.display === 'block') {
                        profileMenu.style.display = 'none';
                    }
                    if(customerOptionsMenu && customerOptionsMenu.style.display === 'block') {
                        customerOptionsMenu.style.display = 'none';
                    }
                 }
            });

            // Customer Options Menu Logic
            customerOptionsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                customerOptionsMenu.style.display = customerOptionsMenu.style.display === 'block' ? 'none' : 'block';
            });
            document.getElementById('customerReportBtn').addEventListener('click', () => {
                showCustomerReportPage(currentCustomerId);
                customerOptionsMenu.style.display = 'none';
            });
             document.getElementById('customerEditBtn').addEventListener('click', () => {
                editCustomer(currentCustomerId);
                customerOptionsMenu.style.display = 'none';
            });
             document.getElementById('customerDeleteBtn').addEventListener('click', () => {
                deleteCustomer(currentCustomerId);
                customerOptionsMenu.style.display = 'none';
            });
        }

        function setupPhoneValidation(phoneInput, submitButton) {
            const phoneWrapper = phoneInput.closest('.phone-input-wrapper');
            phoneInput.addEventListener('input', () => {
                const phone = phoneInput.value.trim();
                if (phone.length > 0 && (phone.length !== 11 || !/^\d{11}$/.test(phone))) {
                    phoneWrapper.classList.add('input-invalid');
                    submitButton.disabled = true;
                } else {
                    phoneWrapper.classList.remove('input-invalid');
                    submitButton.disabled = false;
                }
            });
        }

        // NEW: Customer options functions
        function showCustomerReportPage(customerId) {
            const customer = findCustomerById(customerId);
            if (!customer) return;

            mainContainer.style.display = 'none';
            reportPage.style.display = 'none';
            customerReportPage.style.display = 'flex'; 
            document.body.style.overflow = 'hidden'; 

            customerReportPageName.textContent = `${customer.name}-এর রিপোর্ট`;
            
            const { tableElement, totalGave, totalReceived, allTransactions } = generateCustomerTransactionTable(customer, true);
            
            customerReportPageContent.innerHTML = ''; 
            customerReportPageContent.appendChild(tableElement);
            
            customerReportPageFooterContainer.innerHTML = '';
            if (allTransactions.length > 0) {
                const footer = document.createElement('div');
                footer.className = 'tx-table-footer tx-table-header';
                footer.style.fontWeight = 'bold';
                footer.innerHTML = `
                    <div class="tx-col tx-col-details">মোট</div>
                    <div class="tx-col tx-col-gave">${formatCurrency(totalGave, false)}</div>
                    <div class="tx-col tx-col-received">${formatCurrency(totalReceived, false)}</div>
                `;
                customerReportPageFooterContainer.appendChild(footer);
            }

            customerReportPageContent.onclick = function(e) {
                const row = e.target.closest('.tx-table-row');
                if (row && row.dataset.txId) {
                    showTransactionDetailModal(customerId, row.dataset.txId);
                }
            };
            
            customerReportPdfBtn.onclick = () => downloadCustomerReportPdf(customerId);
            
            const shareText = generateCustomerReportShareText(customer);
            customerReportShareBtn.onclick = () => {
                 if (navigator.share) {
                    navigator.share({ title: `রিপোর্ট - ${customer.name}`, text: shareText, url: window.location.href });
                } else {
                    customAlert('আপনার ব্রাউজার এই ফিচারটি সমর্থন করে না।');
                }
            };
            customerReportCopyBtn.onclick = () => {
                navigator.clipboard.writeText(shareText);
                showToast('রিপোর্টের তথ্য কপি করা হয়েছে!');
            };

        }


        function hideCustomerReportPage() {
            mainContainer.style.display = 'block';
            customerReportPage.style.display = 'none';
            document.body.style.overflow = ''; 
        }

        function editCustomer(customerId) {
            const customer = findCustomerById(customerId);
            if (!customer) return;
            
            activeEditingCustomer = customer;
            
            const nameInput = document.getElementById('editCustomerNameInput');
            const phoneInput = document.getElementById('editCustomerPhoneInput');
            const saveButton = document.getElementById('saveEditedCustomerBtn');
            
            nameInput.value = customer.name;
            phoneInput.value = customer.phone || '';
            
            phoneInput.closest('.phone-input-wrapper').classList.remove('input-invalid');
            saveButton.disabled = false;

            zIndexCounter++;
            editCustomerModal.style.zIndex = zIndexCounter;
            editCustomerModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            nameInput.focus();
        }

        async function saveEditedCustomer() {
            if (!activeEditingCustomer) return;
            
            const newName = document.getElementById('editCustomerNameInput').value.trim();
            const newPhone = document.getElementById('editCustomerPhoneInput').value.trim();

            if (!newName) { customAlert('গ্রাহকের নাম খালি রাখা যাবে না।'); return; }

            activeEditingCustomer.name = newName;
            activeEditingCustomer.phone = newPhone;
            
            const updateKey = `ledgers.${currentLedgerId}.customers`;
            await updateFirestore({ [updateKey]: ledgers[currentLedgerId].customers });
            
            editCustomerModal.classList.remove('active');
            document.body.style.overflow = '';
            showToast('গ্রাহকের তথ্য আপডেট করা হয়েছে।');
            
            if (currentLedgerView === 'customer' && currentCustomerId === activeEditingCustomer.id) {
                renderLedgerCustomerView();
            } else {
                renderLedgerMainView(customerSearchInput.value);
            }
            activeEditingCustomer = null;
        }


        async function deleteCustomer(customerId) {
            const customer = findCustomerById(customerId);
            if (!customer) return;

            const confirmed = await customConfirm(`আপনি কি "${customer.name}"-কে এবং তার সমস্ত লেনদেন মুছে ফেলতে নিশ্চিত? এই কাজটি ফেরানো যাবে না।`);
            if (confirmed) {
                const customerIndex = ledgers[currentLedgerId].customers.findIndex(c => c.id === customerId);
                if (customerIndex > -1) {
                    ledgers[currentLedgerId].customers.splice(customerIndex, 1);
                    
                    const updateKey = `ledgers.${currentLedgerId}.customers`;
                    await updateFirestore({ [updateKey]: ledgers[currentLedgerId].customers });
                    
                    showToast(`"${customer.name}"-কে মুছে ফেলা হয়েছে।`);
                    showMainLedgerView();
                }
            }
        }

        function generateCustomerTransactionTable(customer, clickable = false) {
            const tableContainer = document.createElement('div');
            tableContainer.className = 'customer-transaction-table';
            
            const allTransactions = [...(customer.transactions || [])];

            let totalGave = 0;
            let totalReceived = 0;

            if (allTransactions.length === 0) {
                tableContainer.innerHTML = `<p style="text-align:center; padding: 20px;">কোনো লেনদেন নেই।</p>`;
                return { tableElement: tableContainer, totalGave, totalReceived, allTransactions };
            }

            tableContainer.innerHTML = `
                <div class="tx-table-header">
                    <div class="tx-col tx-col-details">লেনদেনের বিবরণ</div>
                    <div class="tx-col tx-col-gave">দিলাম</div>
                    <div class="tx-col tx-col-received">পেলাম</div>
                </div>
            `;

            const transactionsWithRunningBalance = [];
            let runningBalance = 0;
            allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date)); 
            allTransactions.forEach(tx => {
                if (tx.type === 'gave') runningBalance += tx.amount;
                if (tx.type === 'received') runningBalance -= tx.amount;
                transactionsWithRunningBalance.push({ ...tx, runningBalance });
            });
            transactionsWithRunningBalance.reverse();

            
            transactionsWithRunningBalance.forEach(tx => {
                if (tx.type === 'gave') totalGave += tx.amount;
                if (tx.type === 'received') totalReceived += tx.amount;
                
                const row = document.createElement('div');
                row.className = 'tx-table-row';
                if (clickable) {
                    row.dataset.txId = tx.id;
                }
                const { datePart, yearPart, timePart } = formatTransactionDateForDisplay(tx.date);
                const descriptionHTML = tx.description ? `
                    <span class="tx-description-label">বিবরণ:</span> 
                    <span class="tx-description-text">${tx.description}</span>` : '';

                let balanceDisplay = 'হিসাব ০.০০';
                if (tx.runningBalance > 0) {
                    balanceDisplay = `<span style="color: var(--expense-color);">পাবো ${formatCurrency(tx.runningBalance, false)}</span>`;
                } else if (tx.runningBalance < 0) {
                    balanceDisplay = `<span style="color: var(--income-color);">দেবো ${formatCurrency(Math.abs(tx.runningBalance), false)}</span>`;
                }

                row.innerHTML = `
                    <div class="tx-col tx-col-details">
                        <div class="tx-date">${datePart}</div>
                        <div class="tx-date-year">${yearPart}</div>
                        <div class="tx-time">${timePart}</div>
                        ${descriptionHTML}
                        <div class="running-balance-chip">${balanceDisplay}</div>
                    </div>
                    <div class="tx-col tx-col-gave">
                        ${tx.type === 'gave' ? formatCurrency(tx.amount, false) : ''}
                    </div>
                    <div class="tx-col tx-col-received">
                        ${tx.type === 'received' ? formatCurrency(tx.amount, false) : ''}
                    </div>
                `;
                tableContainer.appendChild(row);
            });
            
            return { tableElement: tableContainer, totalGave, totalReceived, allTransactions };
        }

        function generateCustomerReportShareText(customer) {
            const ledgerName = ledgers[currentLedgerId]?.name || "আমার খাতা";
            const transactions = [...(customer.transactions || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
            let totalGave = 0;
            let totalReceived = 0;

            let text = `**${customer.name} - বাকি হিসাব রিপোর্ট**\n`;
            text += `খাতা: ${ledgerName}\n\n`;

            transactions.forEach(tx => {
                const { datePart, yearPart } = formatTransactionDateForDisplay(tx.date);
                text += `🗓️ ${datePart} ${yearPart}\n`;
                if (tx.type === 'gave') {
                    text += `🔴 দিলাম: ${formatCurrency(tx.amount)}\n`;
                    totalGave += tx.amount;
                }
                if (tx.type === 'received') {
                    text += `🟢 পেলাম: ${formatCurrency(tx.amount)}\n`;
                    totalReceived += tx.amount;
                }
                if (tx.description) {
                    text += `📝 বিবরণ: ${tx.description}\n`;
                }
                text += `--------------------\n`;
            });
            
            const finalBalance = totalGave - totalReceived;
            
            text += `\n**সর্বমোট:**\n`;
            text += `মোট দিলাম: ${formatCurrency(totalGave)}\n`;
            text += `মোট পেলাম: ${formatCurrency(totalReceived)}\n`;
            text += `**${finalBalance >= 0 ? 'পাবো' : 'দেবো'}: ${formatCurrency(Math.abs(finalBalance))}**\n\n`;
            text += `Talika.xyz থেকে পাঠানো হয়েছে`;
            
            return text.replace(/\*\*/g, '');
        }

        function showTransactionDetailModal(customerId, txId) {
            const tx = findTransactionById(customerId, txId);
            if (!tx) return;

            activeEditingTx = { customerId, txId };
            const container = document.getElementById('transactionDetailContent');
            const { datePart, yearPart, timePart } = formatTransactionDateForDisplay(tx.date);
            const descriptionHTML = tx.description ? `
                <span class="tx-description-label">বিবরণ:</span>
                <span class="tx-description-text">${tx.description}</span>` : '<i>কোনো বিবরণ নেই</i>';

            container.innerHTML = `
                 <div class="tx-table-header">
                    <div class="tx-col tx-col-details">বিবরণ</div>
                    <div class="tx-col tx-col-gave">দিলাম</div>
                    <div class="tx-col tx-col-received">পেলাম</div>
                </div>
                <div class="tx-table-row">
                     <div class="tx-col tx-col-details">
                        <div class="tx-date">${datePart}</div>
                        <div class="tx-date-year">${yearPart}</div>
                        <div class="tx-time">${timePart}</div>
                        ${descriptionHTML}
                    </div>
                    <div class="tx-col tx-col-gave">
                        ${tx.type === 'gave' ? formatCurrency(tx.amount) : ''}
                    </div>
                    <div class="tx-col tx-col-received">
                        ${tx.type === 'received' ? formatCurrency(tx.amount) : ''}
                    </div>
                </div>
            `;
            
            document.getElementById('transactionDetailDeleteBtn').onclick = () => deleteTransaction(customerId, txId);
            document.getElementById('transactionDetailEditBtn').onclick = () => showEditTransactionModal(customerId, txId);

            zIndexCounter++;
            transactionDetailModal.style.zIndex = zIndexCounter;
            transactionDetailModal.classList.add('active');
        }
        
        function showEditTransactionModal(customerId, txId) {
            const customer = findCustomerById(customerId);
            const tx = findTransactionById(customerId, txId);
            if (!customer || !tx) return;

            const customerInfoDiv = document.getElementById('editTransactionCustomerInfo');
            const initial = customer.name.trim().charAt(0).toUpperCase() || '?';
            const color = customerColors[Math.abs(customer.name.split("").reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) % customerColors.length];
            const balance = calculateCustomerBalance(customer);
            const balanceText = balance > 0 ? `পাবো ${formatCurrency(balance)}` : (balance < 0 ? `দেবো ${formatCurrency(Math.abs(balance))}` : 'হিসাব ০.০০');
            
            customerInfoDiv.innerHTML = `
                 <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="customer-initial-circle" style="background-color: ${color}; width: 35px; height: 35px; font-size: 1.1em;">${initial}</div>
                    <div>
                        <div style="font-weight: bold;">${customer.name}</div>
                        <div>${balanceText}</div>
                    </div>
                </div>
            `;
            
            document.getElementById('editGaveAmountInput').value = tx.type === 'gave' ? tx.amount : '';
            document.getElementById('editReceivedAmountInput').value = tx.type === 'received' ? tx.amount : '';
            document.getElementById('editDescriptionInput').value = tx.description;
            document.getElementById('editDateInput').value = formatDateForInput(new Date(tx.date));

            transactionDetailModal.classList.remove('active');
            zIndexCounter++;
            editTransactionModal.style.zIndex = zIndexCounter;
            editTransactionModal.classList.add('active');
        }

        async function deleteTransaction(customerId, txId) {
             const confirmed = await customConfirm('আপনি কি এই লেনদেনটি মুছে ফেলতে নিশ্চিত?');
             if (confirmed) {
                const customer = findCustomerById(customerId);
                if (!customer) return;
                const txIndex = customer.transactions.findIndex(t => t.id === txId);
                if (txIndex > -1) {
                    customer.transactions.splice(txIndex, 1);
                    
                    const updateKey = `ledgers.${currentLedgerId}.customers`;
                    await updateFirestore({ [updateKey]: ledgers[currentLedgerId].customers });
                    
                    showToast('লেনদেন মুছে ফেলা হয়েছে।');
                    transactionDetailModal.classList.remove('active');
                    showCustomerReportPage(customerId);
                    renderLedgerCustomerView();
                }
             }
        }
        
        async function saveEditedTransaction() {
            const { customerId, txId } = activeEditingTx;
            const customer = findCustomerById(customerId);
            const tx = findTransactionById(customerId, txId);
            if (!customer || !tx) return;
            
            const gaveAmount = parseFloat(document.getElementById('editGaveAmountInput').value) || 0;
            const receivedAmount = parseFloat(document.getElementById('editReceivedAmountInput').value) || 0;

            if (gaveAmount > 0 && receivedAmount > 0) { customAlert('একই সাথে "দিলাম" এবং "পেলাম" এন্ট্রি করা যাবে না।'); return; }
            if (gaveAmount === 0 && receivedAmount === 0) { customAlert('অনুগ্রহ করে টাকার পরিমাণ লিখুন।'); return; }

            tx.type = gaveAmount > 0 ? 'gave' : 'received';
            tx.amount = gaveAmount > 0 ? gaveAmount : receivedAmount;
            tx.description = document.getElementById('editDescriptionInput').value.trim();
            
            const newDate = document.getElementById('editDateInput').value;
            const oldDate = new Date(tx.date);
            const finalDate = new Date(newDate + 'T00:00:00');
            finalDate.setHours(oldDate.getHours(), oldDate.getMinutes(), oldDate.getSeconds());
            tx.date = finalDate.toISOString();
            
            const updateKey = `ledgers.${currentLedgerId}.customers`;
            await updateFirestore({ [updateKey]: ledgers[currentLedgerId].customers });
            
            showToast('লেনদেন আপডেট করা হয়েছে।');
            editTransactionModal.classList.remove('active');
            showCustomerReportPage(customerId);
            renderLedgerCustomerView();
        }

    })(); // End of IIFE