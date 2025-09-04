# Makefile para compilar RichPresenceRedeWorth em Linux
CXX = g++
CXXFLAGS = -std=c++11 -Wall
TARGET = RichPresenceRedeWorth
SRC = main.cpp

all: $(TARGET)

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) resource.o -o $(TARGET) $(SRC)

clean:
	rm -f $(TARGET)