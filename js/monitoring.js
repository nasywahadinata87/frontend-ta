// =====================================
// LOGIN CHECK
// =====================================

if (sessionStorage.getItem("isLogin") !== "true") {
    window.location.href = "login.html";
}

// =====================================
// ELEMENT HTML
// =====================================

const el = {

    voltage: document.getElementById("voltageValue"),
    current: document.getElementById("currentValue"),
    soc: document.getElementById("socValue"),
    pf: document.getElementById("pfValue"),
    mode: document.getElementById("modeValue"),
    source: document.getElementById("sourceValue"),
    badge: document.getElementById("sourceBadge"),
    socBar: document.getElementById("socMiniFill")

};

// =====================================
// DATA LOGGER GLOBAL
// =====================================

let allLogs = [];

// =====================================
// CHART
// =====================================

let voltageChart = null;
let socChart = null;

// =====================================
// UPDATE DASHBOARD
// =====================================

function updateDashboard(data) {

    el.voltage.textContent = data.tegangan ?? "--";

    el.current.textContent = data.arus ?? "--";

    el.soc.textContent = data.soc ?? "--";

    el.pf.textContent = data.pf ?? "--";

    el.mode.textContent = data.mode ?? "--";

el.source.textContent = data.sumber ?? "--";

el.badge.textContent = data.sumber ?? "--";

if (data.sumber === "PLTS") {

    el.badge.className = "source-badge plts";

}
else if (data.sumber === "PLN") {

    el.badge.className = "source-badge pln";

}
else{

    el.badge.className = "source-badge mati";

}

    // Progress Bar SoC
    el.socBar.style.width = `${data.soc ?? 0}%`;

}

// =====================================
// REALTIME
// =====================================

async function loadRealtime() {

    try {

        const response = await fetch(`${API_URL}/realtime`);

        if (!response.ok) {
            throw new Error("Gagal mengambil data realtime");
        }

        const data = await response.json();

        updateDashboard(data);

    } catch (err) {

        console.error(err);

    }

}

// =====================================
// DATA LOGGER
// =====================================

async function loadLogs() {

    try {

        const response = await fetch(`${API_URL}/logs`);

        if (!response.ok) {
            throw new Error("Gagal mengambil data logger");
        }

        allLogs = await response.json();

        applyFilter();
        remaining = REFRESH_TIME;

    } catch (err) {

        console.error(err);

    }

}

// =====================================
// PERTAMA KALI
// =====================================

loadRealtime();

loadLogs();

// =====================================
// FILTER SUMBER
// =====================================

function applyFilter() {

    const filter =
        document.getElementById("filterSource").value;

    let filteredLogs = allLogs;

    if (filter === "PLTS") {

        filteredLogs =
            allLogs.filter(log =>
                log.sumber_aktif === "PLTS"
            );

    }

    else if (filter === "PLN") {

        filteredLogs =
            allLogs.filter(log =>
                log.sumber_aktif === "PLN"
            );

    }

    updateTable(filteredLogs);

    updateChart(filteredLogs);

}

// =====================================
// UPDATE TABLE
// =====================================

