#include <WiFiManager.h>  // https://github.com/tzapu/WiFiManager
#include <ESPAsyncWebServer.h> // https://github.com/me-no-dev/ESPAsyncWebServer
#include <AsyncTCP.h> // https://github.com/me-no-dev/AsyncTCP
#include "site.h"
#include "ESP32Servo.h"

// Inicializacija variabli | Initialization of variables
int saveNumber = 0, baseLast = 0, shoulderLast = 0, upperArmLast = 0, handLast = 0, gripperLast = 0, gripperTopLast = 0;
int baseSave[100], shoulderSave[100], upperArmSave[100], handSave[100], gripperSave[100], gripperTopSave[100];
bool play = false;

// Inicializacija WiFiManager-a | WiFiManager intialization
WiFiManager wm;

Servo base;
Servo shoulder;
Servo upperArm;
Servo hand;
Servo gripper;
Servo gripperTop;

// Inicijalizacija AsyncWebServer-a i AsyncWebSocket-a | Initialization of AsyncWebServer and AsyncWebSocket
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

// Poslužuje HTML sadržaj sa "site.h" | Serves HTML content from "site.h"
void handleRoot(AsyncWebServerRequest *request) {
  request->send(200, "text/html", htmlCode);
}
// Poslužuje odgovor 404 "Not Found" | Serves a 404 "Not Found" response
void notFound(AsyncWebServerRequest *request) {
  request->send(404, "text/plain", "Not Found");
}
// WebSocket
void handleClients(String servo, int value) {
  // Kombinira "servo" i "value" u jedan string i pošalje ga svim povezanim klijentima | Combined "servo" and "value" in one string and sends it to all connected clients
  String message = servo + " " + String(value);
  ws.textAll(message);
}

void handleSaveSteps(AsyncWebServerRequest *request) {
  int saveIndex = request->getParam("save")->value().toInt();

  int valueBase = request->getParam("base")->value().toInt();
  int valueShoulder = request->getParam("shoulder")->value().toInt();
  int valueUpperArm = request->getParam("upperArm")->value().toInt();
  int valueHand = request->getParam("hand")->value().toInt();
  int valueGripper = request->getParam("gripper")->value().toInt();
  int valueGripperTop = request->getParam("gripperTop")->value().toInt();

  baseSave[saveIndex] = valueBase;
  shoulderSave[saveIndex] = valueShoulder;
  upperArmSave[saveIndex] = valueUpperArm;
  handSave[saveIndex] = valueHand;
  gripperSave[saveIndex] = valueGripper;
  gripperTopSave[saveIndex] = valueGripperTop;

  Serial.print("SaveIndex: ");
  Serial.print(saveIndex);
  Serial.print(" SaveValues: ");
  Serial.print(baseSave[saveIndex]);
  Serial.print(" ");
  Serial.print(shoulderSave[saveIndex]);
  Serial.print(" ");
  Serial.print(upperArmSave[saveIndex]);
  Serial.print(" ");
  Serial.print(handSave[saveIndex]);
  Serial.print(" ");
  Serial.print(gripperSave[saveIndex]);
  Serial.print(" ");
  Serial.println(gripperTopSave[saveIndex]);

  saveNumber++;


  request->send(200, "text/plain", "OK");
}

// Obrađivanje primljenenih zahtjeva
void handleSetServo(AsyncWebServerRequest *request) {
  // Izdvaja "action" iz zahtjeva | Extract the action from request
  String action = request->getParam("servo")->value();
  // Izdvaja "action" iz zahtjeva | Extract the value from request
  int value = request->getParam("value")->value().toInt();
  // Poziva funkciju WebSocket handleClients, prosljeđujući "action" i "value" | Calls the WebSocket handleClients function, passing the "action" and "value"
  handleClients(action, value);
  Serial.print("Received: ");
  Serial.print(action);
  Serial.print(" ");
  Serial.println(value);

  // Procesiranje "action" | Processing "action"
  if (action == "base") {
    base.write(value + 90);
    baseLast = value;
  }else if (action == "shoulder") {
    shoulder.write(value + 90);
    shoulderLast = value;
  }else if (action == "upperArm") {
    upperArm.write(value + 90);
    upperArmLast = value;
  }else if (action == "hand") {
    hand.write(value + 90);
    handLast = value;
  }else if (action == "gripper") {
    gripper.write(value + 90);
    gripperLast = value;
  }else if (action == "gripperTop") {
    gripperTop.write(value + 90);
    gripperTopLast = value;
  }else if (action == "play") {
    play = true;
  }else if (action == "stop") {
    play = false;
    saveNumber = 0;
  }
  // Odgovara s 200 "OK" kada se zahtjev obradi | Responds with 200 "OK" when request is processed
  request->send(200, "text/plain", "OK");
}

