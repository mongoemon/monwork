import { state } from './state.js';
import { t, pickLang } from './i18n.js';

const TOOL_CAT_ORDER = [
    ['Test Management',  'tool_cat_test_management'],
    ['Automation',       'tool_cat_automation'     ],
    ['API Testing',      'tool_cat_api'            ],
    ['Performance',      'tool_cat_performance'    ],
    ['CI/CD',            'tool_cat_cicd'           ],
    ['Version Control',  'tool_cat_vcs'            ],
    ['Database',         'tool_cat_database'       ],
    ['Monitoring',       'tool_cat_monitoring'     ],
    ['Collaboration',    'tool_cat_collaboration'  ],
    ['Device / Platform','tool_cat_device'         ],
];

const LEVEL_KEYS = {
    5: 'level_expert', 4: 'level_advanced',
    3: 'level_intermediate', 2: 'level_beginner', 1: 'level_beginner'
};
const LEVEL_CSS = {
    5: 'expert', 4: 'advanced', 3: 'intermediate', 2: 'beginner', 1: 'beginner'
};
const LEVEL_ORDER = [5, 4, 3, 2, 1];

function buildTagGroup(label, modifierClass, tagNames) {
    const row = document.createElement('div');
    row.className = 'skill-level-group';

    const badge = document.createElement('span');
    badge.className = `skill-level-label ${modifierClass}`;
    badge.textContent = label;

    const tagsEl = document.createElement('div');
    tagsEl.className = 'skill-tags';
    tagNames.forEach(name => {
        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.textContent = name;
        tagsEl.appendChild(tag);
    });

    row.append(badge, tagsEl);
    return row;
}

function buildSkillGroups(skills) {
    const groups = {};
    skills.forEach(skill => {
        const lvl = parseInt(skill.Level) || 0;
        const key = LEVEL_KEYS[lvl] || 'level_beginner';
        if (!groups[key]) groups[key] = [];
        groups[key].push(pickLang(skill, 'Skill_Name'));
    });

    const el = document.createElement('div');
    el.className = 'skills-groups';

    const seen = new Set();
    LEVEL_ORDER.forEach(lvl => {
        const key = LEVEL_KEYS[lvl];
        if (seen.has(key) || !groups[key]) return;
        seen.add(key);
        el.appendChild(buildTagGroup(t(key), `skill-level--${LEVEL_CSS[lvl]}`, groups[key]));
    });

    return el;
}

function buildToolGroups(rows) {
    const groups = {};
    rows.forEach(row => {
        const cat = String(row['Category'] || '').trim();
        const name = String(row['Tool_Name'] || '').trim();
        if (!cat || !name) return;
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(name);
    });

    const el = document.createElement('div');
    el.className = 'skills-groups';

    const rendered = new Set();
    TOOL_CAT_ORDER.forEach(([cat, i18nKey]) => {
        if (!groups[cat]) return;
        rendered.add(cat);
        el.appendChild(buildTagGroup(t(i18nKey), 'skill-level--tool', groups[cat]));
    });

    // Fallback: categories not in TOOL_CAT_ORDER
    Object.keys(groups).filter(c => !rendered.has(c)).forEach(cat => {
        el.appendChild(buildTagGroup(cat, 'skill-level--tool', groups[cat]));
    });

    return el;
}

export function renderSkills(data) {
    state.skills = data;
    const qaContainer = document.getElementById('qa-skill-list');
    const devContainer = document.getElementById('dev-skill-list');

    const qaSkills = data.filter(s => String(s.Domain || '').trim().toLowerCase() === 'qa');
    const devSkills = data.filter(s => String(s.Domain || '').trim().toLowerCase() === 'software development');

    if (qaContainer)  { qaContainer.innerHTML  = ''; qaContainer.appendChild(buildSkillGroups(qaSkills));  }
    if (devContainer) { devContainer.innerHTML = ''; devContainer.appendChild(buildSkillGroups(devSkills)); }
}

export function renderTools(data) {
    state.tools = data;
    const qaContainer  = document.getElementById('qa-tools-list');
    const devContainer = document.getElementById('dev-tools-list');

    const qaTools  = data.filter(row => String(row.Domain || '').trim().toLowerCase() === 'qa');
    const devTools = data.filter(row => String(row.Domain || '').trim().toLowerCase() === 'software development');

    if (qaContainer)  { qaContainer.innerHTML  = ''; qaContainer.appendChild(buildToolGroups(qaTools));  }
    if (devContainer) { devContainer.innerHTML = ''; devContainer.appendChild(buildToolGroups(devTools)); }
}
