/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * @author Ruben Pacheco-Caldera
 * Think Quick Game all rights reserved. A game that throws a random category at players
 * and they must name three items from the category in 5 seconds
 * 
*/
'use strict';
const Alexa = require('ask-sdk-v1adapter');

const APP_ID = 'amzn1.ask.skill.ac9c7005-0822-4554-9c7e-ad2c98a47c45';

const SKILL_NAME = 'Think Quick';
const HELP_MESSAGE = 'You can say explain the rules, play game, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const bye = ['Goodbye', 'Adios', 'Later, Alligator', 'Bye-Bye', 'See ya'];
var STOP_MESSAGE =  bye[getRandomArbitrary(0, bye.length)];

const timeupsound = "<audio src='soundbank://soundlibrary/musical/amzn_sfx_bell_short_chime_01'/>";
const roundsound = "<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_bridge_01'/>";
const correctsound = "<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_01'/>";
var respo = '';
var isnextround;
var announcement='';
var finalscore = '';
const easy_time = '<audio src="https://s3.amazonaws.com/thinkquicksounds/5sec.mp3"/>';
const med_time = '<audio src="https://s3.amazonaws.com/thinkquicksounds/4sec.mp3"/>';
const hard_time = '<audio src="https://s3.amazonaws.com/thinkquicksounds/3sec.mp3"/>';



const easy_cats = ['Cereals', 'Condiments','Breakfast foods','School subjects', 'Fast food restaurants',
'Disney characters', 'animals that live in the ocean', 'ice cream flavors', 'Board games',
'pizza toppings', 'religions', 'rappers','love songs','books','Candy bars', 'planets',
'Superheroes', 'Shoe brands','Vegetables','social media apps','Holidays', 'Disney movies',
'sports','Islands','fast animals','mammals','slow animals','classic movies','science fiction movies',
'water sports','cookies','chips', 'spices','Things that are cold','things that are hot',
'things found in a park', 'things that burn', 'things that smell bad', 'things that smell good',
'Hobbies','toys', 'Insects','song titles', 'Store names', 'Things found in a bedroom ',
'Words that end with -ow','Things you take camping','Languages','Words that rhyme with bell',
'Things people hate to touch','Things to take to the beach','Things you can climb' ];

const medium_cats = ['Luxury car brands', 'animals that live in the desert','Movie stars',
'Football teams', 'U.S. state capitals', 'Cartoon shows','Musical instruments','Body organs',
'natural disasters','farm animals','nicknames','baby foods','tropical fruit','American landmarks',
'Sports that dont use a ball','things that kill you','Presidents','Airlines','Video Games ',
'Countries in Africa','cities in europe','countries in Asia','countries in South America',
'Villains from a movie','dance moves','dog breeds','Trees','crimes','cooking tools','parts of a car',
'Airports','Mexican foods','Basketball teams','Baseball teams','wearable technology gadgets',
'Diseases','Lakes','authors','flowers','terms of endearment','Things that are sticky',
'Bad habits','items in a vending machine','weekend activities','yellow fruits',
'countries of Asia ','Spongebob Square pant Main Characters ','Dog Commands ',
'Electrical Home Appliances','Types of coffees ','U.S. government agencies'];

const hard_cats = ['Objects that bounce','Bald celebrities','Round objects',
'Comedians','Gardening tools','Artists from the 2000s','Japanese companies',
'Famous art pieces','Parts of a tree','European capital cities','Math formulas',
'Songs with a name in the title','Theme songs','Excuses for being late',
'Reasons to quit your job','things that have stripes','Megacities',
'Sports that require a helmet '];


// add the categories





function getVals(diction) {
    var values = [];
    for (var key in diction){
        values.push(diction[key]);
    }
    
    return values;
}

function GetTopScore(attributes){
    var winners = [];
    var values = getVals(attributes['score']);
 
   

    var max = Math.max.apply(null, values);
    
    for (var key in attributes['score']) {
        if (attributes['score'][key] == max){
            winners.push(key);
        }
    }
    var response = "";   
    if (winners.length == 1){
        response = winners[0] + " is currently winning with " + String(max) + " points. " ;
        
    }else if (winners.length > 1) {
        var i;
        for ( i = 0; i < winners.length; i++){
            response += winners[i] + " "; 
        }
        response += " are currently tied for " + String(max) + " points. ";
    }
    return response;
    
}
function FinalWinners(attributes){
    var winnerArray = [];
    var values = getVals(attributes['score']);
 
   

    var top = Math.max.apply(null, values);
    
    for (var key in attributes['score']) {
        if (attributes['score'][key] == top){
            winnerArray.push(key);
        }
    }
    var response = "";   
    if (winnerArray.length == 1){
        response = "The winner is " + winnerArray[0] + " with " + String(top) + " points." ;
        
    }else if (winnerArray.length > 1) {
        response = "There was a tie between ";
        var i;
        for ( i = 0; i < winnerArray.length; i++){
            response += winnerArray[i] + ", "; 
        }
        response += " for " + String(top) + " points.";
    }
    return response;
}
    
