/* ==================================
   Band Kit Metronome FULL (HTML連携版)
================================== */

let audioContext = null;

let running = false;

let beat = 0;
let measure = 1;
let total = 0;

let startTime = 0;
let lastIndex = -1;

/* ==================================
   BPM取得（HTML連携）
================================== */

function getBPM() {

    const el = document.getElementById("bpm");

    return parseInt(el?.value) || 120;

}

/* ==================================
   拍子取得（4/4, 3/4対応）
================================== */

function getSignature() {

    const el = document.getElementById("beats");

    const value = el?.value || "4/4";

    const m = value.match(/^(\d+)\s*\/\s*(\d+)/);

    if (!m) return { beats: 4, unit: 4 };

    return {
        beats: parseInt(m[1]),
        unit: parseInt(m[2])
    };

}

/* ==================================
   Display Mode
================================== */

function getDisplayMode() {

    const el = document.getElementById("display-mode");

    return el?.value || "lr";

}

/* ==================================
   Init
================================== */

window.addEventListener("DOMContentLoaded", () => {

    const btn =
        document.getElementById("start-metronome");

    btn?.addEventListener("click", toggle);

    requestAnimationFrame(loop);

});

/* ==================================
   Start / Stop
================================== */

function toggle() {

    running = !running;

    if (running) {

        beat = 0;
        measure = 1;
        total = 0;
        lastIndex = -1;

        startTime = performance.now();

        if (!audioContext) {

            audioContext =
                new (window.AudioContext ||
                     window.webkitAudioContext)();

        }

        document.getElementById("start-metronome").innerHTML =
            "Stop";

    } else {

        document.getElementById("start-metronome").innerHTML =
            "Start";
    }

}

/* ==================================
   MAIN LOOP
================================== */

function loop(t) {

    requestAnimationFrame(loop);

    if (!running) return;

    const bpm = getBPM();

    const beatLen = 60000 / bpm;

    const now = t - startTime;

    /* =========================
       🎯 針（2拍で1往復）
    ========================= */

    const needle = document.getElementById("metro-needle");

    if (needle) {

        const cycle = beatLen * 2;

        const sub = (now % cycle) / cycle;

        const swing = Math.sin(sub * Math.PI * 2);

        needle.style.transform =
            `rotate(${swing * 40}deg)`;

    }

    /* =========================
       🎯 拍判定（正確）
    ========================= */

    const index = Math.floor(now / beatLen);

    if (index !== lastIndex) {

        lastIndex = index;

        const sig = getSignature();

        const disable =
            document.getElementById("disable-beats")?.checked;

        if (!disable) {

            beat++;

            if (beat > sig.beats) {

                beat = 1;
                measure++;
            }

        }

        total++;

        playClick(beat === 1);

        updateUI(sig);

    }

}

/* ==================================
   UI更新（HTML完全連携）
================================== */

function updateUI(sig) {

    const mode = getDisplayMode();

    const lr = document.getElementById("metro-lr");

    const beatView = document.getElementById("metro-beat-view");

    const max = sig.beats;

    if (mode === "beat") {

        if (lr) lr.style.display = "none";
        if (beatView) beatView.style.display = "block";

        let out = "";

        for (let i = 1; i <= max; i++) {

            out += (i === beat) ? "● " : "○ ";

        }

        if (beatView) beatView.textContent = out;

    } else {

        if (lr) lr.style.display = "flex";
        if (beatView) beatView.style.display = "none";

    }

    const cur = document.getElementById("metro-current");
    const m = document.getElementById("metro-measure");
    const t = document.getElementById("metro-total");

    if (cur) cur.textContent = `${beat}/${max}`;
    if (m) m.textContent = `小節: ${measure}`;
    if (t) t.textContent = `総拍数: ${total}`;

}

/* ==================================
   音
================================== */

function playClick(high) {

    if (!audioContext) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.frequency.value = high ? 1400 : 900;
    gain.gain.value = 0.05;

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + 0.05);

}
/* =====================================
   Band Kit
   System Core
===================================== */

/* =========================
   Elements
========================= */

const setupScreen =
    document.getElementById(
        "setup-screen"
    );

const app =
    document.getElementById(
        "app"
    );

/* =========================
   Startup
========================= */

window.addEventListener(
    "DOMContentLoaded",
    initialize
);

function initialize() {

    initializeLanguage();

    initializeTabs();

    initializeSettings();

}

/* =========================
   Language Setup
========================= */

