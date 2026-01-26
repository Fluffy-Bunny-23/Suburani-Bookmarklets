javascript:(function(){
  // Remove existing modal if present
  const existingModal = document.getElementById('suburani-master-modal');
  if (existingModal) {
    existingModal.remove();
    return;
  }

  // Create modal container
  const modal = document.createElement('div');
  modal.id = 'suburani-master-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;';

  // Create modal content
  const content = document.createElement('div');
  content.style.cssText = 'background:white;border-radius:12px;padding:25px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 4px 20px rgba(0,0,0,0.3);';

  // Header
  const header = document.createElement('div');
  header.innerHTML = '<h2 style="margin:0 0 20px 0;color:#333;font-size:24px;border-bottom:2px solid #4285f4;padding-bottom:10px;">Suburani Master Bookmarklet</h2>';
  content.appendChild(header);

  // Scripts data
  const scripts = [
    {
      category: 'Navigation',
      items: [
        {
          name: 'Chapter Page',
          description: 'Navigate to a specific chapter (1-40)',
          code: function() {
            var chapter = prompt("Enter a chapter number:");
            if (chapter) {
              chapter = chapter.trim();
              if (/^\d+$/.test(chapter)) {
                chapter = parseInt(chapter, 10);
                if (chapter > 0 && chapter <= 40) {
                  var url = "https://hands-up-education.org/suburani_full/chap" + chapter + "/chap" + chapter + "_na.html";
                  window.open(url, '_blank');
                } else {
                  alert("Please enter a chapter number between 1 and 40.");
                }
              } else {
                alert("Invalid input. Please enter a valid numeric chapter number.");
              }
            }
          }
        },
        {
          name: 'Suburani Activebook',
          description: 'Navigate to Activebook for a chapter (1-40)',
          code: function() {
            var n = prompt("Enter the chapter number (1-40):");
            if (n && !isNaN(n) && Number(n) <= 40) {
              window.open("https://hands-up-education.org/suburani_full/activebooks/activebook.html?n=" + n, '_blank');
            } else {
              alert(n > 40 ? "Error: Chapter number must not be above 40." : "Please enter a valid number.");
            }
          }
        },
        {
          name: 'Autograded Translation',
          description: 'Navigate to autograded translation exercise (e.g., 7.3)',
          code: function() {
            var u = prompt("Enter the translation number. e.g. 7.3");
            if (u) {
              window.open("https://hands-up-education.org/suburani_full/activities/automark.html?fn=" + u.replace(/\./g, "-"), '_blank');
            }
          }
        },
        {
          name: 'Sorting Exercise',
          description: 'Navigate to sorting exercise (e.g., 7.3)',
          code: function() {
            var u = prompt("Enter the sorting number. e.g. 7.3");
            if (u) {
              window.open("https://hands-up-education.org/suburani_full/activities/sort.html?fn=" + u.replace(/\./g, "-"), '_blank');
            }
          }
        }
      ]
    },
    {
      category: 'Cheats & Helpers',
      items: [
        {
          name: 'Verb Trainer AI',
          description: 'AI-powered Latin verb conjugation helper (requires Gemini API key)',
          code: function() {
            let API_KEY = localStorage.getItem('gemini_api_key');
            if (!API_KEY) {
              API_KEY = prompt('Enter your Gemini API key (will be saved):');
              if (!API_KEY) {
                alert('API key is required');
                return;
              }
              localStorage.setItem('gemini_api_key', API_KEY);
            }

            async function solveWithGemini(question) {
              try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    contents: [{
                      parts: [{
                        text: `You are a Latin expert. Answer this Latin verb conjugation question with ONLY the correct Latin word, nothing else. No explanations, no punctuation, just the conjugated verb form.\n\nQuestion: ${question}\n\nAnswer with only the Latin word:`
                      }]
                    }]
                  })
                });

                const data = await response.json();
                
                if (data.error) {
                  alert('API Error: ' + data.error.message);
                  return null;
                }
                
                if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                  return data.candidates[0].content.parts[0].text.trim();
                }
                throw new Error('Invalid response structure');
              } catch (error) {
                alert('Error: ' + error.message);
                return null;
              }
            }

            async function autoSolve() {
              const questionText = document.body.textContent.match(/CHOOSE ONE OF VERBS:(.*?)COMPOSE:/s)?.[1]?.trim() ||
                                  document.body.textContent.match(/Conjugate (.*?) in/)?.[0] ||
                                  document.body.textContent;
              
              const statusDiv = document.createElement('div');
              statusDiv.style.cssText = 'position:fixed;top:10px;right:10px;background:#4285f4;color:white;padding:15px;border-radius:8px;z-index:10000;font-family:sans-serif;box-shadow:0 2px 10px rgba(0,0,0,0.3);max-width:300px;';
              statusDiv.innerHTML = 'Solving...<br><small>API Key stored</small>';
              document.body.appendChild(statusDiv);

              const answer = await solveWithGemini(questionText);
              
              if (answer) {
                statusDiv.innerHTML = `<b>Answer: ${answer}</b><br><small>Click to copy • Right-click to clear API key</small>`;
                statusDiv.style.background = '#34a853';
                statusDiv.style.cursor = 'pointer';
                
                statusDiv.onclick = () => {
                  navigator.clipboard.writeText(answer);
                  const oldText = statusDiv.innerHTML;
                  statusDiv.innerHTML = '<b>Copied to clipboard!</b>';
                  setTimeout(() => statusDiv.innerHTML = oldText, 1000);
                };
                
                statusDiv.oncontextmenu = (e) => {
                  e.preventDefault();
                  if (confirm('Clear saved API key?')) {
                    localStorage.removeItem('gemini_api_key');
                    alert('API key cleared');
                  }
                  statusDiv.remove();
                };
              } else {
                statusDiv.innerHTML = 'Failed to get answer<br><small>Check console</small>';
                statusDiv.style.background = '#ea4335';
                setTimeout(() => statusDiv.remove(), 3000);
              }
            }

            autoSolve();
          }
        },
        {
          name: 'Vocab Helper',
          description: 'Automatic vocabulary answer helper with toggle',
          code: function() {
            console.clear();
            console.log("🔹 Script starting — fetching vocabulary database…");
            const dbUrl = "https://raw.githubusercontent.com/Fluffy-Bunny-23/Suburani-Bookmarklets/refs/heads/main/vocabulary.json";
            let autoAnswer = false;
            let uiVisible = true;
            let lastQuestion = "";

            const toggleBtn = document.createElement("div");
            Object.assign(toggleBtn.style, {
              position: "fixed",
              bottom: "10px",
              right: "10px",
              padding: "6px 12px",
              backgroundColor: "#c00",
              color: "#fff",
              borderRadius: "5px",
              cursor: "pointer",
              zIndex: 9999,
              fontFamily: "Arial,sans-serif",
              fontSize: "14px",
              userSelect: "none"
            });
            toggleBtn.textContent = "Auto Answer: OFF";
            toggleBtn.onclick = () => {
              autoAnswer = !autoAnswer;
              toggleBtn.textContent = `Auto Answer: ${autoAnswer ? "ON" : "OFF"}`;
              toggleBtn.style.backgroundColor = autoAnswer ? "#080" : "#c00";
              console.log(`🔹 Auto Answer ${autoAnswer ? "Enabled" : "Disabled"}`);
            };
            document.body.appendChild(toggleBtn);

            const answerDisplay = document.createElement("div");
            Object.assign(answerDisplay.style, {
              position: "fixed",
              bottom: "50px",
              right: "10px",
              padding: "5px 10px",
              backgroundColor: "rgba(0,0,0,0.75)",
              color: "#fff",
              borderRadius: "5px",
              fontFamily: "Arial,sans-serif",
              fontSize: "13px",
              zIndex: 9998,
              userSelect: "none",
              pointerEvents: "none"
            });
            document.body.appendChild(answerDisplay);

            function updateAnswerDisplay(answer) {
              answerDisplay.textContent = answer ? `Answer: ${answer}` : "";
              answerDisplay.style.display = uiVisible && answer ? "block" : "none";
            }

            document.addEventListener("keydown", e => {
              if (e.key === "\\") {
                uiVisible = !uiVisible;
                toggleBtn.style.display = uiVisible ? "block" : "none";
                answerDisplay.style.display = uiVisible && answerDisplay.textContent ? "block" : "none";
                console.log(`🔹 UI ${uiVisible ? "shown" : "hidden"}`);
              }
            });

            function getCurrentQuestion() {
              const flashcard = document.querySelector("#flashpag");
              if (flashcard && getComputedStyle(flashcard).display !== "none") {
                let latinText = flashcard.querySelector("#flashlat");
                if (latinText && latinText.textContent.trim()) {
                  return latinText.textContent.trim();
                }
              }

              const multiChoice = document.querySelector("#multi");
              if (multiChoice && getComputedStyle(multiChoice).display !== "none") {
                let question = multiChoice.querySelector(".multiq");
                if (question && question.textContent.trim()) {
                  return question.textContent.trim();
                }
              }

              const typeIn = document.querySelector("#typein");
              if (typeIn && getComputedStyle(typeIn).display !== "none") {
                let question = typeIn.querySelector("#qtyp");
                if (question && question.textContent.trim()) {
                  return question.textContent.trim();
                }
              }

              return null;
            }

            function submitAnswer(answer) {
              const typeIn = document.querySelector("#typein");
              if (typeIn && getComputedStyle(typeIn).display !== "none") {
                let input = document.querySelector("#typeans");
                let submitBtn = document.querySelector("#checkbtn");
                if (input && submitBtn) {
                  const firstAnswer = answer.split(",")[0].trim();
                  console.log(`⌨️ Typing: "${firstAnswer}"`);
                  input.value = firstAnswer;
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                  setTimeout(() => {
                    console.warn("🖱️ Submitting typed answer");
                    submitBtn.click();
                  }, 500);
                  return;
                }
              }

              const buttons = Array.from(document.querySelectorAll("#multi .multib")).filter(btn => btn.offsetParent !== null);
              if (buttons.length) {
                for (let btn of buttons) {
                  let btnText = btn.textContent.replace(/^\d+\s*/, "").trim().toLowerCase();
                  if (btnText === answer.toLowerCase() || btnText.split(/\s*,\s*/).includes(answer.toLowerCase())) {
                    console.log(`🖱️ Clicking option: "${btnText}"`);
                    btn.click();
                    return;
                  }
                }
                console.warn("⚠️ No matching visible option found.");
              }
            }

            fetch(dbUrl)
              .then(r => r.json())
              .then(vocabData => {
                console.log("✅ Vocabulary database loaded!");
                setInterval(() => {
                  const currentQ = getCurrentQuestion();
                  if (!currentQ) {
                    updateAnswerDisplay("");
                    return;
                  }

                  if (currentQ !== lastQuestion) {
                    lastQuestion = currentQ;
                    console.log(`📖 New question: "${currentQ}"`);
                    const match = vocabData.find(entry => entry.latin.split(",")[0].trim() === currentQ.split(",")[0].trim());
                    if (!match) {
                      console.warn(`⚠️ No DB match for "${currentQ}"`);
                      updateAnswerDisplay("?");
                      return;
                    }
                    const englishAnswer = match.english.split(",")[0].trim();
                    console.log(`✅ Matched "${match.latin}" → "${englishAnswer}"`);
                    updateAnswerDisplay(englishAnswer);
                    if (autoAnswer) {
                      submitAnswer(englishAnswer);
                    }
                  }
                }, 1000);
              })
              .catch(err => console.error("❌ Failed to load DB:", err));
          }
        }
      ]
    }
  ];

  // Create script buttons by category
  scripts.forEach(category => {
    const categoryDiv = document.createElement('div');
    categoryDiv.style.cssText = 'margin-bottom:20px;';
    
    const categoryHeader = document.createElement('h3');
    categoryHeader.textContent = category.category;
    categoryHeader.style.cssText = 'color:#4285f4;margin:15px 0 10px 0;font-size:18px;font-weight:600;';
    categoryDiv.appendChild(categoryHeader);

    category.items.forEach(script => {
      const scriptBtn = document.createElement('div');
      scriptBtn.style.cssText = 'background:#f5f5f5;padding:12px;margin:8px 0;border-radius:8px;cursor:pointer;transition:all 0.2s;border:2px solid transparent;';
      scriptBtn.innerHTML = `<div style="font-weight:600;color:#333;margin-bottom:4px;">${script.name}</div><div style="font-size:12px;color:#666;">${script.description}</div>`;
      
      scriptBtn.onmouseenter = function() {
        this.style.background = '#e8f0fe';
        this.style.borderColor = '#4285f4';
      };
      scriptBtn.onmouseleave = function() {
        this.style.background = '#f5f5f5';
        this.style.borderColor = 'transparent';
      };
      scriptBtn.onclick = function() {
        modal.remove();
        script.code();
      };
      
      categoryDiv.appendChild(scriptBtn);
    });

    content.appendChild(categoryDiv);
  });

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.cssText = 'width:100%;padding:12px;background:#4285f4;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:600;margin-top:10px;transition:background 0.2s;';
  closeBtn.onmouseenter = function() { this.style.background = '#3367d6'; };
  closeBtn.onmouseleave = function() { this.style.background = '#4285f4'; };
  closeBtn.onclick = function() { modal.remove(); };
  content.appendChild(closeBtn);

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Close on background click
  modal.onclick = function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  };
})();
