const Alexa = require("ask-sdk-core");
const Utils = require("./utils");

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      "Welcome, you can ask me where you can park your bicycle.";
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const FindClosestParkingLocationHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "FindClosestParkingLocation"
    );
  },
  handle(handlerInput) {
    const isGeoSupported =
      handlerInput.requestEnvelope.context.System.device.supportedInterfaces
        .Geolocation;
    if (!isGeoSupported) {
      return handlerInput.responseBuilder
        .speak(
          `I'm sorry, your device does not support location services capabilities. 
          To use this skill, please try with an Alexa device which supports this.`
        )
        .getResponse();
    }

    var geoObject = handlerInput.requestEnvelope.context.Geolocation;
    if (!geoObject || !geoObject.coordinate) {
      return handlerInput.responseBuilder
        .speak(
          "Location Services permission is required to use this feature. Please enable it in the Alexa app."
        )
        .withAskForPermissionsConsentCard([
          "alexa::devices:all:geolocation:read"
        ])
        .getResponse();
    } else {
      const latitude = geoObject.coordinate.latitudeInDegrees;
      const longitude = geoObject.coordinate.longitudeInDegrees;

      const result = Utils.closestBikeParking(latitude, longitude);
      const mapImageUrl = Utils.getMapImage(result.latitude, result.longitude);

      const parkingAddress = result.address;

      const parkingDescription = `Near: ${result.building}\rType: ${result.standType}\rCapacity: ${result.capacity}`;

      const speakOutput = `There is a ${result.standType} located at ${parkingAddress}. The closest building is ${result.building}.`;
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .withStandardCard(
          parkingAddress,
          parkingDescription,
          mapImageUrl,
          mapImageUrl
        )
        .getResponse();
    }
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      "You can ask me where to leave your bicycle! How can I help?";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = "Goodbye!";
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse();
  }
};

const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
    );
  },
  handle(handlerInput) {
    const intentName = getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`~~~~ Error handled: ${error.stack}`);
    const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

exports.bikeparking = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    FindClosestParkingLocationHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
