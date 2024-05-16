#include <WiFiManager.h>  // https://github.com/tzapu/WiFiManager
#include <ESPAsyncWebServer.h> // https://github.com/me-no-dev/ESPAsyncWebServer
#include <AsyncTCP.h> // https://github.com/me-no-dev/AsyncTCP
#include "site.h"
#include "ESP32Servo.h"

// Inicializacija variabli
int saveNumber = 0, baseLast = 0, shoulderLast = 0, upperArmLast = 0, handLast = 0, gripperLast = 0, gripperTopLast = 0;
int baseSave[100], shoulderSave[100], upperArmSave[100], handSave[100], gripperSave[100], gripperTopSave[100];
bool play = false;
unsigned long lastMessageTime = 0;
unsigned long messageInterval = 20;

// Inicializacija WiFiManager-a
WiFiManager wm;

Servo base;
Servo shoulder;
Servo upperArm;
Servo hand;
Servo gripper;
Servo gripperTop;

// Inicijalizacija AsyncWebServer-a i AsyncWebSocket-a
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

// Poslužuje HTML sadržaj sa "site.h"
void handleRoot(AsyncWebServerRequest *request) {
  request->send(200, "text/html", htmlCode);
}
// Poslužuje odgovor 404 "Not Found"
void notFound(AsyncWebServerRequest *request) {
  request->send(404, "text/plain", "Not Found");
}

// WebSocket
void handleClients(String servo, int value, int step) {
  // Trenutno vrijeme
  unsigned long currentTime = millis();
  
  // Provjera dali je prošlo dovoljno vremena od zadnje websocket poruke
  if (currentTime - lastMessageTime >= messageInterval) {
    // Ažuriraje vremena zadnje poruke
    lastMessageTime = currentTime;

  // Kombinira "servo", "value" i "step" u jedan string i pošalje ga svim povezanim klijentima
  String message = servo + " " + String(value) + " " + String(step);
  ws.textAll(message);
  }
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

  saveNumber=saveIndex;
  Serial.println(saveNumber);


  request->send(200, "text/plain", "OK");
}

// Obrađivanje primljenenih zahtjeva
void handleSetServo(AsyncWebServerRequest *request) {
  // Izdvaja "action" iz zahtjeva
  String action = request->getParam("servo")->value();
  // Izdvaja "action" iz zahtjeva
  int value = request->getParam("value")->value().toInt();
  // Poziva funkciju WebSocket handleClients, prosljeđujući "action" i "value"
  handleClients(action, value, 0);
  Serial.print("Received: ");
  Serial.print(action);
  Serial.print(" ");
  Serial.println(value);

  // Procesiranje "action"
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
  }else if (action == "save") { //Stara save funkcija
    baseSave[saveNumber] = baseLast;
    shoulderSave[saveNumber] = shoulderLast;
    upperArmSave[saveNumber] = upperArmLast;
    handSave[saveNumber] = handLast;
    gripperSave[saveNumber] = gripperLast;
    gripperTopSave[saveNumber] = gripperTopLast;
    saveNumber++;
  }else if (action == "play") {
    play = true;
  }else if (action == "stop") {
    play = false;
  }
  else if (action == "restart") {
    play = false;
    saveNumber=0;
    base.write(90);
    baseLast = 0;
    handleClients("base", 0, 0);
    shoulder.write(0);
    shoulderLast = 0;
    handleClients("shoulder", 0, 0);
    upperArm.write(0);
    upperArmLast = 0;
    handleClients("upperArm", 0, 0);
    hand.write(90);
    handLast = 0;
    handleClients("hand", 0, 0);
    gripper.write(90);
    gripperLast = 0;
    handleClients("gripper", 0, 0);
    gripperTop.write(90);
    gripperTopLast = 0;
    handleClients("gripperTop", 0, 0);
  }
  // Odgovara s 200 "OK" kada se zahtjev obradi
  request->send(200, "text/plain", "OK");
}

