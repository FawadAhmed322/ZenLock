chrome.runtime.sendMessage({ type: 'greet' }, (response) => {
    console.log(response)
})
chrome.runtime.sendMessage({ type: 'validateToken' }, (res) => {
    console.log(res)
    if (res.ok) {
        chrome.storage.local.get(['lastPageVisited'], (result) => {
            const lastPageVisited = result.lastPageVisited || '../vault.html';
            console.log('Last page visited:', lastPageVisited);
            window.location.href = lastPageVisited
        });
    } else {
        window.location.href = '../signin.html'
    }
});