javascript:(function () { var chapter = prompt("Enter a chapter number:"); if (chapter) { chapter = chapter.trim(); if (/^\d+$/.test(chapter)) { chapter = parseInt(chapter, 10); if (chapter > 0 && chapter <= 40) { var url = "https://hands-up-education.org/suburani_full/chap" + chapter + "/chap" + chapter + "_na.html"; console.log("Navigating to: " + url); window.location.href = url; } else { alert("Please enter a chapter number between 1 and 40."); } } else { alert("Invalid input. Please enter a valid numeric chapter number."); } } else { alert("No input provided. Please enter a chapter number."); } })();