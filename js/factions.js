/* ============================================================
   ЛОГИКА РАЗДЕЛА ФРАКЦИЙ (ИЕРАРХИЯ С АВТО-ПЕРСОНАЖАМИ)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initFactionFilters();
    renderFactionHierarchy('all');
    setupFactionModal();
});

/* ----------------------------------------------------------
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ---------------------------------------------------------- */


function getFactionMembers(factionId) {
    if (!window.CHARACTERS) return [];
    return window.CHARACTERS.filter(char => isCharInFaction(char, factionId));
}


function getMainFaction(factionId) {
    const faction = window.FACTIONS.find(f => f.id === factionId);
    if (!faction) return null;
    if (faction.is_main) return faction;
    if (faction.parent_id) {
        return window.FACTIONS.find(f => f.id === faction.parent_id);
    }
    return null;
}

/* ----------------------------------------------------------
   1. ФИЛЬТРЫ ПО КАТЕГОРИЯМ
   ---------------------------------------------------------- */
function initFactionFilters() {
    const filterBar = document.getElementById('factionFilterBar');
    if (!filterBar || !window.FACTION_CATEGORIES) return;

    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn is-active';
    allBtn.dataset.category = 'all';
    allBtn.innerHTML = `<span class="filter-btn__symbol">◈</span> Все блоки`;
    allBtn.addEventListener('click', () => applyFactionFilter('all', allBtn));
    filterBar.appendChild(allBtn);

    window.FACTION_CATEGORIES.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.category = cat.id;
        btn.innerHTML = `<span class="filter-btn__symbol" style="color: ${cat.color}">${cat.symbol}</span> ${cat.name}`;
        btn.addEventListener('click', () => applyFactionFilter(cat.id, btn));
        filterBar.appendChild(btn);
    });
}

function applyFactionFilter(categoryId, activeBtn) {
    document.querySelectorAll('#factionFilterBar .filter-btn').forEach(b => b.classList.remove('is-active'));
    activeBtn.classList.add('is-active');
    renderFactionHierarchy(categoryId);
    setTimeout(drawFactionThreads, 100);
}

/* ----------------------------------------------------------
   2. РЕНДЕР ИЕРАРХИИ ФРАКЦИЙ
   ---------------------------------------------------------- */
function renderFactionHierarchy(categoryId) {
    const container = document.getElementById('factionHierarchy');
    if (!container) return;
    container.innerHTML = '';

    
    const mainFactions = window.FACTIONS.filter(f => 
        f.is_main && (categoryId === 'all' || f.category_id === categoryId)
    );

    mainFactions.forEach(mainFaction => {
        
        const subFactions = window.FACTIONS.filter(f => 
            !f.is_main && f.parent_id === mainFaction.id
        );

        const row = document.createElement('div');
        row.className = 'faction-row';
        row.dataset.mainId = mainFaction.id;

        
        const mainCard = createFactionCard(mainFaction, true);
        row.appendChild(mainCard);

        
        if (subFactions.length > 0) {
            const subContainer = document.createElement('div');
            subContainer.className = 'faction-sub-container';
            subFactions.forEach(sub => {
                const subCard = createFactionCard(sub, false);
                subContainer.appendChild(subCard);
            });
            row.appendChild(subContainer);
        }

        container.appendChild(row);
    });
}

/* ----------------------------------------------------------
   3. СОЗДАНИЕ КАРТОЧКИ ФРАКЦИИ
   ---------------------------------------------------------- */
function createFactionCard(faction, isMain) {
    const cat = window.FACTION_CATEGORIES.find(c => c.id === faction.category_id);
    const color = cat ? cat.color : '#5a5040';
    
    
    const members = getFactionMembers(faction.id);
    const membersCount = members.length;
    
    
    const membersList = membersCount > 0
        ? members.map(m => {
            const leaderIcon = m.is_leader ? '✦ ' : '';
            const deadIcon = m.status_text_id === 'dead' ? '† ' : '';
            return `${leaderIcon}${deadIcon}${m.name}`;
        }).join(', ')
        : '—';

    const card = document.createElement('div');
    card.className = `faction-card ${isMain ? 'faction-card--main' : 'faction-card--sub'}`;
    card.dataset.factionId = faction.id;
    card.style.borderTopColor = color;

    card.innerHTML = `
        <div class="pin pin--small"></div>
        <div class="faction-card__symbol" style="background: ${color}; color: #d8ceb0;">${cat ? cat.symbol : '?'}</div>
        <div class="faction-card__name">${faction.name}</div>
        <div class="faction-card__tag">${faction.tag || ''}</div>
        <div class="faction-card__type">[${faction.type}]</div>
        <div class="faction-card__desc">${faction.description.substring(0, 100)}${faction.description.length > 100 ? '...' : ''}</div>
        <div class="faction-card__members">
            <div class="faction-card__members-title">Участники (${membersCount})</div>
            <div class="faction-card__members-list">${membersList}</div>
        </div>
    `;

    card.addEventListener('click', () => openFactionDetail(faction.id));
    return card;
}

