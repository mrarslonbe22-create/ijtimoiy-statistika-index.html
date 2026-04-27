// ============================================
// MA'LUMOTLAR
// ============================================
let yillar = [2020, 2021, 2022, 2023, 2024, 2025];
let aholi = [34558.9, 35271.3, 35874.4, 36421.8, 37543.2, 38236.7];
let bandlar = [13200, 13450, 13780, 14100, 14500, 14850];
let mlya = [19500, 19800, 20100, 20450, 21200, 21700];
let kambagal = [5200, 4900, 4600, 4010, 3200, 2220];
let mehnat_resurslari = [20200, 20500, 20850, 21100, 21800, 22300];
let iqtisodiy_nofaol = [5500, 5600, 5650, 5700, 5800, 5900];

// Hisoblangan ko'rsatkichlar
let bandlikFoizi = [];
let kambagallikFoizi = [];
let ishsizlar = [];

// Grafik o'zgaruvchilari
let mainChart = null;
let prognozChart = null;
let currentGraph = 'aholi';

// ============================================
// HISOBLASH FUNKSIYALARI
// ============================================
function calculateAll() {
    bandlikFoizi = [];
    kambagallikFoizi = [];
    ishsizlar = [];
    
    for(let i = 0; i < yillar.length; i++) {
        // Bandlik foizi
        let bf = (bandlar[i] / mlya[i] * 100).toFixed(2);
        bandlikFoizi.push(parseFloat(bf));
        
        // Kambag'allik foizi
        let kf = (kambagal[i] / aholi[i] * 100).toFixed(2);
        kambagallikFoizi.push(parseFloat(kf));
        
        // Ishsizlar soni
        let ish = mehnat_resurslari[i] - bandlar[i] - iqtisodiy_nofaol[i];
        ishsizlar.push(ish);
    }
}

// Statistika kartalarini yangilash
function updateStatCards() {
    const lastIndex = yillar.length - 1;
    const prevIndex = lastIndex - 1;
    
    // Aholi
    document.getElementById('current_aholi').innerHTML = aholi[lastIndex].toLocaleString();
    let aholiChange = ((aholi[lastIndex] - aholi[prevIndex]) / aholi[prevIndex] * 100).toFixed(2);
    document.getElementById('aholi_change').innerHTML = (aholiChange > 0 ? '+' : '') + aholiChange + '%';
    
    // Bandlik
    document.getElementById('current_bandlik').innerHTML = bandlikFoizi[lastIndex];
    let bandlikChange = (bandlikFoizi[lastIndex] - bandlikFoizi[prevIndex]).toFixed(2);
    document.getElementById('bandlik_change').innerHTML = (bandlikChange > 0 ? '+' : '') + bandlikChange + '%';
    
    // Kambag'allik
    document.getElementById('current_kambagal').innerHTML = kambagallikFoizi[lastIndex];
    let kambagalChange = (kambagallikFoizi[lastIndex] - kambagallikFoizi[prevIndex]).toFixed(2);
    document.getElementById('kambagal_change').innerHTML = (kambagalChange > 0 ? '+' : '') + kambagalChange + '%';
    document.getElementById('kambagal_change').className = 'stat-change ' + (kambagalChange < 0 ? 'negative' : 'positive');
    
    // Ishsizlar
    document.getElementById('current_ishsiz').innerHTML = (ishsizlar[lastIndex] / 1000).toFixed(1);
    let ishsizChange = ((ishsizlar[lastIndex] - ishsizlar[prevIndex]) / ishsizlar[prevIndex] * 100).toFixed(2);
    document.getElementById('ishsiz_change').innerHTML = (ishsizChange > 0 ? '+' : '') + ishsizChange + '%';
    document.getElementById('ishsiz_change').className = 'stat-change ' + (ishsizChange > 0 ? 'positive' : 'negative');
}

// Jadvalni to'ldirish
function updateTable() {
    let html = '';
    for(let i = 0; i < yillar.length; i++) {
        html += `<tr>
            <td>${yillar[i]}</td>
            <td>${aholi[i].toLocaleString()}</td>
            <td>${bandlar[i]}</td>
            <td>${mlya[i]}</td>
            <td>${kambagal[i]}</td>
            <td>${bandlikFoizi[i]}%</td>
            <td>${kambagallikFoizi[i]}%</td>
        </tr>`;
    }
    document.getElementById('table-body').innerHTML = html;
}

