javascript:(function(){
    console.clear(); // Clears the console at the start

    let dbUrl = "https://raw.githubusercontent.com/Fluffy-Bunny-23/Suburani-Bookmarklets/refs/heads/main/vocabulary.json";
    let running = false;
    let keyLock = false;
    let lastQuestion = "";
    let uiVisible = true; // Track UI visibility state

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
            
            function toggleUIVisibility() {
                uiVisible = !uiVisible;
                
                let indicator = document.getElementById("autoAnswerIndicator");
                let answerStatus = document.getElementById("answerStatusIndicator");
                
                if (indicator) {
                    indicator.style.display = uiVisible ? "block" : "none";
                }
                
                if (answerStatus) {
                    answerStatus.style.display = uiVisible ? "block" : "none";
                }
                
                console.log(uiVisible ? "🔍 UI is now visible" : "🔒 UI is now hidden");
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

            function getActiveQuestionType() {
                // Check which question container is currently displayed
                const flashpagEl = document.getElementById("flashpag");
                const multiEl = document.getElementById("multi");
                const typeinEl = document.getElementById("typein");
                
                if (flashpagEl && flashpagEl.style.display !== "none") {
                    return "flash";
                } else if (multiEl && multiEl.style.display !== "none") {
                    return "multi";
                } else if (typeinEl && typeinEl.style.display !== "none") {
                    return "typein";
                } else {
                    return null;
                }
            }

            function getCurrentQuestion() {
                const questionType = getActiveQuestionType();
                let questionEl;
                
                // Get the question element based on the active question type
                switch (questionType) {
                    case "flash":
                        questionEl = document.querySelector("#flashlat");
                        break;
                    case "multi":
                        questionEl = document.querySelector("#q1");
                        break;
                    case "typein":
                        questionEl = document.querySelector("#qtyp");
                        break;
                    default:
                        return null;
                }
                
                if (questionEl && questionEl.textContent) {
                    let questionText = questionEl.textContent.trim().replace(/^\d+\s*/, '');
                    // Removed the "Found question from" console.log
                    return questionText;
                }
                
                return null;
            }

            function checkCurrentQuestion() {
                let latinQuestion = getCurrentQuestion();
                
                // Return if no question found or if it's the same as last time
                if (!latinQuestion) {
                    showAnswerStatus("Waiting for question...", "#666");
                    return null;
                }
                
                // If we've already processed this question and nothing has changed, don't update
                if (latinQuestion === lastQuestion) {
                    return null;
                }
                
                // Update the last question we've seen
                lastQuestion = latinQuestion;
                
                // Normalize the question to find the primary Latin word
                let primaryLatinWord = latinQuestion.split(",")[0].trim();
                
                let entry = data.find(item => {
                    // Normalize both strings for comparison by removing accents
                    let normalizedItem = item.latin.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    let normalizedQuery = primaryLatinWord.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    
                    return normalizedItem.split(",")[0].trim() === normalizedQuery;
                });
                
                if (entry) {
                    let correctAnswers = entry.english.toLowerCase().split(",").map(s => s.trim());
                    
                    // Always show answer for both question types
                    if (document.querySelector(".multib")) {
                        // For multiple choice
                        showAnswerStatus(`<b>Question:</b> "${latinQuestion}"<br><b>Answer:</b> ${correctAnswers.join(", ")}<br><b>Look for:</b> ${highlightMatchingOptions(correctAnswers)}`, "#1a5276");
                    } else if (document.querySelector("#typeans")) {
                        // For typing questions
                        showAnswerStatus(`<b>Question:</b> "${latinQuestion}"<br><b>Answer:</b> ${correctAnswers.join(", ")}`, "#1a5276");
                    } else {
                        showAnswerStatus(`<b>Question:</b> "${latinQuestion}"<br><b>Answer:</b> ${correctAnswers.join(", ")}`, "#1a5276");
                    }
                    
                    return { question: latinQuestion, answers: correctAnswers, entry: entry };
                } else {
                    showAnswerStatus(`<b>Question:</b> "${latinQuestion}"<br><b>No answer found in database</b>`, "#d35400");
                }
                
                return null;
            }
            
            function highlightMatchingOptions(correctAnswers) {
                let options = document.querySelectorAll(".multib");
                let matchingOptions = [];
                
                options.forEach(option => {
                    let optionText = option.textContent.trim().toLowerCase().replace(/^\d+\s*/, '');
                    if (correctAnswers.includes(optionText)) {
                        matchingOptions.push(`<span style="color:#2ecc71;font-weight:bold;">${optionText}</span>`);
                    }
                });
                
                return matchingOptions.length > 0 ? matchingOptions.join(", ") : "No matching option found";
            }

            // Trigger click on an element with proper event bubbling
            function simulateClick(element) {
                if (!element) return;
                
                // Use multiple methods to ensure the click is registered
                try {
                    // Method 1: Standard click() method
                    element.click();
                    
                    // Method 2: MouseEvent simulation
                    const evt = new MouseEvent("click", {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    element.dispatchEvent(evt);
                } catch (e) {
                    console.error("Error clicking element:", e);
                }
            }

            // Fill input field and trigger events
            function simulateTyping(element, value) {
                if (!element) return;
                
                try {
                    // Set the value directly
                    element.value = value;
                    
                    // Trigger multiple events to ensure proper registration
                    ["input", "change", "keyup", "keydown", "keypress"].forEach(eventType => {
                        const event = new Event(eventType, { bubbles: true });
                        element.dispatchEvent(event);
                    });
                } catch (e) {
                    console.error("Error typing into element:", e);
                }
            }

            function autoAnswer() {
                if (!running) return;

                let flashLatEl = document.querySelector("#flashlat");
                let nextFlashBtn = document.querySelector("#nextq1");

                if (flashLatEl && nextFlashBtn && getActiveQuestionType() === "flash") {
                    showAnswerStatus("Moving to next question...", "#666", true);
                    setTimeout(() => simulateClick(nextFlashBtn), 1000);
                    setTimeout(autoAnswer, 1500);
                    return;
                }

                let questionInfo = checkCurrentQuestion();
                
                // If we didn't get question info, try again later
                if (!questionInfo) {
                    setTimeout(autoAnswer, 500);
                    return;
                }

                let options = document.querySelectorAll(".multib");
                if (options.length > 0 && getActiveQuestionType() === "multi") {
                    let matchFound = false;
                    options.forEach(option => {
                        let optionText = option.textContent.trim().toLowerCase().replace(/^\d+\s*/, '');
                        if (questionInfo.answers.includes(optionText)) {
                            console.log(`🟢 Clicking: "${optionText}"`);
                            showAnswerStatus(`<b>Question:</b> "${questionInfo.question}"<br><b>Answer:</b> ${questionInfo.answers.join(", ")}<br><b>Selecting:</b> "${optionText}"`, "#27ae60", true);
                            matchFound = true;
                            setTimeout(() => simulateClick(option), 500);
                        }
                    });
                    
                    if (!matchFound) {
                        showAnswerStatus(`<b>Question:</b> "${questionInfo.question}"<br><b>Answer:</b> ${questionInfo.answers.join(", ")}<br><b>Warning:</b> No matching option found`, "#d35400");
                    }
                    
                    setTimeout(autoAnswer, 1500);
                    return;
                }

                let inputBox = document.querySelector("#typeans");
                let checkButton = document.querySelector("#checkbtn");
                if (inputBox && checkButton && getActiveQuestionType() === "typein") {
                    let answer = questionInfo.answers[0];
                    console.log(`⌨️ Typing: "${answer}"`);
                    showAnswerStatus(`<b>Question:</b> "${questionInfo.question}"<br><b>Answer:</b> ${questionInfo.answers.join(", ")}<br><b>Typing:</b> "${answer}"`, "#16a085", true);
                    
                    // Improved input method
                    simulateTyping(inputBox, answer);
                    
                    // Give time for the input to register before clicking check
                    setTimeout(() => {
                        simulateClick(checkButton);
                    }, 800);
                    
                    setTimeout(autoAnswer, 1500);
                    return;
                }

                setTimeout(autoAnswer, 1000);
            }

            // Set up MutationObserver to detect when question containers change visibility
            function setupDisplayObserver() {
                const containers = ["flashpag", "multi", "typein"];
                containers.forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        const observer = new MutationObserver(mutations => {
                            mutations.forEach(mutation => {
                                if (mutation.attributeName === 'style' && 
                                    mutation.target.style.display !== 'none') {
                                    // If this container becomes visible, reset lastQuestion
                                    console.log(`Container ${id} is now visible`);
                                    lastQuestion = "";
                                    checkCurrentQuestion();
                                }
                            });
                        });
                        
                        observer.observe(element, { attributes: true });
                    }
                });
            }

            // Set up continuous question monitoring
            function monitorQuestions() {
                checkCurrentQuestion();
                setTimeout(monitorQuestions, 500);
            }

            document.addEventListener("keydown", function(event) {
                if (event.key === "\\" && !keyLock) {
                    keyLock = true;
                    // Changed behavior: now toggles UI visibility instead of auto-answer
                    toggleUIVisibility();
                    setTimeout(() => keyLock = false, 300);
                }
            });

            createIndicator();
            setupDisplayObserver();
            monitorQuestions(); // Start monitoring questions regardless of auto-answer status
            console.log("🔹 Press '\\' to show/hide UI. Click the indicator to start/stop auto-answer.");
        })
        .catch(error => console.error("❌ Error loading database:", error));
})();