void setup() {
  // Attach servo i postavlja početne položaje
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
  // Automatski se povezuje pomoću spremljenih podataka, ako veza ne uspije, pokreće se pristupna točka "Robotska Ruka"
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

  // WebSocket obrada događaja
  ws.onEvent([](AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
    // Obrada događaja povezivanja klijenta slanjem položaja servoa novopovezanom klijentu
    if (type == WS_EVT_CONNECT) {
      handleClients("base", baseLast, 0);
      delay(messageInterval+50);
      handleClients("shoulder", shoulderLast, 0);
      delay(messageInterval+50);
      handleClients("upperArm", upperArmLast, 0);
      delay(messageInterval+50);
      handleClients("hand", handLast, 0);
      delay(messageInterval+50);
      handleClients("gripper", gripperLast, 0);
      delay(messageInterval+50);
      handleClients("gripperTop", gripperTopLast, 0);
      delay(messageInterval+50);
      messageInterval = messageInterval + 20;
      Serial.print("WebSocket client connected. Message interval:");
      Serial.println(messageInterval);
    }else if (type == WS_EVT_DISCONNECT) {
      messageInterval = messageInterval - 20;
      Serial.print("WebSocket client disconnected. Message interval:");
      Serial.println(messageInterval);
    }
  });

  // Pokretanje WebSocket poslužitelja
  server.addHandler(&ws);
}

void loop() {
  // Funkcija za ponovno pokretanje WiFiManagera kako bi se obrisali spremljeni podaci i vratili na proces autoConnect("Robot Arm"). Napomena: Tipka 0 je boot Tipka na ESP32.
  if (digitalRead(0) == LOW) {
    Serial.println("Restarting...");
    delay(1000);
    wm.resetSettings();
    delay(100);
    ESP.restart();
  }
  delay(100);

  // Izvršava se dok je play = true i prosljeđuje sve potrebnih vrijednosti funkciji "moveServo"
  if (play) {
    for (int i = 0; i <= saveNumber; i++) {
      moveServo(1, base.read(), baseSave[i] + 90, i);
      moveServo(2, shoulder.read(), shoulderSave[i] + 90, i);
      moveServo(3, upperArm.read(), upperArmSave[i] + 90, i);
      moveServo(4, hand.read(), handSave[i] + 90, i);
      moveServo(5, gripper.read(), gripperSave[i] + 90, i);
      moveServo(6, gripperTop.read(), gripperTopSave[i] + 90, i);
    }
    delay(500);
  }
}

// Funkcija za polagano pomicanje robotske ruke. Bez ove funkcije morali bismo postaviti vrijednost direktno u servo, što bi bilo previše brzo
void moveServo(int servoNum, int currentPosition, int targetPosition, int step) {
  if (currentPosition < targetPosition) {
    for (int pos = currentPosition; pos <= targetPosition; pos++) {
      if (servoNum == 1) {
        base.write(pos);
        handleClients("base", pos - 90, step+1);
      } else if (servoNum == 2) {
        shoulder.write(pos);
        handleClients("shoulder", pos - 90, step+1);
      } else if (servoNum == 3) {
        upperArm.write(pos);
        handleClients("upperArm", pos - 90, step+1);
      } else if (servoNum == 4) {
        hand.write(pos);
        handleClients("hand", pos - 90, step+1);
      } else if (servoNum == 5) {
        gripper.write(pos);
        handleClients("gripper", pos - 90, step+1);
      } else if (servoNum == 6) {
        gripperTop.write(pos);
      }
      delay(20);
    }
  } else {
    for (int pos = currentPosition; pos >= targetPosition; pos--) {
      if (servoNum == 1) {
        base.write(pos);
        handleClients("base", pos - 90, step+1);
      } else if (servoNum == 2) {
        shoulder.write(pos);
        handleClients("shoulder", pos - 90, step+1);
      } else if (servoNum == 3) {
        upperArm.write(pos);
        handleClients("upperArm", pos - 90, step+1);
      } else if (servoNum == 4) {
        hand.write(pos);
        handleClients("hand", pos - 90, step+1);
      } else if (servoNum == 5) {
        gripper.write(pos);
        handleClients("gripper", pos - 90, step+1);
      } else if (servoNum == 6) {
        gripperTop.write(pos);
      }
      delay(20);
    }
  }
}