/* ----------------------------------------------------------
   4. КРАСНЫЕ НИТИ МЕЖДУ ФРАКЦИЯМИ
   ---------------------------------------------------------- */
function drawFactionThreads() {
    const svg = document.getElementById('factionThreads');
    if (!svg) return;
    const container = document.getElementById('factionHierarchy');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    svg.innerHTML = '';

    const rows = container.querySelectorAll('.faction-row');
    rows.forEach(row => {
        const mainCard = row.querySelector('.faction-card--main');
        const subCards = row.querySelectorAll('.faction-card--sub');
        if (!mainCard || subCards.length === 0) return;

        const mainRect = mainCard.getBoundingClientRect();
        const mainCenterX = mainRect.right - containerRect.left;
        const mainCenterY = mainRect.top + mainRect.height / 2 - containerRect.top;

        subCards.forEach(subCard => {
            const subRect = subCard.getBoundingClientRect();
            const subCenterX = subRect.left - containerRect.left;
            const subCenterY = subRect.top + subRect.height / 2 - containerRect.top;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', mainCenterX);
            line.setAttribute('y1', mainCenterY);
            line.setAttribute('x2', subCenterX);
            line.setAttribute('y2', subCenterY);
            line.setAttribute('class', 'faction-thread-line');
            svg.appendChild(line);
        });
    });
}

/* ----------------------------------------------------------
   5. МОДАЛЬНОЕ ОКНО ФРАКЦИИ
   ---------------------------------------------------------- */
function setupFactionModal() {
    const modal = document.getElementById('factionModal');
    const closeBtn = document.getElementById('factionClose');
    const overlay = document.getElementById('factionOverlay');

    const closeModal = () => modal.classList.remove('is-open');
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
}

function openFactionDetail(factionId) {
    const faction = window.FACTIONS.find(f => f.id === factionId);
    if (!faction) return;

    const cat = window.FACTION_CATEGORIES.find(c => c.id === faction.category_id);
    const color = cat ? cat.color : '#5a5040';

    document.getElementById('fDetailTag').textContent = faction.tag || '';
    document.getElementById('fDetailTag').style.color = color;
    document.getElementById('fDetailName').textContent = faction.name;
    document.getElementById('fDetailType').textContent = `[ ${faction.type} вид деятельности ]`;
    document.getElementById('fDetailDesc').textContent = faction.description;

    
    const members = getFactionMembers(factionId);
    const rosterList = document.getElementById('fRosterList');
    rosterList.innerHTML = '';

    if (members.length === 0) {
        rosterList.innerHTML = '<div class="roster-empty">В этой фракции пока нет активных персонажей</div>';
    } else {
        members.forEach(char => {
            const row = document.createElement('div');
            row.className = 'roster-row';

            
            const role = faction.roles.find(r => r.char_id === char.id);
            
            
            const roleName = role ? role.title : (char.profession || 'Участник');
            const isLeader = char.is_leader || (role && role.is_leader);

            
            let icons = '';
            if (isLeader) icons += '<span class="roster-leader-badge">✦ Лидер</span>';
            const status = window.STATUSES.find(s => s.id === char.status_text_id);
            if (status && status.id === 'dead') icons += ' <span style="color: var(--stamp-red);">†</span>';
            if (char.is_npc) icons += ' <span class="roster-npc-badge">NPC</span>';

            row.innerHTML = `
                <div class="roster-title">${roleName} ${icons}</div>
                <div class="roster-char">
                    <span class="roster-char-link" data-char-id="${char.id}">${char.name}</span>
                </div>
            `;
            rosterList.appendChild(row);
        });
    }

    
    rosterList.querySelectorAll('.roster-char-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            const charId = link.dataset.charId;
            document.getElementById('factionModal').classList.remove('is-open');
            setTimeout(() => {
                if (typeof openPassport === 'function') {
                    openPassport(charId);
                }
            }, 300);
        });
    });

    document.getElementById('factionModal').classList.add('is-open');
}