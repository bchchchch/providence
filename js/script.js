/* ============================================================
   ГЛАВНЫЙ СКРИПТ АРХИВА PROVIDENCE (js/script.js)
   
   Отвечает за:
   1. Кнопки фильтрации персонажей по категориям и типу
   2. Отрисовку карточек персонажей с печатью статуса
   3. Умную сортировку (alive в начале, остальные по алфавиту)
   4. Открытие и заполнение паспорта
   5. Автоподстановку картинок
   ============================================================ */

let currentCategoryFilter = 'all';
let currentTypeFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    initCategoryFilters();
    initTypeFilters();
    renderCharacters();
    setupModal();
    autoFillAvatars();
});

/* ----------------------------------------------------------
   ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: найти категорию фракции персонажа
   ---------------------------------------------------------- */

function getCharacterCategory(char) {
    if (!char || !char.faction_ids || char.faction_ids.length === 0) return null;
    const primaryFactionId = char.faction_ids[0]; 
    const faction = window.FACTIONS.find(f => f.id === primaryFactionId);
    if (!faction) return null;
    return window.FACTION_CATEGORIES.find(c => c.id === faction.category_id);
}


function isCharInFaction(char, factionId) {
    if (!char || !char.faction_ids) return false;
    return char.faction_ids.includes(factionId);
}


function getCharacterCategories(char) {
    if (!char || !char.faction_ids) return [];
    const categories = [];
    char.faction_ids.forEach(factionId => {
        const faction = window.FACTIONS.find(f => f.id === factionId);
        if (faction) {
            const cat = window.FACTION_CATEGORIES.find(c => c.id === faction.category_id);
            if (cat && !categories.find(c => c.id === cat.id)) {
                categories.push(cat);
            }
        }
    });
    return categories;
}

/* ----------------------------------------------------------
   1. ИНИЦИАЛИЗАЦИЯ ФИЛЬТРОВ ПО КАТЕГОРИЯМ (фракции)
   ---------------------------------------------------------- */
function initCategoryFilters() {
    const filterBar = document.getElementById('filterBar');
    if (!filterBar || !window.FACTION_CATEGORIES) return;

    
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn is-active';
    allBtn.dataset.category = 'all';
    allBtn.innerHTML = `<span class="filter-btn__symbol">◈</span> Все`;
    allBtn.addEventListener('click', () => {
        document.querySelectorAll('#filterBar .filter-btn').forEach(b => b.classList.remove('is-active'));
        allBtn.classList.add('is-active');
        currentCategoryFilter = 'all';
        renderCharacters();
    });
    filterBar.appendChild(allBtn);

    
    window.FACTION_CATEGORIES.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.category = cat.id;
        btn.innerHTML = `<span class="filter-btn__symbol" style="color: ${cat.color}">${cat.symbol}</span> ${cat.name}`;
        
        btn.addEventListener('click', () => {
            document.querySelectorAll('#filterBar .filter-btn').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            currentCategoryFilter = cat.id;
            renderCharacters();
        });
        
        filterBar.appendChild(btn);
    });
}

/* ----------------------------------------------------------
   2. ИНИЦИАЛИЗАЦИЯ ФИЛЬТРОВ ПО ТИПУ (NPC/Отвечающие)
   ---------------------------------------------------------- */
function initTypeFilters() {
    const filterBar = document.getElementById('typeFilterBar');
    if (!filterBar) return;

    const types = [
        { id: 'all', name: 'Все', symbol: '◈' },
        { id: 'npc', name: 'NPC', symbol: '◆' },
        { id: 'player', name: 'Отвечающие', symbol: '●' }
    ];

    types.forEach(type => {
        const btn = document.createElement('button');
        btn.className = `filter-btn ${type.id === 'all' ? 'is-active' : ''}`;
        btn.dataset.type = type.id;
        btn.innerHTML = `<span class="filter-btn__symbol">${type.symbol}</span> ${type.name}`;
        
        btn.addEventListener('click', () => {
            document.querySelectorAll('#typeFilterBar .filter-btn').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            currentTypeFilter = type.id;
            renderCharacters();
        });
        
        filterBar.appendChild(btn);
    });
}

/* ----------------------------------------------------------
   3. УМНАЯ СОРТИРОВКА И ОТРИСОВКА КАРТОЧЕК
   ---------------------------------------------------------- */
