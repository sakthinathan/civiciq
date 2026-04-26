"use strict";

window.civiciqState = {
  currentView: "explore",
  currentCountry: null,
  chatHistory: [],
  quizState: { country: null, questions: [], current: 0, score: 0, answered: false },
  translateLang: null,
  allCountries: {}
};

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initCountryCards();
  if (window.initChatInput) window.initChatInput();
  bindQuizCountryButtons();
  loadAllCountries();
  setView("explore");
});

function initNav() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  const translateToggle = document.getElementById("translateToggle");
  if (translateToggle) {
    translateToggle.addEventListener("click", () => {
      if (window.toggleLangPicker) window.toggleLangPicker();
    });
  }

  document.querySelectorAll(".lang-picker button").forEach(btn => {
    btn.addEventListener("click", () => {
      if (window.selectLanguage) window.selectLanguage(btn.dataset.lang);
    });
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".header-actions")) {
      document.getElementById("langPicker")?.classList.add("hidden");
    }
  });
}

function setView(view) {
  window.civiciqState.currentView = view;

  // Toggle hero visibility so it doesn't linger on other pages
  const hero = document.querySelector(".hero");
  if (hero) {
    if (view === "explore") {
      hero.style.display = ""; // default
    } else {
      hero.style.display = "none";
    }
  }

  document.querySelectorAll(".view").forEach(v => {
    v.classList.toggle("active", v.id === `view-${view}`);
    v.classList.toggle("hidden", v.id !== `view-${view}`);
  });

  document.querySelectorAll(".nav-btn").forEach(btn => {
    const isActive = btn.dataset.view === view;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-current", isActive ? "page" : "false");
  });

  if (view === "compare") renderCompare();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initCountryCards() {
  document.querySelectorAll(".country-card").forEach(card => {
    card.addEventListener("click", () => openCountry(card.dataset.country));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openCountry(card.dataset.country);
      }
    });
  });
}

async function openCountry(countryId) {
  try {
    const res = await fetch(`/api/elections/${countryId}`);
    if (!res.ok) throw new Error("Country not found");

    const data = await res.json();
    window.civiciqState.currentCountry = countryId;
    renderCountryDetail(data);

    document.querySelector(".country-grid")?.classList.add("hidden");
    document.getElementById("countryDetail")?.classList.remove("hidden");
    
    // Hide hero when focusing on a single country
    const hero = document.querySelector(".hero");
    if (hero) hero.style.display = "none";
    
    document.getElementById("countryDetail")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    showToast("Could not load country data.");
  }
}

function renderCountryDetail(data) {
  document.getElementById("detailFlag").textContent = data.flag;
  document.getElementById("detailName").textContent = data.name;
  document.getElementById("detailSystem").textContent = data.system;
  document.getElementById("detailBody").textContent = data.body;
  document.getElementById("detailFreq").textContent = data.frequency;
  document.getElementById("detailDesc").textContent = data.description;

  const factsEl = document.getElementById("detailFacts");
  factsEl.innerHTML = (data.facts || []).map(f =>
    `<span class="fact-chip" role="listitem">💡 ${escapeHtml(f)}</span>`
  ).join("");

  if (window.renderTimeline) window.renderTimeline(data.timeline || []);
  if (window.renderVotingSteps) window.renderVotingSteps(data.steps || [], data.youtubeId);
  if (window.initDetailTabs) window.initDetailTabs();

  const tabBtnStates = document.getElementById("tabBtnStates");
  if (data.states_data && data.states_data.length > 0) {
    if (tabBtnStates) tabBtnStates.style.display = "inline-block";
    renderStatesBreakdown(data.states_data);
  } else {
    if (tabBtnStates) tabBtnStates.style.display = "none";
  }
}

function renderStatesBreakdown(states) {
  const container = document.getElementById("statesContainer");
  if (!container) return;
  
  const total = states.reduce((sum, s) => sum + s.seats, 0);
  
  let html = `<div class="info-layout" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
    <div class="info-content">
       <div style="margin-bottom: 20px; font-size: 1.1rem; color: var(--gold); font-weight: 700;">🇮🇳 Lok Sabha Breakdown</div>
       <p style="font-size: 0.9rem; margin-bottom: 20px; opacity: 0.8;">The Lok Sabha consists of 543 representatives elected directly by the people. Below is the seat distribution across all 36 States and Union Territories.</p>
       <div style="font-weight: 500;">Total Constituencies: <span style="color:var(--gold); font-weight:900;">${total}</span></div>
    </div>
    <div class="info-map" style="border-radius: 12px; overflow: hidden; border: 1px solid var(--gold-pale);">
       <iframe width="100%" height="200" style="border:0" loading="lazy" allowfullscreen 
         src="https://www.google.com/maps/embed/v1/place?key=${window.MAPS_API_KEY}&q=India+Election+Commission"></iframe>
       <div style="padding: 10px; font-size: 0.75rem; text-align: center; background: var(--paper-light);">🗺️ Dynamic Regional Context Viewer</div>
    </div>
  </div>`;

  html += `<table class="compare-table" style="width: 100%;">
    <thead>
      <tr>
        <th style="text-align: left;">State / Union Territory</th>
        <th style="text-align: center;">Lok Sabha Seats</th>
      </tr>
    </thead>
    <tbody>`;
    
  states.sort((a,b) => b.seats - a.seats).forEach(s => {
    html += `<tr>
      <td style="text-align: left;">${escapeHtml(s.name)}</td>
      <td style="text-align: center;"><strong>${s.seats}</strong></td>
    </tr>`;
  });
  
  html += `</tbody></table>`;
  container.innerHTML = html;
}

