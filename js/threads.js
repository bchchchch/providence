/* ============================================================
   ДИНАМИЧЕСКИЕ КРАСНЫЕ НИТИ
   ============================================================ */

function drawThreads() {
    const svg = document.getElementById('threadsSvg');
    if (!svg) return;

    const corkboard = document.querySelector('.corkboard');
    if (!corkboard) return;

    const boardRect = corkboard.getBoundingClientRect();
    
    // Очищаем SVG
    svg.innerHTML = '';

    // Получаем нижнюю часть шапки (узел будет скрыт под плашкой)
    const headerCard = document.getElementById('headerCard');
    if (!headerCard) return;
    
    const headerRect = headerCard.getBoundingClientRect();
    const headerCenterX = headerRect.left + headerRect.width / 2 - boardRect.left;
    const headerBottomY = headerRect.bottom - boardRect.top - 10; // Чуть выше нижней границы

    // Нити от шапки к папкам навигации
    const navFolders = document.querySelectorAll('.folder');
    navFolders.forEach(folder => {
        const folderRect = folder.getBoundingClientRect();
        const folderCenterX = folderRect.left + folderRect.width / 2 - boardRect.left;
        const folderTopY = folderRect.top - boardRect.top;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', headerCenterX);
        line.setAttribute('y1', headerBottomY);
        line.setAttribute('x2', folderCenterX);
        line.setAttribute('y2', folderTopY);
        line.setAttribute('class', 'thread-line');
        svg.appendChild(line);
    });

    // Нити от папок навигации к карточкам (если есть)
    const cards = document.querySelectorAll('.dossier');
    if (cards.length > 0 && navFolders.length > 0) {
        cards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2 - boardRect.left;
            const cardTopY = cardRect.top - boardRect.top;

            // Соединяем с соответствующей папкой (по индексу, если есть)
            const targetNav = navFolders[index % navFolders.length];
            if (targetNav) {
                const navRect = targetNav.getBoundingClientRect();
                const navCenterX = navRect.left + navRect.width / 2 - boardRect.left;
                const navBottomY = navRect.bottom - boardRect.top;

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', navCenterX);
                line.setAttribute('y1', navBottomY);
                line.setAttribute('x2', cardCenterX);
                line.setAttribute('y2', cardTopY);
                line.setAttribute('class', 'thread-line');
                svg.appendChild(line);
            }
        });
    }
}

// Запускаем при загрузке и при ресайзе
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(drawThreads, 100);
});

window.addEventListener('resize', () => {
    drawThreads();
});