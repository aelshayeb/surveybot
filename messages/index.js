/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://docs.botframework.com/en-us/node/builder/chat/dialogs/#waterfall
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Define the SurveysDBNEW constructor
var SurveysDBNEW = [];
// Define the Question constructor
var Survey = function() {};
// Define the Question constructor
var Question = function() {};

function getById(arr, uniqueIDCheck) {
    for (var d = 0, len = arr.length; d < len; d += 1) {
        if (arr[d].uniqueID === uniqueIDCheck) {
            return arr[d];
        }
    }
}

bot.dialog('/', [
    function (session) {
        builder.Prompts.choice(session, "Hello... What would like to do today ?", ["Create a survey", "Fill a survey", "Statistics", "Contact us"]);
    },
    function (session, results) {
        if (results.response.entity === "Create a survey") {
          session.beginDialog('/createsurvey');
        } else if (results.response.entity === "Fill a survey") {
          session.beginDialog('/fillsurvey');
        } else if (results.response.entity === "Statistics") {
          session.beginDialog('/stats');
        }
        else {
          session.beginDialog('/contactus');
        }
    }
]);

function checkExitOrEnd(session, results) {
    if(results.response == "restart" || results.response == "Restart" || results.response == "exit")
    {
        session.send("Restarting...");
        session.cancelDialog();
        session.endConversation();
        return true;
    } else if(results.response == "end" || results.response == "End" || results.response == "Save and Quit")
    {
        session.userData.survey.uniqueID = "SRvEy" + SurveysDBNEW.length + "oRtNeOd";
        SurveysDBNEW.push(session.userData.survey);
        session.send("Record Saved. Survey ID: ");
        session.send(session.userData.survey.uniqueID);
        session.userData.survey = {};
        session.cancelDialog();
        session.endConversation();
        return true;
    }
    return false;
}

bot.dialog('/stats', [
    function (session) {
      var msg = new builder.Message(session)
                .textFormat(builder.TextFormat.xml)
                .attachments([
                  new builder.HeroCard(session)
                    .title("User Responses")
                    .subtitle("Dynamic Chart")
                    .text("The Space Needle is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        builder.CardImage.create(session, "http://www.apacmarket.com/admin/graph-image/graph.jpg")
                    ])
                    .tap(builder.CardAction.openUrl(session, "http://www.apacmarket.com/admin/graph-image/graph.jpg"))
                  ]);
      session.endDialog(msg);
    }
]);

bot.dialog('/createsurvey', [
    function (session) {
      session.userData.survey = new Survey();
      session.userData.survey.questions = [];
      builder.Prompts.text(session, "Awesome, let's create a survey. What's your name?");
    },
    function (session, results) {
      if(!checkExitOrEnd(session, results))
      {
        session.userData.name = results.response;
        session.send("Hi " + session.userData.name + ", let's get started. When you're done type 'end' to end the session or type 'restart' to begin another survey without saving.");
        session.beginDialog('/createquestion');
      }
    }
]);


bot.dialog('/fillsurvey', [
    function (session) {
      // session.send(JSON.stringify(SurveysDBNEW));
      builder.Prompts.text(session, "Please enter the survey ID");
    },
    function (session, results) {
      if(!checkExitOrEnd(session, results))
      {
          // Get the survey
          // session.send("Before choosen");
          session.userData.choosenSurvey = getById(SurveysDBNEW,results.response);
          // session.send("Before beginDialog");
          session.beginDialog('/qadialog');
        }
      },
      function (session, results) {
        if(!checkExitOrEnd(session, results))
        {
            // End the survey
            session.send("Thank you for doing the survey with us. We hope you had a great time. :)");
          }
        }
]);

bot.dialog('/contactus', [
    function (session) {
      var msg = new builder.Message(session)
                .textFormat(builder.TextFormat.xml)
                .attachments([
                  new builder.HeroCard(session)
                    .title("RobotoBoto")
                    .subtitle("Cell: +1 (416) 558 - 4560")
                    .text("Email: mobaidullah@ryerson.ca\n------- . -------\nCopyright HackTheValley\n------- . -------")
                    .images([
                        builder.CardImage.create(session, "https://www.hackvalley.com/img/mlh-logo-color.png")
                    ])
                    .tap(builder.CardAction.openUrl(session, "https://mlh.io/seasons/na-2017/events?utm_source=na-2017&utm_medium=TrustBadge&utm_campaign=na-2017&utm_content=white"))
                  ]);
      session.endDialog(msg);
    }
]);

