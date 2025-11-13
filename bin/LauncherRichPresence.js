const { db } = require('./plugins/dataDB.js');
const path = require('path');

console.log('[DEBUG_LOG] - Log do terminal sendo registrada com sucesso em', path.dirname(process.cwd()));
require("./plugins/terminalLogInfo.js");

console.log("[DEBUG_LOG] - Iniciando sistemas...");

const date = new Date();
const locale = 'pt-BR';
var capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
var monthName = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
var year = date.getFullYear();
var titleDate = `${capitalize(monthName)} de ${year}`;
var weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
var day = date.getDate();
var cardDate = `${capitalize(weekday)}, ${day} de ${capitalize(monthName)} de ${year}`;
var currentYear = date.getFullYear();
var currentMonth = String(date.getMonth() + 1).padStart(2, '0');
var currentDay = String(date.getDate()).padStart(2, '0');
var formattedDate = `${currentYear}-${currentMonth}-${currentDay}`;

var dateAf = `${capitalize(monthName)}_${year}`;
var dateStartApp = Date.now();

// Saída (hoje): "Novembro de 2025" titleDate
// Saída (hoje): "Terça-feira, 4 de Novembro de 2025" cardDate
// Saída (hoje): "2025-11-04" formattedDate

if (!db.stats.get(`appLaunches/${dateAf}`)) {
  db.stats.set(`appLaunches/${dateAf}`, {
    month: capitalize(monthName),
    year: year,
    date: date,
    launches: 1,
    app: [],
    days: {
      [formattedDate]: {
        date: Date.now(),
        launches: 1
      }
    }
  })
} else {
  db.stats.update("appLaunches/" + dateAf + "/launches", (db.stats.get("appLaunches/" + dateAf + "/launches") || 0) + 1);
  db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/launches", (db.stats.get("appLaunches/" + dateAf + "/days/" + formattedDate + "/launches") || 0) + 1);

}

db.stats.push("appLaunches/" + dateAf + "/app", {
  start: dateStartApp,
  stop: 0,
  total: 0
});

setInterval(() => {
  var dateStop23 = Date.now();
  var totalTimeExecute23 = dateStop23 - dateStartApp;

  let timeExecuteList23 = db.stats.get("appLaunches/" + dateAf + "/app");

  let index = 0;
  if (Array.isArray(timeExecuteList23) && timeExecuteList23.length > 0) {
    index = timeExecuteList23.length - 1;
  }

  db.stats.update("appLaunches/" + dateAf + "/app/" + index + "", {
    start: dateStartApp,
    stop: dateStop23,
    total: totalTimeExecute23
  });
}, 60000);

