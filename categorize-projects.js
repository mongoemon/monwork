const XLSX = require('./node_modules/xlsx');
const path = require('path');

const categories = {
    Software: [
        'Lotus', 'Manao Meals', 'Seller Center (Office Mate)',
        'PTT Digital', 'True Online Store', '7-11',
        'Curaprox', 'Curaprox Pro', 'Pick', 'Panya',
    ],
    Game: [
        'Linage W', 'Hotel Life: A Resort Simulator', 'Lumen.',
        'City of Games', 'Tint.', 'ImaginMe', 'ImaginMe Beauty and the Beast',
        'ImaginMe Dragons', 'ImaginMe Jungle Book', 'ImaginMe Little Bean',
        'Tesco Lotus Shopping Spree', 'Totem Defender',
        'Mes Comptines for 3DS', 'My First Songs 2 for 3DS',
        'My First Songs for 3DS', 'Lolirock',
        'Meine ersten Mitsing-Lieder for WiiU', 'Mon Premier Karaoké for WiiU',
        'Hummingbird and Ladybug', 'AeternoBlade for 3DS',
        'Deadly Premonition: The Director\'s Cut for Steam',
        'Deadly Premonition: Director\'s Cut for PS3',
        'Wicked Monster BLAST! for PS3', 'Crazy Strike Bowling for PS3',
        'Wicked Monsters Type!', 'B-Units Build It for 3DS & Wii',
        'Wicked Monsters BLAST! for Wii', 'Yuth',
    ],
    'etc.': ['Aliveunited'],
};

const lookup = {};
Object.entries(categories).forEach(([cat, names]) =>
    names.forEach(n => lookup[n] = cat)
);

const filePath = path.join(__dirname, 'data.xlsx');
const wb = XLSX.readFile(filePath);
const rows = XLSX.utils.sheet_to_json(wb.Sheets['Project'], { defval: '', raw: false });

const counts = { Software: 0, Game: 0, 'etc.': 0, unmatched: 0 };
rows.forEach(r => {
    const cat = lookup[r['Project name']] || 'etc.';
    r['Project_Category'] = cat;
    if (lookup[r['Project name']]) counts[cat]++;
    else { counts.unmatched++; console.log('  unmatched:', r['Project name']); }
});

wb.Sheets['Project'] = XLSX.utils.json_to_sheet(rows);
XLSX.writeFile(wb, filePath);
console.log('Done.', counts);
