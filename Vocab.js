javascript:(function(){
    let dbUrl = "https://raw.githubusercontent.com/Fluffy-Bunny-23/Suburani-Bookmarklets/refs/heads/main/vocabulary.json";
    let running = false;
    let keyLock = false;
    console.clear ()
    console.log("⏳ Fetching vocabulary database...");

    fetch(dbUrl)
        .then(response => response.json())
        .then(data => {
            console.log("✅ Vocabulary database loaded successfully!");
            
            function autoAnswer() {
                if (!running) return;

                let flashLatEl = document.querySelector("#flashlat");
                let nextFlashBtn = document.querySelector("#nextq1");

                if (flashLatEl && nextFlashBtn) {
                    setTimeout(() => nextFlashBtn.click(), 1000);
                    setTimeout(autoAnswer, 1500);
                    return;
                }

                let questionEl = document.querySelector("#q1, #qtyp");
                if (!questionEl) {
                    setTimeout(autoAnswer, 500);
                    return;
                }

                let latinQuestion = questionEl.textContent.trim().replace(/^\d+\s*/, '');
                console.log(`📖 Question: "${latinQuestion}"`);

                let primaryLatinWord = latinQuestion.split(",")[0].trim();

                let entry = data.find(item => item.latin.split(",")[0].trim() === primaryLatinWord);
                if (!entry) {
                    console.warn(`⚠️ No match for "${latinQuestion}"`);
                    return;
                }

                let correctAnswers = entry.english.toLowerCase().split(",").map(s => s.trim());
                console.log(`✅ Found: "${entry.latin}" ->`, correctAnswers);

                let options = document.querySelectorAll(".multib");
                if (options.length > 0) {
                    options.forEach(option => {
                        let optionText = option.textContent.trim().toLowerCase().replace(/^\d+\s*/, '');
                        if (correctAnswers.includes(optionText)) {
                            console.log(`🟢 Clicking: "${optionText}"`);
                            option.click();
                        }
                    });
                    setTimeout(autoAnswer, 1000);
                    return;
                }

                let inputBox = document.querySelector("#typeans");
                let checkButton = document.querySelector("#checkbtn");
                if (inputBox && checkButton) {
                    let answer = correctAnswers[0];
                    console.log(`⌨️ Typing: "${answer}"`);
                    inputBox.value = answer;
                    inputBox.dispatchEvent(new Event("input", { bubbles: true }));
                    checkButton.click();
                    setTimeout(autoAnswer, 1000);
                    return;
                }

                setTimeout(autoAnswer, 1000);
            }

            document.addEventListener("keydown", function(event) {
                if (event.key === "\\" && !keyLock) {
                    keyLock = true;
                    running = !running;
                    console.log(running ? "▶️ Auto-answer STARTED!" : "⏹️ Auto-answer STOPPED!");
                    if (running) autoAnswer();
                    setTimeout(() => keyLock = false, 300); // Prevents duplicate logs from key repeat
                }
            });

            console.log("🔹 Press '\\' to start/stop auto-answer.");
        })
        .catch(error => console.error("❌ Error loading database:", error));
})();
