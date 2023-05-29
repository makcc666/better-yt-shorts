const browserObj = (typeof browser === 'undefined') ? chrome : browser;
const version = browserObj.runtime.getManifest().version;
document.getElementById('version').textContent = version;

const modal = document.getElementById("edit-modal");
const resetBtn = document.querySelector(".reset-btn");
const editBtnList = document.querySelectorAll(".edit-btn");
const closeBtn = document.querySelector(".close-btn");
const keybindInput = document.getElementById("keybind-input");
let modalTitleSpan = document.getElementById("modal-title-span");
let invalidKeybinds = ['backspace', 'enter', 'escape', 'tab', ' ', 'space', 'pageup', 'pagedown', 'arrowup', 'arrowdown', 'printscreen', 'meta'];

const defaultKeybinds = {
    'Seek Backward': 'arrowleft',
    'Seek Forward': 'arrowright',
    'Decrease Speed': 'u',
    'Reset Speed': 'i',
    'Increase Speed': 'o',
    'Decrease Volume': '-',
    'Increase Volume': '+',
    'Toggle Mute': 'm',
    'Next Frame': ',',
    'Previous Frame': '.',
    'Reaction Like':'z',
    'Reaction Dislike':'x'
};
let currentKeybinds = Object.assign({}, defaultKeybinds);
let currentKeybindArray = [];
let keybindState = '';

// Set user's prefers-color-scheme
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', "dark");
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    const newColorScheme = event.matches ? "dark" : "light";
    document.documentElement.setAttribute('data-theme', newColorScheme);
});

// Get keybinds from storage
browserObj.storage.local.get(['keybinds'])
.then((result) => {
    let updatedkeybinds = result['keybinds'];
    if (updatedkeybinds) {
        // Set default keybinds if not exists
        for (const [cmd, keybind] of Object.entries(defaultKeybinds)) {
          if (!result.keybinds[cmd]) result.keybinds[cmd] = keybind;
        }
        for (const [command, keybind] of Object.entries(updatedkeybinds)) {
            document.getElementById(command+'-span').textContent = keybind;
        }
        currentKeybinds = updatedkeybinds;
    }
    // Keybind array for easier checking if keybind is already in use
    currentKeybindArray = Object.values(currentKeybinds);
});

// Open modal
for (let i = 0; i < editBtnList.length; i++) {
    editBtnList[i].onclick = function() {
        modal.style.display = "block";
        keybindInput.focus();
        keybindInput.select();
        modalTitleSpan.textContent = this.id;
        keybindState = this.id;
    }
}

resetBtn.onclick = () => {
    currentKeybinds = defaultKeybinds;
    currentKeybindArray = Object.values(currentKeybinds);
    for (const [command, keybind] of Object.entries(defaultKeybinds)) {
        document.getElementById(command+'-span').textContent = keybind;
        browserObj.storage.local.set({ 'keybinds' : defaultKeybinds });
    }
}

// Close modal (x)
closeBtn.onclick = () => {
    modal.style.display = "none";
}
// Close modal (click outside)
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
}

keybindInput.addEventListener('keydown', (event) => {
    event.preventDefault();
    var keybind = event.key.toLowerCase();
    // console.log([keybind,invalidKeybinds.includes(keybind)],invalidKeybinds);
    if (invalidKeybinds.includes(keybind)) {
        if (keybind === ' ') keybind = 'space';
        keybindInput.value = "";
        closeBtn.click();
        alert("Invalid keybind: <<" + keybind + ">> is not allowed.");
        return;
    }
    if (currentKeybindArray.includes(keybind)) {
        keybindInput.value = "";
        closeBtn.click();
        alert("Invalid keybind: <<" + keybind + ">> is already in use.");
        return;
    }
    document.getElementById(keybindState+'-span').textContent = keybind;
    currentKeybinds[keybindState] = keybind;
    currentKeybindArray = Object.values(currentKeybinds);
    browserObj.storage.local.set({ 'keybinds' : currentKeybinds })
    .then(() => {
        keybindInput.value = "";
        closeBtn.click(); 
    });
});