bot.dialog('/createquestion', [
    function (session, arg) {
      // session.send("Before new Questions");
      session.userData.newq = new Question();
      // session.send("Before new Choice");
      builder.Prompts.choice(session, "What type of question would you like to ask ?", ["text", "choice", "number", "Save and Quit"]);
    },
    function (session, results, next) {
      // This doesn't work because there is a choice question before.
      // So the framework by default returns a response before it can check for the string.
      if(!checkExitOrEnd(session, results))
      {
        session.userData.newq.type = results.response.entity;
        if(session.userData.newq.type === "choice")
        {
          session.userData.newq.choices = [];
          session.beginDialog('/createchoiceslol');
        }
        else {
          next();
        }
      }
    },
    function (session, results) {
      if(!checkExitOrEnd(session, results))
      {
        builder.Prompts.text(session, "What's your question?");
      }
    },
    function (session, results) {
      if(!checkExitOrEnd(session, results))
      {
        // session.send("Before setting text");
        session.userData.newq.text = results.response;
        // session.send("Before push");
        session.userData.survey.questions.push(session.userData.newq);
        // session.send("Before replacing");
        session.replaceDialog('/createquestion', {});
      }
    }
]);

bot.dialog('/createchoiceslol', [
    function (session) {
      builder.Prompts.number(session, "How many choices would you like to have?");
    },
    function (session, results) {
      if(!checkExitOrEnd(session, results))
      {
        session.userData.noofchoices = results.response;
        session.beginDialog('/choicefilldialog');
      }
    }
]);

bot.dialog('/choicefilldialog', [
    function (session, args) {
        // Save previous state (create on first call)
        session.dialogData.index = args ? args.index : 0;
        session.dialogData.form = args ? args.form : {};

        // session.send("Before choice number");
        builder.Prompts.text(session, "Choice # " + (session.dialogData.index+1) + " Of " + session.userData.noofchoices + ":");
    },
    function (session, results) {
        // Save users reply
        // var field = questions[session.dialogData.index++].field;
        // session.dialogData.form[field] = results.response;
        if(!checkExitOrEnd(session, results))
        {
          session.userData.newq.choices.push(results.response);
        }
        // session.send("Before end check");
        session.dialogData.index++;
        // Check for end of form
        if (session.dialogData.index >= session.userData.noofchoices) {
            // Return completed form
            session.endDialogWithResult({ response: session.dialogData.form });
        } else {
            // Next field
            session.replaceDialog('/choicefilldialog', session.dialogData);
        }
    }
]);

// Add Q&A dialog
bot.dialog('/qadialog', [
    function (session, args) {
        // Save previous state (create on first call)
        session.dialogData.index = args ? args.index : 0;
        session.dialogData.form = args ? args.form : {};

        // ession.send("Before question number");
        session.send("Question" + (session.dialogData.index+1) + " Of " + session.userData.choosenSurvey.questions.length + ":");
        // session.send("Before switch");
        switch (session.userData.choosenSurvey.questions[session.dialogData.index].type) {
          case "text":
          {
            // session.send("Before prompt");
            // Prompt user for next field
            builder.Prompts.text(session, session.userData.choosenSurvey.questions[session.dialogData.index].text);
            break;
          }
          case "number":
          {
            builder.Prompts.number(session, session.userData.choosenSurvey.questions[session.dialogData.index].text);
            break;
          }
          case "choice":
          {
            var lmao = session.userData.choosenSurvey.questions[session.dialogData.index].choices;
            lmao.push('exit');
            builder.Prompts.choice(session, session.userData.choosenSurvey.questions[session.dialogData.index].text, lmao);
            break;
          }
        }
    },
    function (session, results) {
        // Save users reply
        // var field = questions[session.dialogData.index++].field;
        // session.dialogData.form[field] = results.response;

        if(!checkExitOrEnd(session, results))
        {
          // session.send("Before end check");
          session.dialogData.index++;
          // Check for end of form
          if (session.dialogData.index >= session.userData.choosenSurvey.questions.length) {
              // Return completed form
              session.endDialogWithResult({ response: session.dialogData.form });
          } else {
              // Next field
              session.replaceDialog('/qadialog', session.dialogData);
          }
        }
    }
]);


/*
bot.dialog('/showquestion', [
    function (session) {
      switch (session.userData.choosenSurvey.questions[session.userData.currentq].type) {
        case "text":
        {
          builder.Prompts.text(session, session.userData.choosenSurvey.questions[session.userData.currentq].text);
          break;
        }
        case "number":
        {
          builder.Prompts.number(session, session.userData.choosenSurvey.questions[session.userData.currentq].text);
          break;
        }
        case "choice":
        {
          builder.Prompts.choice(session, session.userData.choosenSurvey.questions[session.userData.currentq].text, session.userData.choosenSurvey.questions[session.userData.currentq].choices);
          break;
        }
      }
    }
]);*/



if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}
