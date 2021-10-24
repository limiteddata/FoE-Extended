
addEventListener("message", async (event) => {
    try {
        if (event.source != window || !event.data.type || event.data.type != "PageFetch")
            return;  
        const result = await fetch(event.data.url, event.data.options).then(e=>e.json());
        event.ports[0].postMessage({result: result}); 
    } catch (err) {
        event.ports[0].postMessage({error: err});
    }
    event.ports[0].close();
}, false)

window.addEventListener('imageResolver', (e) => {
    const src = chrome.runtime.getURL(e.detail.path) 
    window.dispatchEvent(new CustomEvent('resolvedImage', { detail: {id:e.detail.id, url:src} }))
})

const foreground_entry_point = document.createElement('div');
foreground_entry_point.id = 'foreground';

const modalContent = document.createElement('div');
modalContent.id = 'modalContent';
document.body.appendChild(modalContent);
document.body.appendChild(foreground_entry_point);

const s = document.createElement('script');
s.src = chrome.runtime.getURL('./src/pages/Foreground/Foreground.bundle.js');

(document.head || document.documentElement).appendChild(s);

