// --- Navigation Drawer ---
const beginningNavd = document.querySelector(".beginning-navd");
const menuBtn = document.querySelector(".opennavd");
const closeBtn = document.querySelector(".close-navdrawer");
if (menuBtn && beginningNavd) menuBtn.addEventListener("click", () => beginningNavd.open = true);
if (closeBtn && beginningNavd) closeBtn.addEventListener("click", () => beginningNavd.open = false);

// --- Export Dialog ---
const exportButton = document.querySelector('.export-button');
const exportDialog = document.querySelector('.export-dialog');
const closeExportBtn = document.querySelector('.close-btn');
if (exportButton && exportDialog) exportButton.addEventListener("click", () => exportDialog.open = true);
if (closeExportBtn && exportDialog) closeExportBtn.addEventListener("click", () => exportDialog.open = false);

// --- Import Dialog ---
const closeImport = document.querySelector('.cancel');
const importDialog = document.querySelector('.import-dialog');
const importButton = document.querySelector('.import-main');
if (importButton && importDialog) importButton.addEventListener("click", () => importDialog.open = true);
if (closeImport && importDialog) closeImport.addEventListener("click", () => importDialog.open = false);

// --- Credits Dialog ---
const creditDialog = document.querySelector('.credit-dialog');
const creditButton = document.querySelector('.credit-btn');
const okButton = document.querySelector('.ok-btn');
if (creditButton && creditDialog) creditButton.addEventListener("click", () => creditDialog.open = true);
if (okButton && creditDialog) okButton.addEventListener("click", () => creditDialog.open = false);

// --- Settings Dialog ---
const settingsDialog = document.querySelector('.settings-dialog');
const settingsButton = document.querySelector('.settings-btn');
const closeSettings = document.querySelector('.apply-btn');
if (settingsButton && settingsDialog) settingsButton.addEventListener("click", () => settingsDialog.open = true);
if (closeSettings && settingsDialog) closeSettings.addEventListener("click", () => settingsDialog.open = false);

