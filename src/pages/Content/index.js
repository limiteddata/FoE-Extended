
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




