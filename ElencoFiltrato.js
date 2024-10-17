// ==UserScript==
// @name        Elenco Filtrato
// @namespace   Elenco Filtrato
// @match       *://classroom.google.com/*
// @grant       none
// @version     1
// @author      Filo35
// @description 12/10/2024, 14:57:00
// ==/UserScript==

(function () {
    'use strict';

    const saltaNumero = 18;

    let ctrlPressCount = 0; // Counter for Ctrl presses
    let lastPressTime = 0; // Timestamp of the last press
    const pressThreshold = 5; // Number of presses required
    const timeLimit = 2000; // Time limit in milliseconds (2 seconds)



    const guud = () => {
      let elements = document.querySelectorAll('[aria-label*="Invia email a"]');
      let filtrate = []
      let index = 1
      elements.forEach(el => {
          let row = el.closest('tr');

          if (index == saltaNumero) {
            console.log(`[${saltaNumero}] Skipped (user)`);
            index++;
          }

          if (row) {
              let nameElement = row.querySelector('span[id^="rtsc-"]');
              if (nameElement) {
                  let name = nameElement.textContent.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
                  let emailText = el.getAttribute('aria-label')
                                    .replace('Invia email a ', '')
                                    .replace('@garibaldidavinci.edu.it', '');
                  let datePart = emailText.match(/(\d{2})-(\d{2})-(\d{4})/)[0].replace(/-/g, '/');
                  let namePart = name.trim();
                  let formattedText = `[${index}] ${namePart}: ${datePart}`;
                  filtrate.push(formattedText);
                  console.log(formattedText);
                  index++;
              }
          }
      });


        // Create and show the draggable GUI if there are emails found
        if (filtrate.length > 0) {
            //console.log(filtrate)
            createDraggableGUI(filtrate);
        } else {
            alert("No emails found.");
        }
    };



    const createDraggableGUI = (emails) => {
        let isPinned = false;
        // Create the GUI container
        const guiContainer = document.createElement('div');
        guiContainer.style.position = 'fixed';
        guiContainer.style.width = '400px'; // Fixed width
        guiContainer.style.height = '600px'; // Fixed height
        guiContainer.style.maxHeight = '600px'; // Set a maximum height for the container
        guiContainer.style.overflowY = 'auto'; // Enable scrolling if content exceeds max height
        guiContainer.style.backgroundColor = 'rgba(51, 51, 51, 0.8)'; // Semi-transparent background
        guiContainer.style.color = '#fff';
        guiContainer.style.border = '1px solid #555';
        guiContainer.style.borderRadius = '5px';
        guiContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
        guiContainer.style.zIndex = 1000;
        guiContainer.style.padding = '10px';
        guiContainer.style.left = '20px'; // Initial left position
        guiContainer.style.top = '20px'; // Initial top position
        guiContainer.style.setProperty('scrollbar-width', 'thin');
        guiContainer.style.setProperty('scrollbar-color', '#888 #444');
        guiContainer.style.userSelect = 'none';



        // Create the title
        const title = document.createElement('h1');
        title.style.margin = '0';
        title.style.fontSize = '18px'; // Increased font size for visibility
        title.style.color = '#fff';
        title.textContent = 'Elenco filtrato:';
        title.style.userSelect = 'none';
        guiContainer.appendChild(title);

        // Create a close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '5px';
        closeButton.style.right = '5px';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '10px';
        closeButton.style.background = 'red';
        closeButton.style.color = 'white';
        closeButton.style.cursor = 'pointer';
        closeButton.style.userSelect = 'none';
        closeButton.onclick = () => {
            document.body.removeChild(guiContainer); // Remove GUI on close
        };
        guiContainer.appendChild(closeButton);

        // Create a pin button
        const pinButton = document.createElement('button');
        pinButton.textContent = 'Fissa';
        pinButton.style.position = 'absolute';
        pinButton.style.top = '5px';
        pinButton.style.right = '30px';
        pinButton.style.border = 'none';
        pinButton.style.borderRadius = '5px';
        pinButton.style.background = 'blue';
        pinButton.style.color = 'white';
        pinButton.style.cursor = 'pointer';
        pinButton.style.userSelect = 'none';
        pinButton.onclick = () => {
            isPinned = !isPinned;
            pinButton.textContent = isPinned ? 'Stacca' : 'Fissa';
        };
        guiContainer.appendChild(pinButton);

        // Create a copy button
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copia Elenco';
        copyButton.style.marginTop = '10px'; // Add margin for spacing
        copyButton.style.border = 'none';
        copyButton.style.borderRadius = '5px';
        copyButton.style.background = 'green';
        copyButton.style.color = 'white';
        copyButton.style.cursor = 'pointer';
        copyButton.style.userSelect = 'none';
        copyButton.onclick = () => {
            // Extract email text to copy
            const emailText = emails.join('\n');
            navigator.clipboard.writeText(emailText).then(() => {
                alert('Elenco copiato!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        };
        guiContainer.appendChild(copyButton);

        // Create a list to hold the emails
        const emailList = document.createElement('div');
        emailList.style.fontSize = '16px'; // Increased font size for readability
        emailList.style.lineHeight = '1.5'; // Added line height for better spacing
        guiContainer.style.userSelect = 'text';

        // Populate the email list
        emails.forEach(email => {
            const emailItem = document.createElement('div');
            emailItem.textContent = email;
            emailItem.style.padding = '5px'; // Padding for each email item
            emailItem.style.borderBottom = '1px solid #555'; // Separator line
            emailList.appendChild(emailItem);
        });

        guiContainer.appendChild(emailList);

        // Make the GUI draggable, excluding the buttons
        guiContainer.onmousedown = (e) => {
            if (!isPinned && !e.target.closest('button')) {
                let offsetX = e.clientX - guiContainer.getBoundingClientRect().left;
                let offsetY = e.clientY - guiContainer.getBoundingClientRect().top;
                guiContainer.style.cursor = 'grabbing';
                const dragMove = (event) => {
                    guiContainer.style.left = `${event.clientX - offsetX}px`;
                    guiContainer.style.top = `${event.clientY - offsetY}px`;
                };
                const dragEnd = () => {
                    guiContainer.style.cursor = 'default';
                    document.removeEventListener('mousemove', dragMove);
                    document.removeEventListener('mouseup', dragEnd);
                };
                document.addEventListener('mousemove', dragMove);
                document.addEventListener('mouseup', dragEnd);
            }
        };

        // Append the GUI to the body
        document.body.appendChild(guiContainer);
    };

    // Keydown event listener
    document.addEventListener('keydown', (event) => {
        if (window.location.href.endsWith('/sort-last-name')) {
          if (event.ctrlKey) {
              const currentTime = Date.now();

              // Check if we are still within the time limit
              if (currentTime - lastPressTime <= timeLimit) {
                  ctrlPressCount++; // Increment the count
              } else {
                  // Reset the counter if the time limit has passed
                  ctrlPressCount = 1; // Start a new count
              }

              lastPressTime = currentTime; // Update the last press time

              // Check if the required number of presses has been reached
              if (ctrlPressCount >= pressThreshold) {
                  console.log('Triggered action!');
                  ctrlPressCount = 0; // Reset count before triggering
                  guud(); // Call your function to execute the script
              }
          }
      }
    });
})();