void setup() {
  // Attach servo i postavlja početne položaje | Attaches servos and sets initial positions
  base.attach(16);
  shoulder.attach(17);
  upperArm.attach(5);
  hand.attach(18);
  gripper.attach(19);
  gripperTop.attach(21);
  base.write(90);
  shoulder.write(90);
  upperArm.write(90);
  hand.write(90);
  gripper.write(90);
  gripperTop.write(90);

  Serial.begin(115200);
  //Dodan je "ESP.restart();" nakon DEBUG_WM(WiFi.localIP()); (linija 897) u biblioteci WiFiManager.cpp kako bi se riješio problem s ESPAsyncWebServer koji se ne učitava nakon povezivanja na novu pristupnu točku
  //Added "ESP.restart();" after DEBUG_WM(WiFi.localIP()); (line 897) in library WiFiManager.cpp to fix problem with ESPAsyncWebServer not loading server after connect to new AP

  // Automatski se povezuje pomoću spremljenih podataka, ako veza ne uspije, pokreće se pristupna točka "Robotska Ruka" |
  // Automatically connect using saved credentials, if connection fails, it starts an access point "Robotska Ruka"
  bool res;
  res = wm.autoConnect("Robotska Ruka");
  if (!res) {
    Serial.println("Failed to connect");
    ESP.restart();
  } else {
    Serial.println("connected...yeey :)");
  }

  server.on("/", HTTP_GET, handleRoot);
  server.on("/setServo", HTTP_GET, handleSetServo);
  server.on("/saveSteps", HTTP_GET, handleSaveSteps);
  server.onNotFound(notFound);
  server.begin();

  // WebSocket obrada događaja | WebSocket event handler
  ws.onEvent([](AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
    // Obrada događaja povezivanja klijenta slanjem položaja servoa novopovezanom klijentu | 
    // Handle client connection event by sending servo positions to newly connected client
    if (type == WS_EVT_CONNECT) {
      handleClients("base", baseLast);
      handleClients("shoulder", shoulderLast);
      handleClients("upperArm", upperArmLast);
      handleClients("hand", handLast);
      handleClients("gripper", gripperLast);
      Serial.println("WebSocket client connected");
    }else if (type == WS_EVT_DISCONNECT) {
      Serial.println("WebSocket client disconnected");
    }
  });

  // Pokretanje WebSocket poslužitelja | Starting WebSocket server
  server.addHandler(&ws);
}

void loop() {
  // Funkcija za ponovno pokretanje WiFiManagera kako bi se obrisali spremljeni podaci i vratili na proces autoConnect("Robot Arm"). Napomena: Tipka 0 je boot Tipka na ESP32. |
  // Function to restart WiFiManager, wiping saved data, and returning to the autoConnect("Robot Arm") process. Note: Button 0 is the boot button on ESP32.
  if (digitalRead(0) == LOW) {
    Serial.println("Restarting...");
    delay(1000);
    wm.resetSettings();
    delay(100);
    ESP.restart();
  }
  delay(100);

  // Izvršava se dok je play = true i prosljeđuje sve potrebnih vrijednosti funkciji "moveServo" | 
  // Executing while play = true and passing all required values to function "moveServo"
  if (play) {
    for (int i = 0; i < saveNumber; i++) {
      moveServo(1, base.read(), baseSave[i] + 90);
      moveServo(2, shoulder.read(), shoulderSave[i] + 90);
      moveServo(3, upperArm.read(), upperArmSave[i] + 90);
      moveServo(4, hand.read(), handSave[i] + 90);
      moveServo(5, gripper.read(), gripperSave[i] + 90);
      moveServo(6, gripperTop.read(), gripperTopSave[i] + 90);
    }
    delay(500);
  }
}

// Funkcija za polagano pomicanje robotske ruke. Bez ove funkcije morali bismo postaviti vrijednost direktno u servo, što bi bilo prebrzo | Function for slowly moving servo
void moveServo(int servoNum, int currentPosition, int targetPosition) {
  if (currentPosition < targetPosition) {
    for (int pos = currentPosition; pos <= targetPosition; pos++) {
      if (servoNum == 1) {
        base.write(pos);
        handleClients("base", pos - 90);
      } else if (servoNum == 2) {
        shoulder.write(pos);
        handleClients("shoulder", pos - 90);
      } else if (servoNum == 3) {
        upperArm.write(pos);
        handleClients("upperArm", pos - 90);
      } else if (servoNum == 4) {
        hand.write(pos);
        handleClients("hand", pos - 90);
      } else if (servoNum == 5) {
        gripper.write(pos);
        handleClients("gripper", pos - 90);
      } else if (servoNum == 6) {
        gripperTop.write(pos);
      }
      delay(20);
    }
  } else {
    for (int pos = currentPosition; pos >= targetPosition; pos--) {
      if (servoNum == 1) {
        base.write(pos);
        handleClients("base", pos - 90);
      } else if (servoNum == 2) {
        shoulder.write(pos);
        handleClients("shoulder", pos - 90);
      } else if (servoNum == 3) {
        upperArm.write(pos);
        handleClients("upperArm", pos - 90);
      } else if (servoNum == 4) {
        hand.write(pos);
        handleClients("hand", pos - 90);
      } else if (servoNum == 5) {
        gripper.write(pos);
        handleClients("gripper", pos - 90);
      } else if (servoNum == 6) {
        gripperTop.write(pos);
      }
      delay(20);
    }
  }
}
