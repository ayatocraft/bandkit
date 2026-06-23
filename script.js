/* ==================================
   Band Kit Metronome
================================== */

let metroAudio = null;

let metroRunning = false;

let metroBeat = 0;
let metroMeasure = 1;
let metroTotal = 0;

let metroStartTime = 0;
let metroLastIndex = -1;

/* ==================================
   INIT
================================== */

window.addEventListener("DOMContentLoaded", () => {

    const btn =
        document.getElementById(
            "start-metronome"
        );

    btn?.addEventListener(
        "click",
        toggleMetronome
    );

    requestAnimationFrame(
        metronomeLoop
    );

});

/* ==================================
   START / STOP
================================== */

function toggleMetronome() {

    metroRunning =
        !metroRunning;

    const btn =
        document.getElementById(
            "start-metronome"
        );

    if (metroRunning) {

        metroBeat = 0;
        metroMeasure = 1;
        metroTotal = 0;
        metroLastIndex = -1;

        metroStartTime =
            performance.now();

        if (!metroAudio) {

            metroAudio =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

        }

        btn.innerHTML =
            "Stop";

    } else {

        btn.innerHTML =
            "Start";

    }

}

/* ==================================
   BPM
================================== */

function getBpm() {

    return parseInt(
        document.getElementById(
            "bpm"
        )?.value || 120
    );

}

/* ==================================
   拍子
================================== */

function getBeats() {

    const value =
        document.getElementById(
            "beats"
        )?.value || "4/4";

    const parts =
        value.split("/");

    return parseInt(
        parts[0]
    ) || 4;

}

/* ==================================
   LOOP
================================== */

function metronomeLoop(now) {

    requestAnimationFrame(
        metronomeLoop
    );

    if (!metroRunning)
        return;

    const bpm =
        getBpm();

    const beatLength =
        60000 / bpm;

    const elapsed =
        now - metroStartTime;

    /* --------------------------
       針
    -------------------------- */

    const needle =
        document.getElementById(
            "metro-needle"
        );

    if (needle) {

        const cycle =
            beatLength * 2;

        const progress =
            (elapsed % cycle)
            / cycle;

        const angle =
            Math.sin(
                progress *
                Math.PI *
                2
            ) * 40;

        needle.style.transform =
            `rotate(${angle}deg)`;

    }

    /* --------------------------
       拍判定
    -------------------------- */

    const beatIndex =
        Math.floor(
            elapsed /
            beatLength
        );

    if (
        beatIndex !==
        metroLastIndex
    ) {

        metroLastIndex =
            beatIndex;

        const maxBeat =
            getBeats();

        const disable =
            document.getElementById(
                "disable-beats"
            )?.checked;

        if (!disable) {

            metroBeat++;

            if (
                metroBeat >
                maxBeat
            ) {

                metroBeat = 1;
                metroMeasure++;

            }

        }

        metroTotal++;

        playClick(
            metroBeat === 1
        );

        updateMetronomeUI(
            maxBeat
        );

    }

}

/* ==================================
   UI
================================== */

function updateMetronomeUI(
    maxBeat
) {

    const mode =
        document.getElementById(
            "display-mode"
        )?.value || "lr";

    const lr =
        document.getElementById(
            "metro-lr"
        );

    const beatView =
        document.getElementById(
            "metro-beat-view"
        );

    if (
        mode === "beat"
    ) {

        if (lr)
            lr.style.display =
                "none";

        if (beatView)
            beatView.style.display =
                "block";

        let html = "";

        for (
            let i = 1;
            i <= maxBeat;
            i++
        ) {

            html +=
                i === metroBeat
                ? "● "
                : "○ ";

        }

        beatView.textContent =
            html;

    } else {

        if (lr)
            lr.style.display =
                "flex";

        if (beatView)
            beatView.style.display =
                "none";

    }

    document.getElementById(
        "metro-current"
    ).textContent =
        `${metroBeat}/${maxBeat}`;

    document.getElementById(
        "metro-measure"
    ).textContent =
        `小節: ${metroMeasure}`;

    document.getElementById(
        "metro-total"
    ).textContent =
        `総拍数: ${metroTotal}`;

}

/* ==================================
   CLICK SOUND
================================== */