function updateTable(logs) {

    const tbody = document.getElementById("logTbody");

    tbody.innerHTML = "";

    if (!logs.length) {

        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="7">Tidak ada data</td>
            </tr>
        `;

        return;
    }

    logs.forEach(log => {

        let badge = "";
            if(log.sumber_aktif==="PLTS"){
                badge=`<span class="badge-plts">☀ PLTS</span>`;
            }
            else if(log.sumber_aktif==="PLN"){
                badge=`<span class="badge-pln">🏭 PLN</span>`;
            }
            else{
                badge=`<span class="badge-mati">⚫ MATI</span>`;
            }
        tbody.innerHTML += `
            <tr>

                <td class="td-time">
                    ${new Date(log.waktu).toLocaleString("id-ID")}
                </td>

                <td class="td-mode">
                    ${log.mode_sistem}
                </td>

                <td>
                    ${badge}
                </td>

                <td class="td-val" style="color:var(--accent-amber)">
                    ${log.tegangan} <small>V</small>
                </td>

                <td class="td-val" style="color:var(--accent-sky)">
                    ${log.arus} <small>A</small>
                </td>

                <td>
                    <div class="soc-cell">

                        <span>${log.soc}%</span>

                        <div class="soc-bar">
                            <div
                                class="soc-bar-fill"
                                style="width:${log.soc}%; background:#2f9e5a;">
                            </div>
                        </div>

                    </div>
                </td>

                <td class="td-val" style="color:var(--accent-sun)">
                    ${log.pf}
                </td>

            </tr>
        `;

    });

    document.getElementById("rowCount").textContent =
        `${logs.length} RECORDS`;

}
// =====================================
// UPDATE CHART
// =====================================
function updateChart(logs) {

    if (!logs.length) return;

    // data
    const data = [...logs]
    .slice(0, 5)   // ambil 5 data terbaru
    .reverse();    // tampilkan dari lama → baru

    const labels = data.map(log =>
        new Date(log.waktu).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit"
        })
    );

    const voltageData = data.map(log => Number(log.tegangan));
    const socData = data.map(log => Number(log.soc));

    // ===============================
    // CHART TEGANGAN
    // ===============================

    if (voltageChart) {
        voltageChart.destroy();
    }

    voltageChart = new Chart(
        document.getElementById("chartVolt"),
        {
            type: "line",
            data: {
                labels: labels,
                datasets:[{
                data: voltageData,
                borderColor:"#d97706",
                backgroundColor:"rgba(217,119,6,0.08)",
                fill:true,
                tension:0.45,
                borderWidth:3,
                pointRadius:4

                }]
            },
           options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                elements: {
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 5
                        }
                    }
                }
            }
        }
    );

    // ===============================
    // CHART SOC
    // ===============================

    if (socChart) {
        socChart.destroy();
    }

    socChart = new Chart(
        document.getElementById("chartSoC"),
        {
            type: "line",
            data: {
                labels: labels,
                datasets:[{
                    data:socData,
                    borderColor:"#16a34a",
                    backgroundColor:"rgba(22,163,74,0.08)",
                    fill:true,
                    tension:0.45,
                    borderWidth:3,
                    pointRadius:4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                elements: {
                    point: {
                        radius:4,
                        hoverRadius:6
                    }
                },
                scales: {
                    x: {
                        grid:{
                            display:false
                        }
                    },
                    y:{
                        min:0,
                        max:100,
                        ticks:{
                            stepSize:20
                        }
                    }
                }
            }
        }
    );
}
// =====================================
// AUTO REFRESH TIMER
// =====================================
const REFRESH_TIME = 300; // 5 menit
let remaining = REFRESH_TIME;
let pauseRefresh = false;
const timerEl =
    document.getElementById("refreshTimer");
const progressEl =
    document.getElementById("refreshProgress");
const pauseBtn =
    document.getElementById("pauseRefresh");

function updateRefreshTimer() {
    if (pauseRefresh) return;
    remaining--;
    if (remaining <= 0) {
        loadLogs();
        return;
    }
    const minute = String(Math.floor(remaining / 60)).padStart(2, "0");
    const second = String(remaining % 60).padStart(2, "0");
    if (timerEl) {
    timerEl.textContent =
        `${minute}:${second}`;
    }
    if (progressEl) {
    progressEl.style.width =
        `${(remaining / REFRESH_TIME) * 100}%`;
    }

}

setInterval(() => {

    loadRealtime();

    updateRefreshTimer();

}, 1000);

document
.getElementById("filterSource")
.addEventListener("change", applyFilter);

pauseBtn.addEventListener("click", () => {

    pauseRefresh = !pauseRefresh;

    pauseBtn.textContent =
        pauseRefresh
            ? "▶ Resume"
            : "⏸ Pause";

});

// =====================================
// LOGOUT
// =====================================

document.getElementById("logoutBtn").addEventListener("click", () => {

    sessionStorage.removeItem("isLogin");

    window.location.href = "index.html";

});

// =====================================
// EXPORT CSV
// =====================================

document.getElementById("exportBtn").addEventListener("click", () => {

    window.open(`${API_URL}/export_csv`, "_blank");

});