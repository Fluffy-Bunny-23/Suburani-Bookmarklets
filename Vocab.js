javascript:(function(){
    console.clear(); // Clears the console at the start

    let dbUrl = "https://raw.githubusercontent.com/Fluffy-Bunny-23/Suburani-Bookmarklets/refs/heads/main/vocabulary.json";
    let running = false;
    let keyLock = false;

    console.log("⏳ Fetching vocabulary database...");

    fetch(dbUrl)
        .then(response => response.json())
        .then(data => {
            console.log("✅ Vocabulary database loaded successfully!");

            function createIndicator() {
                let indicator = document.createElement("div");
                indicator.id = "autoAnswerIndicator";
                indicator.style.position = "fixed";
                indicator.style.bottom = "10px";
                indicator.style.right = "10px";
                indicator.style.padding = "8px 14px";
                indicator.style.backgroundColor = "red";
                indicator.style.color = "#fff";
                indicator.style.fontSize = "14px";
                indicator.style.borderRadius = "5px";
                indicator.style.zIndex = "1000";
                indicator.style.fontFamily = "Arial, sans-serif";
                indicator.style.cursor = "pointer";
                indicator.style.userSelect = "none";
                indicator.style.transition = "opacity 0.3s, background-color 0.3s";
                indicator.textContent = "OFF";
                indicator.onclick = toggleAutoAnswer;
                document.body.appendChild(indicator);
                
                // Create answer status indicator - always visible
                let answerStatus = document.createElement("div");
                answerStatus.id = "answerStatusIndicator";
                answerStatus.style.position = "fixed";
                answerStatus.style.bottom = "50px";
                answerStatus.style.right = "10px";
                answerStatus.style.padding = "8px 14px";
                answerStatus.style.backgroundColor = "#333";
                answerStatus.style.color = "#fff";
                answerStatus.style.fontSize = "14px";
                answerStatus.style.borderRadius = "5px";
                answerStatus.style.zIndex = "1000";
                answerStatus.style.fontFamily = "Arial, sans-serif";
                answerStatus.style.maxWidth = "300px";
                answerStatus.style.transition = "background-color 0.3s";
                answerStatus.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
                answerStatus.textContent = "Listening for questions...";
                document.body.appendChild(answerStatus);
            }

            function updateIndicator() {
                let indicator = document.getElementById("autoAnswerIndicator");
                if (indicator) {
                    indicator.textContent = running ? "Auto Answer ON" : "OFF";
                    indicator.style.backgroundColor = running ? "green" : "red";
                }
                
                // Update the status style based on running status
                let answerStatus = document.getElementById("answerStatusIndicator");
                if (answerStatus) {
                    answerStatus.style.border = running ? "2px solid green" : "2px solid gray";
                }
            }
            
            function showAnswerStatus(message, color = "#333", autoAnswer = false) {
                let answerStatus = document.getElementById("answerStatusIndicator");
                if (answerStatus) {
                    // If it mentions "Selecting" or "Typing", only show when auto-answer is on
                    if ((message.includes("Selecting") || message.includes("Typing") || message.includes("Moving")) && !running) {
                        return;
                    }
                    
                    answerStatus.innerHTML = message;
                    answerStatus.style.backgroundColor = color;
                    
                    // Add an indicator if auto-answer is taking action
                    if (autoAnswer && running) {
                        answerStatus.innerHTML += ' <span style="color:#FFCC00;">⚡</span>';
                    }
                }
            }

            function toggleAutoAnswer() {
                running = !running;
                console.log(running ? "▶️ Auto-answer STARTED!" : "⏹️ Auto-answer STOPPED!");
                updateIndicator();
                if (running) autoAnswer();
            }

            function checkCurrentQuestion() {
                let questionEl = document.querySelector("#q1, #qtyp");
                if (questionEl) {
                    let latinQuestion = questionEl.textContent.trim().replace(/^\d+\s*/, '');
                    let primaryLatinWord = latinQuestion.split(",")[0].trim();
                    
                    let entry = data.find(item => item.latin.split(",")[0].trim() === primaryLatinWord);
                    if (entry) {
                        let correctAnswers = entry.english.toLowerCase().split(",").map(s => s.trim());
                        showAnswerStatus(`<b>Question:</b> "${latinQuestion}"<br><b>Answer:</b> ${correctAnswers.join(", ")}`, "#1a5276");
                        
                        return { question: latinQuestion, answers: correctAnswers, entry: entry };
                    } else {
                        showAnswerStatus(`<b>Question:</b> "${latinQuestion}"<br><b>No answer found in database</b>`, "#d35400");
                    }
                }
                return null;
            }

            function autoAnswer() {
                if (!running) return;

                let flashLatEl = document.querySelector("#flashlat");
                let nextFlashBtn = document.querySelector("#nextq1");

                if (flashLatEl && nextFlashBtn) {
                    showAnswerStatus("Moving to next question...", "#666", true);
                    setTimeout(() => nextFlashBtn.click(), 1000);
                    setTimeout(autoAnswer, 1500);
                    return;
                }

                let questionInfo = checkCurrentQuestion();
                if (!questionInfo) {
                    showAnswerStatus("Waiting for question...", "#666");
                    setTimeout(autoAnswer, 500);
                    return;
                }

                let options = document.querySelectorAll(".multib");
                if (options.length > 0) {
                    let matchFound = false;
                    options.forEach(option => {
                        let optionText = option.textContent.trim().toLowerCase().replace(/^\d+\s*/, '');
                        if (questionInfo.answers.includes(optionText)) {
                            console.log(`🟢 Clicking: "${optionText}"`);
                            showAnswerStatus(`<b>Question:</b> "${questionInfo.question}"<br><b>Answer:</b> ${questionInfo.answers.join(", ")}<br><b>Selecting:</b> "${optionText}"`, "#27ae60", true);
                            matchFound = true;
                            setTimeout(() => option.click(), 500);
                        }
                    });
                    
                    if (!matchFound) {
                        showAnswerStatus(`<b>Question:</b> "${questionInfo.question}"<br><b>Answer:</b> ${questionInfo.answers.join(", ")}<br><b>Warning:</b> No matching option found`, "#d35400");
                    }
                    
                    setTimeout(autoAnswer, 1000);
                    return;
                }

                let inputBox = document.querySelector("#typeans");
                let checkButton = document.querySelector("#checkbtn");
                if (inputBox && checkButton) {
                    let answer = questionInfo.answers[0];
                    console.log(`⌨️ Typing: "${answer}"`);
                    showAnswerStatus(`<b>Question:</b> "${questionInfo.question}"<br><b>Answer:</b> ${questionInfo.answers.join(", ")}<br><b>Typing:</b> "${answer}"`, "#16a085", true);
                    inputBox.value = answer;
                    inputBox.dispatchEvent(new Event("input", { bubbles: true }));
                    setTimeout(() => checkButton.click(), 500);
                    setTimeout(autoAnswer, 1000);
                    return;
                }

                setTimeout(autoAnswer, 1000);
            }

            // Set up continuous question monitoring
            function monitorQuestions() {
                checkCurrentQuestion();
                setTimeout(monitorQuestions, 1000);
            }

            document.addEventListener("keydown", function(event) {
                if (event.key === "\\" && !keyLock) {
                    keyLock = true;
                    toggleAutoAnswer();
                    setTimeout(() => keyLock = false, 300);
                }
            });

            createIndicator();
            monitorQuestions(); // Start monitoring questions regardless of auto-answer status
            console.log("🔹 Press '\\' or click the indicator to start/stop auto-answer.");
        })
        .catch(error => console.error("❌ Error loading database:", error));
})();
