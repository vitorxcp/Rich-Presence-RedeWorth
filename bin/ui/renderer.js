window.$ = window.jQuery = require('./jquery-3.7.1.min.js');

$(() => {
    var translations;

    const tr = translate();
    const { ipcRenderer, app } = require('electron');
    const peq = require("../../package.json");

    const formatTimeDifference = (timestamp) => {
        let diff = Date.now() - timestamp;
        const units = [
            {
                label: 'd',
                value: 1000 * 60 * 60 * 24
            },
            {
                label: 'h',
                value: 1000 * 60 * 60
            },
            {
                label: 'm',
                value: 1000 * 60
            },
            {
                label: 's',
                value: 1000
            }
        ];

        const duration = units.map(({ label, value }) => {
            const amount = Math.floor(diff / value);
            diff %= value;
            return amount > 0
                ? `${amount}${label} `
                : '';
        }).join('').trim();

        if (duration === '') {
            return '0s';
        } else {
            return duration;
        }
    };

    const formatMemoryUsage = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)}MiB`;

    var user = null
    var nickname = "";
    var startRPC;
    var intInfo = false;
    let csfg = false;

    $(document).ready(async () => {
        var jqwerftj = $("#showActivitiesReal").checked;

        await ipcControl();

        setTimeout(() => {
            $(".wedfr").addClass("hidden")
        }, 1300);
    })

    const $tooltip = $('#custom-tooltip');
    const showTooltip = function (e) {
        const text = $(this).attr('title-app');
        $tooltip.html(text).removeClass('hidden');
        moveTooltip(e);
    };
    const hideTooltip = () => {
        $tooltip.addClass('hidden');
    };
    const moveTooltip = (e) => {
        const winWidth = $(window).width();
        const winHeight = $(window).height();

        const tipWidth = $tooltip.outerWidth();
        const tipHeight = $tooltip.outerHeight();

        let newLeft = e.clientX + 15;

        if (newLeft + tipWidth > winWidth - 10) {
            newLeft = e.clientX - 15 - tipWidth;
        }

        let newTop = e.clientY + 15;

        if (newTop + tipHeight > winHeight - 10) {
            newTop = e.clientY - 15 - tipHeight;
        }

        $tooltip.css({
            left: newLeft + 'px',
            top: newTop + 'px'
        });
    };

    $('[title-app]').on({
        'mouseover': showTooltip,
        'mouseleave': hideTooltip,
        'mousemove': moveTooltip
    });

    async function ipcControl() {
        let dsaf34r = document.getElementById("editTimeActivitiesProfile").value;

        ipcRenderer.on('terminal-output', (event, data) => {
            const terminalDiv = document.getElementById('terminal');
            const colors = {
                "[0;31m": "red",
                "[0;33m": "#ffcc00",
                "[0;37m-": "#ffffff",
                "[0;36m ": "#00ffff",
                "[0;35m ": "#ff00ff",
                "[0;32m": "#00ff00"
            };

            const colorKey = Object.keys(colors).find(key => data.includes(key)) || null;
            const color = colorKey ? colors[colorKey] : "#ffffff";

            const processedData = String(data).replace(/\x1B\[[0-9;]*[mK]/g, '');

            if (processedData) {
                terminalDiv.innerHTML += `<p style="color: ${color}">${processedData}</p>`;
                terminalDiv.scrollTop = terminalDiv.scrollHeight;
            }

            if (processedData.includes("Atividade personalizada ativada!")) {
                numberExecuteReload = 25;
            }
        });

        ipcRenderer.on('versionAPP', (event, data) => {
            $('#versionAPP').text(data);
        });

        ipcRenderer.on('MemoryUsed', (event, data) => {
            $('#ramUsedProcess').text(formatMemoryUsage(data.heapUsed));
        });

        ipcRenderer.on("stats", (event, data) => {
            const date = new Date();
            const locale = 'pt-BR';
            const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
            const monthName = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
            const year = date.getFullYear();
            const titleDate = `${capitalize(monthName)} de ${year}`;
            const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
            const day = date.getDate();
            const cardDate = `${capitalize(weekday)}, ${day} de ${capitalize(monthName)} de ${year}`;
            const currentYear = date.getFullYear();
            const currentMonth = String(date.getMonth() + 1).padStart(2, '0');
            const currentDay = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${currentYear}-${currentMonth}-${currentDay}`;

            var dateAf = `${capitalize(monthName)}_${year}`;

            // Saída (hoje): "Novembro de 2025" titleDate
            // Saída (hoje): "Terça-feira, 4 de Novembro de 2025" cardDate
            // Saída (hoje): "2025-11-04" formattedDate

            if (data.appLaunches) {
                let launchesInfo = "";
                const entries = Object.entries(data.appLaunches).sort((a, b) => new Date(b[0]) - new Date(a[0]));
                for (const [date, info] of entries) {
                    const date2 = info.date ? new Date(info.date) : new Date();
                    const capitalize2 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
                    const monthName2 = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date2);
                    const year2 = date2.getFullYear();
                    const titleDate2 = `${capitalize2(monthName2)} de ${year2}`;
                    const weekday2 = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date2);
                    const day2 = date2.getDate();
                    const cardDate2 = `${capitalize2(weekday2)}, ${day2} de ${capitalize2(monthName2)} de ${year2}`;
                    const currentYear2 = date2.getFullYear();
                    const currentMonth2 = String(date2.getMonth() + 1).padStart(2, '0');
                    const currentDay2 = String(date2.getDate()).padStart(2, '0');
                    const formattedDate2 = `${currentYear2}-${currentMonth2}-${currentDay2}`;

                    // Saída (hoje): "Novembro de 2025" titleDate2
                    // Saída (hoje): "Terça-feira, 4 de Novembro de 2025" cardDate2
                    // Saída (hoje): "2025-11-04" formattedDate2

                    var timeMinecraftExecuteMS = 0;
                    var timeActiveExecuteMS = 0;
                    var timeAppExecuteMS = 0;
                    var htmlDays = "";

                    Object.entries(info.days).forEach(([date, data]) => {
                        const date22 = data.stopDateNow ? new Date(data.stopDateNow) : new Date();
                        const capitalize22 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
                        const monthName22 = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date22);
                        const year22 = date22.getFullYear();
                        const titleDate22 = `${capitalize22(monthName22)} de ${year22}`;
                        const weekday22 = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date22);
                        const day22 = date22.getDate();
                        const cardDate22 = `${capitalize22(weekday22)}, ${day22} de ${capitalize2(monthName22)} de ${year22}`;
                        const currentYear22 = date22.getFullYear();
                        const currentMonth22 = String(date22.getMonth() + 1).padStart(2, '0');
                        const currentDay22 = String(date22.getDate()).padStart(2, '0');
                        const formattedDate22 = `${currentYear22}-${currentMonth22}-${currentDay22}`;

                        // Saída (hoje): "Novembro de 2025" titleDate22
                        // Saída (hoje): "Terça-feira, 4 de Novembro de 2025" cardDate22
                        // Saída (hoje): "2025-11-04" formattedDate22

                        if (!data.timeExecuteRPC) return;

                        var timeDayMinecraftExecuteMS = 0;
                        var timeDayActiveExecuteMS = 0;

                        const rpcList = Array.isArray(data.timeExecuteRPC)
                            ? data.timeExecuteRPC
                            : Object.keys(data.timeExecuteRPC)
                                .sort((a, b) => a - b)
                                .map(k => data.timeExecuteRPC[k]);

                        rpcList.forEach((rpc, i) => {
                            const isLast = i === rpcList.length - 1;

                            if (rpc.app && (rpc.app.total === 0 || rpc.app.total)) {
                                const appTotal = Number(rpc.app.total ?? 0);
                                const mcTotal = Number(rpc.minecraft?.total ?? 0);

                                if (rpc.minecraft) {
                                    if (mcTotal === 0 && isLast && rpc.minecraft.start !== 0) {
                                        timeMinecraftExecuteMS += (Date.now() - rpc.minecraft.start);
                                        timeDayMinecraftExecuteMS += (Date.now() - rpc.minecraft.start);
                                    } else {
                                        timeMinecraftExecuteMS += mcTotal;
                                        timeDayMinecraftExecuteMS += mcTotal;
                                    }
                                }

                                if (appTotal === 0 && isLast) {
                                    timeActiveExecuteMS += (Date.now() - rpc.app.start);
                                    timeDayActiveExecuteMS += (Date.now() - rpc.app.start);
                                } else {
                                    timeActiveExecuteMS += appTotal;
                                    timeDayActiveExecuteMS += appTotal;
                                }
                            }
                        });

                        var milessecondsMinecraft = timeDayMinecraftExecuteMS;
                        var hoursMinecraft = Math.floor(milessecondsMinecraft / (1000 * 60 * 60));
                        var minutesMinecraft = Math.floor((milessecondsMinecraft % (1000 * 60 * 60)) / (1000 * 60));
                        var secondsMinecraft = Math.floor((milessecondsMinecraft % (1000 * 60)) / 1000);
                        var timeMinecraftExecute = `${hoursMinecraft}m ${minutesMinecraft}m ${secondsMinecraft}s`;

                        var milessecondsActive = timeDayActiveExecuteMS;
                        var hoursActive = Math.floor(milessecondsActive / (1000 * 60 * 60));
                        var minutesActive = Math.floor((milessecondsActive % (1000 * 60 * 60)) / (1000 * 60));
                        var secondsActive = Math.floor((milessecondsActive % (1000 * 60)) / 1000);
                        var timeActiveExecute = `${hoursActive}h ${minutesActive}m ${secondsActive}s`;

                        htmlDays += `
                                            <div
                                                class="flex-shrink-0 w-[12em] bg-gray-800 p-4 rounded-lg border border-gray-700">
                                                <span class="text-sm text-gray-400 mb-2 block">${cardDate22}</span>
                                                <div class="flex flex-col gap-1">
                                                    <div>
                                                        <span class="text-xs text-gray-400">Tempo do Minecraft
                                                            Aberto:</span>
                                                        <p class="text-lg font-medium text-white">${timeMinecraftExecute}</p>
                                                    </div>
                                                    <div>
                                                        <span class="text-xs text-gray-400">Tempo da Atividade
                                                            Ativa:</span>
                                                        <p class="text-lg font-medium text-white">${timeActiveExecute}</p>
                                                    </div>
                                                </div>
                                            </div>
                    `
                    });

                    info.app.forEach((appInfo, i) => {
                        const isLast = i === info.app.length - 1;

                        if (isLast) {
                            timeAppExecuteMS += (Date.now() - appInfo.start);
                        } else {
                            timeAppExecuteMS += appInfo.total;
                        }
                    });

                    var milessecondsMinecraft = timeMinecraftExecuteMS;
                    var hoursMinecraft = Math.floor(milessecondsMinecraft / (1000 * 60 * 60));
                    var minutesMinecraft = Math.floor((milessecondsMinecraft % (1000 * 60 * 60)) / (1000 * 60));
                    var secondsMinecraft = Math.floor((milessecondsMinecraft % (1000 * 60)) / 1000);
                    var daysMinecraft = Math.floor(hoursMinecraft / 24);
                    var timeMinecraftExecute = `${daysMinecraft}d ${hoursMinecraft}h ${minutesMinecraft}m ${secondsMinecraft}s`;

                    var milessecondsActive = timeActiveExecuteMS;
                    var hoursActive = Math.floor(milessecondsActive / (1000 * 60 * 60));
                    var minutesActive = Math.floor((milessecondsActive % (1000 * 60 * 60)) / (1000 * 60));
                    var secondsActive = Math.floor((milessecondsActive % (1000 * 60)) / 1000);
                    var daysActive = Math.floor(hoursActive / 24);
                    var timeActiveExecute = `${daysActive}d ${hoursActive}h ${minutesActive}m ${secondsActive}s`;

                    var milessecondsApp = timeAppExecuteMS;
                    var hoursApp = Math.floor(milessecondsApp / (1000 * 60 * 60));
                    var minutesApp = Math.floor((milessecondsApp % (1000 * 60 * 60)) / (1000 * 60));
                    var secondsApp = Math.floor((milessecondsApp % (1000 * 60)) / 1000);
                    var daysApp = Math.floor(hoursApp / 24);
                    var timeAppExecute = `${daysApp}d ${hoursApp}h ${minutesApp}m ${secondsApp}s`;

                    $("#statistics-top-views").empty();
                    $("#statistics-top-views").append(`
                    <div class="grid grid-cols-[auto_1fr] gap-x-6 mt-[-12px]">
                                    <div class="flex flex-col items-center">
                                        <div class="w-3 h-3 bg-gray-500 rounded-full mt-1"></div>
                                        <div class="w-px h-full bg-gray-700"></div>
                                    </div>
                                    <div class="overflow-hidden mb-[20px]">
                                        <h2 class="text-lg font-semibold text-white mb-4">${titleDate2}</h2>
                                        <div class="flex flex-wrap gap-x-8 gap-y-4 mb-6">
                                            <div>
                                                <span class="text-sm text-gray-400">Tempo do Minecraft Aberto:</span>
                                                <p class="text-xl font-bold text-white">${timeMinecraftExecute}</p>
                                            </div>
                                            <div>
                                                <span class="text-sm text-gray-400">Tempo da Atividade Ativa:</span>
                                                <p class="text-xl font-bold text-white">${timeActiveExecute}</p>
                                            </div>
                                            <div>
                                                <span class="text-sm text-gray-400">Aplicativo Aberto:</span>
                                                <p class="text-xl font-bold text-white">${info.launches} <span
                                                        class="text-base font-normal text-gray-300">vezes</span></p>
                                            </div>
                                            <div>
                                                <span class="text-sm text-gray-400">Tempo do Aplicativo Aberto:</span>
                                                <p class="text-xl font-bold text-white">${timeAppExecute}</p>
                                            </div>
                                        </div>
                                        <div class="flex overflow-x-auto gap-4 pb-4 w-full">
                                            ${htmlDays}
                                        </div>
                                    </div>
                                </div>
                    `)
                }
            }
        });

        ipcRenderer.on("infoApp", (event, data) => {
            var stats = data;

            if (stats === "run" && intInfo !== true) {
                const $terminal = $('#terminal');
                const mensagem = `<p style="color: #ffcc00">Você provavelmente reiniciou a página, mas o sistema de atividades já estava online!</p>`;

                $terminal.append(mensagem);
                $terminal.scrollTop($terminal[0].scrollHeight);

                intInfo = true;
            }
        })

        ipcRenderer.on('activities-reload-time-active', (event, data) => {
            if (data === 0) return $("#timeResetProcessRPC").text("Agora...");
            if (!data || data === -1) return $("#timeResetProcessRPC").text("0s");
            $("#timeResetProcessRPC").text(`${data}s`);
        })

        ipcRenderer.on('timeExecuteJava', (event, data) => {
            if (!data || data === 0 || data === -1) return $("#timeMinecraftIsON").text("0s");
            $("#timeMinecraftIsON").text(formatTimeDifference(data));
        })

        ipcRenderer.on('timeStartPresence', (event, data) => {
            if (!data || data === 0 || data === -1) {
                $("#timeProcessIsON").text("0s");

                document.getElementById('restartRPC').disabled = true;
                document.getElementById('stopRPC').disabled = true;
                document.getElementById('startRPC').disabled = false;
                return;
            }

            $("#timeProcessIsON").text(formatTimeDifference(data));
            document.getElementById('restartRPC').disabled = false;
            document.getElementById('stopRPC').disabled = false;
            document.getElementById('startRPC').disabled = true;
        })

        ipcRenderer.on('config', (event, data) => {
            if (csfg === true) return;

            var editTimeActivitiesProfile = document.getElementById('editTimeActivitiesProfile').value;
            var showClient = document.getElementById('showClient').checked;
            var showPlayers = document.getElementById('showPlayers').checked;
            var showTimeActivities = document.getElementById('showTimeActivities').checked;
            var showActivitiesReal = document.getElementById("showActivitiesReal").checked;

            jqwerftj = data.showActivitiesReal;
            dsaf34r = data.editTimeActivitiesProfile;

            nickname = data.nickname;

            document.getElementById('editNick').value = data.nickname;
            if (showClient !== data.showClient) document.getElementById('showClient').checked = data.showClient;
            if (showPlayers !== data.showPlayers) document.getElementById('showPlayers').checked = data.showPlayers;
            if (showTimeActivities !== data.showTimeActivities) document.getElementById('showTimeActivities').checked = data.showTimeActivities;
            if (showActivitiesReal !== data.showActivitiesReal) document.getElementById('showActivitiesReal').checked = data.showActivitiesReal;
            if (editTimeActivitiesProfile !== data.editTimeActivitiesProfile) document.getElementById("editTimeActivitiesProfile").value = data.editTimeActivitiesProfile
            document.getElementById('headNickname').src = `https://mc-heads.net/avatar/${data.nickname}/16x16`;
        })

        ipcRenderer.on('configApp', (event, data) => {
            if (csfg === true) return;

            var minimizeToTray = document.getElementById('minimizeToTray').checked;
            var runAppToMin = document.getElementById('runAppToMin').checked;
            var closeAppGameInt = document.getElementById('closeAppGameInt').checked;
            var AppStartRich = document.getElementById('AppStartRich').checked;
            var pixelFormatApp1 = document.getElementById('pixelFormatApp1').value;
            var pixelFormatApp2 = document.getElementById('pixelFormatApp2').value;

            if (minimizeToTray !== data.minimizeToTray) document.getElementById('minimizeToTray').checked = data.minimizeToTray;
            if (runAppToMin !== data.runAppToMin) document.getElementById('runAppToMin').checked = data.runAppToMin;
            if (closeAppGameInt !== data.closeAppGameInt) document.getElementById('closeAppGameInt').checked = data.closeAppGameInt;
            if (AppStartRich !== data.AppStartRich) document.getElementById('AppStartRich').checked = data.AppStartRich;
            if (pixelFormatApp1 !== data.pixelFormatApp1) document.getElementById('pixelFormatApp1').value = data.pixelFormatApp1;
            if (pixelFormatApp2 !== data.pixelFormatApp2) document.getElementById('pixelFormatApp2').value = data.pixelFormatApp2;
        })

        ipcRenderer.on('reloadUser', async () => {
            await reloadUser();
        })

        ipcRenderer.on('startRPC', (event, data) => {
            intInfo = true;
            if (jqwerftj === true) {
                document.getElementById("editTimeActivitiesProfile").value = new Date(startRPC).toLocaleString("en-CA", {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }).replace(',', '');
            }

            startRPC = data.timeStart;
            document.getElementById('restartRPC').disabled = false;
            document.getElementById('stopRPC').disabled = false;
            document.getElementById('startRPC').disabled = true;

            console.log("RPC Started");
            dateOnActivities = Date.now() - 1000;

            let currentDate = new Date();
            let formattedDate = currentDate.toLocaleString("en-CA", {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(',', '');

            if (document.getElementById("editTimeActivitiesProfile").value === "" || document.getElementById("editTimeActivitiesProfile").value === " " || !document.getElementById("editTimeActivitiesProfile").value) document.getElementById("editTimeActivitiesProfile").value = formattedDate;

            var editTimeActivitiesProfile = document.getElementById('editTimeActivitiesProfile').value;
            var showClient = document.getElementById('showClient').checked;
            var showPlayers = document.getElementById('showPlayers').checked;
            var showTimeActivities = document.getElementById('showTimeActivities').checked;
            var showActivitiesReal = document.getElementById("showActivitiesReal").checked;

            ipcRenderer.send(`config`, {
                showActivitiesReal,
                editTimeActivitiesProfile,
                showClient,
                showPlayers,
                showTimeActivities,
                nickname
            });
        });

        document.getElementById('homeC').addEventListener('click', () => { categoryAc("homeC") });
        document.getElementById('configC').addEventListener('click', () => { categoryAc("configC") });
        document.getElementById('topC').addEventListener('click', () => { categoryAc("topC") });
        document.getElementById('userC').addEventListener('click', () => { categoryAc("userC") });
        document.getElementById('configCJ').addEventListener('click', () => { categoryVCAP("configCJ") });
        document.getElementById('configCP').addEventListener('click', () => { categoryVCAP("configCP") });
        document.getElementById('configCA').addEventListener('click', () => { categoryVCAP("configCA") });
        document.getElementById('configCAPP').addEventListener('click', () => { categoryVCAP("configCAPP") });
        document.getElementById('startRPC').addEventListener('click', () => handleRPCAction('start'));
        document.getElementById('restartRPC').addEventListener('click', () => handleRPCAction('reload'));
        document.getElementById('stopRPC').addEventListener('click', () => handleRPCAction('stop'));
        document.getElementById("minimizeToTray").addEventListener("click", function () { systemUpdateConfigApp() });
        document.getElementById("runAppToMin").addEventListener("click", function () { systemUpdateConfigApp() });
        document.getElementById("closeAppGameInt").addEventListener("click", function () { systemUpdateConfigApp() });
        document.getElementById("pixelFormatApp1").addEventListener("keyup", function () { systemUpdateConfigApp() });
        document.getElementById("pixelFormatApp2").addEventListener("keyup", function () { systemUpdateConfigApp() });

        document.getElementById("editTimeActivitiesProfile").addEventListener("change", function () {
            if (dsaf34r !== document.getElementById("editTimeActivitiesProfile").value) {
                document.getElementById("showActivitiesReal").checked = false
                systemUpdateConfigApp();
            }
        })

        document.getElementById("showActivitiesReal").addEventListener("click", function () {
            systemUpdateConfigApp();

            document.getElementById('editTimeActivitiesProfile').value = new Date(startRPC).toLocaleString("en-CA", {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(',', '');
        })

        document.getElementById("showTimeActivities").addEventListener("click", function () {
            var showTimeActivities = document.getElementById('showTimeActivities').checked;

            if (showTimeActivities === true) {
                document.getElementById('editTimeActivitiesProfile').disabled = false;
            } else {
                document.getElementById('editTimeActivitiesProfile').disabled = true;
            }
        });
        document.getElementById('editNick').addEventListener('keyup', () => {
            var nick = String(document.getElementById('editNick').value).slice();
            document.getElementById('headNickname').src = `https://mc-heads.net/avatar/${nick}/16x16`;
            systemUpdateConfigApp();

        });

        document.getElementById("showClient").addEventListener("click", function () { systemUpdateConfigApp() })
        document.getElementById("showPlayers").addEventListener("click", function () { systemUpdateConfigApp() })
        document.getElementById("showTimeActivities").addEventListener("click", function () { systemUpdateConfigApp() })
        document.getElementById("AppStartRich").addEventListener("click", () => { systemUpdateConfigApp() })

        $("#appTitleDonate").text(tr["main"]["appTitleDonate"]);
        $("#appDescriptionDonate").text(tr["main"]["appDescriptionDonate"]);
        $("#openPix").html(`<i class="fa-solid fa-qrcode"></i> ${tr["main"]["donateButton"]}`);
        $("#homeC").attr("title-app", tr["main"]["attr"]["homeC"]);
        $("#configC").attr("title-app", tr["main"]["attr"]["configC"]);
        $("#topC").attr("title-app", tr["main"]["attr"]["topC"]);
        $("#userC").attr("title-app", tr["main"]["attr"]["userC"]);
        $("#minimize-btn").attr("title-app", tr["main"]["navbar"]["window-controls"]["minimize-btn"]);
        $("#maximize-btn").attr("title-app", tr["main"]["navbar"]["window-controls"]["maximize-btn"]);
        $("#close-btn").attr("title-app", tr["main"]["navbar"]["window-controls"]["close-btn"]);
        $("#startRPC").attr("title-app", tr["main"]["homeSection"]["controls"]["start"]["attr"]).html(`<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current"
                                            viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg> <span>${tr["main"]["homeSection"]["controls"]["start"]["content"]}</span>`);
        $("#restartRPC").attr("title-app", tr["main"]["homeSection"]["controls"]["restart"]["attr"]).html(`<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current"
                                            viewBox="0 0 24 24">
                                            <path
                                                d="M12 5V1L7 6l5 5V7c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5H5c0 3.9 3.1 7 7 7s7-3.1 7-7-3.1-7-7-7z" />
                                        </svg> <span>${tr["main"]["homeSection"]["controls"]["restart"]["content"]}</span>`);
        $("#stopRPC").attr("title-app", tr["main"]["homeSection"]["controls"]["stop"]["attr"]).html(`<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current"
                                            viewBox="0 0 24 24">
                                            <path d="M6 6h12v12H6z" />
                                        </svg> <span>${tr["main"]["homeSection"]["controls"]["stop"]["content"]}</span>`);
        $("#titleMineAd3").text(tr["main"]["homeSection"]["information"]["titleMinecraft"]);
        $("#titleATAd3").text(tr["main"]["homeSection"]["information"]["titleAtivApp"]);
        $("#titleMemoAd3").text(tr["main"]["homeSection"]["information"]["titleRam"]);
        $("#titleAtAAd3").text(tr["main"]["homeSection"]["information"]["TitleAppAt"]);

        document.getElementById('openPix').addEventListener('click', () => {
            ipcRenderer.send('abrir-livepix');
        });

        $(document).on('keydown', function (event) {
            if (event.key === "Escape") {
                $(".wedfr-d3").css("display", "none");
                $(".wedfr-d3f4").css("display", "none");
                csfg = false;
                $(".wedfr-d32").css("display", "none");
            }
        });

        $("#minimize-btn").on("click", function () {
            ipcRenderer.send("minimize-window");
        });

        $("#maximize-btn").on("click", function () {
            ipcRenderer.send("maximize-window");
        });

        $("#close-btn").on("click", function () {
            ipcRenderer.send("close-window");
        });

        const reloadUser = async () => {
            var userTags = {
                "518862457876250625": [
                    {
                        tag_color: "bg-[#313b12] text-yellow-400",
                        tag: "Dono"
                    },
                    {
                        tag_color: "bg-[#0e2043] text-blue-400",
                        tag: "Desenvolvedor"
                    }
                ]
            }

            await fetch("http://localhost:7847/api/user").then(res => res.json())
                .then(userr => userr.id ? (user = userr) : (user = null)).catch(e => {
                    user = null;
                });

            if (user) {
                $("#noLoginUser").addClass("hidden");
                $("#yesLoginUser").removeClass("hidden");
                $("#userC")
                    .html(`<img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}" alt="Avatar" class="w-8 h-8 rounded-full">`);
                $("#avatarUserProfile")
                    .css("background-image", `url('https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}')`);
                $("#userName").text(user.username);
                $("#userTag").text(`@${user.global_name}`);

                if (userTags[user.id]) {
                    var tags = "";
                    userTags[user.id].map(tag => {
                        tags += `<div class="mt-2 px-3 py-1 ${tag.tag_color} text-sm rounded-full font-medium shadow-md">${tag.tag}</div>`
                    })

                    $("#tags").html(tags)
                }

                $("#logoutBtn").on("click", () => {
                    ipcRenderer.send('logout-discord');
                });
            } else {
                $("#noLoginUser").removeClass("hidden");
                $("#yesLoginUser").addClass("hidden");
                $("#userC").html(`<i class="fa-duotone fa-solid fa-circle-user text-[#C3C3C3] group-hover:text-white transition"></i>`);
                $("#loginButton").on("click", () => {
                    ipcRenderer.send('abrir-login-discord');
                });
            }
        };

        reloadUser();
        setInterval(reloadUser, 30000);
    }

    const animationSpeed = 200;

    const handleRPCAction = (action) => {
        const nickInput = document.getElementById("editNick").value.trim() || "DefaultNick";

        if (nickname === "") nickname = nickInput;

        if (action === 'start' || action === 'reload') {
            document.getElementById('startRPC').disabled = true;
        }
        if (action === 'reload') {
            document.getElementById('restartRPC').disabled = true;
            document.getElementById('stopRPC').disabled = true;
        }
        if (action === 'stop') {
            document.getElementById('restartRPC').disabled = true;
            document.getElementById('stopRPC').disabled = true;
            document.getElementById('startRPC').disabled = false;
            dateOnActivities = 0;
            dateReloadStatus = 0;
        }

        if (action === "reload") action = "start";

        ipcRenderer.send(`${action}RPC`, nickname);

        systemUpdateConfigApp();
    };

    function systemUpdateConfigApp() {
        var editTimeActivitiesProfile = document.getElementById('editTimeActivitiesProfile').value;
        var showClient = document.getElementById('showClient').checked;
        var showPlayers = document.getElementById('showPlayers').checked;
        var showTimeActivities = document.getElementById('showTimeActivities').checked;
        var nickInput = document.getElementById("editNick").value;
        var showActivitiesReal = document.getElementById("showActivitiesReal").checked;
        var runAppToMin = document.getElementById('runAppToMin').checked;
        var minimizeToTray = document.getElementById('minimizeToTray').checked;
        var closeAppGameInt = document.getElementById('closeAppGameInt').checked;
        var pixelFormatApp1 = document.getElementById('pixelFormatApp1').value;
        var pixelFormatApp2 = document.getElementById('pixelFormatApp2').value;
        var AppStartRich = document.getElementById("AppStartRich").checked;

        nickname = nickInput

        ipcRenderer.send(`configApp`, {
            minimizeToTray,
            runAppToMin,
            closeAppGameInt,
            pixelFormatApp1,
            pixelFormatApp2,
            AppStartRich
        });

        ipcRenderer.send(`config`, {
            showActivitiesReal,
            editTimeActivitiesProfile,
            showClient,
            showPlayers,
            showTimeActivities,
            nickname
        });
    }

    function categoryAc(id) {
        $("#homeC, #configC, #topC, #userC").addClass("group").removeClass("bg-[#070F1D]");
        $("#" + id).removeClass("group").addClass("bg-[#070F1D]");

        const targetSectionId = "#" + id.replace('C', 'Section');
        const $targetSection = $(targetSectionId);
        const $activeSection = $("#homeSection, #configSection, #topSection, #userSection").not(".hidden");

        if (id !== "homeC") {
            csfg = true;
            $("#donate-widget").addClass("hidden");
        }
        else {
            csfg = false;
            $("#donate-widget").removeClass("hidden");
        }

        if ($activeSection.attr('id') === $targetSection.attr('id')) return;
        if ($activeSection.length > 0) {
            $activeSection.animate({ opacity: 0 }, animationSpeed, function () {
                $(this).removeClass("flex").addClass("hidden");
                $targetSection.removeClass("hidden").addClass("flex").css({ opacity: 0 }).animate({ opacity: 1 }, animationSpeed);
            });
        } else {
            $targetSection.removeClass("hidden").addClass("flex").css({ opacity: 0 }).animate({ opacity: 1 }, animationSpeed);
        }
    }

    function categoryVCAP(id) {
        $("#configCJ, #configCP, #configCA, #configCAPP").addClass("bg-opacity-40");
        $("#" + id).removeClass("bg-opacity-40");

        const targetSectionId = "#view" + id.replace("c", "C");
        const $targetSection = $(targetSectionId);
        const $activeSection = $("#viewConfigCJ, #viewConfigCP, #viewConfigCA, #viewConfigCAPP").not(".hidden");

        if ($activeSection.attr('id') === $targetSection.attr('id')) return;
        if ($activeSection.length > 0) {
            $activeSection.animate({ opacity: 0 }, animationSpeed, function () {
                $(this).removeClass("flex").addClass("hidden");
                $targetSection.removeClass("hidden").addClass("flex").css({ opacity: 0 }).animate({ opacity: 1 }, animationSpeed);
            });
        } else {
            $targetSection.removeClass("hidden").addClass("flex").css({ opacity: 0 }).animate({ opacity: 1 }, animationSpeed);
        }
    }

    function getLanguage() {
        const languages = navigator.languages;
        const primaryLocale = navigator.language;
        const mainLang = primaryLocale.split('-')[0];

        return mainLang;
    }

    function translate() {
        const lang = getLanguage();
        const defaultLang = 'pt';

        try {
            translations = require(`../resources/languages/${lang}.json`);
            console.warn("Linguagem de tradução aplicada: " + lang + ".")
        } catch (e1) {
            translations = require(`../resources/languages/${defaultLang}.json`);
            console.warn("Linguagem (" + lang + ") de tradução não encontrada, redirecionando sistema padrão para: " + defaultLang + ".")
        }

        return translations;
    }
});