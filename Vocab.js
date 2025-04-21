javascript:(function(){
  console.clear();
  console.log("🔹 Script starting — fetching vocabulary database…");

  const DB_URL = "https://raw.githubusercontent.com/Fluffy-Bunny-23/Suburani-Bookmarklets/refs/heads/main/vocabulary.json";
  let autoEnabled = false;
  let uiVisible   = true;
  let lastQuestion = "";

  // — Create Toggle Button —
  const toggleBtn = document.createElement("div");
  Object.assign(toggleBtn.style, {
    position: "fixed", bottom: "10px", right: "10px",
    padding: "6px 12px", backgroundColor: "#c00", color: "#fff",
    borderRadius: "5px", cursor: "pointer", zIndex: 9999,
    fontFamily: "Arial,sans-serif", fontSize: "14px", userSelect: "none"
  });
  toggleBtn.textContent = "Auto Answer: OFF";
  toggleBtn.onclick = () => {
    autoEnabled = !autoEnabled;
    toggleBtn.textContent = `Auto Answer: ${autoEnabled?"ON":"OFF"}`;
    toggleBtn.style.backgroundColor = autoEnabled ? "#080" : "#c00";
    console.log(`🔹 Auto Answer ${autoEnabled?"Enabled":"Disabled"}`);
  };
  document.body.appendChild(toggleBtn);

  // — Create Answer Display Box —
  const answerBox = document.createElement("div");
  Object.assign(answerBox.style, {
    position: "fixed", bottom: "50px", right: "10px",
    padding: "5px 10px", backgroundColor: "rgba(0,0,0,0.75)",
    color: "#fff", borderRadius: "5px", fontFamily: "Arial,sans-serif",
    fontSize: "13px", zIndex: 9998, userSelect: "none", pointerEvents: "none"
  });
  document.body.appendChild(answerBox);

  // — Show/Hide UI with backslash —
  document.addEventListener("keydown", e => {
    if (e.key === "\\") {
      uiVisible = !uiVisible;
      toggleBtn.style.display = uiVisible ? "block" : "none";
      answerBox.style.display = uiVisible && answerBox.textContent ? "block" : "none";
      console.log(`🔹 UI ${uiVisible?"shown":"hidden"}`);
    }
  });

  // — Update Answer Display —
  function updateAnswer(text) {
    answerBox.textContent = text ? `Answer: ${text}` : "";
    answerBox.style.display = uiVisible && text ? "block" : "none";
  }

  // — Detect the current visible question text —
  function detectQuestion() {
    // Flashcard
    const flash = document.querySelector("#flashpag");
    if (flash && getComputedStyle(flash).display !== "none") {
      let el = flash.querySelector("#flashlat");
      if (el && el.textContent.trim()) return el.textContent.trim();
    }
    // Multiple-choice
    const multi = document.querySelector("#multi");
    if (multi && getComputedStyle(multi).display !== "none") {
      let el = multi.querySelector(".multiq");
      if (el && el.textContent.trim()) return el.textContent.trim();
    }
    // Type‑in
    const typein = document.querySelector("#typein");
    if (typein && getComputedStyle(typein).display !== "none") {
      let el = typein.querySelector("#qtyp");
      if (el && el.textContent.trim()) return el.textContent.trim();
    }
    return null;
  }

  // — Perform the actual clicking or typing —
  function answerThis(answer) {
    // 1) If Type‑in is visible, do that first:
    const typein = document.querySelector("#typein");
    if (typein && getComputedStyle(typein).display !== "none") {
      let inp = document.querySelector("#typeans");
      let btn = document.querySelector("#checkbtn");
      if (inp && btn) {
        console.log(`⌨️ Typing: "${answer}"`);
        inp.value = answer;
        inp.dispatchEvent(new Event("input",{bubbles:true}));
        // slight delay before clicking
        setTimeout(() => {
          console.log("🖱️ Submitting typed answer");
          btn.click();
        }, 100);
        return;
      }
    }
    // 2) Else, handle multiple-choice (only visible options):
    const opts = Array.from(document.querySelectorAll("#multi .multib"))
      .filter(o => o.offsetParent !== null);
    if (opts.length) {
      for (let o of opts) {
        let txt = o.textContent.replace(/^\d+\s*/, "").trim().toLowerCase();
        if (txt === answer.toLowerCase() || txt.split(/\s*,\s*/).includes(answer.toLowerCase())) {
          console.log(`🖱️ Clicking option: "${txt}"`);
          o.click();
          return;
        }
      }
      console.warn("⚠️ No matching visible option found.");
    }
  }

  // — Main Loop: fetch DB, then poll every second —
  fetch(DB_URL)
    .then(r => r.json())
    .then(db => {
      console.log("✅ Vocabulary database loaded!");
      setInterval(() => {
        const q = detectQuestion();
        if (!q) {
          updateAnswer("");
          return;
        }
        if (q === lastQuestion) return;
        lastQuestion = q;
        console.log(`📖 New question: "${q}"`);

        const entry = db.find(e => e.latin.split(",")[0].trim() === q.split(",")[0].trim());
        if (!entry) {
          console.warn(`⚠️ No DB match for "${q}"`);
          updateAnswer("?");
          return;
        }

        const ans = entry.english;
        console.log(`✅ Matched "${entry.latin}" → "${ans}"`);
        updateAnswer(ans);

        if (autoEnabled) answerThis(ans);
      }, 1000);
    })
    .catch(e => console.error("❌ Failed to load DB:", e));
})();