function closeCountry() {
  window.civiciqState.currentCountry = null;
  document.getElementById("countryDetail")?.classList.add("hidden");
  document.querySelector(".country-grid")?.classList.remove("hidden");
  
  // Bring back hero
  const hero = document.querySelector(".hero");
  if (hero && window.civiciqState.currentView === "explore") hero.style.display = "";
}

async function loadAllCountries() {
  try {
    const res = await fetch("/api/elections");
    window.civiciqState.allCountries = await res.json();
  } catch (e) {
    window.civiciqState.allCountries = {};
  }
}

const compareData = [
  { id: "india", compulsory: false, cycle: 5, votersM: 970 },
  { id: "usa", compulsory: false, cycle: 4, votersM: 240 },
  { id: "uk", compulsory: false, cycle: 5, votersM: 48 },
  { id: "eu", compulsory: false, cycle: 5, votersM: 370 },
  { id: "brazil", compulsory: true, cycle: 4, votersM: 156 }
];

function renderCompare() {
  const tbody = document.getElementById("compareBody");
  if (!tbody) return;

  const countries = {
    india: { name: "India", flag: "🇮🇳", system: "Parliamentary Democracy", body: "Election Commission of India", freq: "Every 5 years" },
    usa: { name: "United States", flag: "🇺🇸", system: "Federal Presidential Republic", body: "Federal Election Commission", freq: "Every 4 years" },
    uk: { name: "United Kingdom", flag: "🇬🇧", system: "Constitutional Monarchy", body: "Electoral Commission", freq: "Every 5 years" },
    eu: { name: "European Union", flag: "🇪🇺", system: "Supranational Union", body: "European Parliament", freq: "Every 5 years" },
    brazil: { name: "Brazil", flag: "🇧🇷", system: "Federal Presidential Republic", body: "Tribunal Superior Electoral", freq: "Every 4 years" }
  };

  tbody.innerHTML = compareData.map(d => {
    const c = countries[d.id];
    return `<tr>
      <td><span class="flag-cell" aria-hidden="true">${c.flag}</span> ${c.name}</td>
      <td>${c.system}</td>
      <td>${c.freq}</td>
      <td>${d.votersM}M+</td>
      <td style="font-size:0.82rem">${c.body}</td>
      <td><span class="badge ${d.compulsory ? "badge-yes" : "badge-no"}">${d.compulsory ? "Yes" : "No"}</span></td>
    </tr>`;
  }).join("");

  const maxV = Math.max(...compareData.map(d => d.votersM));
  document.getElementById("voterChart").innerHTML = compareData.map(d => {
    const c = countries[d.id];
    const pct = Math.round((d.votersM / maxV) * 100);
    return `<div class="bar-row">
      <span class="bar-label" aria-hidden="true">${c.flag}</span>
      <div class="bar-track"><div class="bar-fill" style="width:0%" data-width="${pct}%" role="img" aria-label="${c.name}: ${d.votersM}M voters"></div></div>
      <span class="bar-val">${d.votersM}M</span>
    </div>`;
  }).join("");

  const maxC = 5;
  document.getElementById("cycleChart").innerHTML = compareData.map(d => {
    const c = countries[d.id];
    const pct = Math.round((d.cycle / maxC) * 100);
    return `<div class="bar-row">
      <span class="bar-label" aria-hidden="true">${c.flag}</span>
      <div class="bar-track"><div class="bar-fill" style="width:0%" data-width="${pct}%" role="img" aria-label="${c.name}: every ${d.cycle} years"></div></div>
      <span class="bar-val">${d.cycle} yrs</span>
    </div>`;
  }).join("");

  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll(".bar-fill").forEach(bar => {
        bar.style.width = bar.dataset.width;
      });
    }, 100);
  });
}

function bindQuizCountryButtons() {
  document.querySelectorAll(".quiz-country-btn").forEach(btn => {
    btn.addEventListener("click", () => startQuiz(btn.dataset.country));
  });
}

async function startQuiz(countryId) {
  document.querySelectorAll(".quiz-country-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.country === countryId);
  });

  try {
    const res = await fetch(`/api/elections/${countryId}`);
    if (!res.ok) throw new Error("Quiz source data unavailable");

    const country = await res.json();
    
    const qc = document.getElementById("quizContainer");
    if (qc) {
      qc.classList.remove("hidden");
      qc.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--gold);">🤖 Generating dynamic AI quiz for ${country.name}...</div>`;
    }

    let questions = [];
    try {
      const qRes = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({country: country.name})
      });
      const qData = await qRes.json();
      if (qData && qData.questions && qData.questions.length > 0) {
        questions = qData.questions;
      }
    } catch(e) {
      console.warn("AI Quiz generation failed, utilizing fallback");
    }

    if (!questions || questions.length === 0) {
      questions = buildQuizQuestions(country);
    }

    window.civiciqState.quizState = {
      country: countryId,
      questions,
      current: 0,
      score: 0,
      answered: false
    };

    renderQuizQuestion();
  } catch (e) {
    showToast("Could not load quiz.");
  }
}

