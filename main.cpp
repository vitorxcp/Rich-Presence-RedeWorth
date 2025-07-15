#include <iostream>
#include <fstream>
#include <string>

#ifdef _WIN32
#include <windows.h>  // Biblioteca do Windows para manipular processos, janelas, etc.
#else
#include <sys/stat.h>
#include <unistd.h>
#include <cstdlib>
#endif

// Função que executa um comando (como "npm install") e imprime a saída no terminal
bool runCommandWithOutput(const std::string &cmd)
{
    // Cria pipes para capturar a saída do processo
    HANDLE hStdOutRead, hStdOutWrite;
    SECURITY_ATTRIBUTES sa = { sizeof(SECURITY_ATTRIBUTES), NULL, TRUE };

    if (!CreatePipe(&hStdOutRead, &hStdOutWrite, &sa, 0))
        return false;

    SetHandleInformation(hStdOutRead, HANDLE_FLAG_INHERIT, 0);

    // Configura a estrutura de inicialização do processo
    STARTUPINFOA si{};
    PROCESS_INFORMATION pi{};
    si.cb = sizeof(si);
    si.hStdOutput = hStdOutWrite;  // Redireciona saída padrão
    si.hStdError = hStdOutWrite;   // Redireciona erro padrão
    si.dwFlags |= STARTF_USESTDHANDLES;

    // Cria o processo oculto
    if (!CreateProcessA(NULL, const_cast<char *>(cmd.c_str()),
                        NULL, NULL, TRUE,
                        CREATE_NO_WINDOW,
                        NULL, NULL, &si, &pi))
    {
        // Falha ao criar processo
        CloseHandle(hStdOutWrite);
        CloseHandle(hStdOutRead);
        return false;
    }

    CloseHandle(hStdOutWrite); // Fecha handle de escrita do pipe

    // Lê e imprime a saída do processo
    char buffer[4096];
    DWORD bytesRead;

    while (ReadFile(hStdOutRead, buffer, sizeof(buffer) - 1, &bytesRead, NULL))
    {
        if (bytesRead == 0)
            break;

        buffer[bytesRead] = '\0';
        std::cout << buffer;
    }

    WaitForSingleObject(pi.hProcess, INFINITE);  // Aguarda o processo terminar

    DWORD exitCode;
    GetExitCodeProcess(pi.hProcess, &exitCode);

    // Libera os recursos
    CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);
    CloseHandle(hStdOutRead);

    return (exitCode == 0);
}

// Verifica se o arquivo existe
bool FileExists(const std::string &path)
{
#ifdef _WIN32
    DWORD attr = GetFileAttributesA(path.c_str());
    return (attr != INVALID_FILE_ATTRIBUTES && !(attr & FILE_ATTRIBUTE_DIRECTORY));
#else
    struct stat buffer;
    return (stat(path.c_str(), &buffer) == 0);
#endif
}

// Verifica se o Node.js local existe
bool nodeExists()
{
#ifdef _WIN32
    return FileExists("lib\\nodejs\\node-v22.15.0-win-x64\\node.exe");
#else
    return FileExists("lib/nodejs/node-v22.15.0-linux-x64/bin/node");
#endif
}

// Verifica se o Electron está instalado
bool electronExists()
{
#ifdef _WIN32
    return FileExists("node_modules\\.bin\\electron.cmd") || FileExists("node_modules\\.bin\\electron.js");
#else
    return FileExists("node_modules/.bin/electron");
#endif
}

// Instala o Electron e dependências usando o Node local
bool installElectron()
{
    std::cout << "Instalando Electron com Node local...\n";

#ifdef _WIN32
    std::string cmd1 = "lib\\nodejs\\node-v22.15.0-win-x64\\node.exe lib\\nodejs\\node-v22.15.0-win-x64\\node_modules\\npm\\bin\\npm-cli.js install electron --save-dev";
    std::string cmd2 = "lib\\nodejs\\node-v22.15.0-win-x64\\node.exe lib\\nodejs\\node-v22.15.0-win-x64\\node_modules\\npm\\bin\\npm-cli.js install";

    // Primeiro instala o Electron, depois as dependências
    if (!runCommandWithOutput(cmd1)) {
        std::cerr << "Erro ao instalar Electron!\n";
        return false;
    }

    if (!runCommandWithOutput(cmd2)) {
        std::cerr << "Erro ao instalar dependências!\n";
        return false;
    }

    return true;
#else
    std::string cmd = "lib/nodejs/node-v22.15.0-linux-x64/bin/node lib/nodejs/node-v22.15.0-linux-x64/lib/node_modules/npm/bin/npm-cli.js install";
    int result = system(cmd.c_str());
    return (result == 0);
#endif
}

// Executa o Electron em segundo plano (sem console)
bool runElectronScript()
{
#ifdef _WIN32
    std::string cmd = "node_modules\\electron\\dist\\electron.exe bin/LauncherRichPresence.js";

    STARTUPINFOA si{};
    PROCESS_INFORMATION pi{};
    si.cb = sizeof(si);
    si.dwFlags = STARTF_USESHOWWINDOW;
    si.wShowWindow = SW_HIDE;  // Oculta a janela

    // Cria o processo de forma oculta
    if (!CreateProcessA(NULL, const_cast<char *>(cmd.c_str()),
                        NULL, NULL, FALSE,
                        CREATE_NO_WINDOW,
                        NULL, NULL,
                        &si, &pi))
    {
        std::cout << "Erro ao iniciar o Electron!\n";
        return false;
    }

    // Não espera o processo, apenas continua
    CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);

    return true;
#else
    std::string cmd = "nohup node_modules/electron/dist/electron bin/LauncherRichPresence.js > /dev/null 2>&1 &";
    int result = system(cmd.c_str());
    return (result == 0);
#endif
}

int main()
{
#ifdef _WIN32
    // Verifica se precisa instalar dependências
    bool precisaInstalar = !electronExists();

    // Se o Node não está presente, mostra erro
    if (!nodeExists())
    {
        MessageBoxA(NULL, "Node.js não encontrado! Extraia o Node.js em uma pasta chamada 'nodejs'", "Erro", MB_ICONERROR);
        return 1;
    }

    // Instala as dependências se necessário
    if (precisaInstalar)
    {
        std::cout << "Electron não encontrado. Instalando...\n";
        if (!installElectron())
        {
            MessageBoxA(NULL, "Erro ao instalar dependências!", "Erro", MB_ICONERROR);
            return 1;
        }
    }

    // Executa o Electron em background
    if (!runElectronScript())
    {
        MessageBoxA(NULL, "Erro ao executar o script com Electron.", "Erro", MB_ICONERROR);
        return 1;
    }

    // Encerra o processo completamente (sem deixar console aberto)
    ExitProcess(0);

#else
    // Parte para Linux (ainda funcional, mas não foco aqui)
    if (!nodeExists())
    {
        std::cerr << "Node.js não encontrado! Extraia o Node.js em uma pasta chamada 'nodejs'\n";
        return 1;
    }

    if (!electronExists())
    {
        std::cout << "Electron não encontrado. Instalando...\n";
        installElectron();
    }

    std::cout << "Executando Electron...\n";
    if (!runElectronScript())
    {
        std::cerr << "Erro ao executar o script com Electron.\n";
        return 1;
    }

    return 0;
#endif
}