/* ============================================================
   ЛОГИКА ХРОНОЛОГИИ
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    renderTimeline();
    setupDetailPanel();
});

/* ---------- 1. ОТРИСОВКА ТАЙМЛАЙНА ---------- */
function renderTimeline() {
    const track = document.getElementById('timelineTrack');
    if (!track || !window.CHRONOLOGY) return;

    window.CHRONOLOGY.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'timeline-card';
        card.dataset.id = item.id;
        card.style.borderColor = item.color;
        
        card.innerHTML = `
            <div class="timeline-card__year" style="color: ${item.color}">${item.year}</div>
            <div class="timeline-card__title">${item.title}</div>
            <div class="timeline-card__desc">${item.short_desc}</div>
            <div class="timeline-card__pin"></div>
        `;

        // Соединяющая нить (кроме последней карточки)
        if (index < window.CHRONOLOGY.length - 1) {
            const thread = document.createElement('div');
            thread.className = 'timeline-thread';
            thread.style.background = item.color;
            card.appendChild(thread);
        }

        card.addEventListener('click', () => openDetail(item));
        track.appendChild(card);
    });
        // Выделяем последнее добавленное событие красным кружком
    const cards = track.querySelectorAll('.timeline-card');
    if (cards.length > 0) {
        const lastCard = cards[cards.length - 1];
        lastCard.classList.add('timeline-card--new');
    }
}

/* ---------- 2. ПАНЕЛЬ ПОДРОБНОСТЕЙ ---------- */
function setupDetailPanel() {
    const panel = document.getElementById('detailPanel');
    const closeBtn = document.getElementById('detailClose');

    const closePanel = () => {
        panel.classList.remove('is-open');
    };

    closeBtn.addEventListener('click', closePanel);
    
    // Закрытие по клику на оверлей
    panel.addEventListener('click', (e) => {
        if (e.target === panel) {
            closePanel();
        }
    });

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('is-open')) {
            closePanel();
        }
    });
}

function openDetail(item) {
    const panel = document.getElementById('detailPanel');
    
    document.getElementById('detailYear').textContent = item.year;
    document.getElementById('detailYear').style.color = item.color;
    document.getElementById('detailTitle').textContent = item.title;
    document.getElementById('detailDesc').textContent = item.full_desc;

    const imageContainer = document.getElementById('detailImage');
    const img = document.getElementById('detailImg');
    
    if (item.image) {
        img.src = item.image;
        img.alt = item.title;
        imageContainer.style.display = 'block';
    } else {
        imageContainer.style.display = 'none';
    }

    panel.classList.add('is-open');
}