function playClick(
    strong
) {

    if (!metroAudio)
        return;

    const osc =
        metroAudio
        .createOscillator();

    const gain =
        metroAudio
        .createGain();

    osc.frequency.value =
        strong
        ? 1400
        : 900;

    gain.gain.value =
        0.05;

    osc.connect(gain);

    gain.connect(
        metroAudio.destination
    );

    osc.start();

    osc.stop(
        metroAudio.currentTime
        + 0.05
    );

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
   TUNER
================================== */

let tunerAudioContext = null;
let tunerAnalyser = null;
let tunerBuffer = null;
let tunerStream = null;

let tunerRunning = false;

/* ==================================
   MIC
================================== */

async function initTunerMic() {

    if (tunerStream) return;

    tunerStream =
        await navigator.mediaDevices.getUserMedia({
            audio: true
        });

    tunerAudioContext =
        new (
            window.AudioContext ||
            window.webkitAudioContext
        )();

    const source =
        tunerAudioContext.createMediaStreamSource(
            tunerStream
        );

    tunerAnalyser =
        tunerAudioContext.createAnalyser();

    tunerAnalyser.fftSize = 4096;

    source.connect(tunerAnalyser);

    tunerBuffer =
        new Float32Array(
            tunerAnalyser.fftSize
        );
}

/* ==================================
   AUTO CORRELATE
================================== */

function tunerDetectFrequency() {

    tunerAnalyser.getFloatTimeDomainData(
        tunerBuffer
    );

    let bestOffset = -1;
    let bestCorr = 0;

    for (
        let offset = 20;
        offset < 1000;
        offset++
    ) {

        let corr = 0;

        for (
            let i = 0;
            i < tunerBuffer.length - offset;
            i++
        ) {

            corr +=
                tunerBuffer[i] *
                tunerBuffer[i + offset];
        }

        if (corr > bestCorr) {

            bestCorr = corr;
            bestOffset = offset;
        }
    }

    if (bestOffset < 0) {
        return -1;
    }

    return (
        tunerAudioContext.sampleRate /
        bestOffset
    );
}

/* ==================================
   NOTE
================================== */

function tunerNote(freq) {

    const notes = [
        "ド","ド#","レ","レ#",
        "ミ","ファ","ファ#",
        "ソ","ソ#","ラ",
        "ラ#","シ"
    ];

    const midi =
        Math.round(
            69 +
            12 *
            Math.log2(freq / 440)
        );

    return {
        name:
            notes[
                ((midi % 12) + 12) % 12
            ],
        octave:
            Math.floor(
                midi / 12
            ) - 1,
        midi
    };
}

/* ==================================
   CENTS
================================== */

function tunerCents(freq) {

    const midi =
        Math.round(
            69 +
            12 *
            Math.log2(freq / 440)
        );

    const target =
        440 *
        Math.pow(
            2,
            (midi - 69) / 12
        );

    return Math.round(
        1200 *
        Math.log2(
            freq / target
        )
    );
}

/* ==================================
   START
================================== */

async function startTuner() {

    if (tunerRunning)
        return;

    await initTunerMic();

    tunerRunning = true;

    const display =
        document.querySelector(
            "#page-tuner .big-display"
        );

    const info =
        document.querySelector(
            "#page-tuner p"
        );

    const needle =
        document.getElementById(
            "tuner-needle"
        );

    let status = "";



    if (needle)
        needle.style.transform =
            "rotate(0deg)";

    const history = [];

    function loop() {

        if (!tunerRunning)
            return;

        const freq =
            tunerDetectFrequency();

        if (
            freq > 50 &&
            freq < 2000
        ) {

            history.push(freq);

            if (
                history.length > 15
            ) {
                history.shift();
            }

            if (
                history.length >= 15
            ) {

                const min =
                    Math.min(...history);

                const max =
                    Math.max(...history);

                if (
                    (max - min) < 10
                ) {

                    const avg =
                        history.reduce(
                            (a,b)=>a+b
                        ) /
                        history.length;

                    const note =
                        tunerNote(avg);

                    const cents =
                        tunerCents(avg);

                    if (display) {

                        display.textContent =
                            `${note.name}${note.octave}`;
                    }

                    if (info) {

                        info.textContent =
                            `${Math.round(avg)}Hz  ${cents > 0 ? "+" : ""}${cents}¢`;
                    }
if (Math.abs(cents) <= 5) {

    status = "🟢 ちょうど良い";

} else if (cents < 0) {

    status = "⬅ 少し低い";

} else {

    status = "➡ 少し高い";

}

if (display) {

    display.innerHTML = `
        🎵 ${note.name}
        <div style="
            font-size:24px;
            margin-top:8px;
        ">
            ${note.octave}オクターブ
        </div>
    `;

}

if (info) {

    info.innerHTML = `
        ${Math.round(avg)}Hz
        <br>
        ${status}
        <br>
        測定完了
    `;

}
                    if (needle) {

                        const angle =
                            Math.max(
                                -45,
                                Math.min(
                                    45,
                                    cents
                                )
                            );

                        needle.style.transform =
                            `rotate(${angle}deg)`;
                    }

                    tunerRunning = false;

                    return;
                }
            }
        }

        requestAnimationFrame(loop);
    }

    loop();
}

/* ==================================
   RETUNE
================================== */

function restartTuner() {

    tunerRunning = false;

    setTimeout(
        startTuner,
        100
    );
}

/* ==================================
   EVENTS
================================== */

window.addEventListener(
    "DOMContentLoaded",
    () => {
        document
    .querySelector(
        "[data-page='pitch']"
    )
    ?.addEventListener(
        "click",
        startPitch
    );
        document
            .querySelector(
                "[data-page='tuner']"
            )
            ?.addEventListener(
                "click",
                startTuner
            );

        document
            .getElementById(
                "retune-btn"
            )
            ?.addEventListener(
                "click",
                restartTuner
            );
    }
);
function detectPitchLoop(display) {

    if (!pitchRunning)
        return;

    tunerAnalyser.getFloatTimeDomainData(
        tunerBuffer
    );

    let rms = 0;

    for (
        let i = 0;
        i < tunerBuffer.length;
        i++
    ) {

        rms +=
            tunerBuffer[i] *
            tunerBuffer[i];

    }

    rms =
        Math.sqrt(
            rms /
            tunerBuffer.length
        );

    if (rms < 0.05) {

        requestAnimationFrame(
            () =>
            detectPitchLoop(display)
        );

        return;

    }

    const freq =
        tunerDetectFrequency();

    if (
        freq > 50 &&
        freq < 2000
    ) {

        const note =
            tunerNote(freq);

        if (display) {

            display.innerHTML = `
                🎵 ${note.name}
                <br>
                ${Math.round(freq)}Hz
                <br>
                ${note.octave}オクターブ
            `;

        }

    }

    requestAnimationFrame(
        () =>
        detectPitchLoop(display)
    );

}
/* ==================================
   PITCH DETECTION
================================== */

let pitchRunning = false;
let lastPitch = "";

/* ==================================
   START
================================== */

async function startPitch() {

    if (pitchRunning) return;

    await initTunerMic();

    pitchRunning = true;

    const display =
        document.querySelector(
            "#page-pitch .big-display"
        );

    if (display) {

        display.innerHTML =
            "🎤 音待ち...";

    }

    detectPitchLoop(display);

}

/* ==================================
   STOP
================================== */

function stopPitch() {

    pitchRunning = false;

}
let noiseRunning = false;

/* ==================================
   NOISE START
================================== */

async function startNoise() {

    if (noiseRunning) return;

    await initTunerMic();

    noiseRunning = true;

    const display =
        document.getElementById("db-display");

    const bar =
        document.querySelector("#page-noise progress");

    if (display) {
        display.textContent = "0 dB";
    }

    noiseLoop(display, bar);
}

/* ==================================
   LOOP（0.5秒更新）
================================== */

function noiseLoop(display, bar) {

    if (!noiseRunning) return;

    tunerAnalyser.getFloatTimeDomainData(
        tunerBuffer
    );

    /* --------------------------
       RMS計算（音量）
    -------------------------- */

    let sum = 0;

    for (let i = 0; i < tunerBuffer.length; i++) {

        const v = tunerBuffer[i];

        sum += v * v;

    }

    const rms =
        Math.sqrt(sum / tunerBuffer.length);

    /* --------------------------
       小さい音は無視
    -------------------------- */

    let db = 0;

    if (rms > 0.01) {

        db =
            20 * Math.log10(rms);

        db = Math.abs(db) * 10;

        db = Math.min(120, db);

        if (db < 50) {
            db = 0;
        }
    }

    /* --------------------------
       表示更新（安定化）
    -------------------------- */

    const value = Math.round(db);

    if (display) {
        display.textContent = value + " dB";
    }

    if (bar) {
        bar.value = value;
    }

    /* --------------------------
       0.5秒ループ
    -------------------------- */

    setTimeout(() => {
        requestAnimationFrame(() => {
            noiseLoop(display, bar);
        });
    }, 500);
}

/* ==================================
   STOP
================================== */

function stopNoise() {
    noiseRunning = false;
}

/* ==================================
   EVENT
================================== */

window.addEventListener("DOMContentLoaded", () => {

    document
        .querySelector("[data-page='noise']")
        ?.addEventListener("click", startNoise);

});
