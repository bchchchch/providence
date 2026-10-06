/* ============================================================
   ДАННЫЕ: ФРАКЦИИ PROVIDENCE (ИЕРАРХИЯ)
   ============================================================ */

window.FACTION_CATEGORIES = [
  { id: "government", name: "Правительство", color: "#6e1414", symbol: "✠" },
  { id: "military", name: "Силовые структуры", color: "#16293f", symbol: "🛡" },
  { id: "institute", name: "НИИ и Наука", color: "#5a5040", symbol: "⚙" },
  { id: "resistance", name: "Сопротивление", color: "#8f4a1a", symbol: "◆" },
  { id: "confessions", name: "Конфессии", color: "#3a3050", symbol: "✦" },
  { id: "none", name: "Беспартийные", color: "#646464", symbol: "⮾" }
];

window.FACTIONS = [
  /* ========== ГЛАВНЫЕ ПАРТИИ ========== */
  {
    id: "gov_main",
    category_id: "government",
    is_main: true,
    name: "Правительство Республики Эгида",
    tag: "#Правительство@providence_ask",
    type: "Публичный",
    description: "Единственный высший исполнительный и законодательный орган государственной власти Республики Эгида (после роспуска парламента). Полностью представлен участниками правящей и единственно законной (с 1958 г.) партии «Под Эгидой».",
    roles: [
      { title: "Канцлер", char_id: "altenberg", is_leader: true, is_npc_reserved: true },
      { title: "Глава города Провиденс", char_id: null, is_leader: true, is_npc_reserved: true }
    ]
  },
  {
    id: "military_main",
    category_id: "military",
    is_main: true,
    name: "Вооружённые Силы Эгиды",
    tag: "#Военные@providence_ask",
    type: "Публичный",
    description: "Фракция объединяет представителей военных структур Республики.",
    roles: [
      { title: "Министр обороны", char_id: null, is_leader: true, is_npc_reserved: true },
      { title: "Военнослужащие ВС", char_id: null, is_leader: false, is_npc_reserved: false }
    ]
  },
  {
    id: "institute_main",
    category_id: "institute",
    is_main: true,
    name: "НИИ Прикладной Электроники",
    tag: "#НИИ@providence_ask",
    type: "Публичный",
    description: "Открылся в 1922 году. Единственное высшее учебное заведение в Провиденсе.",
    roles: [
      { title: "Ректор", char_id: null, is_leader: true, is_npc_reserved: false },
      { title: "Преподаватели", char_id: null, is_leader: false, is_npc_reserved: false },
      { title: "Студенты", char_id: null, is_leader: false, is_npc_reserved: false }
    ]
  },
  {
    id: "resistance_main",
    category_id: "resistance",
    is_main: true,
    name: "Объединённое Сопротивление",
    tag: "#Сопротивление@providence_ask",
    type: "Подпольный",
    description: "Стихийное движение, признанное экстремистским в 1952 г. Объединяет людей разных политических лагерей против диктатуры канцлера.",
    roles: [
      { title: "Общий лидер", char_id: null, is_leader: true, is_npc_reserved: true }
    ]
  },
  {
    id: "confessions_main",
    category_id: "confessions",
    is_main: true,
    name: "Конфессии Эгиды",
    tag: "#Конфессии@providence_ask",
    type: "Публичный",
    description: "Условное название для всех религиозных организаций: христиане, неоязычники, иудеи, сектанты.",
    roles: [
      { title: "Архиепископ Эгиды", char_id: null, is_leader: true, is_npc_reserved: true }
    ]
  },
  {
    id: "none",
    category_id: "none",
    is_main: true,
    name: "Беспартийные",
    type: "Публичный",
    tag: "",
    description: "Граждане, не определившиеся с политической принадлежностью.",
    roles: [
      { }
    ]
  },

  /* ========== ПОДРАЗДЕЛЕНИЯ ========== */
  {
    id: "min_culture",
    category_id: "government",
    is_main: false,
    parent_id: "gov_main",
    name: "Министерство культуры и пропаганды (МКИП)",
    type: "Публичный",
    tag: "",
    description: "Министерство, занимающееся вопросами культуры, пропаганды и цензуры. Порицает «мелкобуржуазную» культуру.",
    roles: [
      { title: "Министр культуры", char_id: null, is_leader: true, is_npc_reserved: true }
    ]
  },
  {
    id: "secret_police",
    category_id: "military",
    is_main: false,
    parent_id: "military_main",
    name: "Тайная Государственная Полиция",
    tag: "#ТайнаяПолиция@providence_ask",
    type: "Секретный",
    description: "Наблюдение и борьба с политическими противниками режима за рубежом и внутри Эгиды.",
    roles: [
      { title: "Глава Тайной Полиции", char_id: null, is_leader: true, is_npc_reserved: true },
      { title: "Служащие ТГП", char_id: null, is_leader: false, is_npc_reserved: false }
    ]
  },
  {
    id: "phoenix",
    category_id: "institute",
    is_main: false,
    parent_id: "institute_main",
    name: "ИЦ «Феникс»",
    type: "Секретный",
    tag: "",
    description: "Закрытый исследовательский центр на базе института под патронажем ВС Эгиды.",
    roles: [
      { title: "Технический руководитель", char_id: null, is_leader: true, is_npc_reserved: true },
      { title: "Сотрудники центра", char_id: null, is_leader: false, is_npc_reserved: false }
    ]
  },
  {
    id: "free_egida",
    category_id: "resistance",
    is_main: false,
    parent_id: "resistance_main",
    name: "Оппозиционная партия «Свободная Эгида»",
    type: "Подпольный",
    tag: "",
    description: "Крыло сопротивления. После гибели основателя многие сторонники покинули республику.",
    roles: [
      { title: "Основатель", char_id: "petar_dennitsa", is_leader: true, is_npc_reserved: true },
      { title: "Лидер", char_id: null, is_leader: true, is_npc_reserved: true },
      { title: "Правая рука", char_id: null, is_leader: false, is_npc_reserved: false },
      { title: "Сторонники", char_id: null, is_leader: false, is_npc_reserved: false }
    ]
  },
  {
    id: "free_egida_editorial",
    category_id: "resistance",
    is_main: false,
    parent_id: "resistance_main",
    name: "Редакция «Свободной Эгиды»",
    type: "Подпольный",
    tag: "",
    description: "Подпольное издание, распространяющее листовки и информацию.",
    roles: [
      { title: "Главный редактор", char_id: null, is_leader: true, is_npc_reserved: false },
      { title: "Журналисты", char_id: null, is_leader: false, is_npc_reserved: false }
    ]
  },
  {
    id: "christian_union",
    category_id: "confessions",
    is_main: false,
    parent_id: "confessions_main",
    name: "Христианский союз",
    type: "Публичный",
    tag: "",
    description: "Христианский союз — консервативное подразделение внутри партии «Под Эгидой», возглавляемое архиепископом.",
    roles: [
      { title: "Архиепископ Эгиды", char_id: null, is_leader: true, is_npc_reserved: true }
    ]
  }
];