function initializeLanguage() {

    const savedLanguage =
        localStorage.getItem(
            "bandkit-language"
        );

    if (savedLanguage) {

        showApp();

        applyLanguage(
            savedLanguage
        );

    }

    const continueButton =
        document.getElementById(
            "setup-continue"
        );

    if (!continueButton)
        return;

    continueButton.addEventListener(
        "click",
        () => {

            const selected =
                document.querySelector(
                    'input[name="language"]:checked'
                );

            if (!selected)
                return;

            const language =
                selected.value;

            localStorage.setItem(
                "bandkit-language",
                language
            );

            applyLanguage(
                language
            );

            showApp();

        }
    );

}

/* =========================
   Show App
========================= */

function showApp() {

    setupScreen.classList.add(
        "hidden"
    );

    app.classList.remove(
        "hidden"
    );

}

/* =========================
   Language Dictionary
========================= */

const LANG = {

    ja: {

        metronome: "メトロノーム",
        tuner: "チューナー",
        pitch: "音検知",
        piano: "Pianoshock 2",
        score: "ご利用できません",
        noise: "騒音計",
        settings: "設定",

        language: "言語",

        reset: "初期化"

    },

    en: {

        metronome: "Metronome",
        tuner: "Tuner",
        pitch: "Pitch Detection",
        piano: "Pianoshock 2",
        score: "Disabled",
        noise: "Noise Meter",
        settings: "Settings",

        language: "Language",

        reset: "Reset"

    }

};

/* =========================
   Apply Language
========================= */

function applyLanguage(lang) {

    const text =
        LANG[lang];

    if (!text)
        return;

    const tabs =
        document.querySelectorAll(
            ".tab"
        );

    tabs.forEach(tab => {

        const label =
            tab.querySelectorAll(
                "span"
            )[1];

        switch (
            tab.dataset.page
        ) {

            case "metronome":
                label.textContent =
                    text.metronome;
                break;

            case "tuner":
                label.textContent =
                    text.tuner;
                break;

            case "pitch":
                label.textContent =
                    text.pitch;
                break;

            case "piano":
                label.textContent =
                    text.piano;
                break;

            case "score":
                label.textContent =
                    text.score;
                break;

            case "noise":
                label.textContent =
                    text.noise;
                break;

            case "settings":
                label.textContent =
                    text.settings;
                break;

        }

    });

    const changeLanguage =
        document.getElementById(
            "change-language"
        );

    const resetButton =
        document.getElementById(
            "reset-app"
        );

    if (changeLanguage) {

        changeLanguage.innerHTML = `
            <span class="material-symbols-rounded">
                language
            </span>
            ${text.language}
        `;

    }

    if (resetButton) {

        resetButton.innerHTML = `
            <span class="material-symbols-rounded">
                restart_alt
            </span>
            ${text.reset}
        `;

    }

}

/* =========================
   Tabs
========================= */

function initializeTabs() {

    const tabs =
        document.querySelectorAll(
            ".tab"
        );

    tabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".tab"
                    )
                    .forEach(t => {

                        t.classList.remove(
                            "active"
                        );

                    });

                document
                    .querySelectorAll(
                        ".page"
                    )
                    .forEach(page => {

                        page.classList.remove(
                            "active"
                        );

                    });

                tab.classList.add(
                    "active"
                );

                const targetPage =
                    document.getElementById(
                        "page-" +
                        tab.dataset.page
                    );

                if (targetPage) {

                    targetPage.classList.add(
                        "active"
                    );

                }

            }
        );

    });

}

/* =========================
   Settings
========================= */

function initializeSettings() {

    const languageButton =
        document.getElementById(
            "change-language"
        );

    const resetButton =
        document.getElementById(
            "reset-app"
        );

    if (languageButton) {

        languageButton.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "bandkit-language"
                );

                location.reload();

            }
        );

    }

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            () => {

                const result =
                    confirm(
                        "Band Kitを初期化しますか？"
                    );

                if (!result)
                    return;

                localStorage.clear();

                location.reload();

            }
        );

    }

}

/* =====================================
   End System Core
===================================== */

/* ==================================
   GLOBAL
================================== */

window.audioContext = window.audioContext || null;
window.micStream = window.micStream || null;
window.analyser = window.analyser || null;
window.dataArray = window.dataArray || null;

/* 状態管理 */
let tunerRunning = false;

/* ==================================
   MIC INIT（1回だけ）
================================== */

async function initMic() {

    if (window.micStream) return;

    window.micStream =
        await navigator.mediaDevices.getUserMedia({
            audio: true
        });

    window.audioContext =
        window.audioContext ||
        new (window.AudioContext ||
             window.webkitAudioContext)();

    const source =
        window.audioContext.createMediaStreamSource(
            window.micStream
        );

    window.analyser =
        window.audioContext.createAnalyser();

    window.analyser.fftSize = 2048;

    source.connect(window.analyser);

    window.dataArray =
        new Float32Array(window.analyser.fftSize);

}

/* ==================================
   🎤 TUNER（停止→再検知対応）
================================== */

