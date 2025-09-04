#include <iostream>
#include <fstream>
#include <string>

#ifdef _WIN32
#include <windows.h>
#else
#include <sys/stat.h>
#include <unistd.h>
#include <cstdlib>
#include <cstdio>
#endif

bool FileExists(const std::string &path) {
#ifdef _WIN32
    DWORD attr = GetFileAttributesA(path.c_str());
    return (attr != INVALID_FILE_ATTRIBUTES && !(attr & FILE_ATTRIBUTE_DIRECTORY));
#else
    struct stat buffer;
    return (stat(path.c_str(), &buffer) == 0);
#endif
}

bool nodeExists() {
#ifdef _WIN32
    return FileExists("lib\\nodejs\\node-v22.15.0-win-x64\\node.exe");
#else
    return FileExists("lib/nodejs/node-v22.15.0-linux-x64/bin/node");
#endif
}

bool electronExists() {
#ifdef _WIN32
    return FileExists("node_modules\\.bin\\electron.cmd") || FileExists("node_modules\\.bin\\electron.js");
#else
    return FileExists("node_modules/.bin/electron");
#endif
}

#ifdef _WIN32
bool runCommandWithOutput(const std::string &cmd) {
    HANDLE hStdOutRead, hStdOutWrite;
    SECURITY_ATTRIBUTES sa = { sizeof(SECURITY_ATTRIBUTES), NULL, TRUE };

    if (!CreatePipe(&hStdOutRead, &hStdOutWrite, &sa, 0))
        return false;

    SetHandleInformation(hStdOutRead, HANDLE_FLAG_INHERIT, 0);

    STARTUPINFOA si{};
    PROCESS_INFORMATION pi{};
    si.cb = sizeof(si);
    si.hStdOutput = hStdOutWrite;
    si.hStdError = hStdOutWrite;
    si.dwFlags |= STARTF_USESTDHANDLES;

    if (!CreateProcessA(NULL, const_cast<char *>(cmd.c_str()),
                        NULL, NULL, TRUE,
                        CREATE_NO_WINDOW,
                        NULL, NULL, &si, &pi))
    {
        CloseHandle(hStdOutWrite);
        CloseHandle(hStdOutRead);
        return false;
    }

    CloseHandle(hStdOutWrite);

    char buffer[4096];
    DWORD bytesRead;

    while (ReadFile(hStdOutRead, buffer, sizeof(buffer) - 1, &bytesRead, NULL)) {
        if (bytesRead == 0)
            break;
        buffer[bytesRead] = '\0';
        std::cout << buffer;
    }

    WaitForSingleObject(pi.hProcess, INFINITE);
    DWORD exitCode;
    GetExitCodeProcess(pi.hProcess, &exitCode);

    CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);
    CloseHandle(hStdOutRead);

    return (exitCode == 0);
}
#else
bool runCommandWithOutput(const std::string &cmd) {
    FILE *pipe = popen(cmd.c_str(), "r");
    if (!pipe) return false;

    char buffer[4096];
    while (fgets(buffer, sizeof(buffer), pipe) != nullptr) {
        std::cout << buffer;
    }

    int returnCode = pclose(pipe);
    return (returnCode == 0);
}
#endif

bool installElectron() {
    std::cout << "Instalando Electron com Node local...\n";

#ifdef _WIN32
    std::string node = "lib\\nodejs\\node-v22.15.0-win-x64\\node.exe";
    std::string npm = "lib\\nodejs\\node-v22.15.0-win-x64\\node_modules\\npm\\bin\\npm-cli.js";
    std::string cmd1 = node + " " + npm + " install electron --save-dev";
    std::string cmd2 = node + " " + npm + " install";

    return runCommandWithOutput(cmd1) && runCommandWithOutput(cmd2);
#else
    std::string node = "lib/nodejs/node-v22.15.0-linux-x64/bin/node";
    std::string npm = "lib/nodejs/node-v22.15.0-linux-x64/lib/node_modules/npm/bin/npm-cli.js";
    std::string cmd1 = node + " " + npm + " install electron --save-dev";
    std::string cmd2 = node + " " + npm + " install";

    return runCommandWithOutput(cmd1) && runCommandWithOutput(cmd2);
#endif
}

bool runElectronScript() {
#ifdef _WIN32
    std::string cmd = "node_modules\\electron\\dist\\electron.exe bin/LauncherRichPresence.js";

    STARTUPINFOA si{};
    PROCESS_INFORMATION pi{};
    si.cb = sizeof(si);
    si.dwFlags = STARTF_USESHOWWINDOW;
    si.wShowWindow = SW_HIDE;

    if (!CreateProcessA(NULL, const_cast<char *>(cmd.c_str()),
                        NULL, NULL, FALSE,
                        CREATE_NO_WINDOW,
                        NULL, NULL,
                        &si, &pi))
    {
        std::cout << "Erro ao iniciar o Electron!\n";
        return false;
    }

    CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);
    return true;
#else
    std::string cmd = "nohup node_modules/electron/dist/electron bin/LauncherRichPresence.js > /dev/null 2>&1 &";
    return (system(cmd.c_str()) == 0);
#endif
}

int main() {
    if (!nodeExists()) {
#ifdef _WIN32
        MessageBoxA(NULL, "Node.js não encontrado! Extraia o Node.js em uma pasta chamada 'nodejs'", "Erro", MB_ICONERROR);
#else
        std::cerr << "Node.js não encontrado! Extraia o Node.js em uma pasta chamada 'nodejs'\n";
#endif
        return 1;
    }

    if (!electronExists()) {
        std::cout << "Electron não encontrado. Instalando...\n";
        if (!installElectron()) {
#ifdef _WIN32
            MessageBoxA(NULL, "Erro ao instalar dependências!", "Erro", MB_ICONERROR);
#else
            std::cerr << "Erro ao instalar dependências!\n";
#endif
            return 1;
        }
    }

    std::cout << "Executando Electron...\n";
    if (!runElectronScript()) {
#ifdef _WIN32
        MessageBoxA(NULL, "Erro ao executar o script com Electron.", "Erro", MB_ICONERROR);
#else
        std::cerr << "Erro ao executar o script com Electron.\n";
#endif
        return 1;
    }

#ifdef _WIN32
    ExitProcess(0);
#else
    return 0;
#endif
}