try {
  const fs = require('fs');
  const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
  const { spawn } = require('child_process');
  const peq = require('../package.json');
  const config = require('./configFile.js');
  const { pipeline } = require('stream');
  const { promisify } = require('util');
  const configFile = require("./configFile.js");
  const authEvents = require('./server.js');
  const streamPipeline = promisify(pipeline);
  const { fork } = require("child_process");

  const formatText = text => text.replace(/\n/g, '<br>');
  const formatTextc = text => text.replace(/\n/g, '');
  const tr = translate();

  app.commandLine.appendSwitch('disable-renderer-backgrounding');

  let numberExecuteReload, dateStartMinecraft, timeStart = -1;
  let mainWindow, rpcProcess, splashWindow, tray;
  let livePixWindow, authWindow = null;
  let stopForced, tryAgain = false;
  let stringExecuteReload = "f";
  var startsd = 1;
  let nickname, d3 = "";
  var translations;

  let noAgain = db.get("config/minimizeToTray") === false;

  try {
    nickname = db.rich.get("configRichPresence/nickname") || "";
  } catch (err) { nickname = ""; }

  const createTray = () => {
    tray = new Tray(path.join(__dirname, "./ui/image/imageicon.png"));
    tray.setToolTip("Rich Presence RedeWorth");
    tray.on('double-click', () => { if (mainWindow.isVisible()) { mainWindow.hide(); } else { mainWindow.show(); } });
    updateTrayMenu("stop");
  };

  const updateTrayMenu = state => {
    d3 = state
    const trayMenu = Menu.buildFromTemplate([
      {
        label: tr["trayMenu"][0].label,
        click: () => { restartApp(); db.update("config/reloadStartRichPresence", true); }
      },
      {
        label: tr["trayMenu"][1].label,
        click: () => startRPCProcess(nickname),
        enabled: state !== "run"
      },
      {
        label: tr["trayMenu"][2].label,
        click: () => { stopRPCProcess(); setTimeout(() => startRPCProcess(nickname), 100); }
      },
      {
        label: tr["trayMenu"][3].label,
        click: () => stopRPCProcess(),
        enabled: state !== "stop"
      },
      {
        label: mainWindow.isVisible() ? tr["trayMenu"][4].label1 : tr["trayMenu"][4].label2,
        click: () => { if (mainWindow.isVisible()) { mainWindow.hide(); } else { mainWindow.show(); } updateTrayMenu(d3); }
      },
      {
        label: tr["trayMenu"][5].label,
        click: () => { tryAgain = true; app.quit(); }
      }
    ]);


    tray.setContextMenu(trayMenu);
  };

  const createMainWindow = () => {
    mainWindow = new BrowserWindow({
      width: db.get("config/pixelFormatApp1") ? Number(db.get("config/pixelFormatApp1")) : 950,
      height: db.get("config/pixelFormatApp2") ? Number(db.get("config/pixelFormatApp2")) : 600,
      title: 'Rich Presence Rede Worth',
      icon: path.join(__dirname, "./ui/image/imageicon.png"),
      webPreferences: { nodeIntegration: true, contextIsolation: false, },
      frame: false,
    });

    if (config.environment === "Production") Menu.setApplicationMenu(Menu.buildFromTemplate([]));

    mainWindow.webContents.on('context-menu', (e, params) => {
      const template = [
        {
          label: tr["contextMenu"][0].label,
          click: () => { restartApp(); db.update("config/reloadStartRichPresence", true); }
        },
        { type: 'separator' },
        {
          label: tr["contextMenu"][1].label,
          click: () => { mainWindow.minimize(); }
        },
        {
          label: tr["contextMenu"][2].label,
          click: () => { if (mainWindow.isMaximized()) { mainWindow.unmaximize(); } else { mainWindow.maximize(); } }
        },
        {
          label: tr["contextMenu"][3].label,
          click: () => { mainWindow.hide(); }
        },
        {
          label: tr["contextMenu"][4].label,
          click: () => { tryAgain = true; app.quit(); }
        }
      ];

      const menu = Menu.buildFromTemplate(template);
      menu.popup({ window: mainWindow });
    });

    mainWindow.loadFile('ui/index.html');
    mainWindow.setTitle("Rich Presence RedeWorth");
    mainWindow.show()

    if (db.get("config/runAppToMin") === true) mainWindow.hide();

    var formattedDateg = formattedDate;

    setInterval(() => {
      const dateg = new Date();
      const capitalizeg = (s) => s.charAt(0).toUpperCase() + s.slice(1);
      const monthNameg = new Intl.DateTimeFormat(locale, { month: 'long' }).format(dateg);
      const yearg = dateg.getFullYear();
      const titleDateg = `${capitalizeg(monthNameg)} de ${yearg}`;
      const weekdayg = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(dateg);
      const dayg = dateg.getDate();
      const cardDateg = `${capitalizeg(weekdayg)}, ${dayg} de ${capitalizeg(monthNameg)} de ${yearg}`;
      const currentYearg = dateg.getFullYear();
      const currentMonthg = String(dateg.getMonth() + 1).padStart(2, '0');
      const currentDayg = String(dateg.getDate()).padStart(2, '0');
      var dateAf4 = `${capitalizeg(monthNameg)}_${yearg}`;
      formattedDateg = `${currentYearg}-${currentMonthg}-${currentDayg}`;

      if (!mainWindow.isDestroyed()) {
        if (timeStart === 0) {
          if (!db.stats.get("appLaunches/" + dateAf + "/days/" + formattedDate + "/startDateNow")) {
            db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/startDateNow", 0);
          } else {
            if (db.stats.get("appLaunches/" + dateAf + "/days/" + formattedDate + "/startDateNow") === 0) {
              db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/startDateNow", 0);
              db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/stopDateNow", 0);
            }
          }
        }

        mainWindow.webContents.send('versionAPP', `v${peq.version}`);
        mainWindow.webContents.send('MemoryUsed', process.memoryUsage());
        mainWindow.webContents.send('config', db.rich.get("configRichPresence"));
        mainWindow.webContents.send('configApp', db.get("config"));
        mainWindow.webContents.send('timeExecuteJava', dateStartMinecraft)
        mainWindow.webContents.send("infoApp", d3)
        mainWindow.webContents.send("timeStartPresence", timeStart)

        if (numberExecuteReload > 0) { numberExecuteReload--; if (stringExecuteReload === "f") numberExecuteReload = -1; }
        else { numberExecuteReload = 25; if (stringExecuteReload === "f") numberExecuteReload = -1; }

        mainWindow.webContents.send('activities-reload-time-active', numberExecuteReload);
        mainWindow.webContents.send("stats", {
          appLaunches: db.stats.get("appLaunches") || {},
        })
      }

      if (formattedDateg !== formattedDate) {
        console.log("[DEBUG_LOG] - Mudança de dia detectada, ajustando banco de dados...");

        // var dateStopPrev = new Date();
        // dateStopPrev.setHours(23, 59, 59, 999);
        // var dateStopPrevMS = dateStopPrev.getTime();

        // let timeExecuteListPrev = db.stats.get("appLaunches/" + dateAf + "/app");
        // let indexPrev = 0;
        // if (Array.isArray(timeExecuteListPrev) && timeExecuteListPrev.length > 0) {
        //   indexPrev = timeExecuteListPrev.length - 1;
        // }

        // db.stats.update("appLaunches/" + dateAf + "/app/" + indexPrev, {
        //   start: dateStartApp,
        //   stop: dateStopPrevMS,
        //   total: (dateStopPrevMS - dateStartApp)
        // });

        dateStartApp = Date.now();
        const dateNew = new Date();
        const monthNameNew = new Intl.DateTimeFormat(locale, { month: 'long' }).format(dateNew);
        const yearNew = dateNew.getFullYear();
        dateAf = `${capitalize(monthNameNew)}_${yearNew}`;
        const currentYearNew = dateNew.getFullYear();
        const currentMonthNew = String(dateNew.getMonth() + 1).padStart(2, '0');
        const currentDayNew = String(dateNew.getDate()).padStart(2, '0');
        capitalize = capitalizeg;
        monthName = monthNameg;
        year = yearg;
        titleDate = titleDateg;
        weekday = weekdayg;
        day = dayg;
        cardDate = cardDateg;
        currentYear = currentYearg;
        currentMonth = currentMonthg;
        currentDay = currentDayg;


        let timeExecuteList = db.stats.get("appLaunches/" + dateAf + "/days/" + formattedDate + "/timeExecuteRPC");
        const lastValue = Object.values(timeExecuteList || {}).pop();
        var formatDateObje = {
          app: {
            start: dateStartApp,
            stop: 0,
            total: 0
          },
          minecraft: {
            start: 0,
            stop: 0,
            total: 0
          }
        };

        let index = 0;
        if (Array.isArray(timeExecuteList) && timeExecuteList.length > 0) {
          index = timeExecuteList.length - 1;
        }

        if (!db.stats.get(`appLaunches/${dateAf4}`)) {
          db.stats.set(`appLaunches/${dateAf4}`, {
            month: capitalize(monthNameNew),
            year: yearNew,
            date: dateNew,
            launches: 1,
            app: [],
            days: {}
          });
        }

        db.stats.update("appLaunches/" + dateAf4 + "/days/" + formattedDateg, {
          date: Date.now(),
          launches: 1,
          startDateNow: dateStartApp,
          stopDateNow: 0,
          rpcStarts: 0,
          timeExecuteRPC: []
        });

        if (!dateStartMinecraft || dateStartMinecraft === -1) { } else {
          console.log(lastValue)
          db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/timeExecuteRPC/" + index + "/minecraft", {
            start: lastValue.minecraft.start,
            stop: dateStartApp,
            total: (dateStartApp - lastValue.minecraft.start)
          });

          formatDateObje.minecraft.start = dateStartApp;
        }

        db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/timeExecuteRPC/" + index + "/app", {
          start: lastValue.app.start,
          stop: dateStartApp,
          total: (dateStartApp - lastValue.app.start)
        });

        db.stats.push("appLaunches/" + dateAf4 + "/days/" + formattedDateg + "/timeExecuteRPC", formatDateObje);
        console.log("appLaunches/" + dateAf4 + "/days/" + formattedDateg + "/timeExecuteRPC", formatDateObje);

        let timeExecuteList2 = db.stats.get("appLaunches/" + dateAf + "/app");
        const lastValue2 = Object.values(timeExecuteList2 || {}).pop();

        let index2 = 0;
        if (Array.isArray(timeExecuteList2) && timeExecuteList2.length > 0) {
          index2 = timeExecuteList2.length - 1;
        }

        db.stats.update("appLaunches/" + dateAf + "/app/" + index2 + "", {
          start: lastValue2.start,
          stop: dateStartApp,
          total: (dateStartApp - lastValue2.start)
        });

        db.stats.push("appLaunches/" + dateAf4 + "/app", {
          start: dateStartApp,
          stop: 0,
          total: 0
        });

        console.log("[DEBUG_LOG] - Novo dia iniciado e registros atualizados com sucesso:", formattedDateg);
        formattedDate = formattedDateg;
        dateAf = dateAf4;
      }
    }, 1000);

    ipcMain.on("minimize-window", () => { mainWindow.minimize(); });

    ipcMain.on("maximize-window", () => {
      if (mainWindow.isMaximized()) { mainWindow.unmaximize() }
      else { mainWindow.maximize() }
    });

    ipcMain.on("close-window", () => {
      var dateStop = Date.now();
      var totalTimeExecute = dateStop - dateStartApp;

      let timeExecuteList = db.stats.get("appLaunches/" + dateAf + "/app");

      let index = 0;
      if (Array.isArray(timeExecuteList) && timeExecuteList.length > 0) {
        index = timeExecuteList.length - 1;
      }

      db.stats.update("appLaunches/" + dateAf + "/app/" + index + "", {
        start: dateStartApp,
        stop: dateStop,
        total: totalTimeExecute
      });
      stopRPCProcess();
      app.quit();
    });

    mainWindow.on('close', event => {
      var dateStop = Date.now();
      var totalTimeExecute = dateStop - dateStartApp;

      let timeExecuteList = db.stats.get("appLaunches/" + dateAf + "/app");

      let index = 0;
      if (Array.isArray(timeExecuteList) && timeExecuteList.length > 0) {
        index = timeExecuteList.length - 1;
      }

      db.stats.update("appLaunches/" + dateAf + "/app/" + index + "", {
        start: dateStartApp,
        stop: dateStop,
        total: totalTimeExecute
      });
      stopRPCProcess();
      if (noAgain) return app.quit();
      if (!tryAgain) {
        event.preventDefault();
        mainWindow.hide();
        updateTrayMenu(d3);
      }
    });

    mainWindow.on('unresponsive', () => { console.warn('[WARN] Janela travada. Reiniciando app...'); restartApp(); });

    mainWindow.on('crashed', () => { console.error('[ERROR] Janela principal crashou.'); restartApp(); });
  };

  authEvents.on('openAutorizationLoginWiki', ({ title, message }) => {
    const errorWindow = new BrowserWindow({
      width: 400,
      height: 500,
      modal: true,
      icon: path.join(__dirname, "./ui/image/imageicon.png"),
      parent: mainWindow,
      resizable: false,
      frame: false,
      webPreferences: { nodeIntegration: true, contextIsolation: false }
    });

    errorWindow.loadFile('ui/login.html');

    ipcMain.on('auth-permit', (event, foi) => {
      if (foi === false) { authEvents.emit('wikiLoginError', { title: 'Erro de Autenticação', message: 'Acesso cancelado pelo usuário.' }); }
      else if (foi === true) { authEvents.emit('wikiLoginDone', { title: 'Autenticando...', message: 'Aguarde enquanto autenticamos sua conta...' }); }
    })
  });

  const createSplashWindow = () => {
    splashWindow = new BrowserWindow({
      width: 350,
      height: 450,
      frame: false,
      icon: path.join(__dirname, "./ui/image/imageicon.png"),
      alwaysOnTop: false,
      resizable: false,
      webPreferences: { nodeIntegration: true, contextIsolation: false, },
    });
    splashWindow.loadFile('ui/splash.html');
    splashWindow.setTitle("Discord Rich Presence RedeWorth");

    if (config.environment === "Production") Menu.setApplicationMenu(Menu.buildFromTemplate([]));
  };

  function restartApp() { app.relaunch(); app.exit(0); }

  const startRPCProcess = nick => {
    timeStart = Date.now();

    updateTrayMenu("run");
    mainWindow.webContents.send('startRPC', {
      timeStart
    });
    console.log('[DEBUG_LOG] - Iniciando RPC...');

    startsd = db.stats.get("appLaunches/" + dateAf + "/days/" + formattedDate + "/rpcStarts") || 1;

    db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/startDateNow", timeStart);
    db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/stopDateNow", 0);
    db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/rpcStarts",
      (db.stats.get("appLaunches/" + dateAf + "/days/" + formattedDate + "/rpcStarts") || 0) + 1
    );


    db.stats.push("appLaunches/" + dateAf + "/days/" + formattedDate + "/timeExecuteRPC", {
      app: {
        start: timeStart,
        stop: 0,
        total: 0
      },
      minecraft: {
        start: 0,
        stop: 0,
        total: 0
      }
    });

    if (rpcProcess) console.log('[DEBUG_LOG] - Status do RPC Morto pelo sistema para evitar duplicação.')

    rpcProcess?.kill();
    const nodePath = process.execPath;
    rpcProcess = spawn(nodePath, ['bin/RichPresence.js'], {
      env: {
        ...process.env,
        NICKNAME: nick
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    rpcProcess.stdout.on('data', handleRPCProcessOutput);
    rpcProcess.stderr.on('data', data => console.error(formatTextc(`Erro: ${data}`)));
    rpcProcess.on('close', () => console.log('[DEBUG] - RPC encerrado.'));
    rpcProcess.on('exit', (code, signal) => {
      console.warn(`[WATCHDOG] RPC process exited. Code: ${code}, Signal: ${signal}`);
      setTimeout(() => {
        if (!rpcProcess && !stopForced) {
          console.log('[WATCHDOG] Reiniciando RPC automaticamente...');
          startRPCProcess(nickname);
        }
      }, 3000);
    });
  };

  const restartRPCProcess = () => {
    stopRPCProcess();
    setTimeout(() => startRPCProcess(nickname), 5000);
  };

  const stopRPCProcess = () => {
    timeStart = 0;

    updateTrayMenu("stop");
    if (rpcProcess) {
      rpcProcess.kill();
      rpcProcess = null;
      stopForced = true;
      mainWindow.webContents.send('terminal-output', formatText('[DEBUG] - Atividade desativada com sucesso.'));
      stringExecuteReload = "f";
      numberExecuteReload = -1;

      db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/stopDateNow", Date.now());

      var dateStart = db.stats.get("appLaunches/" + dateAf + "/days/" + formattedDate + "/startDateNow") || 0;
      var dateStop = db.stats.get("appLaunches/" + dateAf + "/days/" + formattedDate + "/stopDateNow") || 0;
      var totalTimeExecute = dateStop - dateStart;

      let timeExecuteList = db.stats.get("appLaunches/" + dateAf + "/days/" + formattedDate + "/timeExecuteRPC");

      let index = 0;
      if (Array.isArray(timeExecuteList) && timeExecuteList.length > 0) {
        index = timeExecuteList.length - 1;
      }

      db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/timeExecuteRPC/" + index + "/app", {
        start: dateStart,
        stop: dateStop,
        total: totalTimeExecute
      });

      if (!dateStartMinecraft || dateStartMinecraft === -1) { } else {
        var dateStartM = db.stats.get("appLaunches/" + dateAf + "/days/" + formattedDate + "/minecraftStartDateNow") || 0;
        var dateStopM = Date.now();
        var totalTimeExecuteM = dateStopM - dateStartM;

        let timeExecuteListM = db.stats.get("appLaunches/" + dateAf + "/days/" + formattedDate + "/timeExecuteRPC");

        let indexM = 0;
        if (Array.isArray(timeExecuteListM) && timeExecuteListM.length > 0) {
          indexM = timeExecuteListM.length - 1;
        }
        db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/timeExecuteRPC/" + indexM + "/minecraft", {
          start: dateStartM,
          stop: dateStopM,
          total: totalTimeExecuteM
        });

        db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/minecraftStopDateNow", dateStopM);

        dateStartMinecraft = -1;
      }
    }

  };

  const handleRPCProcessOutput = data => {
    const output = data.toString();
    if (output.includes("Minecraft foi aberto!")) {
      dateStartMinecraft = Date.now();
      db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/minecraftStarts",
        (db.stats.get("appLaunches/" + dateAf + "/days/" + formattedDate + "/minecraftStarts") || 0) + 1
      );
      db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/minecraftStartDateNow", dateStartMinecraft);
      db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/minecraftStopDateNow", 0);
      db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/minecraftTimeExecuteRPCNow", 0);

      let timeExecuteList = db.stats.get("appLaunches/" + dateAf + "/days/" + formattedDate + "/timeExecuteRPC");

      let index = 0;
      if (Array.isArray(timeExecuteList) && timeExecuteList.length > 0) {
        index = timeExecuteList.length - 1;
      }

      db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/timeExecuteRPC/" + index + "/minecraft", {
        start: dateStartMinecraft,
        stop: 0,
        total: 0
      });

    }
    if (output.includes("Minecraft foi fechado!")) {
      if (db.get("config/closeAppGameInt") === true) { tryAgain = true; app.quit(); }
      dateStartMinecraft = -1;
      var dateStart = db.stats.get("appLaunches/" + dateAf + "/days/" + formattedDate + "/minecraftStartDateNow") || 0;
      var dateStop = Date.now();
      var totalTimeExecute = dateStop - dateStart;
      db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/minecraftStopDateNow", dateStop);
      db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/minecraftTimeExecuteRPCNow", totalTimeExecute);
      let timeExecuteList = db.stats.get("appLaunches/" + dateAf + "/days/" + formattedDate + "/timeExecuteRPC");

      let index = 0;
      if (Array.isArray(timeExecuteList) && timeExecuteList.length > 0) {
        index = timeExecuteList.length - 1;
      }
      db.stats.update("appLaunches/" + dateAf + "/days/" + formattedDate + "/timeExecuteRPC/" + index + "/minecraft", {
        start: dateStart,
        stop: dateStop,
        total: totalTimeExecute
      });
    };
    if (output.includes("[DEBUG] - Discord desconectado")) setTimeout(() => restartRPCProcess(), 5000);
    if (output.includes("Atividade personalizada ativada!")) {
      stringExecuteReload = "s";
      numberExecuteReload = 25;
    }

    if (output.includes("[DEBUG_LOG] - ")) {
      return console.log(formatTextc(output))
    }

    mainWindow.webContents.send('terminal-output', formatText(output));
    console.log(formatTextc(output));
  };

  const initializeApp = () => {
    console.log("[DEBUG_LOG] - Inicializando aplicação...");
    createSplashWindow();
    splashWindow.show()
  };

  ipcMain.on('abrir-login-discord', () => {
    if (authWindow) { authWindow.focus(); return; }
    authWindow = new BrowserWindow({
      width: 600,
      icon: path.join(__dirname, "./ui/image/imageicon.png"),
      height: 500,
      parent: mainWindow,
      modal: true,
      show: true,
      resizable: false,
      frame: false,
      webPreferences: { nodeIntegration: false, contextIsolation: false },
    });

    authWindow.loadURL(configFile.authUrl);

    authWindow.on('closed', () => { authWindow = null; });
  });

  ipcMain.on('abrir-livepix', () => {
    if (livePixWindow) {
      livePixWindow.focus();
      return;
    }
    livePixWindow = new BrowserWindow({
      width: 550,
      icon: "https://cdn.discordapp.com/avatars/518862457876250625/dd92d27383a7c85ef111c62c1989f168.png",
      height: 850,
      modal: false,
      show: true,
      resizable: true,
      frame: true,
      autoHideMenuBar: true,
      webPreferences: { nodeIntegration: false, contextIsolation: false },
    });

    livePixWindow.loadURL("https://livepix.gg/vitorxp1958");

    livePixWindow.on('closed', () => { livePixWindow = null; });
  });

  authEvents.on('authenticated', (token, userData) => {
    db.update("tokenUser", token)
    mainWindow.webContents.send('reloadUser', true);
    if (authWindow) { authWindow.close(); authWindow = null; }
  });

  ipcMain.on('logout-discord', () => {
    db.update("tokenUser", null)
    mainWindow.webContents.send('reloadUser', true);
  });

  app.whenReady().then(initializeApp);

  ipcMain.on('startRPC', (event, nick) => startRPCProcess(nick));
  ipcMain.on('stopRPC', stopRPCProcess);
  ipcMain.on('config', (event, data) => {
    nickname = data.nickname ?? nickname;
    rpcProcess?.stdin.write(JSON.stringify(data) + '\n');
    db.rich.set("configRichPresence", data);
  });

  ipcMain.on("firstUpdate", (event, data) => {
    createMainWindow();
    createTray();
    setTimeout(() => {
      if (db.get("config/reloadStartRichPresence") === true || db.get("config/AppStartRich") === true) {
        db.update("config/reloadStartRichPresence", false);
        startRPCProcess(nickname);
      }
    }, 2500)
    splashWindow.close();
  })

  ipcMain.on("updateVersionApp", async (event, data) => {
    restartApp();
    db.update("config/reloadStartRichPresence", true);
  })

  ipcMain.on("updateVerify", async (event, data2) => {
    const response = await fetch(
      "https://api.github.com/repos/vitorxcp/Rich-Presence-RedeWorth/releases/latest"
    ).catch(e => {
      return splashWindow.webContents.send("firstUpdate", false);
    });

    if (!response || !response.ok) return splashWindow.webContents.send("firstUpdate", false);

    const data = await response.json();
    if (!data.tag_name) return splashWindow.webContents.send("firstUpdate", false);

    const versaoMaisRecente = data.tag_name;
    const versaoLocal = `v${peq.version}`;

    let zipUrl = null;
    if (versaoLocal !== versaoMaisRecente) {
      if (Number(versaoMaisRecente.replace(/[^\d]/g, "")) <= Number(versaoLocal.replace(/[^\d]/g, "")))
        return splashWindow.webContents.send("firstUpdate", false);
      zipUrl = data.assets[0]?.browser_download_url;
    }

    if (!zipUrl) return splashWindow.webContents.send("firstUpdate", false);

    splashWindow.webContents.send("yepUpdate", true);

    const outputPath = path.join(__dirname, "update.zip");
    const extractPath = path.join(__dirname, "..");

    const writer = fs.createWriteStream(outputPath);

    async function downloadAndExtract() {
      try {
        console.log("[LOG] Baixando arquivo ZIP...");
        const response = await fetch(zipUrl);
        if (!response.ok) throw new Error(`[ERROR] Erro ao baixar o arquivo: ${response.status} ${response.statusText}`);

        const totalSize = response.headers.get("content-length");
        if (!totalSize) {
          console.warn("[WARN] Não foi possível obter o tamanho do arquivo.");
        }
        const totalBytes = totalSize ? parseInt(totalSize, 10) : null;
        let downloadedSize = 0;

        const { Transform } = require("stream");

        const progressStream = new Transform({
          transform(chunk, encoding, callback) {
            downloadedSize += chunk.length;
            if (totalBytes) {
              const percent = Math.round((downloadedSize / totalBytes) * 100);
              splashWindow.webContents.send("outputPercentUpdate", percent);
            }
            this.push(chunk);
            callback();
          },
        });

        await streamPipeline(response.body, progressStream, writer);

        console.log("[LOG] Download finalizado corretamente.");
        splashWindow.webContents.send("updateDonwloadFirst", true);

        console.log("[LOG] Extraindo arquivos...");

        await extractWithWorker(outputPath, extractPath);

        splashWindow.webContents.send("outputExtractedFiles", true);
        console.log("Arquivos extraídos para:", extractPath);

        fs.unlinkSync(outputPath);
        console.log("Arquivo ZIP removido.");
        fs.writeFileSync(path.join(__dirname, "update.flag"), "true");
        setTimeout(restartApp, 100);

        return splashWindow.webContents.send("firstUpdate", true);
      } catch (error) {
        console.error("Erro:", error);
      }
    }

    function extractWithWorker(zipPath, extractPath) {
      return new Promise((resolve, reject) => {
        const worker = fork(path.join(__dirname, "extractWorker.js"));

        worker.send({ zipPath, extractPath });
        worker.on("message", (msg) => {
          if (msg.type === "progress") {
            splashWindow.webContents.send("outputPercentExtractedFiles", msg.percent);
          }
          if (msg.type === "done") {
            resolve();
            worker.kill();
          }
        });

        worker.on("error", reject);
      });
    }

    setTimeout(async () => {
      await downloadAndExtract();
    }, 500);
  });

  ipcMain.on('configApp', (event, data) => { db.update("config", data); noAgain = data.minimizeToTray === false; });

  app.on('window-all-closed', event => { event.preventDefault(); });

  mainWindow.on("closed", () => {
    stopRPCProcess();
    mainWindow = null;
  });

  app.on("quit", () => {
    stopRPCProcess();
  });

  function getLanguage() {
    const languages = app.getPreferredSystemLanguages();
    const firstLang = navigator.language;
    return firstLang.split('-')[0];
  }

  function translate() {
    const lang = getLanguage();
    const defaultLang = 'en';

    try {
      translations = require(`./resources/languages/${lang}.json`);
      console.warn("Linguagem de tradução aplicada: " + lang + ".")
    } catch (e1) {
      translations = require(`./resources/languages/${defaultLang}.json`);
      console.warn("Linguagem (" + lang + ") de tradução não encontrada, redirecionando sistema padrão para: " + defaultLang + ".")
    }

    return translations;
  }
} catch (err) {
  console.log(err)
}