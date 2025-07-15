# Detecta o sistema operacional
OS := $(shell uname -s)

# Define o nome do executável conforme o SO
ifeq ($(OS),Linux)
    EXE = RichPresenceRedeWorth
else
    EXE = RichPresenceRedeWorth.exe
endif

# Regra padrão para compilar
all:
	g++ main.cpp resource.o -o $(EXE)

# Limpeza dos arquivos compilados
clean:
	rm -f $(EXE)
