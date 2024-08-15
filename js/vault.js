chrome.storage.local.set({ 'lastPageVisited': '../vault.html' }, () => {
    console.log('Last page visited saved.')
});

document.getElementById('signOut').addEventListener('click', (e) => {
    chrome.runtime.sendMessage({ type: 'signOut' }, (res) => {
        console.log(res);
        if (res.ok) {
            window.location.href = '../signin.html';
        }
    });
});
