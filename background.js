let baseUrl = 'http://localhost:5000'

// Function to save the JWT token using chrome.storage
const setData = (data) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(data, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                console.log('Data saved to storage.');
                resolve();
            }
        });
    });
};

// Function to retrieve the JWT token using chrome.storage
const getData = (key) => {
    return new Promise((resolve, reject) => {
        const storageKey = key ? { [key]: null } : null;
        
        chrome.storage.local.get(storageKey, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                if (key) {
                    resolve(result[key] !== undefined ? result[key] : null);
                } else {
                    resolve(result);
                }
            }
        });
    });
}

const validateToken = async () => {
    console.log('testing testing');
    const token = await getData('jwtToken'); // Await the token retrieval
    console.log('-=-=-=-=-=-=-=-=-');
    console.log(token);
    console.log('-=-=-=-=-=-=-=-=-');

    // Await the fetch call to get the response object
    const response = await fetch(baseUrl + '/validate_token', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Attach the token as a Bearer token
            'Content-Type': 'application/json'  // Optional, if you want to specify the content type
        }
    });

    // Return an object containing both the status and the JSON data
    const data = await response.json();
    return {
        status: response.status,
        ok: response.ok,
        data
    };
}

const signUpWithEmailAndPassword = async (email, password) => {
    try {
        const response = await fetch(baseUrl + '/signup', {
            method: 'POST', // Specify the method as POST
            headers: {
                'Content-Type': 'application/json', // Tell the server that the request body contains JSON
            },
            body: JSON.stringify({ email, password }) // Convert the email and password to JSON format
        });

        return {
            status: response.status,
            ok: response.ok
        };
    } catch (error) {
        // Handle any network or other errors
        console.error('Error during signup:', error);
        return {
            status: 401,
            ok: false
        };
    }
}

const signInWithEmailAndPassword = async (email, password) => {
    try {
        const response = await fetch(baseUrl + '/signin', {
            method: 'POST', // Specify the method as POST
            headers: {
                'Content-Type': 'application/json', // Tell the server that the request body contains JSON
            },
            body: JSON.stringify({ email, password }) // Convert the email and password to JSON format
        });
        const data = await response.json();
        return {
            status: response.status,
            ok: response.ok,
            data
        };
    } catch (error) {
        // Handle any network or other errors
        console.error('Error during signin:', error);
        return {
            status: 401,
            ok: false
        };
    }
}

const signOut = () => {
    chrome.storage.local.remove(['jwtToken']);
}

try {
    let user = null;
    
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log(message);
        if (message.type === 'greet') {
            sendResponse('Greetings Buddy!');

        } else if (message.type === 'validateToken') {
            validateToken()
                .then((res) => sendResponse(res));

        } else if (message.type === 'signUpWithEmailAndPassword') {
            const email = message.data.email;
            const password = message.data.password;
            signUpWithEmailAndPassword(email, password)
                .then((res) => sendResponse(res));

        } else if (message.type === 'signInWithEmailAndPassword') {
            const email = message.data.email;
            const password = message.data.password;
            signInWithEmailAndPassword(email, password)
                .then(async (res) => {
                    if (res.ok) {
                        try {
                            await setData({ email: email, jwtToken: res.data.token, salt: res.data.salt });
                            sendResponse(res);
                        } catch (err) {
                            console.error('Error saving data:', err);
                            sendResponse({ status: 500, ok: false });
                        }
                    } else {
                        sendResponse(res);
                    }
                });

        } else if (message.type === 'signOut') {
            signOut();
            sendResponse({ ok: true });
        }

        return true;
    });

} catch (error) {
    console.log(error);
}
