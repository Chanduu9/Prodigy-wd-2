let startTime, updatedTime, difference, tInterval;
let running = false;
let laps = JSON.parse(localStorage.getItem('laps')) || [];
let lapTimes = JSON.parse(localStorage.getItem('lapTimes')) || [];
let savedTime = localStorage.getItem('savedTime') || 0;

const display = document.getElementById("display");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const lapBtn = document.getElementById("lapBtn");
const lapsContainer = document.getElementById("laps");
const exportLapsBtn = document.getElementById("exportLaps");

if (savedTime && laps.length) {
    display.innerHTML = formatTime(savedTime);
    renderLaps();
}

startBtn.addEventListener("click", startStopwatch);
stopBtn.addEventListener("click", stopStopwatch);
resetBtn.addEventListener("click", resetStopwatch);
lapBtn.addEventListener("click", recordLap);
exportLapsBtn.addEventListener("click", exportLaps);

function startStopwatch() {
    if (!running) {
        startTime = new Date().getTime() - savedTime;
        tInterval = setInterval(getTime, 1);
        running = true;
    }
}

function stopStopwatch() {
    if (running) {
        clearInterval(tInterval);
        running = false;
        savedTime = difference;
        localStorage.setItem('savedTime', savedTime);
    }
}

function resetStopwatch() {
    clearInterval(tInterval);
    difference = 0;
    running = false;
    savedTime = 0;
    laps = [];
    lapTimes = [];
    localStorage.clear();
    display.innerHTML = "00:00:00.000";
    lapsContainer.innerHTML = "";
}

function recordLap() {
    if (running) {
        const currentLapTime = difference;
        const lastLapTime = lapTimes.length > 0 ? lapTimes[lapTimes.length - 1] : 0;
        const lapDifference = currentLapTime - lastLapTime;

        laps.push({
            time: display.innerHTML,
            diff: formatTime(lapDifference),
        });
        lapTimes.push(currentLapTime);

        localStorage.setItem('laps', JSON.stringify(laps));
        localStorage.setItem('lapTimes', JSON.stringify(lapTimes));

        renderLaps();
    }
}

function renderLaps() {
    lapsContainer.innerHTML = "";
    laps.forEach((lap, index) => {
        const li = document.createElement("li");
        li.textContent = `Lap ${index + 1}: ${lap.time} (Δ ${lap.diff})`;
        lapsContainer.appendChild(li);
    });
}

function getTime() {
    updatedTime = new Date().getTime();
    difference = updatedTime - startTime;

    display.innerHTML = formatTime(difference);
}

function formatTime(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    const milliseconds = Math.floor(ms % 1000);

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
}

function pad(number, digits = 2) {
    return number.toString().padStart(digits, '0');
}

function exportLaps() {
    const csvContent = "data:text/csv;charset=utf-8,";
    const headers = ["Lap Number", "Time", "Difference"];
    const rows = laps.map((lap, index) => [index + 1, lap.time, lap.diff].join(","));
    const csvData = [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent + csvData);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "laps.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