function renderCharacters() {
    const grid = document.getElementById('characterGrid');
    if (!grid || !window.CHARACTERS) return;

    grid.innerHTML = '';

    
    let filteredChars = window.CHARACTERS.filter(char => {
        
        const categoryMatch = currentCategoryFilter === 'all' || 
            char.faction_ids.some(factionId => {
                const faction = window.FACTIONS.find(f => f.id === factionId);
                return faction && faction.category_id === currentCategoryFilter;
            });
        
        
        const typeMatch = currentTypeFilter === 'all' ||
            (currentTypeFilter === 'npc' && char.is_npc) ||
            (currentTypeFilter === 'player' && !char.is_npc);
        
        return categoryMatch && typeMatch;
    });

    
    filteredChars.sort((a, b) => {
        const aAlive = a.status_text_id === 'alive';
        const bAlive = b.status_text_id === 'alive';
        
        
        if (aAlive && !bAlive) return -1;
        if (!aAlive && bAlive) return 1;
        
        
        return a.name.localeCompare(b.name, 'ru');
    });

    filteredChars.forEach((char, index) => {
        const cat = getCharacterCategory(char) || window.FACTION_CATEGORIES[0];
        const status = window.STATUSES.find(s => s.id === char.status_text_id) || window.STATUSES[0];
        
        
        let dossierColorClass = 'dossier--blue';
        if (char.is_npc && char.status_text_id === 'dead') dossierColorClass = 'dossier--red';
        else if (cat.id === 'government') dossierColorClass = 'dossier--red';
        else if (cat.id === 'resistance') dossierColorClass = 'dossier--blue';
        else if (cat.id === 'military') dossierColorClass = 'dossier--green';
        else if (cat.id === 'confessions') dossierColorClass = 'dossier--yellow';
        else dossierColorClass = 'dossier--yellow';

        
        const card = document.createElement('div');
        card.className = `dossier dossier-card ${dossierColorClass}`;
        card.dataset.category = cat.id;
        card.dataset.id = char.id;
        
        
        const randomRotate = (Math.random() * 1.6 - 0.8).toFixed(1);
        card.style.setProperty('--rotate', `${randomRotate}deg`);
        card.style.animation = `fadeInUp 0.4s ease forwards ${index * 0.05}s`;
        card.style.opacity = '0';

        
        const leaderIcon = char.is_leader ? ' ✦' : '';

        
        const statusStamp = status.id !== 'alive' ? 
            `<div class="card-status-stamp" style="color: ${status.color};">${status.text.toUpperCase()}</div>` : '';

        card.innerHTML = `
            <div class="pin pin--small"></div>
            <div class="dossier__tab" style="background: ${cat.color}; color: #d8ceb0;">${cat.symbol}</div>
            <div class="dossier__title">${char.name.split(' ')[0]}${leaderIcon}</div>
            <div class="dossier__subtitle">${char.profession}</div>
            <div class="dossier__desc">
                <strong style="color: ${status.color}">${status.symbol} ${status.text}</strong><br>
                Рейтинг: <span style="font-weight: bold; color: ${char.rating > 0 ? '#4a6b3a' : char.rating < 0 ? '#6e1414' : '#322c22'}">${char.rating > 0 ? '+' : ''}${char.rating}</span>
            </div>
            ${char.is_npc ? '<div class="card-npc-stamp">NPC</div>' : ''}
            ${statusStamp}
        `;

        card.addEventListener('click', () => openPassport(char.id));
        grid.appendChild(card);
    });

    
    if (!document.getElementById('dynamic-animations')) {
        const style = document.createElement('style');
        style.id = 'dynamic-animations';
        style.textContent = `
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px) rotate(2deg); }
                to { opacity: 1; transform: translateY(0) rotate(var(--rotate, 0deg)); }
            }
            .card-status-stamp {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-14deg);
                padding: 8px 16px;
                font-family: var(--font-mono);
                font-size: 18px;
                font-weight: bold;
                letter-spacing: 3px;
                text-transform: uppercase;
                border: 3px double currentColor;
                background: transparent;
                z-index: 5;
                text-shadow: 1px 1px 0 rgba(216, 206, 176, 0.3), -1px -1px 0 rgba(216, 206, 176, 0.3);
                pointer-events: none;
                white-space: nowrap;
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
    }
}

/* ----------------------------------------------------------
   4. НАСТРОЙКА МОДАЛЬНОГО ОКНА (закрытие)
   ---------------------------------------------------------- */
function setupModal() {
    const modal = document.getElementById('passportModal');
    const overlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('modalClose');

    const closeModal = () => {
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
}

/* ----------------------------------------------------------
   5. ОТКРЫТИЕ И ЗАПОЛНЕНИЕ ПАСПОРТА
   ---------------------------------------------------------- */
function openPassport(charId) {
    const char = window.CHARACTERS.find(c => c.id === charId);
    if (!char) return;

    const cat = getCharacterCategory(char) || window.FACTION_CATEGORIES[0];
    const status = window.STATUSES.find(s => s.id === char.status_text_id) || window.STATUSES[0];

    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    const setDisplay = (id, display) => {
        const el = document.getElementById(id);
        if (el) el.style.display = display;
    };

    
    const leaderIcon = char.is_leader ? ' ✦' : '';
    setText('pName', char.name + leaderIcon);
    setText('pProfession', char.profession);
    
    const factionEl = document.getElementById('pFaction');
    if (factionEl) {
        factionEl.innerHTML = `<span style="color: ${cat.color}; font-size: 16px;">${cat.symbol}</span> ${cat.name}`;
    }

    
    setDisplay('pNpcStamp', char.is_npc ? 'inline-block' : 'none');

    
    const showStatus = status.id !== 'alive';
    ['pStatusStamp', 'pMobileStatusStamp'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (showStatus) {
                el.textContent = status.text.toUpperCase();
                el.style.color = status.color;
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        }
    });

    
    ['pRatingSticker', 'pMobileRatingSticker'].forEach((stickerId, index) => {
        const stickerEl = document.getElementById(stickerId);
        if (stickerEl) {
            if (char.show_rating) {
                const valueId = index === 0 ? 'pRating' : 'pMobileRating';
                const valEl = document.getElementById(valueId);
                if (valEl) {
                    valEl.textContent = char.rating > 0 ? `+${char.rating}` : char.rating;
                    valEl.className = 'passport-rating-value';
                    if (char.rating > 0) valEl.classList.add('positive');
                    else if (char.rating < 0) valEl.classList.add('negative');
                    else valEl.classList.add('neutral');
                }
                stickerEl.style.display = 'block';
            } else {
                stickerEl.style.display = 'none';
            }
        }
    });

    
    const photoContainer = document.getElementById('pPhoto');
    if (photoContainer) {
        const oldStamp = photoContainer.querySelector('.passport-photo__stamp');
        const oldImg = photoContainer.querySelector('img');
        if (oldStamp) oldStamp.remove();
        if (oldImg) oldImg.remove();
        
        if (char.avatar) {
            const img = document.createElement('img');
            img.src = char.avatar;
            img.alt = char.name;
            img.onerror = function() {
                this.remove();
                if (!photoContainer.querySelector('.passport-photo__stamp')) {
                    const stamp = document.createElement('span');
                    stamp.className = 'passport-photo__stamp';
                    stamp.innerHTML = 'НЕТ ФОТО<br>ОБЪЕКТА';
                    photoContainer.appendChild(stamp);
                }
            };
            photoContainer.appendChild(img);
        } else {
            const stamp = document.createElement('span');
            stamp.className = 'passport-photo__stamp';
            stamp.innerHTML = 'НЕТ ФОТО<br>ОБЪЕКТА';
            photoContainer.appendChild(stamp);
        }
    }

    
    const mobilePhotoContainer = document.getElementById('pMobilePhoto');
    if (mobilePhotoContainer) {
        const oldMStamp = mobilePhotoContainer.querySelector('.passport-photo__stamp');
        const oldMImg = mobilePhotoContainer.querySelector('img');
        if (oldMStamp) oldMStamp.remove();
        if (oldMImg) oldMImg.remove();
        
        if (char.avatar) {
            const mImg = document.createElement('img');
            mImg.src = char.avatar;
            mImg.alt = char.name;
            mImg.onerror = function() {
                this.remove();
                if (!mobilePhotoContainer.querySelector('.passport-photo__stamp')) {
                    const mStamp = document.createElement('span');
                    mStamp.className = 'passport-photo__stamp';
                    mStamp.innerHTML = 'НЕТ ФОТО<br>ОБЪЕКТА';
                    mobilePhotoContainer.appendChild(mStamp);
                }
            };
            mobilePhotoContainer.appendChild(mImg);
        } else {
            const mStamp = document.createElement('span');
            mStamp.className = 'passport-photo__stamp';
            mStamp.innerHTML = 'НЕТ ФОТО<br>ОБЪЕКТА';
            mobilePhotoContainer.appendChild(mStamp);
        }
    }

    
    setText('pBiography', char.biography || 'Данные засекречены или отсутствуют.');
    setText('pAppearance', char.appearance || 'Нет описания.');
    setText('pCharacter', char.character || 'Нет описания.');
    setText('pRole', char.role_in_city || 'Нет данных.');

    
    const setupLink = (btnId, link) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            if (link) {
                btn.href = link;
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        }
    };
    setupLink('pAlbumLink', char.album_link);
    setupLink('pDiscussionLink', char.discussion_link);
    setupLink('pLoreLink', char.lore_link);

    
    const statusNote = document.getElementById('pStatusNote');
    if (statusNote) {
        if (char.status_note) {
            statusNote.textContent = `ПРИМЕЧАНИЕ: ${char.status_note}`;
            statusNote.style.display = 'block';
        } else {
            statusNote.style.display = 'none';
        }
    }

    
    const modal = document.getElementById('passportModal');
    if (modal) {
        document.body.style.overflow = 'hidden';
        modal.classList.add('is-open');
    }
    window.openPassport = openPassport;
}

/* ----------------------------------------------------------
   6. АВТОПОДСТАНОВКА АВАТАРОВ
   ---------------------------------------------------------- */
function autoFillAvatars() {
    if (!window.CHARACTERS) return;
    window.CHARACTERS.forEach(char => {
        if (!char.avatar || char.avatar === '') {
            char.avatar = `images/characters/${char.id}.jpg`;
        }
    });
}