function TellScore (attributes) {
    var responsee ='';
    for (var key in attributes['score']) {
       responsee = responsee + key + ' has ' + attributes['score'][key] + ' points, ';
    }
    return responsee;
}

const handlers = {
    'LaunchRequest': function () {

        var response1 = "<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_intro_01'/>";
        
        this.attributes['categories'] = easy_cats;
        
        response1 = response1 +  "Welcome to Think Quick, the game that challenges you\
        to give three responses in a few seconds! If you would like to know the rules\
        say, explain the rules. Otherwise, How many people are playing?";
        this.response.speak(response1).listen('How many players?');
        this.response.shouldEndSession = false;
        this.attributes['gamelength'] = 0;
        this.attributes['NUM_PLAYERS'] = 0;
        this.attributes['currentRound'] = 1;
        //used to keep track of how many categories they've answered
        this.attributes['currentIndex'] = 0;
        this.attributes['currentPlayer'] = 0;
        this.attributes['correctAnswer'] = '';
        this.attributes['score'] = {};
        this.attributes['easy_cat_changed'] = false;
        this.attributes['med_cat_changed'] = false;
        this.attributes['gameover'] = false;

        this.attributes['breakTime'] = easy_time;
        this.attributes['announcedTopScore'] = false;
        this.emit(':responseReady');
        
    },
    'ExplainRulesIntent':function(){
        this.response.speak('A random category is given to each player. \
        You have a few seconds to name three things from that category.\
        As the game progresses, the categories get harder and the time to answer decreases.\
        The user is asked whether the player who just answered got the answer correct. When you want\
        to know the score, ask What is the score? To end the game, say End game.\
        To repeat, say repeat rules. Otherwise, say Play game').listen();
        this.response.shouldEndSession = false;
        this.emit(':responseReady');
        
    },
    'SetNumPlayersIntent': function () {
        this.attributes['NUM_PLAYERS'] = Number(this.event.request.intent.slots.AMAZONNumber.value);
        //initializes all players to score 0
        var i;
        for (i = 0; i < this.attributes['NUM_PLAYERS']; i++){
            this.attributes['score']['Player ' + String(i + 1)] = 0;
        }
        this.response.speak('Okay, ' + this.attributes['NUM_PLAYERS'] +  ' players it is. Do you\
        you wanna play a short, medium or long game?').listen('Short, medium or long game');
        this.response.shouldEndSession = false;
        this.emit(':responseReady');
    },
    'SetGameLengthIntent': function () {
        var gamelength =  this.event.request.intent.slots.gamelength.value;
        if (gamelength == "short"){
            this.attributes['gamelength'] = 3;
        }
        else if (gamelength == "medium"){
            this.attributes['gamelength'] = 5;
        }
         else if (gamelength == "long"){
            this.attributes['gamelength'] = 8;
        }else {
            // default
            this.attributes['gamelength'] = 4;
        }
        var roundnum = this.attributes['gamelength'] ;
        
        this.response.speak('Okay, there will be ' +
            roundnum + ' rounds. The game is about to\
            begin. ' + throwCategory(this.attributes) ).listen();
            
        this.response.shouldEndSession = false;
        this.emit(':responseReady');
    
    },
    
    'CorrectIntent': function() {
        this.attributes['correctAnswer'] =  this.event.request.intent.slots.correct.value;
        
        var responsy;
        var playerscore = this.attributes['score']['Player ' + String(this.attributes['currentPlayer'])] ;
        if (this.attributes['correctAnswer'] == 'yes') {
            this.attributes['score']['Player ' + this.attributes['currentPlayer']] = playerscore + 1;
            
            responsy = 'Okay. Plus one point. '+ correctsound + throwCategory(this.attributes);
            
        }else {
            
            responsy = 'No points added. ' + throwCategory(this.attributes);
            
        }
        
        this.response.speak(responsy).listen();
        this.response.shouldEndSession = false;
        this.emit(':responseReady');
    }, 
    'EndGameIntent': function(){
        var outro = "<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_outro_01'/>";
        if (this.attributes['currentIndex'] != 0) {
            finalscore = "Here is the final score: "+TellScore(this.attributes);
        }
       
        this.response.speak('Okay, the game has ended. '+ finalscore + STOP_MESSAGE + outro);
        this.response.shouldEndSession = true;
        this.emit(':responseReady');
    },
    'ScoreIntent': function () {
        this.attributes['currentPlayer']--;
        this.response.speak(TellScore(this.attributes) + ". To continue, say\
        Play game").listen('To continue, say play game.');
        this.response.shouldEndSession = false;
        this.emit(':responseReady');
    },
    'playGameIntent' : function () {
        var newresp;
        // if players need to set up game
        if (this.attributes['NUM_PLAYERS'] < 1 || this.attributes['gamelength'] < 1){
            newresp = 'How many players?';
        }else {
            newresp = throwCategory(this.attributes);
        }
        this.response.speak(newresp).listen(newresp);
        this.response.shouldEndSession = false;
        this.emit(':responseReady');
    },
   
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'SessionEndedRequest' :function(){
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    }
};

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

