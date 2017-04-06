const restify = require('restify');
const builder = require('botbuilder');

/* Bot Setup */
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
})
const bot = new builder.UniversalBot(connector);

/* Server Setup */
const server = restify.createServer();
server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
server.post('/api/messages', connector.listen());

/* Dialogs */
bot.dialog('/', 
    (session, args, next) => {
        session.send('OK, I just need to ask you a few questions.')
        session.beginDialog('FillForm')
    }
);

bot.dialog('FillForm', [
    (session, args) => {
        session.dialogData.index = args ? args.index : 0;
        session.dialogData.form = args ? args.form : {};

        builder.Prompts.text(session, questions[session.dialogData.index].question);
    },
    (session, results) => {
        // Save users reply
        var field = questions[session.dialogData.index++].field;
        session.dialogData.form[field] = results.response;

        // Check for end of form
        if (session.dialogData.index >= questions.length) {
            session.privateConversationData.portForm = session.dialogData.form;
            session.beginDialog('FormComplete');
        } else {
            session.replaceDialog('FillForm', session.dialogData);
        }
    }
]);

bot.dialog('FormComplete', 
    (session, args) => {
        session.send("Form complete, submission made. Thank you!");
    }
);

/* Questions */
var questions = [
    {field: 'q1', question: 'This is question 1?'},
    {field: 'q2', question: 'This is question 2?'},
    {field: 'q3', question: 'This is question 3?'},
    {field: 'q4', question: 'This is question 4?'},
    {field: 'q5', question: 'This is question 5?'}
];