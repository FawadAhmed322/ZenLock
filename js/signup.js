document.getElementById('signupForm').addEventListener("submit", event => {
    event.preventDefault();
    
    const email = document.getElementById('emailField').value
    const password = document.getElementById('passwordField').value

    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)

    chrome.runtime.sendMessage({ type: 'signUpWithEmailAndPassword', data: { email: email, password: password } }, (res) => {
        if (res.ok) {
            chrome.runtime.sendMessage({ type: 'signInWithEmailAndPassword', data: { email: email, password: password } }, (res) => {
                if (res.ok) {
                    chrome.storage.local.get(['lastPageVisited'], (result) => {
                        const lastPageVisited = result.lastPageVisited || '../vault.html';
                        console.log('Last page visited:', lastPageVisited);
                        window.location.href = lastPageVisited
                    });
                }
            })
        }
    })
})