var throwCategory = function (attributes) {
    
    // generate a random index
    var randInd = getRandomArbitrary(0, attributes['categories'].length);
    var category = '';
    var nextroundalert = '';

    
   
    if (attributes['gameover']) {
        respo = 'The game has ended! '+ FinalWinners(attributes) + ' If you want to play again, say:\
        Alexa, launch think quick. Otherwise, say end game!';
    }else{
        
        // only change the categories once
        if (attributes['currentRound'] == 2 && !attributes['easy_cat_changed']){
            attributes['categories'] = medium_cats;
            attributes['easy_cat_changed'] = true;
        }
        // throws some harder categories in there
        if (attributes['currentRound'] == 4 && !attributes['med_cat_changed']){
            attributes['categories'] = attributes['categories'].concat(hard_cats);
            attributes['med_cat_changed'] = true;
        }
        // announce who the top scorers currently are halfway through the game
        
    
        if(attributes['currentPlayer'] == attributes['NUM_PLAYERS']) {
            isnextround = true;
        }else {
            isnextround = false;
        }
        
        attributes['currentIndex']++;
        attributes['currentPlayer'] ++;
       
        
        // 0 if it's the next round
        if (isnextround) {
            // adds to the response the current round
            attributes['currentRound']++;
            nextroundalert = roundsound +' Round ' + String(attributes['currentRound']) ;
            attributes['currentPlayer'] = 1;
            if (attributes['NUM_PLAYERS'] > 1 && attributes['gamelength']>3 && attributes['currentRound'] == Math.trunc((attributes['gamelength']/2) + 1)){
                announcement = GetTopScore(attributes);
                attributes['announcedTopScore'] = true;
            }
        }else{
            nextroundalert = '';
        }
        
        
        
        if (attributes['categories'].length < 1) {
            respo = 'No categories remaining. To end game and check score, say end game.';
        } else {
        
            
           
            // returns a random category from category list
            category = attributes['categories'][randInd];
            //removes the category after its used
            attributes['categories'].splice(randInd, 1);
            if (attributes['currentRound'] == 3){
                attributes['breakTime'] = med_time;
            }
            else if (attributes['currentRound'] > 5){
                attributes['breakTime'] = hard_time;
            }
            respo = announcement+ nextroundalert +' Player ' + String(attributes['currentPlayer'])+ ', its your turn. Name three '
                + category + 
                attributes['breakTime'] +
                timeupsound + 'Time is up!'+ ' Did this player name three correct ' + category + '?';
        }
    }
        if (attributes['currentRound'] == attributes['gamelength'] && attributes['currentPlayer'] == attributes['NUM_PLAYERS']) 
            attributes['gameover'] = true;
    return respo;
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.registerV2Handlers(WhatCanIBuyIntentHandler,
        TellMeMoreAboutGreetingsPackIntentHandler,
        TellMeMoreAboutPremiumSubscriptionIntentHandler,
        BuyGreetingsPackIntentHandler,
        GetSpecialGreetingsIntentHandler,
        BuyPremiumSubscriptionIntentHandler,
        BuyResponseHandler,
        PurchaseHistoryIntentHandler,
        RefundGreetingsPackIntentHandler,
        CancelPremiumSubscriptionIntentHandler,
        CancelProductResponseHandler);
    alexa.execute();
};