function buildQuizQuestions(countryData) {
  const defaults = [
    {
      q: `How often are national elections held in ${countryData.name}?`,
      options: ["Every year", countryData.frequency, "Every 10 years", "No fixed schedule"],
      answer: 1
    },
    {
      q: `Which body primarily manages elections in ${countryData.name}?`,
      options: [countryData.body, "United Nations", "World Bank", "Local courts only"],
      answer: 0
    },
    {
      q: `Which electoral system is used in ${countryData.name}?`,
      options: [countryData.system, "Sortition", "Direct digital voting only", "Military appointment"],
      answer: 0
    },
    {
      q: `Approximately how many voters are represented in ${countryData.name}?`,
      options: [countryData.voters, "Under 1 million", "Under 10 million", "No voter registry"],
      answer: 0
    }
  ];

  return defaults;
}

function renderQuizQuestion() {
  const { questions, current, score } = window.civiciqState.quizState;
  const qc = document.getElementById("quizContainer");
  if (!qc) return;

  if (current >= questions.length) {
    const pct = Math.round((score / questions.length) * 100);
    const emoji = pct >= 75 ? "Great work" : pct >= 50 ? "Good effort" : "Keep learning";
    qc.innerHTML = `
      <div class="quiz-score" role="region" aria-label="Quiz results">
        <span class="quiz-score-num" aria-label="Score ${score} out of ${questions.length}">${score}/${questions.length}</span>
        <div class="quiz-score-label">${emoji}. You scored ${pct}%.</div>
        <button class="quiz-restart-btn" onclick="startQuiz('${window.civiciqState.quizState.country}')" aria-label="Try again">Try Again</button>
      </div>`;
    return;
  }

  const q = questions[current];
  window.civiciqState.quizState.answered = false;

  qc.innerHTML = `
    <div class="quiz-progress" aria-label="Question ${current + 1} of ${questions.length}">Question ${current + 1} of ${questions.length} · Score: ${score}</div>
    <div class="quiz-progress-bar" role="progressbar" aria-valuenow="${current}" aria-valuemin="0" aria-valuemax="${questions.length}">
      <div class="quiz-progress-fill" style="width:${(current / questions.length) * 100}%"></div>
    </div>
    <div class="quiz-q" id="quizQuestion">${escapeHtml(q.q)}</div>
    <div class="quiz-options" role="list" aria-labelledby="quizQuestion">
      ${q.options.map((opt, i) =>
        `<button class="quiz-option" role="listitem" data-index="${i}" onclick="answerQuiz(${i})" aria-label="Option ${i + 1}: ${escapeHtml(opt)}">${escapeHtml(opt)}</button>`
      ).join("")}
    </div>
    <div id="quizFeedback" aria-live="polite"></div>`;
}

function answerQuiz(selectedIndex) {
  if (window.civiciqState.quizState.answered) return;
  window.civiciqState.quizState.answered = true;

  const { questions, current } = window.civiciqState.quizState;
  const correct = questions[current].answer;
  const isCorrect = selectedIndex === correct;

  if (isCorrect) window.civiciqState.quizState.score += 1;

  document.querySelectorAll(".quiz-option").forEach((btn, i) => {
    btn.disabled = true;
    if (i === correct) btn.classList.add("correct");
    else if (i === selectedIndex && !isCorrect) btn.classList.add("wrong");
  });

  const fb = document.getElementById("quizFeedback");
  if (!fb) return;

  fb.innerHTML = `<div class="quiz-feedback ${isCorrect ? "correct" : "wrong"}" role="alert">
    ${isCorrect ? "Correct." : `The correct answer is: <strong>${escapeHtml(questions[current].options[correct])}</strong>`}
  </div>
  <button class="quiz-next-btn" onclick="nextQuizQuestion()" aria-label="${current + 1 < questions.length ? "Next question" : "See results"}">
    ${current + 1 < questions.length ? "Next Question" : "See Results"}
  </button>`;
}

function nextQuizQuestion() {
  window.civiciqState.quizState.current += 1;
  renderQuizQuestion();
}

function openQuizForCurrent() {
  if (window.civiciqState.currentCountry) {
    setView("quiz");
    startQuiz(window.civiciqState.currentCountry);
  }
}

function showToast(msg, duration = 3500) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  toast.setAttribute("role", "status");
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slide-in 0.3s ease reverse both";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

window.showToast = showToast;
window.escapeHtml = escapeHtml;
window.setView = setView;
window.closeCountry = closeCountry;
window.openQuizForCurrent = openQuizForCurrent;
window.answerQuiz = answerQuiz;
window.nextQuizQuestion = nextQuizQuestion;
window.startQuiz = startQuiz;