function startTuner() {

    if (tunerRunning) return;

    tunerRunning = true;

    initMic().then(() => runTuner());

}

function runTuner() {

    const el =
        document.querySelector("#page-tuner .big-display");

    function loop() {

        window.analyser.getFloatTimeDomainData(
            window.dataArray
        );

        const freq =
            autoCorrelate(
                window.dataArray,
                window.audioContext.sampleRate
            );

        if (freq > 0) {

            const note = freqToNote(freq);
            const cents = getCents(freq);

            if (el) {
                el.textContent =
                    `${note} ${cents > 0 ? "+" : ""}${cents}¢`;
            }

            tunerRunning = false; // 停止

            return;
        }

        requestAnimationFrame(loop);

    }

    loop();

}

/* ==================================
   🔁 再検知ボタン
================================== */

function restartTuner() {

    tunerRunning = false;

    setTimeout(() => {

        tunerRunning = true;

        runTuner();

    }, 100);

}

/* ==================================
   🔊 PITCH（0.5秒・ドレミ）
================================== */

function startPitch() {

    initMic().then(() => {

        const el =
            document.querySelector("#page-pitch .big-display");

        function update() {

            window.analyser.getFloatTimeDomainData(
                window.dataArray
            );

            const freq =
                autoCorrelate(
                    window.dataArray,
                    window.audioContext.sampleRate
                );

            if (el) {

                el.textContent =
                    freq > 0
                        ? freqToNote(freq) +
                          ` (${Math.round(freq)}Hz)`
                        : "--";

            }

        }

        update();
        setInterval(update, 500);

    });

}

/* ==================================
   🔊 NOISE（0.5秒更新）
================================== */

function startNoise() {

    initMic().then(() => {

        const data =
            new Uint8Array(
                window.analyser.frequencyBinCount
            );

        const el =
            document.getElementById("db-display");

        function update() {

            window.analyser.getByteFrequencyData(data);

            let sum = 0;

            for (let i = 0; i < data.length; i++) {
                sum += data[i];
            }

            const avg = sum / data.length;

            const db =
                Math.min(150, avg * 1.6);

            if (el) {
                el.textContent =
                    Math.round(db) + " dB";
            }

        }

        update();
        setInterval(update, 500);

    });

}

/* ==================================
   AUTO CORRELATION
================================== */

function autoCorrelate(buf, sampleRate) {

    let SIZE = buf.length;

    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
        rms += buf[i] * buf[i];
    }

    rms = Math.sqrt(rms / SIZE);

    if (rms < 0.01) return -1;

    let r1 = 0;
    let r2 = SIZE - 1;

    for (let i = 0; i < SIZE / 2; i++) {
        if (Math.abs(buf[i]) < 0.2) {
            r1 = i;
            break;
        }
    }

    for (let i = 1; i < SIZE / 2; i++) {
        if (Math.abs(buf[SIZE - i]) < 0.2) {
            r2 = SIZE - i;
            break;
        }
    }

    buf = buf.slice(r1, r2);

    SIZE = buf.length;

    let c = new Array(SIZE).fill(0);

    for (let i = 0; i < SIZE; i++) {

        for (let j = 0; j < SIZE - i; j++) {
            c[i] += buf[j] * buf[j + i];
        }

    }

    let d = 0;

    while (c[d] > c[d + 1]) d++;

    let max = -1;
    let maxPos = -1;

    for (let i = d; i < SIZE; i++) {

        if (c[i] > max) {
            max = c[i];
            maxPos = i;
        }

    }

    return sampleRate / maxPos;

}

/* ==================================
   ドレミ
================================== */

function freqToNote(freq) {

    if (!freq || freq < 20) return "--";

    const notes =
        ["ド","ド#","レ","レ#","ミ","ファ",
         "ファ#","ソ","ソ#","ラ","ラ#","シ"];

    const n =
        Math.round(
            12 * Math.log2(freq / 440) + 69
        );

    return notes[n % 12];

}

/* ==================================
   セント
================================== */

function getCents(freq) {

    const nearest =
        440 *
        Math.pow(
            2,
            Math.round(
                12 * Math.log2(freq / 440) + 69 - 69
            ) / 12
        );

    return Math.round(
        1200 * Math.log2(freq / nearest)
    );

}

/* ==================================
   EVENTS
================================== */

window.addEventListener("DOMContentLoaded", () => {

    document
        .querySelector("[data-page='tuner']")
        ?.addEventListener("click", startTuner);

    document
        .querySelector("[data-page='pitch']")
        ?.addEventListener("click", startPitch);

    document
        .querySelector("[data-page='noise']")
        ?.addEventListener("click", startNoise);

    document
        .getElementById("retune-btn")
        ?.addEventListener("click", restartTuner);

});