function getSpecialHello() {
    const specialGreetings = [
        {
            language: 'hindi', greeting: 'Namaste', locale: 'en-IN', voice: ['Aditi', 'Raveena'],
        },
        {
            language: 'german', greeting: 'Hallo', locale: 'de-DE', voice: ['Hans', 'Marlene', 'Vicki'],
        },
        {
            language: 'spanish', greeting: 'Hola', locale: 'es-ES', voice: ['Conchita', 'Enrique'],
        },
        {
            language: 'french', greeting: 'Bonjour', locale: 'fr-FR', voice: ['Celine', 'Lea', 'Mathieu'],
        },
        {
            language: 'japanese', greeting: 'Konichiwa', locale: 'ja-JP', voice: ['Mizuki', 'Takumi'],
        },
        {
            language: 'italian', greeting: 'Ciao', locale: 'it-IT', voice: ['Carla', 'Giorgio'],
        },
    ];
    return randomize(specialGreetings);
}

function randomize(array) {
    const randomItem = array[Math.floor(Math.random() * array.length)];
    return randomItem;
}

function getRandomGoodbye() {
    const goodbyes = [
        'OK.  Goodbye!',
        'Have a great day!',
        'Come back again soon!',
    ];
    return randomize(goodbyes);
}

function getResponseBasedOnAccessType(handlerInput, res, preSpeechText) {
    // The filter() method creates a new array with all elements that pass the test implemented by the provided function.
    const greetingsPackProduct = res.inSkillProducts.filter(
        record => record.referenceName === 'Greetings_Pack',
    );

    console.log(
        `GREETINGS PACK PRODUCT = ${JSON.stringify(greetingsPackProduct)}`,
    );

    const premiumSubscriptionProduct = res.inSkillProducts.filter(
        record => record.referenceName === 'Premium_Subscription',
    );

    console.log(
        `PREMIUM SUBSCRIPTION PRODUCT = ${JSON.stringify(premiumSubscriptionProduct)}`,
    );

    let speechText;
    let cardText;
    let repromptOutput;

    const specialGreeting = getSpecialHello();
    const preGreetingSpeechText = `${preSpeechText} Here's your special greeting: `;
    const postGreetingSpeechText = `That's hello in ${specialGreeting.language}.`;
    const langSpecialGreeting = switchLanguage(`${specialGreeting.greeting}!`, specialGreeting.locale);

    if (isEntitled(premiumSubscriptionProduct)) {
        // Customer has bought the Premium Subscription. Switch to Polly Voice, and return special hello
        cardText = `${preGreetingSpeechText} ${specialGreeting.greeting} ${postGreetingSpeechText}`;
        const randomVoice = randomize(specialGreeting.voice);
        speechText = `${preGreetingSpeechText} ${switchVoice(langSpecialGreeting, randomVoice)} ${postGreetingSpeechText} ${getRandomYesNoQuestion()}`;
        repromptOutput = `${getRandomYesNoQuestion()}`;
    } else if (isEntitled(greetingsPackProduct)) {
        // Customer has bought the Greetings Pack, but not the Premium Subscription. Return special hello greeting in Alexa voice
        cardText = `${preGreetingSpeechText} ${specialGreeting.greeting} ${postGreetingSpeechText}`;
        speechText = `${preGreetingSpeechText} ${langSpecialGreeting} ${postGreetingSpeechText} ${getRandomYesNoQuestion()}`;
        repromptOutput = `${getRandomYesNoQuestion()}`;
    } else {
        // Customer has bought neither the Premium Subscription nor the Greetings Pack Product.
        const theGreeting = getSimpleHello();
        // Determine if upsell should be made. returns true/false
        if (shouldUpsell(handlerInput)) {
            // Say the simple greeting, and then Upsell Greetings Pack
            speechText = `Here's your simple greeting: ${theGreeting}. By the way, you can now get greetings in more languages.`;
            return makeUpsell(speechText, greetingsPackProduct, handlerInput);
        }

        // Do not make the upsell. Just return Simple Hello Greeting.
        cardText = `Here's your simple greeting: ${theGreeting}.`;
        speechText = `Here's your simple greeting: ${theGreeting}. ${getRandomYesNoQuestion()}`;
        repromptOutput = `${getRandomYesNoQuestion()}`;
    }

    return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(repromptOutput)
        .withSimpleCard(skillName, cardText)
        .getResponse();
}

function isProduct(product) {
    return product && product.length > 0;
}
function isEntitled(product) {
    return isProduct(product) && product[0].entitled === 'ENTITLED';
}

function getAllEntitledProducts(inSkillProductList) {
    const entitledProductList = inSkillProductList.filter(record => record.entitled === 'ENTITLED');
    return entitledProductList;
}