// --- Export Save ---
function saveExport() {
    const content = document.getElementById("exportfield")?.value;
    if (!content) {
        console.error("No content found in exportfield");
        return;
    }
    let fileName = document.getElementById("export-name")?.value.trim() || "level.txt";
    if (!fileName.toLowerCase().endsWith('.txt')) fileName += '.txt';
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

const saveFileBtn = document.querySelector('.save-file');
if (saveFileBtn) saveFileBtn.addEventListener('click', saveExport);
const saveBtn = document.querySelector('.save-btn');
if (saveBtn) saveBtn.addEventListener('click', saveExport);

// --- New Level Dialog ---
const newlvlButton = document.querySelector('.newlvl');
const newlvlDialog = document.querySelector('.newlvl-dialog');
const cancelSaving = document.querySelector('.cancel-save');
const exportConfirm = document.querySelector('.export-dialog');
const savecurrentlvlBtn = document.querySelector('.current-save');
const beginningDrawer = document.querySelector('.beginning-navd');
const bignewlevelBtn = document.querySelector('.newlevelbigbtn');
if (newlvlButton && newlvlDialog) newlvlButton.addEventListener("click", () => newlvlDialog.open = true);
if (cancelSaving && newlvlDialog) cancelSaving.addEventListener("click", () => newlvlDialog.open = false);
if (savecurrentlvlBtn && exportConfirm && newlvlDialog) {
    savecurrentlvlBtn.addEventListener("click", () => exportConfirm.open = true);
    savecurrentlvlBtn.addEventListener("click", () => newlvlDialog.open = false);
}
if (bignewlevelBtn && newlvlDialog && beginningDrawer) {
    bignewlevelBtn.addEventListener("click", () => newlvlDialog.open = true);
    bignewlevelBtn.addEventListener("click", () => beginningDrawer.open = false);
}

// --- Dark Mode Switch ---
function checkDarkMode() {
    const darkModeSwitch = document.getElementById('switchDark');
    const mwcAccentLink = document.getElementById('mwcaccent');
    if (!darkModeSwitch || !mwcAccentLink) return;
    if (darkModeSwitch.checked) {
        document.documentElement.classList.add('mdui-theme-dark');
        mwcAccentLink.setAttribute('href', 'mat-accent-color-dark.css');
    } else {
        document.documentElement.classList.remove('mdui-theme-dark');
        mwcAccentLink.setAttribute('href', 'mat-accent-color-light.css');
    }
}
const switchDark = document.getElementById('switchDark');
if (switchDark) switchDark.addEventListener('change', checkDarkMode);
document.addEventListener('DOMContentLoaded', checkDarkMode);

// --- Generate and Copy Link ---
function generateAndCopyLink() {
    const exportFieldContent = document.getElementById('exportfield')?.value;
    if (!exportFieldContent) {
        alert("The export field is empty!");
        return;
    }
    const encodedContent = encodeURIComponent(exportFieldContent);
    const baseUrl = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
    const generatedLink = `${baseUrl}/generatedlevel.html?content=${encodedContent}`;
    navigator.clipboard.writeText(generatedLink).then(() => {
        const confirmationCopyIcon = document.getElementById('confirmationCopy');
        if (confirmationCopyIcon) {
            confirmationCopyIcon.textContent = 'check';
            setTimeout(() => { confirmationCopyIcon.textContent = 'link'; }, 3000);
        }
    }).catch(() => {
        alert("Failed to copy link. Please try again.");
    });
}
const copyLinkButton = document.getElementById('copyLink');
if (copyLinkButton) copyLinkButton.addEventListener('click', generateAndCopyLink);

// --- Generate Link for Sharing ---
function generateLink() {
    const exportFieldContent = document.getElementById('exportfield')?.value;
    if (!exportFieldContent) {
        alert("The export field is empty!");
        return null;
    }
    const encodedContent = encodeURIComponent(exportFieldContent);
    const baseUrl = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
    return `${baseUrl}/generatedlevel.html?content=${encodedContent}`;
}
function shareOnFacebook() {
    const generatedLink = generateLink();
    if (!generatedLink) return;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(generatedLink)}`, '_blank');
}
function shareOnX() {
    const generatedLink = generateLink();
    if (!generatedLink) return;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(generatedLink)}`, '_blank');
}
function shareViaEmail() {
    const generatedLink = generateLink();
    if (!generatedLink) return;
    window.location.href = `mailto:?body=${encodeURIComponent(generatedLink)}`;
}
const facebookShareButton = document.getElementById('facebookShare');
if (facebookShareButton) facebookShareButton.addEventListener('click', shareOnFacebook);
const xShareButton = document.getElementById('xShare');
if (xShareButton) xShareButton.addEventListener('click', shareOnX);
const emailShareButton = document.getElementById('emailShare');
if (emailShareButton) emailShareButton.addEventListener('click', shareViaEmail);

// --- Show Level Result after Export Dialog Opens ---
function showLevelResult() {
    const fakeLoading = document.getElementById('fakeLoading');
    const levelResult = document.getElementById('levelResult');
    if (!fakeLoading || !levelResult) return;
    setTimeout(() => {
        fakeLoading.style.display = 'none';
        levelResult.style.display = 'block';
    }, 2000);
}
function observeExportDialog() {
    const exportDialog = document.querySelector('.export-dialog');
    if (!exportDialog) return;
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'open') {
                if (exportDialog.hasAttribute('open')) showLevelResult();
            }
        }
    });
    observer.observe(exportDialog, { attributes: true });
}
document.addEventListener('DOMContentLoaded', observeExportDialog);

// --- Keyboard Shortcuts ---
document.addEventListener("DOMContentLoaded", () => {
    const triggerClick = (selector) => {
        const element = document.querySelector(selector);
        if (element) element.click();
    };
    document.addEventListener("keydown", (event) => {
        if (event.ctrlKey) {
            switch (event.key.toLowerCase()) {
                case 'l': event.preventDefault(); triggerClick(".newlvl"); break;
                case 's': event.preventDefault(); triggerClick(".export-button"); break;
                case 'i': event.preventDefault(); triggerClick(".import-main"); break;
                case 'b': event.preventDefault(); triggerClick(".credit-btn"); break;
                case 'k': event.preventDefault(); triggerClick(".keyboard-shortcuts"); break;
            }
        }
    });
});

