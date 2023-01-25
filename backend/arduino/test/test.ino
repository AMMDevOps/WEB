#include <LiquidCrystal.h>
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

String stra;

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2); 
}

void loop() {
  Serial.println("D");
  while (Serial.available() == 0) {
    delay(100);
  }
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(Serial.available());
  lcd.setCursor(0, 1);
  lcd.print(Serial.readString());
}