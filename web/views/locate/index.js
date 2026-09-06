async function locateDelta() {
    var path = await window.electronAPI.invoke('locateDelta',[]);
    if (path != null && path != "Invalid") {
        document.querySelector('input[type="text"]').value = path;
    }
    else {
        htmlAlert("Warning","The selected folder is not a valid installation for " + window.gidName + ".", [{text:"Ok",resolveWith:'ok'}]);
    }
}

async function createNewInstall(path, flags) {
    if (window.gid == 'noid') {
        htmlAlert("Warning","Please select a game.",[{text:"Ok",resolveWith:'ok'}]);
        return;
    }

    flags.is_from_install_manager = (window.fromIM == undefined ? false : window.fromIM);
    flags.copy_to_d_mod = document.getElementById('copyAnyways').checked;

    await window.electronAPI.invoke("createNewInstallation", [window.gid, path, flags]);
}

async function id() {
    let install_path = document.getElementById('dpath').value.replaceAll('\\', '/');
    console.log(install_path);
    await createNewInstall(install_path, {})
}

async function steam() {
    await createNewInstall(null, { "is_from_steam": true });
}

window.currentPageStack.id = id;

window.currentPageStack.back = function() {
    window.electronAPI.invoke('changeSystemIndex', ["0"]);
};

window.currentPageStack.locateDelta = locateDelta;

window.currentPageStack.steam = steam;

window.currentPageStack.downloadDelta = async function() {
    if (window.gid == 'noid') {
        htmlAlert("Warning","Please select a game.",[{text:"Ok",resolveWith:'ok'}]);
        return;
    }
    var path = await window.electronAPI.invoke("downloadGame", [window.gid]);
    if (path) {
        document.querySelector('input[type="text"]').value = path;
    }

    document.querySelector('.copyAnyways').style.opacity = 0.5;
    document.querySelector('.copyAnyways').style.pointerEvents = 'none';
    document.querySelector('#copyAnyways').checked = true;
};

(async() => {
    var allFeat = ['steam','autodownload'];
    allFeat.forEach(f => {
        document.getElementById('feat_' + f).disabled = true;
        document.getElementById('feat_' + f).style.opacity = 0.4;
    });
    window.gid = "noid";

    var games = await window.electronAPI.invoke('getAvailableGames',[]);
    var gOptions = document.querySelector('.gOptions');

    var ems = [];

    for (l in games) {
        await (async() => {
            var game = games[l];

            var img = document.createElement('img');
            img.id = game.id;
            img.classList.add('gameIco');
            img.addEventListener('click', function() {
                window.gid = game.id;
                window.gidName = game.name;
                document.querySelectorAll('.gameIco').forEach(x =>{
                    x.classList.remove('selectedGameIco');
                });

                img.classList.add('selectedGameIco');

                var allFeat = ['steam','autodownload'];
                allFeat.forEach(f => {
                    if (game.availableFeatures.map(x => x.feat).includes(f)) {
                        document.getElementById('feat_' + f).disabled = false;
                        document.getElementById('feat_' + f).style.opacity = 1;
                    }
                    else {
                        document.getElementById('feat_' + f).disabled = true;
                        document.getElementById('feat_' + f).style.opacity = 0.4;
                    }
                });
            })
            img.src = './gamesIco/' + game.id+'.png';
            gOptions.appendChild(img);

            ems.push({id:game.id,em:img});

            tippy(img, {
                content: game.name
            });
        })();
    }
})();