// --- Updates Snackbar ---
const updateSnackbar = document.querySelector(".updates-notify");
const checkUpdates = document.getElementById("checkUpdates");
if (checkUpdates && updateSnackbar) checkUpdates.addEventListener("click", () => updateSnackbar.open = true);

// --- Settings Full Dialog ---
document.addEventListener('DOMContentLoaded', function () {
    const settingsBtn = document.querySelector('.settings-btn');
    const settingsFulldialog = document.querySelector('.settings-fulldialog');
    const closeSettings = document.querySelector('.close-settings');
    if (settingsBtn && settingsFulldialog) settingsBtn.addEventListener('click', function () { settingsFulldialog.setAttribute('open', ''); });
    if (closeSettings && settingsFulldialog) closeSettings.addEventListener('click', function () { settingsFulldialog.removeAttribute('open'); });
});

// --- Music Player ---
document.addEventListener('DOMContentLoaded', function () {
    const musicMain = document.getElementById('musicMain');
    const musicSrc = document.getElementById('musicSrc');
    const playSongButton = document.getElementById('playSong');
    const muteButton = document.getElementById('mute');
    const volumeCustomize = document.getElementById('volumeCustomize');
    const songNameDisplay = document.getElementById('songName');
    if (!musicMain || !musicSrc || !playSongButton || !muteButton || !volumeCustomize || !songNameDisplay) return;
    function changeMusicSource(source, songName) {
        musicSrc.src = source;
        musicMain.load();
        musicMain.play();
        songNameDisplay.textContent = songName;
    }
    const songIds = [
        { id: 'bonbon-bonbon', file: 'Bonbon Bonbon.ogg', name: 'Bonbon Bonbon' },
        { id: 'bonus', file: 'Bonus.ogg', name: 'Bonus' },
        { id: 'candification', file: 'Candification.ogg', name: 'Candification' },
        { id: 'candy-crushed', file: 'Candy Crushed.ogg', name: 'Candy Crushed' },
        { id: 'candy-hour', file: 'Candy Hour.ogg', name: 'Candy Hour' },
        { id: 'colorbomb', file: 'Colorbomb.ogg', name: 'Colorbomb' },
        { id: 'floaty', file: 'Floaty.ogg', name: 'Floaty' },
        { id: 'its-frosty', file: 'Its Frosty.ogg', name: "It's Frosty" },
        { id: 'just-shouffle', file: 'Just Shouffle.ogg', name: 'Just Shouffle' },
        { id: 'sweet-sweet-caramel', file: 'Sweet Sweet Caramel.ogg', name: 'Sweet Sweet Caramel' }
    ];
    songIds.forEach(song => {
        const btn = document.getElementById(song.id);
        if (btn) btn.addEventListener('click', () => changeMusicSource(`audio/songs/songs_1.9/${song.file}`, song.name));
    });
    playSongButton.addEventListener('click', function () {
        const mdIcon = playSongButton.querySelector('md-icon');
        if (musicMain.paused) {
            musicMain.play();
            if (mdIcon) mdIcon.textContent = 'ﵙ';
        } else {
            musicMain.pause();
            if (mdIcon) mdIcon.textContent = 'ﵥ';
        }
    });
    muteButton.addEventListener('click', function () {
        const mdIcon = muteButton.querySelector('md-icon');
        musicMain.muted = !musicMain.muted;
        if (mdIcon) mdIcon.textContent = musicMain.muted ? 'volume_off' : 'volume_up';
    });
    volumeCustomize.addEventListener('input', function () {
        musicMain.volume = volumeCustomize.value;
    });
});