function makeUpsell(preUpsellMessage, greetingsPackProduct, handlerInput) {
    const upsellMessage = `${preUpsellMessage}. ${greetingsPackProduct[0].summary}. ${getRandomLearnMorePrompt()}`;

    return handlerInput.responseBuilder
        .addDirective({
            type: 'Connections.SendRequest',
            name: 'Upsell',
            payload: {
                InSkillProduct: {
                    productId: greetingsPackProduct[0].productId,
                },
                upsellMessage,
            },
            token: 'correlationToken',
        })
        .getResponse();
}

function makeBuyOffer(theProduct, handlerInput) {
    return handlerInput.responseBuilder
        .addDirective({
            type: 'Connections.SendRequest',
            name: 'Buy',
            payload: {
                InSkillProduct: {
                    productId: theProduct[0].productId,
                },
            },
            token: 'correlationToken',
        })
        .getResponse();
}

function shouldUpsell(handlerInput) {
    if (handlerInput.requestEnvelope.request.intent === undefined) {
        // If the last intent was Connections.Response, do not upsell
        return false;
    }

    return randomize([true, false]); // randomize upsell
}

function switchVoice(speakOutput, voiceName) {
    if (speakOutput && voiceName) {
        return `<voice name="${voiceName}"> ${speakOutput} </voice>`;
    }
    return speakOutput;
}

function switchLanguage(speakOutput, locale) {
    if (speakOutput && locale) {
        return `<lang xml:lang="${locale}"> ${speakOutput} </lang>`;
    }
    return speakOutput;
}

function getBuyResponseText(productReferenceName, productName) {
    if (productReferenceName === 'Greetings_Pack') {
        return `With the ${productName}, I can now say hello in a variety of languages.`;
    } else if (productReferenceName === 'Premium_Subscription') {
        return `With the ${productName}, I can now say hello in a variety of languages, in different accents using Amazon Polly.`;
    }

    console.log('Product Undefined');
    return 'Sorry, that\'s not a valid product';
}
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak('Sorry, I can\'t understand the command. Please say again.')
            .reprompt('Sorry, I can\'t understand the command. Please say again.')
            .getResponse();
    },
};

function getRandomLearnMorePrompt() {
    const questions = [
        'Want to learn more about it?',
        'Should I tell you more about it?',
        'Want to learn about it?',
        'Interested in learning more about it?',
    ];
    return randomize(questions);
}

function getSpeakableListOfProducts(entitleProductsList) {
    const productNameList = entitleProductsList.map(item => item.name);
    let productListSpeech = productNameList.join(', '); // Generate a single string with comma separated product names
    productListSpeech = productListSpeech.replace(/_([^_]*)$/, 'and $1'); // Replace last comma with an 'and '
    return productListSpeech;
}


// *****************************************
// *********** Interceptors ************
// *****************************************
const LogResponseInterceptor = {
    process(handlerInput) {
        console.log(`RESPONSE = ${JSON.stringify(handlerInput.responseBuilder.getResponse())}`);
    },
};

const LogRequestInterceptor = {
    process(handlerInput) {
        console.log(`REQUEST ENVELOPE = ${JSON.stringify(handlerInput.requestEnvelope)}`);
    },
};
const CancelProductResponseHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'Connections.Response'
            && handlerInput.requestEnvelope.request.name === 'Cancel'
        );
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
        const monetizationClient = handlerInput.serviceClientFactory.getMonetizationServiceClient();
        const productId = handlerInput.requestEnvelope.request.payload.productId;
        let speechText;
        let repromptOutput;

        return monetizationClient.getInSkillProducts(locale).then((res) => {
            const product = res.inSkillProducts.filter(
                record => record.productId === productId,
            );

            console.log(
                `PRODUCT = ${JSON.stringify(product)}`,
            );

            if (handlerInput.requestEnvelope.request.status.code === '200') {
                // Alexa handles the speech response immediately following the cancellation request.
                // It then passes the control to our CancelProductResponseHandler() along with the status code (ACCEPTED, DECLINED, NOT_ENTITLED)
                // We use the status code to stitch additional speech at the end of Alexa's cancellation response.
                // Currently, we have the same additional speech (getRandomYesNoQuestion)for accepted, canceled, and not_entitled. You may edit these below, if you like.
                if (handlerInput.requestEnvelope.request.payload.purchaseResult === 'ACCEPTED') {
                    // The cancellation confirmation response is handled by Alexa's Purchase Experience Flow.
                    // Simply add to that with getRandomYesNoQuestion()
                    speechText = `${getRandomYesNoQuestion()}`;
                    repromptOutput = getRandomYesNoQuestion();
                } else if (handlerInput.requestEnvelope.request.payload.purchaseResult === 'DECLINED') {
                    speechText = `${getRandomYesNoQuestion()}`;
                    repromptOutput = getRandomYesNoQuestion();
                } else if (handlerInput.requestEnvelope.request.payload.purchaseResult === 'NOT_ENTITLED') {
                    // No subscription to cancel.
                    // The "No subscription to cancel" response is handled by Alexa's Purchase Experience Flow.
                    // Simply add to that with getRandomYesNoQuestion()
                    speechText = `${getRandomYesNoQuestion()}`;
                    repromptOutput = getRandomYesNoQuestion();
                }
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(repromptOutput)
                    .getResponse();
            }
            // Something failed.
            console.log(`Connections.Response indicated failure. error: ${handlerInput.requestEnvelope.request.status.message}`);

            return handlerInput.responseBuilder
                .speak('There was an error handling your purchase request. Please try again or contact us for help.')
                .getResponse();
        });
    },
};

const TellMeMoreAboutGreetingsPackIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'TellMeMoreAboutGreetingsPackIntent';
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
        const monetizationClient = handlerInput.serviceClientFactory.getMonetizationServiceClient();

        return monetizationClient.getInSkillProducts(locale).then((res) => {
            // Filter the list of products available for purchase to find the product with the reference name "Greetings_Pack"
            const greetingsPackProduct = res.inSkillProducts.filter(
                record => record.referenceName === 'Greetings_Pack',
            );

            // const premiumSubscriptionProduct = res.inSkillProducts.filter(
            //   record => record.referenceName === 'Premium_Subscription'
            // );

            if (isEntitled(greetingsPackProduct)) {
                // Customer has bought the Greetings Pack. They don't need to buy the Greetings Pack.
                const speechText = `Good News! You're subscribed to the Premium Subscription, which includes all features of the Greetings Pack. ${getRandomYesNoQuestion()}`;
                const repromptOutput = `${getRandomYesNoQuestion()}`;

                return handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(repromptOutput)
                    .getResponse();
            }
            // Customer has bought neither the Premium Subscription nor the Greetings Pack Product.
            // Make the upsell
            const speechText = 'Sure.';
            return makeUpsell(speechText, greetingsPackProduct, handlerInput);
        });
    },
};

const TellMeMoreAboutPremiumSubscriptionIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'TellMeMoreAboutPremiumSubscription';
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
        const monetizationClient = handlerInput.serviceClientFactory.getMonetizationServiceClient();

        return monetizationClient.getInSkillProducts(locale).then((res) => {
            // Filter the list of products available for purchase to find the product with the reference name "Greetings_Pack"
            // const greetingsPackProduct = res.inSkillProducts.filter(
            //   record => record.referenceName === 'Greetings_Pack'
            // );

            const premiumSubscriptionProduct = res.inSkillProducts.filter(
                record => record.referenceName === 'Premium_Subscription',
            );

            if (isEntitled(premiumSubscriptionProduct)) {
                // Customer has bought the Greetings Pack. They don't need to buy the Greetings Pack.
                const speechText = `Good News! You're subscribed to the Premium Subscription. ${premiumSubscriptionProduct[0].summary} ${getRandomYesNoQuestion()}`;
                const repromptOutput = `${getRandomYesNoQuestion()}`;

                return handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(repromptOutput)
                    .getResponse();
            }
            // Customer has bought neither the Premium Subscription nor the Greetings Pack Product.
            // Make the upsell
            const speechText = 'Sure.';
            return makeUpsell(speechText, premiumSubscriptionProduct, handlerInput);
        });
    },
};

const BuyGreetingsPackIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'BuyGreetingsPackIntent';
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
        const monetizationClient = handlerInput.serviceClientFactory.getMonetizationServiceClient();

        return monetizationClient.getInSkillProducts(locale).then((res) => {
            // Filter the list of products available for purchase to find the product with the reference name "Greetings_Pack"
            const greetingsPackProduct = res.inSkillProducts.filter(
                record => record.referenceName === 'Greetings_Pack',
            );

            const premiumSubscriptionProduct = res.inSkillProducts.filter(
                record => record.referenceName === 'Premium_Subscription',
            );

            if (isEntitled(premiumSubscriptionProduct)) {
                // Customer has bought the Premium Subscription. They don't need to buy the Greetings Pack.
                const speechText = `Good News! You're subscribed to the Premium Subscription, which includes all features of the Greetings Pack. ${getRandomYesNoQuestion()}`;
                const repromptOutput = `${getRandomYesNoQuestion()}`;

                return handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(repromptOutput)
                    .getResponse();
            } else if (isEntitled(greetingsPackProduct)) {
                // Customer has bought the Greetings Pack. Deliver the special greetings
                const speechText = `Good News! You've already bought the Greetings Pack. ${getRandomYesNoQuestion()}`;
                const repromptOutput = `${getRandomYesNoQuestion()}`;

                return handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(repromptOutput)
                    .getResponse();
            }
            // Customer has bought neither the Premium Subscription nor the Greetings Pack Product.
            // Make the buy offer for Greetings Pack
            return makeBuyOffer(greetingsPackProduct, handlerInput);
        });
    },
};

const GetSpecialGreetingsIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetSpecialGreetingsIntent';
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
        const monetizationClient = handlerInput.serviceClientFactory.getMonetizationServiceClient();

        return monetizationClient.getInSkillProducts(locale).then((res) => {
            // Filter the list of products available for purchase to find the product with the reference name "Greetings_Pack"
            const greetingsPackProduct = res.inSkillProducts.filter(
                record => record.referenceName === 'Greetings_Pack',
            );

            const premiumSubscriptionProduct = res.inSkillProducts.filter(
                record => record.referenceName === 'Premium_Subscription',
            );

            if (isEntitled(premiumSubscriptionProduct)) {
                // Customer has bought the Premium Subscription. They don't need to buy the Greetings Pack.
                const speechText = `Good News! You're subscribed to the Premium Subscription, which includes all features of the Greetings Pack. ${getRandomYesNoQuestion()}`;
                const repromptOutput = `${getRandomYesNoQuestion()}`;

                return handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(repromptOutput)
                    .getResponse();
            } else if (isEntitled(greetingsPackProduct)) {
                // Customer has bought the Greetings Pack. Deliver the special greetings
                const speechText = `Good News! You've already bought the Greetings Pack. ${getRandomYesNoQuestion()}`;
                const repromptOutput = `${getRandomYesNoQuestion()}`;

                return handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(repromptOutput)
                    .getResponse();
            }
            // Customer has bought neither the Premium Subscription nor the Greetings Pack Product.
            // Make the upsell
            const speechText = 'You need the Greetings Pack to get the special greeting.';
            return makeUpsell(speechText, greetingsPackProduct, handlerInput);
        });
    },
};

const BuyPremiumSubscriptionIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'BuyPremiumSubscriptionIntent';
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
        const monetizationClient = handlerInput.serviceClientFactory.getMonetizationServiceClient();

        return monetizationClient.getInSkillProducts(locale).then((res) => {
            // Filter the list of products available for purchase to find the product with the reference name "Premium_Subscription"
            const premiumSubscriptionProduct = res.inSkillProducts.filter(
                record => record.referenceName === 'Premium_Subscription',
            );

            // Send Connections.SendRequest Directive back to Alexa to switch to Purchase Flow
            return makeBuyOffer(premiumSubscriptionProduct, handlerInput);
        });
    },
};

const BuyResponseHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'Connections.Response'
            && (handlerInput.requestEnvelope.request.name === 'Buy'
                || handlerInput.requestEnvelope.request.name === 'Upsell');
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
        const monetizationClient = handlerInput.serviceClientFactory.getMonetizationServiceClient();
        const productId = handlerInput.requestEnvelope.request.payload.productId;

        return monetizationClient.getInSkillProducts(locale).then((res) => {
            const product = res.inSkillProducts.filter(
                record => record.productId === productId,
            );

            if (handlerInput.requestEnvelope.request.status.code === '200') {
                let preSpeechText;

                // check the Buy status - accepted, declined, already purchased, or something went wrong.
                switch (handlerInput.requestEnvelope.request.payload.purchaseResult) {
                    case 'ACCEPTED':
                        preSpeechText = getBuyResponseText(product[0].referenceName, product[0].name);
                        break;
                    case 'DECLINED':
                        preSpeechText = 'No Problem.';
                        break;
                    case 'ALREADY_PURCHASED':
                        preSpeechText = getBuyResponseText(product[0].referenceName, product[0].name);
                        break;
                    default:
                        preSpeechText = `Something unexpected happened, but thanks for your interest in the ${product[0].name}.`;
                        break;
                }
                // respond back to the customer
                return getResponseBasedOnAccessType(handlerInput, res, preSpeechText);
            }
            // Request Status Code NOT 200. Something has failed with the connection.
            console.log(
                `Connections.Response indicated failure. error: + ${handlerInput.requestEnvelope.request.status.message}`,
            );
            return handlerInput.responseBuilder
                .speak('There was an error handling your purchase request. Please try again or contact us for help.')
                .getResponse();
        });
    },
};

const PurchaseHistoryIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'PurchaseHistoryIntent'
        );
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
        const monetizationClient = handlerInput.serviceClientFactory.getMonetizationServiceClient();

        return monetizationClient.getInSkillProducts(locale).then(function (result) {
            const entitledProducts = getAllEntitledProducts(result.inSkillProducts);
            if (entitledProducts && entitledProducts.length > 0) {
                const speechText = `You have bought the following items: ${getSpeakableListOfProducts(entitledProducts)}. ${getRandomYesNoQuestion()}`;
                const repromptOutput = `You asked me for a what you've bought, here's a list ${getSpeakableListOfProducts(entitledProducts)}`;

                return handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(repromptOutput)
                    .getResponse();
            }

            const speechText = 'You haven\'t purchased anything yet. To learn more about the products you can buy, say - what can I buy. How can I help?';
            const repromptOutput = `You asked me for a what you've bought, but you haven't purchased anything yet. You can say - what can I buy, or say yes to get another greeting. ${getRandomYesNoQuestion()}`;

            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(repromptOutput)
                .getResponse();
        });
    },
};

const RefundGreetingsPackIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RefundGreetingsPackIntent'
        );
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
        const monetizationClient = handlerInput.serviceClientFactory.getMonetizationServiceClient();

        return monetizationClient.getInSkillProducts(locale).then((res) => {
            const premiumProduct = res.inSkillProducts.filter(
                record => record.referenceName === 'Greetings_Pack',
            );
            return handlerInput.responseBuilder
                .addDirective({
                    type: 'Connections.SendRequest',
                    name: 'Cancel',
                    payload: {
                        InSkillProduct: {
                            productId: premiumProduct[0].productId,
                        },
                    },
                    token: 'correlationToken',
                })
                .getResponse();
        });
    },
};

const CancelPremiumSubscriptionIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'CancelPremiumSubscriptionIntent'
        );
    },
    handle(handlerInput) {
        const locale = handlerInput.requestEnvelope.request.locale;
        const monetizationClient = handlerInput.serviceClientFactory.getMonetizationServiceClient();

        return monetizationClient.getInSkillProducts(locale).then((res) => {
            const premiumProduct = res.inSkillProducts.filter(
                record => record.referenceName === 'Premium_Subscription',
            );
            return handlerInput.responseBuilder
                .addDirective({
                    type: 'Connections.SendRequest',
                    name: 'Cancel',
                    payload: {
                        InSkillProduct: {
                            productId: premiumProduct[0].productId,
                        },
                    },
                    token: 'correlationToken',
                })
                .getResponse();
        });
    },
};

const WhatCanIBuyIntentHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'WhatCanIBuyIntent');
    },
    handle(handlerInput) {
        // Get the list of products available for in-skill purchase
        const locale = handlerInput.requestEnvelope.request.locale;
        const monetizationClient = handlerInput.serviceClientFactory.getMonetizationServiceClient();
        return monetizationClient.getInSkillProducts(locale).then((res) => {
            // res contains the list of all ISP products for this skill.
            // We now need to filter this to find the ISP products that are available for purchase (NOT ENTITLED)
            const purchasableProducts = res.inSkillProducts.filter(
                record => record.entitled === 'NOT_ENTITLED' &&
                    record.purchasable === 'PURCHASABLE',
            );

            // Say the list of products
            if (purchasableProducts.length > 0) {
                // One or more products are available for purchase. say the list of products
                const speechText = `Products available for purchase at this time are ${getSpeakableListOfProducts(purchasableProducts)}. 
                            To learn more about a product, say 'Tell me more about' followed by the product name. 
                            If you are ready to buy, say, 'Buy' followed by the product name. So what can I help you with?`;
                const repromptOutput = 'I didn\'t catch that. What can I help you with?';
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(repromptOutput)
                    .getResponse();
            }
            // no products are available for purchase. Ask if they would like to hear another greeting
            const speechText = 'There are no products to offer to you right now. Sorry about that. Would you like a greeting instead?';
            const repromptOutput = 'I didn\'t catch that. What can I help you with?';
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(repromptOutput)
                .getResponse();
        });
    },
};

