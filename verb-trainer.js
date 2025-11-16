javascript:(function(){
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
      console.log('API Response:', data);
      
      if (data.error) {
        alert('API Error: ' + data.error.message);
        return null;
      }
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text.trim();
      }
      throw new Error('Invalid response structure');
    } catch (error) {
      console.error('Error:', error);
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
})();