// --- Song List Navigation ---
const songs = [
    'Bonbon Bonbon', 'Bonus', 'Candification', 'Candy Crushed', 'Colorbomb',
    'Dunk that Cookie', 'Floaty', 'Its Frosty', 'Just Shouffle', 'Sweet Sweet Caramel'
];
let currentSongIndex = 0;
const musicMain = document.getElementById('musicMain');
const songNameDisplay = document.getElementById('songName');
function updateSong() {
    if (!musicMain || !songNameDisplay) return;
    const song = songs[currentSongIndex];
    musicMain.src = `audio/songs/songs_1.9/${song}.ogg`;
    songNameDisplay.textContent = song;
}
const previousSongBtn = document.getElementById('previousSong');
const nextSongBtn = document.getElementById('nextSong');
if (previousSongBtn) previousSongBtn.addEventListener('click', function () {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    updateSong();
    if (musicMain) musicMain.play();
});
if (nextSongBtn) nextSongBtn.addEventListener('click', function () {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    updateSong();
    if (musicMain) musicMain.play();
});
updateSong();

// --- Click Sound ---
document.addEventListener('DOMContentLoaded', function () {
    const switchClick = document.getElementById('switchClick');
    const clickSound = document.getElementById('clickSound');
    if (!switchClick || !clickSound) return;
    document.addEventListener('click', function () {
        if (switchClick.checked) {
            clickSound.currentTime = 0;
            clickSound.play();
        }
    });
});

// --- Dropdown Menus ---
document.addEventListener('DOMContentLoaded', function () {
    const dropdowns = document.querySelectorAll('.dropdownmenu');
    dropdowns.forEach(dropdown => {
        const dropbtn = dropdown.closest('button');
        if (!dropbtn) return;
        dropbtn.addEventListener('click', function (event) {
            event.stopPropagation();
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
                dropdown.classList.add('hide');
            } else {
                dropdown.classList.remove('hide');
                dropdown.classList.add('show');
                dropdown.style.backdropFilter = 'blur(15px)';
            }
        });
    });
    window.addEventListener('click', function (event) {
        dropdowns.forEach(dropdown => {
            if (!event.target.closest('button') && dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
                dropdown.classList.add('hide');
                dropdown.style.backdropFilter = '';
            }
        });
    });
});

// --- Import/Export/Credits/New Level Dialogs (Backdrop) ---
// (No change, as these are already robust and deduplicated in the previous code)
// ... existing code ...
// --- Responsive Layout ---
function handleResponsiveLayout() {
    const screenWidth = window.innerWidth;
    const sidebarConfig = document.getElementById('sidebar-config');
    const sidebarElms = document.getElementById('sidebar-elms');
    const sideselectionright = document.querySelector('.sideselectionright');
    const sideselection = document.querySelector('.sideselection');
    const configContent = document.querySelector('bottom-drawer-content[value="configuration"]');
    const elementsContent = document.querySelector('bottom-drawer-content[value="elements"]');
    const settingsMenu = document.getElementById('settingsMenu');
    const settingsContent = document.querySelector('bottom-drawer-content[value="settings"]');
    const MOBILE_BREAKPOINT = 840;
    const TABLET_BREAKPOINT = 1024;
    function moveElement(element, targetContainer, width = '100%') {
        if (element && targetContainer) {
            targetContainer.appendChild(element);
            element.style.width = width;
            element.style.transition = 'width 0.3s ease-in-out';
        }
    }
    function restoreElement(element, originalContainer) {
        if (element && originalContainer) {
            originalContainer.appendChild(element);
            element.style.width = '';
            element.style.transition = 'width 0.3s ease-in-out';
        }
    }
    if (screenWidth < MOBILE_BREAKPOINT) {
        moveElement(sideselectionright, configContent);
        moveElement(sideselection, elementsContent);
        if (sidebarConfig) sidebarConfig.removeAttribute('open');
        if (sidebarElms) sidebarElms.removeAttribute('open');
        if (settingsMenu && settingsContent) {
            const settingsContainer = document.createElement('div');
            settingsContainer.className = 'sideselection';
            settingsContainer.style.width = '100%';
            settingsMenu.style.marginTop = '70px';
            settingsContainer.appendChild(settingsMenu);
            settingsContent.appendChild(settingsContainer);
        }
    } else if (screenWidth < TABLET_BREAKPOINT) {
        restoreElement(sideselectionright, sidebarConfig);
        restoreElement(sideselection, sidebarElms);
        if (sidebarConfig) sidebarConfig.setAttribute('open', '');
        if (sidebarElms) sidebarElms.setAttribute('open', '');
        if (settingsMenu) {
            const settingsContainer = settingsMenu.parentElement;
            if (settingsContainer && settingsContainer.classList.contains('sideselection')) {
                settingsMenu.style.marginTop = '40px';
            }
        }
    } else {
        restoreElement(sideselectionright, sidebarConfig);
        restoreElement(sideselection, sidebarElms);
        if (sidebarConfig) sidebarConfig.setAttribute('open', '');
        if (sidebarElms) sidebarElms.setAttribute('open', '');
        if (settingsMenu) {
            const settingsContainer = settingsMenu.parentElement;
            if (settingsContainer && settingsContainer.classList.contains('sideselection')) {
                settingsMenu.style.marginTop = '';
                settingsContainer.remove();
            }
        }
    }
}
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
window.addEventListener('load', handleResponsiveLayout);
window.addEventListener('resize', debounce(handleResponsiveLayout, 250));

