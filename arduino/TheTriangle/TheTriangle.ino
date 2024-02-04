// - - - - -
// DmxSerial - A hardware supported interface to DMX.
// DmxSerialRecv.ino: Sample DMX application for retrieving 3 DMX values:
// address 1 (red) -> PWM Port 9
// address 2 (green) -> PWM Port 6
// address 3 (blue) -> PWM Port 5
//
// Copyright (c) 2011-2015 by Matthias Hertel, http://www.mathertel.de
// This work is licensed under a BSD style license. See http://www.mathertel.de/License.aspx
//
// Documentation and samples are available at http://www.mathertel.de/Arduino
// 25.07.2011 creation of the DmxSerial library.
// 10.09.2011 fully control the serial hardware register
//            without using the Arduino Serial (HardwareSerial) class to avoid ISR implementation conflicts.
// 01.12.2011 include file and extension changed to work with the Arduino 1.0 environment
// 28.12.2011 changed to channels 1..3 (RGB) for compatibility with the DmxSerialSend sample.
// 10.05.2012 added some lines to loop to show how to fall back to a default color when no data was received since some time.
// - - - - -
#include <DMXSerial.h>
#include <Adafruit_NeoPixel.h>

#define PIXEL_MODE 1

// Which pin on the Arduino is connected to the NeoPixels?
#define PIN1        6 // On Trinket or Gemma, suggest changing this to 1
#define PIN2       7 // On Trinket or Gemma, suggest changing this to 1
#define PIN3       8 // On Trinket or Gemma, suggest changing this to 1

// How many NeoPixels are attached to the Arduino?
#define NUMPIXELS 30 // Popular NeoPixel ring size

// When setting up the NeoPixel library, we tell it how many pixels,
// and which pin to use to send signals. Note that for older NeoPixel
// strips you might need to change the third parameter -- see the
// strandtest example for more information on possible values.
Adafruit_NeoPixel pixels1(NUMPIXELS, PIN1, NEO_GRBW + NEO_KHZ800);
Adafruit_NeoPixel pixels2(NUMPIXELS, PIN2, NEO_GRBW + NEO_KHZ800);
Adafruit_NeoPixel pixels3(NUMPIXELS, PIN3, NEO_GRBW + NEO_KHZ800);

uint8_t startChannel = 1;
uint8_t lastValues1[] = {0, 0, 0, 0, 0, 0, 0, 0, 0};
// uint8_t* lastValues1;
// uint8_t* lastValues2;
// uint8_t* lastValues3;

void setup() {
  DMXSerial.init(DMXReceiver);
  DMXSerial.write(1, 0);
  
  pinMode(LED_BUILTIN, OUTPUT);

  delay(1000);  

  // if(PIXEL_MODE == 1){
  //   lastValues1 = (uint8_t *) malloc(6);
  // }else{
  //   lastValues1 = (uint8_t *) malloc(5 + ceil(NUMPIXELS/8));
  // }

  pixels1.begin();
  // pixels2.begin();
  // pixels3.begin();
}

// optimisation
bool lastCycleUpdate = false;

void processStripe(uint8_t startChannel, Adafruit_NeoPixel &pixels, uint8_t lastValues[] ){
  bool hasUpdate = false;

  uint8_t numberOfChannels = 6;
  uint8_t currentValues[] = {0, 0, 0, 0, 0, 0, 0, 0, 0};

  // check for changes
  for(int c=0; c < numberOfChannels; c++){
    currentValues[c] = DMXSerial.read(startChannel + c);

    if(currentValues[c] != lastValues[c]){
      hasUpdate = true;
    }
  }

  // if nothing change skip
  if(!hasUpdate){
    return;
  }

  // clear all pixels
  pixels.clear();

  // read channel values
  float dimmer = currentValues[0]/255.0;
  uint8_t level = ceil((currentValues[1]/255.0)*NUMPIXELS);
  uint8_t red = (uint8_t)currentValues[2] * dimmer;
  uint8_t green = (uint8_t)currentValues[3]* dimmer;
  uint8_t blue = (uint8_t)currentValues[4] * dimmer;
  uint8_t white = (uint8_t)currentValues[5] * dimmer;

  // set values
  for(int i=0; i<level; i++) { // For each pixel...
    pixels.setPixelColor(i, pixels.Color(red, green, blue, white));
  }
  
  for(uint8_t c=0; c < numberOfChannels; c++){
    lastValues[c] = currentValues[c];
  }

  pixels.show(); 
}

void processStripeV2(uint8_t startChannel, Adafruit_NeoPixel &pixels, uint8_t lastValues[] ){
  bool hasUpdate = false;

  // Calculate the number of bytes needed
  int numberOfBytes = ceil(static_cast<double>(NUMPIXELS) / 8);
  // int numberOfChannels = 5 + numberOfBytes;
  int numberOfChannels = 9;

  // uint8_t* currentValues;
  // currentValues = (uint8_t *) malloc(numberOfChannels);

  uint8_t currentValues[] = {0, 0, 0, 0, 0, 0, 0, 0, 0};

  // check for changes
  for(int c=0; c < numberOfChannels; c++){
    currentValues[c] = DMXSerial.read(startChannel + c);

    if(currentValues[c] != lastValues[c]){
      hasUpdate = true;
    }
  }


  // if nothing change skip
  if(!hasUpdate){
    if(lastCycleUpdate){
      // pixels.setPixelColor(29, pixels.Color(0, 255, 0, 0));
      // pixels.show(); 
      lastCycleUpdate = false;
    }
    return;
  }

  // clear all pixels
  pixels.clear();

  // read channel values
  float dimmer = currentValues[0]/255.0;
  uint8_t red = (uint8_t)currentValues[1] * dimmer;
  uint8_t green = (uint8_t)currentValues[2]* dimmer;
  uint8_t blue = (uint8_t)currentValues[3] * dimmer;
  uint8_t white = (uint8_t)currentValues[4] * dimmer;

  // set values
  for(int i=0; i<NUMPIXELS; i++) {
    uint8_t index = 5 + floor(static_cast<double>(i) / 8);
    uint8_t bitPosition = i % 8;
    uint8_t byte = currentValues[index];

    if(byte & (1 << bitPosition)){
      pixels.setPixelColor(i, pixels.Color(red, green, blue, white));
    }
  }
  
  for(uint8_t c=0; c < numberOfChannels; c++){
    lastValues[c] = currentValues[c];
  }

  pixels.show(); 
  lastCycleUpdate = true;
}


void loop() {
  rocessStripeV2(1, pixels1, lastValues1);
}

// End.