// ============================================
// GRAFIKLAR
// ============================================
function showGraph(type) {
    currentGraph = type;
    
    // Tugmalarni faollashtirish
    document.querySelectorAll('.graph-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    let labels = yillar;
    let data = [];
    let label = '';
    let borderColor = '#1a73e8';
    
    switch(type) {
        case 'aholi':
            data = aholi;
            label = 'Aholi soni (ming kishi)';
            borderColor = '#1a73e8';
            break;
        case 'kambagal':
            data = kambagallikFoizi;
            label = 'Kambag\'allik darajasi (%)';
            borderColor = '#f44336';
            break;
        case 'bandlik':
            data = bandlikFoizi;
            label = 'Bandlik darajasi (%)';
            borderColor = '#4caf50';
            break;
        case 'ishsiz':
            data = ishsizlar;
            label = 'Ishsizlar soni (ming kishi)';
            borderColor = '#ff9800';
            break;
        case 'korrelyatsiya':
            showCorrelationGraph();
            return;
    }
    
    if(mainChart) mainChart.destroy();
    
    const ctx = document.getElementById('mainChart').getContext('2d');
    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: borderColor,
                backgroundColor: borderColor + '20',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: borderColor,
                pointBorderColor: 'white'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                tooltip: { callbacks: { label: (ctx) => `${ctx.raw.toLocaleString()} ${ctx.dataset.label.includes('%') ? '%' : ''}` } },
                legend: { position: 'top' }
            }
        }
    });
}

function showCorrelationGraph() {
    // Aholi vs Daromad korrelyatsiyasi
    let umumiyDaromad = [285000, 340000, 420000, 530000, 680000, 850000];
    let korr = calculateCorrelation(aholi, umumiyDaromad);
    
    if(mainChart) mainChart.destroy();
    
    const ctx = document.getElementById('mainChart').getContext('2d');
    mainChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: `Korrelyatsiya: r = ${korr.toFixed(3)} (kuchli musbat)`,
                data: aholi.map((a, i) => ({x: a, y: umumiyDaromad[i]})),
                backgroundColor: '#1a73e8',
                pointRadius: 8,
                pointHoverRadius: 12
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: { callbacks: { label: (ctx) => `Aholi: ${ctx.parsed.x} ming | Daromad: ${ctx.parsed.y} mlrd` } }
            },
            scales: {
                x: { title: { display: true, text: 'Aholi soni (ming kishi)' } },
                y: { title: { display: true, text: 'Umumiy daromad (mlrd so‘m)' } }
            }
        }
    });
}

function calculateCorrelation(x, y) {
    let n = x.length;
    let sumX = x.reduce((a,b) => a + b, 0);
    let sumY = y.reduce((a,b) => a + b, 0);
    let sumXY = x.reduce((a,b,i) => a + b * y[i], 0);
    let sumX2 = x.reduce((a,b) => a + b * b, 0);
    let sumY2 = y.reduce((a,b) => a + b * b, 0);
    
    let numerator = n * sumXY - sumX * sumY;
    let denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    return numerator / denominator;
}