// --- Bottom Drawer Tabs ---
document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('bottom-drawer-tab');
    const contents = document.querySelectorAll('bottom-drawer-content');
    function updateContentDisplay() {
        const activeTab = document.querySelector('bottom-drawer-tab[active]');
        if (activeTab) {
            const activeValue = activeTab.getAttribute('for-value');
            contents.forEach(content => {
                if (content.getAttribute('value') === activeValue) {
                    content.style.display = 'block';
                    content.style.opacity = '1';
                    content.style.transition = 'opacity 0.3s ease-in-out';
                } else {
                    content.style.opacity = '0';
                    setTimeout(() => { content.style.display = 'none'; }, 300);
                }
            });
        }
    }
    updateContentDisplay();
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.removeAttribute('active'));
            this.setAttribute('active', '');
            updateContentDisplay();
        });
    });
});

// --- Zoom Slider ---
const fluentSlider = document.getElementById("fluentSlider");
const bubble = document.getElementById("valueBubble");
const levelTable = document.getElementById('level');
let previousValue = 50;
if (fluentSlider && bubble && levelTable) {
    function setSliderTrack(val) {
        const min = fluentSlider.min;
        const max = fluentSlider.max;
        const percent = ((val - min) * 100) / (max - min);
        fluentSlider.style.background = `linear-gradient(to right, #007aff ${percent}%, #ccc ${percent}%)`;
    }
    function setBubble(val) {
        const percent = ((val - fluentSlider.min) * 100) / (fluentSlider.max - fluentSlider.min);
        const sliderWidth = fluentSlider.offsetWidth;
        const offset = (percent / 100) * sliderWidth;
        bubble.innerHTML = val;
        bubble.style.left = `${offset}px`;
    }
    fluentSlider.addEventListener("input", () => {
        setSliderTrack(fluentSlider.value);
        setBubble(fluentSlider.value);
        // Zoom logic
        const value = fluentSlider.value;
        bubble.textContent = value;
        bubble.hidden = false;
        const sliderWidth = fluentSlider.offsetWidth;
        const bubbleWidth = bubble.offsetWidth;
        const position = (value / 100) * (sliderWidth - bubbleWidth);
        bubble.style.left = `${position + bubbleWidth / 2}px`;
        const currentScale = getComputedStyle(levelTable).transform;
        const currentScaleValue = currentScale === 'none' ? 1 : parseFloat(currentScale.split('(')[1]);
        if (value > previousValue) {
            levelTable.style.transform = `scale(${currentScaleValue + 0.05})`;
        } else if (value < previousValue) {
            levelTable.style.transform = `scale(${currentScaleValue - 0.05})`;
        }
        previousValue = value;
    });
    fluentSlider.addEventListener("mousedown", () => { bubble.removeAttribute("hidden"); });
    fluentSlider.addEventListener("mouseup", () => { bubble.setAttribute("hidden", "true"); });
    fluentSlider.addEventListener("touchstart", () => { bubble.removeAttribute("hidden"); });
    fluentSlider.addEventListener("touchend", () => { bubble.setAttribute("hidden", "true"); });
    setSliderTrack(fluentSlider.value);
    setBubble(fluentSlider.value);
    fluentSlider.addEventListener('change', function () { bubble.hidden = true; });
}
// ... existing code ...
