let emailElements = [...document.querySelectorAll('[aria-label*="Invia email a"]')];
let emails = emailElements.map(el => el.getAttribute('aria-label').match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/));
emails = emails.filter(Boolean);  // Filter out any null values

emails.forEach(email => {
    let emailWithoutDomain = email[0].replace('@garibaldidavinci.edu.it', '');
    console.log(emailWithoutDomain);
});
