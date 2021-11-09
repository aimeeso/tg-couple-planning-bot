require('dotenv').config();
const { Bot, session } = require("grammy");
const Constants = require('./constants');

if (process.env.BOT_TOKEN === undefined) {
    throw new TypeError('BOT_TOKEN must be provided!')
}

// Create an instance of the `Bot` class and pass your authentication token to it.
const bot = new Bot(process.env.BOT_TOKEN); // <-- put your authentication token between the ""

// one date info
// install session middleware, and define the initial session value
bot.use(
    session({
        initial() {
            return {
                completed: false, // whether we know all the details of the date
                step: 0,
                date: '',
                time: '',
                location: '',
                description: '', //short description of the date (movie? dinner?)
            };
        },
    }),
);


// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.

bot.api.setMyCommands([
    { command: "start", description: "Start the bot" },
    // { command: "help", description: "Show help text" },
    // { command: "settings", description: "Open settings" },
    { command: "new_date", description: "Create a new date" },
    { command: "reset_date", description: "Reset the current date" },
    { command: "view_date", description: "View the current date" },
]);

// React to /start command
bot.command("start", (ctx) => ctx.reply("Welcome! Have fun on your dates! call /new_date to create a new date!"));

//React to /new_date command
bot.command("new_date", (ctx) => {
    if (ctx.session.step > 0 || ctx.session.step < Constants.totalSteps) {
        ctx.reply("You are already creating a date! call /reset_date if you are happy with the input.");
    }
    else {
        ctx.session.completed = false;
        ctx.session.step = 1;
        ctx.reply("Great! A new date! Tell me everything! Lets start with the date!", {
            // force Telegram client to open the reply feature
            reply_markup: { force_reply: true, input_field_placeholder: "date, e.g. 2021-11-09 (tue)" },
        });
    }
});

//React to /reset_date command
bot.command("reset_date", (ctx) => {
    ctx.session.completed = false;
    ctx.session.step = 0;
    ctx.session.date = '';
    ctx.session.time = '';
    ctx.session.location = '';
    ctx.session.description = '';
    ctx.session.completed = false;
    ctx.session.step = 1;
    ctx.reply("All data cleared! Call /new_date if you want to start a new date.");
});

//React to /reset_date command
bot.command("view_date", (ctx) => {
    if (ctx.session.completed) {
        ctx.reply(
            '<p><b>The date is coming!</b></p><p><b>Date:</b>' + ctx.session.date + '</p><p><b>Time:</b>' + ctx.session.time + '</p><p><b>Meeting spot:</b>' + ctx.session.location + '</p><p><b>What you gonna do:</b>' + ctx.session.description + '</p>',
            { parse_mode: "HTML" },
        );
    }
    else {
        ctx.reply("You don't have/have not completed a date plan yet!");
    }
});

bot.on("message:text", (ctx) => {
    //only reply when started a new date
    if (ctx.session.step > 0 || ctx.session.step < Constants.totalSteps) {
        var replyMessage = Constants.replies[ctx.session.step - 1];

        switch (ctx.session.step) {
            case 1:
                ctx.session.date = ctx.message.text;
                break;
            case 2:
                ctx.session.time = ctx.message.text;
                break;
            case 3:
                ctx.session.location = ctx.message.text;
                break;
            case 4:
                ctx.session.description = ctx.message.text;
                ctx.session.completed = true;
                break;
        }

        ctx.session.step = ctx.session.step + 1;

        ctx.reply(replyMessage);
    }
});

// catch error if any
bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    console.error(`Constants.totalSteps:`+Constants.totalSteps);
    console.error(`Constants.replies:`+Constants.replies);
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
      console.error("Could not contact Telegram:", e);
    } else {
      console.error("Unknown error:", e);
    }
  });

// Start your bot
bot.start();