// ============================================
// PROGNOZ
// ============================================
function calculatePrognoz() {
    // Chiziqli trend
    let t = [...Array(aholi.length).keys()];
    let n = aholi.length;
    let sumT = t.reduce((a,b) => a + b, 0);
    let sumY = aholi.reduce((a,b) => a + b, 0);
    let sumTY = t.reduce((a,b,i) => a + b * aholi[i], 0);
    let sumT2 = t.reduce((a,b) => a + b * b, 0);
    
    let b = (n * sumTY - sumT * sumY) / (n * sumT2 - sumT * sumT);
    let a = (sumY - b * sumT) / n;
    
    let linearProg2026 = a + b * n;
    let linearProg2027 = a + b * (n + 1);
    let linearProg2028 = a + b * (n + 2);
    let linearProg2029 = a + b * (n + 3);
    let linearProg2030 = a + b * (n + 4);
    
    document.getElementById('linear_prognoz').innerHTML = linearProg2026.toFixed(1);
    document.getElementById('linear_formula').innerHTML = `y = ${a.toFixed(2)} + ${b.toFixed(2)}*t`;
    
    // Eksponentsial trend
    let lnY = aholi.map(v => Math.log(v));
    let sumLnY = lnY.reduce((a,b) => a + b, 0);
    let sumTLnY = t.reduce((a,b,i) => a + b * lnY[i], 0);
    
    let bExp = (n * sumTLnY - sumT * sumLnY) / (n * sumT2 - sumT * sumT);
    let aExp = (sumLnY - bExp * sumT) / n;
    
    let expProg2026 = Math.exp(aExp + bExp * n);
    document.getElementById('exp_prognoz').innerHTML = expProg2026.toFixed(1);
    document.getElementById('exp_formula').innerHTML = `y = ${Math.exp(aExp).toFixed(2)} * e^(${bExp.toFixed(4)}*t)`;
    
    // CAGR
    let cagr = Math.pow(aholi[aholi.length-1] / aholi[0], 1 / (aholi.length - 1)) - 1;
    let cagrProg2026 = aholi[aholi.length-1] * Math.pow(1 + cagr, 1);
    document.getElementById('cagr_prognoz').innerHTML = cagrProg2026.toFixed(1);
    document.getElementById('cagr_formula').innerHTML = `CAGR = ${(cagr * 100).toFixed(2)}%`;
    
    // Prognoz grafigi
    let progYillar = [...yillar, 2026, 2027, 2028, 2029, 2030];
    let linearValues = [...aholi];
    for(let i = n; i < n + 5; i++) {
        linearValues.push(a + b * i);
    }
    
    if(prognozChart) prognozChart.destroy();
    const ctx = document.getElementById('prognozChart').getContext('2d');
    prognozChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: progYillar,
            datasets: [
                { label: 'Haqiqiy ma\'lumotlar', data: [...aholi, ...Array(5).fill(null)], borderColor: '#1a73e8', borderWidth: 3, pointRadius: 5 },
                { label: 'Chiziqli trend prognozi', data: linearValues, borderColor: '#ff6d00', borderWidth: 2, borderDash: [5, 5], fill: false }
            ]
        },
        options: {
            responsive: true,
            plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.raw?.toFixed(1)} ming kishi` } } }
        }
    });
}

// ============================================
// QO'SHIMCHA FUNKSIYALAR
// ============================================
function exportToExcel() {
    let data = [['Yil', 'Aholi', 'Bandlar', 'MLYa', 'Kambag\'al', 'Bandlik %', 'Kambag\'allik %']];
    for(let i = 0; i < yillar.length; i++) {
        data.push([yillar[i], aholi[i], bandlar[i], mlya[i], kambagal[i], bandlikFoizi[i], kambagallikFoizi[i]]);
    }
    
    let ws = XLSX.utils.aoa_to_sheet(data);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Statistika');
    XLSX.writeFile(wb, `statistika_${new Date().toISOString().slice(0,19)}.xlsx`);
}

function addNewYear() {
    let newYear = yillar[yillar.length-1] + 1;
    let lastAholi = aholi[aholi.length-1];
    let newAholi = prompt(`Yangi yil (${newYear}) uchun aholi sonini kiriting (ming kishi):`, (lastAholi * 1.02).toFixed(1));
    
    if(newAholi && !isNaN(newAholi)) {
        yillar.push(newYear);
        aholi.push(parseFloat(newAholi));
        bandlar.push(bandlar[bandlar.length-1] * 1.01);
        mlya.push(mlya[mlya.length-1] * 1.01);
        kambagal.push(kambagal[kambagal.length-1] * 0.95);
        mehnat_resurslari.push(mehnat_resurslari[mehnat_resurslari.length-1] * 1.01);
        iqtisodiy_nofaol.push(iqtisodiy_nofaol[iqtisodiy_nofaol.length-1] * 1.01);
        
        calculateAll();
        updateStatCards();
        updateTable();
        showGraph(currentGraph);
        calculatePrognoz();
        
        alert(`${newYear}-yil qo'shildi!`);
    }
}

function scrollToStats() {
    document.getElementById('stats').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// BOSHLASH
// ============================================
function init() {
    calculateAll();
    updateStatCards();
    updateTable();
    showGraph('aholi');
    calculatePrognoz();
}

init();
