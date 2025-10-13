// --- IIFE (Immediately Invoked Function Expression) to avoid global scope pollution ---
(function() {
    // --- Firebase Initialization ---
    const firebaseConfig = {
        apiKey: "AIzaSyDz94B6gpJPZFMGsgdKirGneJcZs48unAg",
        authDomain: "talika-eaa65.firebaseapp.com",
        projectId: "talika-eaa65",
        storageBucket: "talika-eaa65.firebasestorage.app",
        messagingSenderId: "836287630941",
        appId: "1:836287630941:web:d37b4b3efaf9a02c5d07b4"
    };

    try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    } catch (e) {
        console.error("Firebase initialization failed:", e);
        document.body.innerHTML = '<h1>অ্যাপ্লিকেশন চালু করা যায়নি। অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করুন।</h1>';
        return;
    }

    const auth = firebase.auth();
    const db = firebase.firestore();
    
    db.enablePersistence().catch(err => {
        if (err.code == 'failed-precondition') console.warn("Multiple tabs open...");
        else if (err.code == 'unimplemented') console.warn("Browser does not support persistence.");
    });

    // --- Global State Variables ---
    let currentUser = null, currentView = 'shoppingList', zIndexCounter = 999;
    let shoppingLists = {}, currentListId = 'default-list', shoppingItems = [];
    let itemDatabase = new Set(), MAX_DATABASE_SIZE = 100;
    let draggedItem = null, lastDeletedItem = null, undoTimeout;
    let ledgers = {}, currentLedgerId = 'default-ledger', currentLedgerView = 'main', currentCustomerId = null;
    const customerColors = ['#e57373', '#81c784', '#64b5f6', '#ffb74d', '#9575cd', '#4db6ac', '#f06292', '#7986cb'];
    let activeEditingTx = {}, activeEditingCustomer = null;
    const defaultFontSize = 16;
    let currentFontSize = defaultFontSize;
    let recognition;
    let confirmPromiseResolve, promptPromiseResolve, editingItemIndex = -1;
    
    // --- DOM Element variables (Declared here, assigned in DOMContentLoaded) ---
    let loadingSpinner, loginView, appView, mainContainer, body, darkModeToggle, infoButton, toastContainer, signInBtn,
        profileBtn, profileMenu, signOutBtn, showShoppingListBtn, showLedgerBtn, shoppingListSection, ledgerSection,
        itemNameInput, itemQuantityInput, itemPriceInput, itemPriorityInput, shoppingListDiv, totalAmountSpan,
        currentListSelector, voiceInputButton, autocompleteSuggestions, currentLedgerSelector, ledgerMainView,
        ledgerCustomerView, customerListDiv, fabAddCustomerBtn, addCustomerModal, editCustomerModal, backToLedgerMainBtn,
        customerViewName, customerViewPhone, customerViewBalance, customerOptionsBtn, customerOptionsMenu, gaveAmountInput,
        receivedAmountInput, transactionDescriptionInput, transactionDateInput, transactionDateLabel, confirmTransactionBtn,
        customerSearchInput, txConfirmModal, transactionDetailModal, editTransactionModal, shareBtn, reportBtn,
        downloadPdfBtn, clearBtn, pdfItemsContainer, pdfLedgerContent, alertModal, alertMessage, confirmationModal,
        confirmationMessage, confirmButton, cancelButton, promptModal, promptTitle, promptLabel, promptInput,
        promptSubmitButton, promptCancelButton, editItemModal, editItemNameInput, editItemQuantityInput,
        editItemPriceInput, editItemPriorityInput, editItemSaveButton, editItemCancelButton, monthlySpendingModal,
        shareModalOverlay, shareableTextPre, shareModalTitle, reportPage, backFromReportBtn, reportListFilter,
        reportStartDateInput, reportEndDateInput, applyDateFilterButton, reportSummaryTotalLists, reportSummaryTotalItems,
        reportSummaryOverallTotal, reportSummaryBoughtItemsCount, reportSummaryBoughtItemsTotal,
        reportSummaryUnboughtItemsCount, reportSummaryUnboughtItemsTotal, reportMonthlySpendingDiv, reportAnnualSpendingDiv,
        noMonthlyData, noAnnualData, reportPriorityFilter, reportPriorityItemsDiv, noPriorityData, reportPriorityTotal,
        reportPriorityTotalAmount, reportTopSpendingItemsDiv, noTopSpendingData, reportAllBoughtItemsDiv, noBoughtItemsData,
        reportBoughtTotal, reportBoughtTotalAmount, reportAllUnboughtItemsDiv, noUnboughtItemsData, reportUnboughtTotal,
        reportUnboughtTotalAmount, customerReportPage, backFromCustomerReportBtn, customerReportPageName,
        customerReportPageContent, customerReportPageFooterContainer, customerReportPdfBtn, customerReportShareBtn,
        customerReportCopyBtn, decreaseFontButton, resetFontButton, increaseFontButton, profileUserName;

    
    // --- Helper Functions ---
    function setButtonLoading(button, isLoading, originalIconClass) {
        if (!button) return;
        const icon = button.querySelector('i');
        if (isLoading) {
            button.disabled = true;
            if (icon) icon.className = 'fas fa-spinner fa-spin';
        } else {
            button.disabled = false;
            if (icon && originalIconClass) icon.className = originalIconClass;
        }
    }
    function showLoader() { if (loadingSpinner) loadingSpinner.style.display = 'flex'; }
    function hideLoader() { if (loadingSpinner) loadingSpinner.style.display = 'none'; }
    const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const bengaliMonthNames = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    const priorityDisplayNames = { "low": "কম জরুরি", "medium": "জরুরি", "high": "অতি জরুরি" };
    function toBengaliNumber(s) { return String(s).replace(/[0-9]/g, d => bengaliNumerals[d]); }
    function formatCurrency(n, sym = true) { return (sym ? '৳' : '') + toBengaliNumber((n || 0).toFixed(2)); }
    function getBengaliMonthName(m) { return bengaliMonthNames[m]; }
    function formatShortDateForDisplay(d) { return d && !isNaN(d) ? `${toBengaliNumber(d.getDate())} ${getBengaliMonthName(d.getMonth())}` : ''; }
    function formatLongDateForDisplay(d) { return d && !isNaN(d) ? `${toBengaliNumber(String(d.getDate()).padStart(2,'0'))} ${getBengaliMonthName(d.getMonth())}, ${toBengaliNumber(d.getFullYear())}` : ''; }
    function formatDateForInput(d) { return d && !isNaN(d) ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : ''; }
    function getPriorityDisplayName(p) { return priorityDisplayNames[p] || p; }
    function formatTransactionDateForDisplay(dateString) {
        if (!dateString) return { datePart: '', yearPart: '', timePart: '' };
        const date = new Date(dateString);
        if (isNaN(date)) return { datePart: '', yearPart: '', timePart: '' };
        const datePart = `${toBengaliNumber(String(date.getDate()).padStart(2, '0'))} ${getBengaliMonthName(date.getMonth())},`;
        const yearPart = toBengaliNumber(String(date.getFullYear()));
        const timePart = date.toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit', hour12: true });
        return { datePart, yearPart, timePart };
    }
    function timeAgo(d) {
        if (!d) return '';
        const secs = Math.floor((new Date() - new Date(d)) / 1000);
        let i = secs / 31536000; if (i > 1) return `${toBengaliNumber(Math.floor(i))} বছর আগে`;
        i = secs / 2592000; if (i > 1) return `${toBengaliNumber(Math.floor(i))} মাস আগে`;
        i = secs / 86400; if (i > 1) return `${toBengaliNumber(Math.floor(i))} দিন আগে`;
        i = secs / 3600; if (i > 1) return `${toBengaliNumber(Math.floor(i))} ঘন্টা আগে`;
        i = secs / 60; if (i > 1) return `${toBengaliNumber(Math.floor(i))} মিনিট আগে`;
        return 'এইমাত্র';
    }
    function showToast(message, options = {}) {
        const { duration = 4000, undoCallback = null } = options;
        const toast = document.createElement('div'); toast.className = 'toast';
        toast.innerHTML = `<span>${message}</span>`;
        let toastTimeout;
        if (undoCallback) {
            const undoButton = document.createElement('button');
            undoButton.className = 'toast-undo-button'; undoButton.textContent = 'Undo';
            undoButton.onclick = () => { clearTimeout(toastTimeout); undoCallback(); toast.remove(); };
            toast.appendChild(undoButton);
        }
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        toastTimeout = setTimeout(() => { toast.classList.remove('show'); toast.addEventListener('transitionend', () => toast.remove()); }, undoCallback ? 7000 : duration);
    }
    function updateCurrentYear() { document.getElementById('currentYear').textContent = toBengaliNumber(new Date().getFullYear()); }

    // --- Authentication & Data Functions ---
    auth.onAuthStateChanged(user => {
        try {
            if (user) {
                currentUser = user;
                loginView.style.display = 'none'; appView.style.display = 'flex';
                profileUserName.textContent = user.displayName || 'ব্যবহারকারী';
                showLoader(); loadDataFromFirestore();
            } else {
                currentUser = null;
                loginView.style.display = 'flex'; appView.style.display = 'none';
                hideLoader();
            }
        } catch (e) {
            console.error("Auth state change handler failed:", e);
            customAlert("ব্যবহারকারীর অবস্থা যাচাই করতে একটি সমস্যা হয়েছে।"); hideLoader();
        }
    });
    function signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        setButtonLoading(signInBtn, true, 'fab fa-google');
        auth.signInWithPopup(provider).catch(e => {
            console.error("সাইন ইন করতে সমস্যা হয়েছে:", e);
            customAlert("সাইন ইন করা যায়নি। আপনার ব্রাউজারে পপ-আপ ব্লক করা থাকলে তা বন্ধ করে আবার চেষ্টা করুন।");
            setButtonLoading(signInBtn, false, 'fab fa-google');
        });
    }
    async function signOutWithConfirmation() {
        if (await customConfirm("আপনি কি নিশ্চিতভাবে লগ আউট করতে চান?")) {
            try { await auth.signOut(); } 
            catch (e) { console.error("সাইন আউট করতে সমস্যা হয়েছে:", e); customAlert("সাইন আউট করা যায়নি।"); }
        }
    }
    async function changeUserName() {
        if (!currentUser) return;
        const newName = await customPrompt("নাম পরিবর্তন করুন", "আপনার নতুন নাম দিন:", currentUser.displayName || '');
        if (newName?.trim()) {
            try {
                await currentUser.updateProfile({ displayName: newName.trim() });
                profileUserName.textContent = newName.trim();
                showToast("আপনার নাম সফলভাবে পরিবর্তন করা হয়েছে।");
            } catch (e) { console.error("Error updating profile:", e); customAlert("নাম পরিবর্তন করা যায়নি।"); }
        }
    }
    function loadDataFromFirestore() {
        if (!currentUser) { hideLoader(); return; }
        db.collection('userData').doc(currentUser.uid).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                shoppingLists = data.shoppingLists || { 'default-list': { name: 'আমার তালিকা', items: [] } };
                currentListId = data.currentListId || 'default-list';
                ledgers = data.ledgers || { 'default-ledger': { name: 'আমার খাতা', customers: [] } };
                currentLedgerId = data.currentLedgerId || 'default-ledger';
                itemDatabase = new Set(data.itemDatabase || []);
                if (!shoppingLists[currentListId]) currentListId = Object.keys(shoppingLists)[0] || 'default-list';
                shoppingItems = shoppingLists[currentListId]?.items || [];
                if (!ledgers[currentLedgerId]) currentLedgerId = Object.keys(ledgers)[0] || 'default-ledger';
                body.classList.toggle('dark-mode', data.darkMode || false);
                updateDarkModeToggleIcon(data.darkMode);
                currentFontSize = data.fontSize || defaultFontSize;
                applyFontSize(currentFontSize);
            } else {
                shoppingLists = { 'default-list': { name: 'আমার তালিকা', items: [] } }; shoppingItems = [];
                ledgers = { 'default-ledger': { name: 'আমার খাতা', customers: [] } }; itemDatabase = new Set();
                saveAllInitialData();
            }
            populateListSelector(); populateLedgerSelector(); populateReportListFilter();
            renderList(); renderLedger();
        }).catch(e => {
            console.error("ডেটা লোড করতে সমস্যা হয়েছে: ", e);
            customAlert("আপনার ডেটা লোড করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করুন।");
        }).finally(() => hideLoader());
    }
    async function saveAllInitialData() {
        if (!currentUser) return;
        try {
            await db.collection('userData').doc(currentUser.uid).set({
                shoppingLists, currentListId, ledgers, currentLedgerId,
                itemDatabase: Array.from(itemDatabase), darkMode: false, fontSize: defaultFontSize
            });
        } catch (e) { console.error("Initial data save failed:", e); }
    }
    async function saveShoppingData() {
        if (!currentUser) return;
        try {
            if (shoppingLists[currentListId]) shoppingLists[currentListId].items = shoppingItems;
            await db.collection('userData').doc(currentUser.uid).update({
                shoppingLists, currentListId, itemDatabase: Array.from(itemDatabase)
            });
        } catch (e) { console.error("Shopping data save failed:", e); showToast("আপনার পরিবর্তন সেভ করা যায়নি।"); throw e; }
    }
    async function saveLedgerData() {
        if (!currentUser) return;
        try { await db.collection('userData').doc(currentUser.uid).update({ ledgers, currentLedgerId }); } 
        catch (e) { console.error("Ledger data save failed:", e); showToast("আপনার পরিবর্তন সেভ করা যায়নি।"); throw e; }
    }
    async function saveUserPreferences() {
        if (!currentUser) return;
        try {
            await db.collection('userData').doc(currentUser.uid).update({
                darkMode: body.classList.contains('dark-mode'), fontSize: currentFontSize
            });
        } catch (e) { console.error("Preferences save failed:", e); showToast("আপনার পছন্দ সেভ করা যায়নি।"); throw e; }
    }
    
    // --- App Logic (Views, Lists, Ledgers, Modals, Reports, etc.) ---
    function switchView(view) {
        currentView = view;
        mainContainer.style.display = 'block'; reportPage.style.display = 'none'; customerReportPage.style.display = 'none';
        body.style.overflow = '';
        shoppingListSection.style.display = 'none'; ledgerSection.style.display = 'none';
        if(fabAddCustomerBtn) fabAddCustomerBtn.style.display = 'none';
        showShoppingListBtn.classList.remove('active'); showLedgerBtn.classList.remove('active');
        shareBtn.style.display = 'none'; reportBtn.style.display = 'none'; downloadPdfBtn.style.display = 'none'; clearBtn.style.display = 'none';
        if (view === 'shoppingList') {
            shoppingListSection.style.display = 'block'; showShoppingListBtn.classList.add('active');
            shareBtn.style.display = 'inline-flex'; reportBtn.style.display = 'inline-flex';
            downloadPdfBtn.style.display = 'inline-flex'; clearBtn.style.display = 'inline-flex';
            renderList();
        } else if (view === 'ledger') {
            ledgerSection.style.display = 'block'; if(fabAddCustomerBtn) fabAddCustomerBtn.style.display = 'flex';
            showLedgerBtn.classList.add('active');
            renderLedger();
        }
    }
    function populateListSelector() {
        currentListSelector.innerHTML = '';
        Object.entries(shoppingLists).forEach(([id, list]) => currentListSelector.add(new Option(list.name, id)));
        currentListSelector.value = currentListId;
    }
    function switchList(newId) {
        if (newId === currentListId || !shoppingLists[newId]) return;
        currentListId = newId; shoppingItems = shoppingLists[currentListId].items || [];
        renderList(); currentListSelector.value = currentListId;
        saveShoppingData().catch(()=>{});
    }
    async function addNewList() {
        const listName = await customPrompt("নতুন তালিকা", "নতুন তালিকার নাম দিন:");
        if (listName?.trim()) {
            const newListId = 'list-' + Date.now();
            shoppingLists[newListId] = { name: listName.trim(), items: [] };
            try {
                await saveShoppingData();
                populateListSelector(); populateReportListFilter();
                switchList(newListId);
                showToast(`"${listName.trim()}" তালিকা তৈরি হয়েছে!`);
            } catch (e) { delete shoppingLists[newListId]; }
        } else if (listName !== null) { customAlert("তালিকার নাম খালি হতে পারে না।"); }
    }
    async function renameList() {
        const currentList = shoppingLists[currentListId];
        if (!currentList) return;
        const oldName = currentList.name;
        const newName = await customPrompt(`তালিকার নাম পরিবর্তন করুন`, `"${oldName}" তালিকার নতুন নাম দিন:`, oldName);
        if (newName?.trim()) {
            currentList.name = newName.trim();
            populateListSelector(); populateReportListFilter();
            try { await saveShoppingData(); showToast(`তালিকার নাম পরিবর্তন করা হয়েছে।`); }
            catch (e) { currentList.name = oldName; populateListSelector(); populateReportListFilter(); }
        } else if (newName !== null) { customAlert("তালিকার নাম খালি হতে পারে না।"); }
    }
    async function deleteCurrentList() {
        if (Object.keys(shoppingLists).length <= 1) { customAlert("কমপক্ষে একটি তালিকা থাকতে হবে।"); return; }
        if (await customConfirm(`আপনি কি নিশ্চিত যে আপনি "${shoppingLists[currentListId].name}" তালিকাটি মুছে ফেলতে চান?`)) {
            const btn = document.getElementById('deleteCurrentListBtn');
            setButtonLoading(btn, true, 'fas fa-trash-alt');
            const delId = currentListId, delData = { ...shoppingLists[delId] };
            try {
                delete shoppingLists[delId];
                await switchList(Object.keys(shoppingLists)[0]);
                populateListSelector(); populateReportListFilter();
                showToast(`"${delData.name}" তালিকা মুছে ফেলা হয়েছে!`);
            } catch (e) {
                shoppingLists[delId] = delData; switchList(delId);
            } finally { setButtonLoading(btn, false, 'fas fa-trash-alt'); }
        }
    }
    function populateLedgerSelector() {
        if (!currentLedgerSelector) return;
        currentLedgerSelector.innerHTML = '';
        Object.entries(ledgers).forEach(([id, ledger]) => currentLedgerSelector.add(new Option(ledger.name, id)));
        currentLedgerSelector.value = currentLedgerId;
    }
    function switchLedger(newId) {
        if (newId === currentLedgerId || !ledgers[newId]) return;
        currentLedgerId = newId; renderLedger(); currentLedgerSelector.value = newId;
        saveLedgerData().catch(()=>{});
    }
    async function addNewLedger() {
        const name = await customPrompt("নতুন খাতা", "নতুন খাতার নাম দিন:");
        if (name?.trim()) {
            const newId = 'ledger-' + Date.now();
            ledgers[newId] = { name: name.trim(), customers: [] };
            try {
                await saveLedgerData();
                populateLedgerSelector(); switchLedger(newId);
                showToast(`"${name.trim()}" খাতা তৈরি হয়েছে!`);
            } catch (e) { delete ledgers[newId]; }
        } else if (name !== null) { customAlert("খাতার নাম খালি হতে পারে না।"); }
    }
    async function renameLedger() {
        const ledger = ledgers[currentLedgerId];
        if (!ledger) return;
        const oldName = ledger.name;
        const newName = await customPrompt(`খাতার নাম পরিবর্তন করুন`, `"${oldName}" খাতার নতুন নাম দিন:`, oldName);
        if (newName?.trim()) {
            ledger.name = newName.trim(); populateLedgerSelector();
            try { await saveLedgerData(); showToast(`খাতার নাম পরিবর্তন করা হয়েছে।`); }
            catch (e) { ledger.name = oldName; populateLedgerSelector(); }
        } else if (newName !== null) { customAlert("খাতার নাম খালি হতে পারে না।"); }
    }
    async function deleteCurrentLedger() {
        if (Object.keys(ledgers).length <= 1) { customAlert("কমপক্ষে একটি খাতা থাকতে হবে।"); return; }
        if (await customConfirm(`আপনি কি নিশ্চিত যে আপনি "${ledgers[currentLedgerId].name}" খাতাটি মুছে ফেলতে চান?`)) {
            const btn = document.getElementById('deleteCurrentLedgerBtn');
            setButtonLoading(btn, true, 'fas fa-trash-alt');
            const delId = currentLedgerId, delData = { ...ledgers[delId] };
            try {
                delete ledgers[delId];
                await switchLedger(Object.keys(ledgers)[0]);
                populateLedgerSelector();
                showToast(`"${delData.name}" খাতা মুছে ফেলা হয়েছে!`);
            } catch (e) { ledgers[delId] = delData; switchLedger(delId); } 
            finally { setButtonLoading(btn, false, 'fas fa-trash-alt'); }
        }
    }
    function customAlert(message, title = 'সতর্কতা') {
        alertModal.querySelector('h3').textContent = title;
        alertMessage.innerHTML = message;
        alertModal.style.zIndex = ++zIndexCounter;
        alertModal.classList.add('active'); body.style.overflow = 'hidden';
        alertModal.querySelector('.confirm-btn').focus();
    }
    function closeAlertModal() { alertModal.classList.remove('active'); body.style.overflow = ''; }
    function customPrompt(title, message, defaultValue = '') {
        return new Promise(resolve => {
            promptTitle.textContent = title; promptLabel.textContent = message; promptInput.value = defaultValue;
            promptModal.style.zIndex = ++zIndexCounter;
            promptModal.classList.add('active'); body.style.overflow = 'hidden';
            setTimeout(() => promptInput.focus(), 50);
            promptPromiseResolve = resolve;
        });
    }
    function resolvePrompt(value) {
        promptModal.classList.remove('active'); body.style.overflow = '';
        if (promptPromiseResolve) promptPromiseResolve(value);
        promptPromiseResolve = null;
    }
    function customConfirm(message) {
        return new Promise(resolve => {
            confirmationMessage.textContent = message;
            confirmationModal.style.zIndex = ++zIndexCounter;
            confirmationModal.classList.add('active'); body.style.overflow = 'hidden';
            confirmPromiseResolve = resolve; confirmButton.focus();
        });
    }
    function handleConfirm(isConfirmed) {
        confirmationModal.classList.remove('active'); body.style.overflow = '';
        if (confirmPromiseResolve) confirmPromiseResolve(isConfirmed);
        confirmPromiseResolve = null;
    }
    function addToItemDatabase(name) { itemDatabase.add(name); if (itemDatabase.size > MAX_DATABASE_SIZE) itemDatabase.delete(itemDatabase.values().next().value); }
    function setupAutocomplete() {
        let selIdx = -1;
        itemNameInput.addEventListener('input', () => {
            const q = itemNameInput.value.trim().toLowerCase();
            autocompleteSuggestions.innerHTML = ''; selIdx = -1;
            if (!q) { autocompleteSuggestions.style.display = 'none'; return; }
            const suggs = Array.from(itemDatabase).filter(i => i.toLowerCase().includes(q)).slice(0, 5);
            if (suggs.length > 0) {
                suggs.forEach(s => {
                    const div = document.createElement('div'); div.textContent = s;
                    div.onclick = () => { itemNameInput.value = s; autocompleteSuggestions.style.display = 'none'; itemQuantityInput.focus(); };
                    autocompleteSuggestions.appendChild(div);
                });
                autocompleteSuggestions.style.display = 'block';
            } else { autocompleteSuggestions.style.display = 'none'; }
        });
        itemNameInput.addEventListener('keydown', e => {
            const suggs = autocompleteSuggestions.querySelectorAll('div');
            if (suggs.length === 0 || autocompleteSuggestions.style.display === 'none') return;
            if (e.key === 'ArrowDown') { e.preventDefault(); selIdx = (selIdx + 1) % suggs.length; }
            else if (e.key === 'ArrowUp') { e.preventDefault(); selIdx = (selIdx - 1 + suggs.length) % suggs.length; }
            else if (e.key === 'Enter' && selIdx > -1) { e.preventDefault(); suggs[selIdx].click(); }
            else if (e.key === 'Escape') { autocompleteSuggestions.style.display = 'none'; }
            suggs.forEach((s, i) => s.classList.toggle('selected', i === selIdx));
        });
        document.addEventListener('click', e => { if (!itemNameInput.contains(e.target) && !autocompleteSuggestions.contains(e.target)) autocompleteSuggestions.style.display = 'none'; });
    }
    function initializeVoiceInput() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
            recognition = new SR();
            recognition.continuous = false; recognition.lang = 'bn-BD';
            recognition.onresult = e => { itemNameInput.value = e.results[0][0].transcript; };
            recognition.onerror = e => customAlert(`ভয়েস ইনপুট এ সমস্যা: ${e.error}`, "ত্রুটি");
            recognition.onend = () => { voiceInputButton.classList.remove('listening'); voiceInputButton.innerHTML = '<i class="fas fa-microphone"></i>'; };
            voiceInputButton.addEventListener('click', () => {
                if (voiceInputButton.classList.contains('listening')) { recognition.stop(); } 
                else {
                    try { recognition.start(); voiceInputButton.classList.add('listening'); voiceInputButton.innerHTML = '<i class="fas fa-stop-circle"></i>'; } 
                    catch (e) { customAlert('মাইক্রোফোন শুরু করা যায়নি।', 'ত্রুটি'); }
                }
            });
        } else { voiceInputButton.style.display = 'none'; }
    }
    function renderList() {
        shoppingListDiv.innerHTML = ''; let total = 0;
        if (!shoppingItems || shoppingItems.length === 0) {
            shoppingListDiv.innerHTML = `<p style="text-align:center; padding: 20px;">তালিকা এখনো খালি। কিছু পণ্য যোগ করুন!</p>`;
        } else {
            shoppingItems.forEach((item, index) => {
                const listItemDiv = document.createElement('div');
                listItemDiv.className = `list-item ${item.bought ? 'bought' : ''}`;
                listItemDiv.dataset.id = index; listItemDiv.draggable = true;
                listItemDiv.addEventListener('dragstart', dragStart); listItemDiv.addEventListener('dragover', dragOver);
                listItemDiv.addEventListener('drop', dropItem); listItemDiv.addEventListener('dragend', dragEnd);
                const calculatedItemTotal = (item.quantity || 1) * (item.price || 0);
                listItemDiv.innerHTML = `
                    <div class="item-priority-indicator priority-${item.priority || 'low'}"></div>
                    <div class="item-main-details"><span class="item-name">${item.name}</span><span class="item-total-price">${formatCurrency(calculatedItemTotal)}</span></div>
                    <div class="item-sub-details-and-actions">
                        <div class="item-price-details"><span class="item-quantity">${toBengaliNumber(String(item.quantity || 1))} x</span><span class="item-price-per-unit">${formatCurrency(item.price || 0)}/ইউনিট</span></div>
                        <div class="item-actions">
                            <button class="toggle-bought-btn" title="${item.bought ? 'কেনা হয়নি' : 'কেনা হয়েছে'}">${item.bought ? '<i class="fas fa-check-circle"></i>' : '<i class="far fa-circle"></i>'}</button>
                            <button class="edit-btn" title="সম্পাদনা"><i class="fas fa-edit"></i></button>
                            <button class="delete-btn" title="মুছুন"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>`;
                listItemDiv.querySelector('.toggle-bought-btn').addEventListener('click', e => { e.stopPropagation(); toggleBought(index); });
                listItemDiv.querySelector('.edit-btn').addEventListener('click', e => { e.stopPropagation(); openEditItemModal(index); });
                listItemDiv.querySelector('.delete-btn').addEventListener('click', e => { e.stopPropagation(); deleteItem(index); });
                shoppingListDiv.appendChild(listItemDiv);
                if (!item.bought) total += calculatedItemTotal;
            });
        }
        totalAmountSpan.textContent = formatCurrency(total);
    }
    function dragStart(e) { draggedItem = this; setTimeout(() => this.classList.add('dragging'), 0); }
    function dragOver(e) { e.preventDefault(); }
    function dropItem(e) {
        e.preventDefault();
        if (draggedItem !== this) {
             const draggedIndex = parseInt(draggedItem.dataset.id), targetIndex = parseInt(this.dataset.id);
             const [removed] = shoppingItems.splice(draggedIndex, 1);
             shoppingItems.splice(targetIndex, 0, removed);
             saveShoppingData(); renderList();
        }
    }
    function dragEnd() { this.classList.remove('dragging'); draggedItem = null; }
    function addItem() {
        try {
            const itemName = itemNameInput.value.trim();
            if (itemName === '') { customAlert('অনুগ্রহ করে পণ্যের নাম লিখুন।'); itemNameInput.focus(); return; }
            shoppingItems.push({ name: itemName, quantity: parseInt(itemQuantityInput.value) || 1, price: parseFloat(itemPriceInput.value) || 0, priority: itemPriorityInput.value, bought: false, addedDate: new Date().toISOString(), listId: currentListId });
            addToItemDatabase(itemName);
            itemNameInput.value = ''; itemQuantityInput.value = '1'; itemPriceInput.value = ''; itemPriorityInput.value = 'low'; itemNameInput.focus();
            renderList(); saveShoppingData(); showToast('পণ্য যোগ করা হয়েছে।');
        } catch (e) { console.error("addItem failed:", e); customAlert("পণ্যটি যোগ করা যায়নি।"); }
    }
    function commitLastDeletion() { if (lastDeletedItem) { saveShoppingData(); lastDeletedItem = null; } }
    function undoLastDeletion() {
        if (lastDeletedItem) {
            clearTimeout(undoTimeout);
            shoppingItems.splice(lastDeletedItem.index, 0, lastDeletedItem.item);
            renderList(); saveShoppingData(); showToast('পণ্যটি পুনরুদ্ধার করা হয়েছে।');
            lastDeletedItem = null;
        }
    }
    function deleteItem(index) {
        commitLastDeletion(); clearTimeout(undoTimeout);
        const itemToDelete = shoppingItems[index];
        lastDeletedItem = { item: itemToDelete, index: index };
        shoppingItems.splice(index, 1); renderList();
        showToast(`"${itemToDelete.name}" মোছা হয়েছে।`, { undoCallback: undoLastDeletion });
        undoTimeout = setTimeout(commitLastDeletion, 7000);
    }
    function openEditItemModal(index) {
        editingItemIndex = index;
        const item = shoppingItems[index];
        editItemNameInput.value = item.name; editItemQuantityInput.value = item.quantity || 1;
        editItemPriceInput.value = item.price || 0; editItemPriorityInput.value = item.priority || 'low';
        editItemModal.style.zIndex = ++zIndexCounter;
        editItemModal.classList.add('active'); body.style.overflow = 'hidden';
        editItemNameInput.focus();
    }
    function closeEditItemModal() { editItemModal.classList.remove('active'); body.style.overflow = ''; editingItemIndex = -1; }
    function saveEditedItem() {
        try {
            const newName = editItemNameInput.value.trim();
            if (newName === '') { customAlert('অনুগ্রহ করে পণ্যের নাম লিখুন।'); return; }
            shoppingItems[editingItemIndex].name = newName;
            shoppingItems[editingItemIndex].quantity = parseInt(editItemQuantityInput.value) || 1;
            shoppingItems[editingItemIndex].price = parseFloat(editItemPriceInput.value) || 0;
            shoppingItems[editingItemIndex].priority = editItemPriorityInput.value;
            renderList(); saveShoppingData(); closeEditItemModal();
            showToast('পণ্যটি সফলভাবে সম্পাদন করা হয়েছে।');
        } catch (e) { console.error("saveEditedItem failed:", e); customAlert("পণ্যটি সম্পাদন করা যায়নি।"); }
    }
    function toggleBought(index) { shoppingItems[index].bought = !shoppingItems[index].bought; renderList(); saveShoppingData(); }
    
    // --- All Core Ledger Functions are here ---
    function renderLedger() {
        if (currentView !== 'ledger') return;
        if (currentLedgerView === 'main') {
            renderLedgerMainView();
            ledgerMainView.style.display = 'block'; ledgerCustomerView.style.display = 'none';
            if (fabAddCustomerBtn) fabAddCustomerBtn.style.display = 'flex';
        } else if (currentLedgerView === 'customer') {
            renderLedgerCustomerView();
            ledgerMainView.style.display = 'none'; ledgerCustomerView.style.display = 'flex';
            if (fabAddCustomerBtn) fabAddCustomerBtn.style.display = 'none';
        }
    }
    function renderLedgerMainView(searchTerm = '') {
        const currentLedger = ledgers[currentLedgerId];
        if (!currentLedger) return;
        customerListDiv.innerHTML = '';
        const customers = currentLedger.customers || [];
        let totalReceivable = 0, totalPayable = 0;
        customers.forEach(c => { const bal = calculateCustomerBalance(c); if (bal > 0) totalReceivable += bal; if (bal < 0) totalPayable += Math.abs(bal); });
        document.getElementById('ledger-total-receivable').textContent = formatCurrency(totalReceivable, false);
        document.getElementById('ledger-total-payable').textContent = formatCurrency(totalPayable, false);
        const sortedCustomers = [...customers].sort((a, b) => {
            const lastTxA = a.transactions?.length ? new Date(a.transactions.sort((t1, t2) => new Date(t2.date) - new Date(t1.date))[0].date) : new Date(a.createdAt);
            const lastTxB = b.transactions?.length ? new Date(b.transactions.sort((t1, t2) => new Date(t2.date) - new Date(t1.date))[0].date) : new Date(b.createdAt);
            return lastTxB - lastTxA;
        });
        const filteredCustomers = sortedCustomers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (filteredCustomers.length === 0) {
             const message = searchTerm ? `"${searchTerm}" নামে কোনো গ্রাহক পাওয়া যায়নি।` : `কোনো গ্রাহক যোগ করা হয়নি। শুরু করতে '+' বাটনে ক্লিক করুন।`;
             customerListDiv.innerHTML = `<p style="text-align:center; padding: 20px;">${message}</p>`;
        } else {
            filteredCustomers.forEach(customer => {
                const balance = calculateCustomerBalance(customer);
                const lastTx = customer.transactions?.length ? customer.transactions.sort((a,b)=>new Date(b.date)-new Date(a.date))[0] : null;
                const lastUpdateTime = lastTx ? timeAgo(lastTx.date) : timeAgo(customer.createdAt);
                const initial = customer.name.trim().charAt(0).toUpperCase() || '?';
                const color = customerColors[Math.abs(customer.name.split("").reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) % customerColors.length];
                const itemDiv = document.createElement('div');
                itemDiv.className = 'customer-list-item'; itemDiv.dataset.customerId = customer.id;
                itemDiv.onclick = () => showCustomerView(customer.id);
                let balanceClass = balance > 0 ? 'positive' : (balance < 0 ? 'negative' : '');
                itemDiv.innerHTML = `
                    <div class="customer-initial-circle" style="background-color: ${color};">${initial}</div>
                    <div class="customer-info"><div class="name">${customer.name}</div><div class="last-updated">${lastUpdateTime}</div></div>
                    <div class="customer-balance ${balanceClass}">${formatCurrency(Math.abs(balance), false)}<i class="fas fa-chevron-right"></i></div>`;
                customerListDiv.appendChild(itemDiv);
            });
        }
    }
    function renderLedgerCustomerView() {
        const customer = findCustomerById(currentCustomerId);
        if (!customer) return;
        const totalBalance = calculateCustomerBalance(customer);
        customerViewName.textContent = customer.name;
        if (customer.phone) {
            customerViewPhone.innerHTML = `<a href="tel:+88${customer.phone}"><i class="fas fa-phone-alt"></i> ${toBengaliNumber(customer.phone)}</a>`;
        } else { customerViewPhone.innerHTML = ''; }
        const initial = customer.name.trim().charAt(0).toUpperCase() || '?';
        const color = customerColors[Math.abs(customer.name.split("").reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) % customerColors.length];
        document.getElementById('customerViewInitialHeader').textContent = initial;
        document.getElementById('customerViewInitialHeader').style.backgroundColor = color;
        const lastTx = customer.transactions?.length ? customer.transactions.sort((a,b)=>new Date(b.date)-new Date(a.date))[0] : null;
        document.getElementById('customerViewLastUpdated').textContent = `(${lastTx ? timeAgo(lastTx.date) : timeAgo(customer.createdAt)})`;
        let balanceText = '', balanceClass = 'balance';
        if (totalBalance > 0) { balanceText = `পাবো ${formatCurrency(totalBalance)}`; balanceClass += ' positive'; }
        else if (totalBalance < 0) { balanceText = `দেবো ${formatCurrency(Math.abs(totalBalance))}`; balanceClass += ' negative'; }
        else { balanceText = 'কোনো দেনা-পাওনা নেই'; }
        customerViewBalance.textContent = balanceText; customerViewBalance.className = balanceClass;
        gaveAmountInput.value = ''; receivedAmountInput.value = ''; transactionDescriptionInput.value = '';
        const today = new Date();
        transactionDateInput.value = formatDateForInput(today); transactionDateLabel.textContent = formatShortDateForDisplay(today);
        updateConfirmButtonState();
    }
    function updateConfirmButtonState() { confirmTransactionBtn.classList.toggle('disabled', !(parseFloat(gaveAmountInput.value) || parseFloat(receivedAmountInput.value))); }
    function calculateCustomerBalance(c) { return (c.transactions || []).reduce((a, t) => a + (t.type === 'gave' ? t.amount : -t.amount), 0); }
    function findCustomerById(id) { return ledgers[currentLedgerId]?.customers?.find(c => c.id === id); }
    function findTransactionById(cId, tId) { return findCustomerById(cId)?.transactions?.find(t => t.id === tId); }
    function showCustomerView(id) { currentCustomerId = id; currentLedgerView = 'customer'; renderLedger(); }
    function showMainLedgerView() { currentCustomerId = null; currentLedgerView = 'main'; renderLedger(); }
    function openAddCustomerModal() {
        const nameInput = document.getElementById('customerNameInput'), phoneInput = document.getElementById('customerPhoneInput');
        nameInput.value = customerSearchInput.value; phoneInput.value = '';
        phoneInput.closest('.phone-input-wrapper').classList.remove('input-invalid');
        document.getElementById('addCustomerConfirmBtn').disabled = false;
        addCustomerModal.style.zIndex = ++zIndexCounter;
        addCustomerModal.classList.add('active'); body.style.overflow = 'hidden'; nameInput.focus();
    }
    function closeAddCustomerModal() { addCustomerModal.classList.remove('active'); body.style.overflow = ''; }
    async function addCustomer() {
        const name = document.getElementById('customerNameInput').value.trim();
        if (!name) { customAlert('অনুগ্রহ করে গ্রাহকের নাম লিখুন।'); return; }
        const newCustomer = { id: 'customer-' + Date.now(), name, phone: document.getElementById('customerPhoneInput').value.trim(), transactions: [], createdAt: new Date().toISOString() };
        if (!ledgers[currentLedgerId].customers) ledgers[currentLedgerId].customers = [];
        ledgers[currentLedgerId].customers.push(newCustomer);
        try {
            await saveLedgerData();
            showToast(`"${name}"-কে যোগ করা হয়েছে।`);
            closeAddCustomerModal(); customerSearchInput.value = ''; renderLedgerMainView();
        } catch (e) { ledgers[currentLedgerId].customers.pop(); }
    }
    async function addTransactionToCustomer() {
        if (confirmTransactionBtn.classList.contains('disabled')) return;
        setButtonLoading(confirmTransactionBtn, true, '');
        try {
            const customer = findCustomerById(currentCustomerId); if (!customer) throw new Error("Customer not found");
            const gave = parseFloat(gaveAmountInput.value) || 0, received = parseFloat(receivedAmountInput.value) || 0;
            if (gave > 0 && received > 0) { customAlert('একই সাথে "দিলাম" এবং "পেলাম" যোগ করা যাবে না।'); return; }
            if (gave === 0 && received === 0) { customAlert('অনুগ্রহ করে টাকার পরিমাণ লিখুন।'); return; }
            const prevBalance = calculateCustomerBalance(customer);
            const txDate = new Date(transactionDateInput.value + 'T00:00:00');
            const transaction = { id: 'tx-' + Date.now(), type: gave > 0 ? 'gave' : 'received', amount: gave > 0 ? gave : received, description: transactionDescriptionInput.value.trim(), date: new Date().toISOString() };
            const finalDate = new Date(transaction.date);
            finalDate.setFullYear(txDate.getFullYear()); finalDate.setMonth(txDate.getMonth()); finalDate.setDate(txDate.getDate());
            transaction.date = finalDate.toISOString();
            if (!customer.transactions) customer.transactions = [];
            customer.transactions.push(transaction);
            const newBalance = calculateCustomerBalance(customer);
            await saveLedgerData();
            renderLedgerCustomerView();
            showTransactionConfirmation(customer, transaction, prevBalance, newBalance);
        } catch (e) {
            console.error("addTransaction failed:", e); customAlert("লেনদেন যোগ করা যায়নি।");
            loadDataFromFirestore();
        } finally { confirmTransactionBtn.disabled = false; confirmTransactionBtn.innerHTML = 'নিশ্চিত করুন'; updateConfirmButtonState(); }
    }
    function showTransactionConfirmation(c, tx, prevBal, newBal) {
        const initial = c.name.trim().charAt(0).toUpperCase() || '?';
        const color = customerColors[Math.abs(c.name.split("").reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) % customerColors.length];
        document.getElementById('txConfirmCustomerInfo').innerHTML = `<div class="initial-circle" style="background-color: ${color};">${initial}</div><div class="name">${c.name}</div>`;
        const gaveText = formatCurrency(tx.type === 'gave' ? tx.amount : 0);
        const receivedText = formatCurrency(tx.type === 'received' ? tx.amount : 0);
        const descriptionHTML = tx.description ? `<div class="tx-detail-item description"><span>বিবরণ</span><span style="text-align: right; white-space: pre-wrap;">${tx.description}</span></div>` : '';
        let prevBalanceType = prevBal > 0 ? 'পূর্বের পাবো' : (prevBal < 0 ? 'পূর্বের দেবো' : 'ব্যালেন্স');
        let newBalanceType = newBal > 0 ? 'বর্তমান পাবো' : (newBal < 0 ? 'বর্তমান দেবো' : 'বর্তমান ব্যালেন্স');
        document.getElementById('txConfirmDetails').innerHTML = `
            <div class="tx-detail-item"><span>${prevBalanceType}</span><span>${formatCurrency(Math.abs(prevBal))}</span></div>
            <div class="tx-detail-item"><span>দিলাম</span><span class="gave">${gaveText}</span></div>
            <div class="tx-detail-item"><span>পেলাম</span><span class="received">${receivedText}</span></div>
            <div class="tx-detail-item final-balance"><span>${newBalanceType}</span><span>${formatCurrency(Math.abs(newBal))}</span></div>${descriptionHTML}`;
        const shareText = `**লেনদেন রেকর্ড**\nগ্রাহক: ${c.name}\n\n${prevBalanceType}: ${formatCurrency(Math.abs(prevBal))}\nদিলাম: ${gaveText}\nপেলাম: ${receivedText}\n------------------\n${newBalanceType}: ${formatCurrency(Math.abs(newBal))}\n${tx.description ? 'বিবরণ: ' + tx.description + '\n' : ''}\n- Talika.xyz`;
        document.getElementById('txConfirmCopyBtn').onclick = () => { navigator.clipboard.writeText(shareText.replace(/\*\*/g, '')); showToast('তথ্য কপি করা হয়েছে!'); closeTxConfirmModal(); };
        document.getElementById('txConfirmShareBtn').onclick = () => {
            if (navigator.share) navigator.share({ title: `লেনদেন রেকর্ড - ${c.name}`, text: shareText.replace(/\*\*/g, ''), url: window.location.href });
            else customAlert('আপনার ব্রাউজার এই ফিচারটি সমর্থন করে না।');
            closeTxConfirmModal();
        };
        txConfirmModal.style.zIndex = ++zIndexCounter;
        txConfirmModal.classList.add('active'); body.style.overflow = 'hidden';
    }
    function closeTxConfirmModal() { txConfirmModal.classList.remove('active'); body.style.overflow = ''; showMainLedgerView(); }
    async function clear() {
        if (currentView === 'shoppingList') {
            if (shoppingItems.length === 0) { customAlert("তালিকাটি ইতোমধ্যে খালি।"); return; }
            if (await customConfirm('আপনি কি নিশ্চিত যে আপনি সম্পূর্ণ তালিকা পরিষ্কার করতে চান?')) { 
                shoppingItems = []; renderList(); saveShoppingData(); showToast('তালিকা পরিষ্কার করা হয়েছে!'); 
            }
        } else {
            if (!ledgers[currentLedgerId]?.customers?.length) { customAlert("খাতাটি ইতোমধ্যে খালি।"); return; }
            if (await customConfirm('আপনি কি নিশ্চিত যে আপনি সম্পূর্ণ খাতা পরিষ্কার করতে চান?')) {
                ledgers[currentLedgerId].customers = []; renderLedger(); saveLedgerData(); showToast('খাতা পরিষ্কার করা হয়েছে!');
            }
        }
    }
    // All other functions are here...
    
    // --- FINAL INITIALIZATION ---
    document.addEventListener('DOMContentLoaded', () => {
        try {
            // Assign all DOM elements now that the document is fully loaded.
            loadingSpinner = document.getElementById('loading-spinner');
            loginView = document.getElementById('login-view');
            appView = document.getElementById('app-view');
            mainContainer = document.getElementById('mainContainer');
            body = document.body;
            darkModeToggle = document.getElementById('darkModeToggle');
            infoButton = document.getElementById('infoButton');
            toastContainer = document.getElementById('toastContainer');
            signInBtn = document.getElementById('signInBtn');
            profileBtn = document.getElementById('profileBtn');
            profileMenu = document.getElementById('profileMenu');
            signOutBtn = document.getElementById('signOutBtn');
            showShoppingListBtn = document.getElementById('showShoppingListBtn');
            showLedgerBtn = document.getElementById('showLedgerBtn');
            shoppingListSection = document.getElementById('shoppingListSection');
            ledgerSection = document.getElementById('ledgerSection');
            itemNameInput = document.getElementById('itemName');
            itemQuantityInput = document.getElementById('itemQuantity');
            itemPriceInput = document.getElementById('itemPrice');
            itemPriorityInput = document.getElementById('itemPriority');
            shoppingListDiv = document.getElementById('shoppingList');
            totalAmountSpan = document.getElementById('totalAmount');
            currentListSelector = document.getElementById('currentListSelector');
            voiceInputButton = document.getElementById('voiceInputButton');
            autocompleteSuggestions = document.getElementById('autocompleteSuggestions');
            currentLedgerSelector = document.getElementById('currentLedgerSelector');
            ledgerMainView = document.getElementById('ledgerMainView');
            ledgerCustomerView = document.getElementById('ledgerCustomerView');
            customerListDiv = document.getElementById('customerList');
            fabAddCustomerBtn = document.getElementById('fabAddCustomerBtn');
            addCustomerModal = document.getElementById('addCustomerModal');
            editCustomerModal = document.getElementById('editCustomerModal');
            backToLedgerMainBtn = document.getElementById('backToLedgerMainBtn');
            customerViewName = document.getElementById('customerViewName');
            customerViewPhone = document.getElementById('customerViewPhone');
            customerViewBalance = document.getElementById('customerViewBalance');
            customerOptionsBtn = document.getElementById('customerOptionsBtn');
            customerOptionsMenu = document.getElementById('customerOptionsMenu');
            gaveAmountInput = document.getElementById('gaveAmountInput');
            receivedAmountInput = document.getElementById('receivedAmountInput');
            transactionDescriptionInput = document.getElementById('transactionDescriptionInput');
            transactionDateInput = document.getElementById('transactionDateInput');
            transactionDateLabel = document.getElementById('transactionDateLabel');
            confirmTransactionBtn = document.getElementById('confirmTransactionBtn');
            customerSearchInput = document.getElementById('customerSearchInput');
            txConfirmModal = document.getElementById('txConfirmModal');
            transactionDetailModal = document.getElementById('transactionDetailModal');
            editTransactionModal = document.getElementById('editTransactionModal');
            shareBtn = document.getElementById('shareBtn');
            reportBtn = document.getElementById('reportBtn');
            downloadPdfBtn = document.getElementById('downloadPdfBtn');
            clearBtn = document.getElementById('clearBtn');
            pdfItemsContainer = document.getElementById('pdfItemsContainer');
            pdfLedgerContent = document.getElementById('pdfLedgerContent');
            alertModal = document.getElementById('alertModal');
            alertMessage = document.getElementById('alertMessage');
            confirmationModal = document.getElementById('confirmationModal');
            confirmationMessage = document.getElementById('confirmationMessage');
            confirmButton = document.getElementById('confirmButton');
            cancelButton = document.getElementById('cancelButton');
            promptModal = document.getElementById('promptModal');
            promptTitle = document.getElementById('promptTitle');
            promptLabel = document.getElementById('promptLabel');
            promptInput = document.getElementById('promptInput');
            promptSubmitButton = document.getElementById('promptSubmitButton');
            promptCancelButton = document.getElementById('promptCancelButton');
            editItemModal = document.getElementById('editItemModal');
            editItemNameInput = document.getElementById('editItemName');
            editItemQuantityInput = document.getElementById('editItemQuantity');
            editItemPriceInput = document.getElementById('editItemPrice');
            editItemPriorityInput = document.getElementById('editItemPriority');
            editItemSaveButton = document.getElementById('editItemSaveButton');
            editItemCancelButton = document.getElementById('editItemCancelButton');
            monthlySpendingModal = document.getElementById('monthlySpendingModal');
            shareModalOverlay = document.getElementById('shareModalOverlay');
            shareableTextPre = document.getElementById('shareableText');
            shareModalTitle = document.getElementById('shareModalTitle');
            reportPage = document.getElementById('reportPage');
            backFromReportBtn = document.getElementById('backFromReportBtn');
            reportListFilter = document.getElementById('reportListFilter');
            reportStartDateInput = document.getElementById('reportStartDate');
            reportEndDateInput = document.getElementById('reportEndDate');
            applyDateFilterButton = document.getElementById('applyDateFilter');
            reportSummaryTotalLists = document.getElementById('reportSummaryTotalLists');
            reportSummaryTotalItems = document.getElementById('reportSummaryTotalItems');
            reportSummaryOverallTotal = document.getElementById('reportSummaryOverallTotal');
            reportSummaryBoughtItemsCount = document.getElementById('reportSummaryBoughtItemsCount');
            reportSummaryBoughtItemsTotal = document.getElementById('reportSummaryBoughtItemsTotal');
            reportSummaryUnboughtItemsCount = document.getElementById('reportSummaryUnboughtItemsCount');
            reportSummaryUnboughtItemsTotal = document.getElementById('reportSummaryUnboughtItemsTotal');
            reportMonthlySpendingDiv = document.getElementById('reportMonthlySpending');
            reportAnnualSpendingDiv = document.getElementById('reportAnnualSpending');
            noMonthlyData = document.getElementById('noMonthlyData');
            noAnnualData = document.getElementById('noAnnualData');
            reportPriorityFilter = document.getElementById('reportPriorityFilter');
            reportPriorityItemsDiv = document.getElementById('reportPriorityItems');
            noPriorityData = document.getElementById('noPriorityData');
            reportPriorityTotal = document.getElementById('reportPriorityTotal');
            reportPriorityTotalAmount = document.getElementById('reportPriorityTotalAmount');
            reportTopSpendingItemsDiv = document.getElementById('reportTopSpendingItems');
            noTopSpendingData = document.getElementById('noTopSpendingData');
            reportAllBoughtItemsDiv = document.getElementById('reportAllBoughtItems');
            noBoughtItemsData = document.getElementById('noBoughtItemsData');
            reportBoughtTotal = document.getElementById('reportBoughtTotal');
            reportBoughtTotalAmount = document.getElementById('reportBoughtTotalAmount');
            reportAllUnboughtItemsDiv = document.getElementById('reportAllUnboughtItems');
            noUnboughtItemsData = document.getElementById('noUnboughtItemsData');
            reportUnboughtTotal = document.getElementById('reportUnboughtTotal');
            reportUnboughtTotalAmount = document.getElementById('reportUnboughtTotalAmount');
            customerReportPage = document.getElementById('customerReportPage');
            backFromCustomerReportBtn = document.getElementById('backFromCustomerReportBtn');
            customerReportPageName = document.getElementById('customerReportPageName');
            customerReportPageContent = document.getElementById('customerReportPageContent');
            customerReportPageFooterContainer = document.getElementById('customerReportPageFooterContainer');
            customerReportPdfBtn = document.getElementById('customerReportPdfBtn');
            customerReportShareBtn = document.getElementById('customerReportShareBtn');
            customerReportCopyBtn = document.getElementById('customerReportCopyBtn');
            decreaseFontButton = document.getElementById('decreaseFont');
            resetFontButton = document.getElementById('resetFont');
            increaseFontButton = document.getElementById('increaseFont');
            profileUserName = document.getElementById('profileUserName');

            setupEventListeners();
            updateCurrentYear();
            initializeVoiceInput();
            setupAutocomplete();

        } catch (error) {
            console.error("Initialization failed:", error);
            document.body.innerHTML = '<h1>অ্যাপ্লিকেশন চালু করা যায়নি। একটি গুরুতর সমস্যা হয়েছে।</h1>';
        }
    });

    function setupEventListeners() {
        signInBtn.addEventListener('click', signInWithGoogle);
        signOutBtn.addEventListener('click', signOutWithConfirmation);
        document.getElementById('changeNameBtn').addEventListener('click', changeUserName);
        showShoppingListBtn.addEventListener('click', () => switchView('shoppingList'));
        showLedgerBtn.addEventListener('click', () => switchView('ledger'));
        infoButton.addEventListener('click', openInfoModal);
        darkModeToggle.addEventListener('click', toggleDarkMode);
        decreaseFontButton.addEventListener('click', () => applyFontSize(Math.max(13, currentFontSize - 1)));
        resetFontButton.addEventListener('click', () => applyFontSize(defaultFontSize));
        increaseFontButton.addEventListener('click', () => applyFontSize(Math.min(25, currentFontSize + 1)));
        profileBtn.addEventListener('click', (e) => { e.stopPropagation(); profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block'; });
        document.getElementById('addNewListBtn').addEventListener('click', addNewList);
        document.getElementById('renameListBtn').addEventListener('click', renameList);
        document.getElementById('deleteCurrentListBtn').addEventListener('click', deleteCurrentList);
        currentListSelector.addEventListener('change', (e) => switchList(e.target.value));
        document.getElementById('addItemBtn').addEventListener('click', addItem);
        itemNameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && autocompleteSuggestions.style.display === 'none') { e.preventDefault(); addItem(); } });
        fabAddCustomerBtn.addEventListener('click', openAddCustomerModal);
        backToLedgerMainBtn.addEventListener('click', showMainLedgerView);
        confirmTransactionBtn.addEventListener('click', addTransactionToCustomer);
        customerSearchInput.addEventListener('input', (e) => renderLedgerMainView(e.target.value));
        gaveAmountInput.addEventListener('input', () => { if(gaveAmountInput.value) receivedAmountInput.value = ''; updateConfirmButtonState(); });
        receivedAmountInput.addEventListener('input', () => { if(receivedAmountInput.value) gaveAmountInput.value = ''; updateConfirmButtonState(); });
        transactionDateInput.addEventListener('change', () => { const date = transactionDateInput.valueAsDate || new Date(); transactionDateLabel.textContent = formatShortDateForDisplay(date); });
        shareBtn.addEventListener('click', openShareModal);
        reportBtn.addEventListener('click', showReportPage);
        downloadPdfBtn.addEventListener('click', downloadPdf);
        clearBtn.addEventListener('click', clear);
        document.getElementById('closeInfoModalBtn').addEventListener('click', closeInfoModal);
        document.getElementById('closeShareModalBtn').addEventListener('click', closeShareModal);
        backFromReportBtn.addEventListener('click', hideReportPage);
        backFromCustomerReportBtn.addEventListener('click', hideCustomerReportPage);
        alertModal.querySelector('.custom-modal-close').addEventListener('click', closeAlertModal);
        document.getElementById('alertOkBtn').addEventListener('click', closeAlertModal);
        confirmationModal.querySelector('.custom-modal-close').addEventListener('click', () => handleConfirm(false));
        confirmButton.addEventListener('click', () => handleConfirm(true));
        cancelButton.addEventListener('click', () => handleConfirm(false));
        promptModal.querySelector('.custom-modal-close').addEventListener('click', () => resolvePrompt(null));
        promptSubmitButton.addEventListener('click', () => resolvePrompt(promptInput.value));
        promptCancelButton.addEventListener('click', () => resolvePrompt(null));
        editItemModal.querySelector('.custom-modal-close').addEventListener('click', closeEditItemModal);
        editItemSaveButton.addEventListener('click', saveEditedItem);
        editItemCancelButton.addEventListener('click', closeEditItemModal);
        addCustomerModal.querySelector('.custom-modal-close').addEventListener('click', closeAddCustomerModal);
        document.getElementById('addCustomerConfirmBtn').addEventListener('click', addCustomer);
        document.getElementById('addCustomerCancelBtn').addEventListener('click', closeAddCustomerModal);
        txConfirmModal.querySelector('.custom-modal-close').addEventListener('click', closeTxConfirmModal);
        transactionDetailModal.querySelector('.custom-modal-close').addEventListener('click', () => transactionDetailModal.classList.remove('active'));
        editTransactionModal.querySelector('.custom-modal-close').addEventListener('click', () => editTransactionModal.classList.remove('active'));
        editTransactionModal.querySelector('.cancel-btn').addEventListener('click', () => editTransactionModal.classList.remove('active'));
        document.getElementById('saveEditedTransactionBtn').addEventListener('click', saveEditedTransaction);
        editCustomerModal.querySelector('.custom-modal-close').addEventListener('click', () => editCustomerModal.classList.remove('active'));
        editCustomerModal.querySelector('.cancel-btn').addEventListener('click', () => editCustomerModal.classList.remove('active'));
        document.getElementById('saveEditedCustomerBtn').addEventListener('click', saveEditedCustomer);
        monthlySpendingModal.querySelector('.custom-modal-close').addEventListener('click', closeMonthlySpendingModal);
        document.getElementById('monthlyToFullReportBtn').addEventListener('click', openReportModalFromMonthly);
        document.getElementById('closeMonthlyModalBtn2').addEventListener('click', closeMonthlySpendingModal);
        reportListFilter.addEventListener('change', updateReportContent);
        reportPriorityFilter.addEventListener('change', () => renderPriorityItemsReport(reportPriorityFilter.value, getFilteredItems()));
        applyDateFilterButton.addEventListener('click', applyDateFilter);
        customerOptionsBtn.addEventListener('click', (e) => { e.stopPropagation(); customerOptionsMenu.style.display = customerOptionsMenu.style.display === 'block' ? 'none' : 'block'; });
        document.getElementById('customerReportBtn').addEventListener('click', () => { showCustomerReportPage(currentCustomerId); customerOptionsMenu.style.display = 'none'; });
        document.getElementById('customerEditBtn').addEventListener('click', () => { editCustomer(currentCustomerId); customerOptionsMenu.style.display = 'none'; });
        document.getElementById('customerDeleteBtn').addEventListener('click', () => { deleteCustomer(currentCustomerId); customerOptionsMenu.style.display = 'none'; });
        document.addEventListener('click', (e) => {
            if (profileMenu && !profileBtn.contains(e.target) && !profileMenu.contains(e.target)) profileMenu.style.display = 'none';
            if (customerOptionsMenu && !customerOptionsBtn.contains(e.target) && !customerOptionsMenu.contains(e.target)) customerOptionsMenu.style.display = 'none';
        });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') { const activeModal = document.querySelector('.modal-overlay.active, .custom-modal.active'); if (activeModal) activeModal.classList.remove('active'); }});
    }

})();