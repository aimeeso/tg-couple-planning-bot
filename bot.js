require('dotenv').config();
const { Bot, session } = require("grammy");
const Constants = require('./constants');

if (process.env.BOT_TOKEN === undefined) {
    throw new TypeError('BOT_TOKEN must be provided!')
}

// Create an instance of the `Bot` class and pass your authentication token to it.
const bot = new Bot(process.env.BOT_TOKEN); // <-- put your authentication token between the ""

const date_template = {
    completed: false, // whether we know all the details of the date
    step: 0,
    date: '',
    time: '',
    location: '',
    description: '', //short description of the date (movie? dinner?)
}

// one date info
// install session middleware, and define the initial session value
bot.use(
    session({
        initial() {
            return {
                dates: [],
                inputting: false,
                inputing_date: {
                    completed: false, // whether we know all the details of the date
                    step: 0,
                    date: '',
                    time: '',
                    location: '',
                    description: '', //short description of the date (movie? dinner?)
                },
                viewing_date: false,
                //old - single date (remove later)
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
    { command: "test_new_date", description: "Create a new date (multiple date)" },
]);

// React to /start command
bot.command("start", (ctx) => ctx.reply("Welcome! Have fun on your dates! call /new_date to create a new date!"));

//React to /new_date command
bot.command("new_date", (ctx) => {
    if (ctx.session.step > 0 && ctx.session.step < Constants.totalSteps) {
        ctx.reply("You are already creating a date! call /reset_date if you are happy with the input.");
    }
    else {
        ctx.session.completed = false;
        ctx.session.step = 1;
        ctx.reply("Great! A new date! Tell me everything!");
        ctx.reply("Lets start with the date!", {
            // force Telegram client to open the reply feature
            reply_markup: { force_reply: true, input_field_placeholder: "date, e.g. 2021-11-09 (tue)" },
        });
    }
});

//React to /new_date command
bot.command("test_new_date", (ctx) => {
    if (ctx.session.inputting) {
        ctx.reply("You are already inputting a new date!");
    }
    else {
        ctx.session.inputting = true;
        ctx.session.inputing_date.completed = false;
        ctx.session.inputing_date.step = 1;
        ctx.reply("Great! A new date! Tell me everything!");
        ctx.reply("Lets start with the date!", {
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
    ctx.reply("All data cleared! Call /new_date if you want to start a new date.");
});

//React to /reset_date command
bot.command("view_date", (ctx) => {
    //old - only one date
    // if (ctx.session.completed) {
    //     ctx.reply(
    //         "*The date is coming\\!* \n *Date: *" + ctx.session.date + "\n *Time: *" + ctx.session.time + "\n *Meeting spot: *" + ctx.session.location + "\n *What you gonna do: *" + ctx.session.description,
    //         { parse_mode: "MarkdownV2" },
    //     );
    // }
    // else {
    //     ctx.reply("You don't have/have not completed a date plan yet!");
    // }
    if(ctx.session.inputting) {
        ctx.reply("You are inputting a date!");
    }
    else if(ctx.session.dates.length <= 0) {
        ctx.reply("You don't have any date plan yet!");
    }
    else {
        ctx.reply('Please input the date', {
            // force Telegram client to open the reply feature
            reply_markup: { force_reply: true, input_field_placeholder: placeholder },
        });      
    }
});

bot.on("message:text", (ctx) => {
    //only reply when started a new date
    // if (ctx.session.step > 0 && ctx.session.step < Constants.totalSteps) {
    //     var replyMessage = Constants.replies[ctx.session.step - 1];
    //     var placeholder = Constants.placeholders[ctx.session.step - 1];

    //     switch (ctx.session.step) {
    //         case 1:
    //             ctx.session.date = ctx.message.text;
    //             break;
    //         case 2:
    //             ctx.session.time = ctx.message.text;
    //             break;
    //         case 3:
    //             ctx.session.location = ctx.message.text;
    //             break;
    //         case 4:
    //             ctx.session.description = ctx.message.text;
    //             ctx.session.completed = true;
    //             ctx,session.d
    //             break;
    //     }

    //     ctx.session.step = ctx.session.step + 1;

    //     if(placeholder == '') {
    //         ctx.reply(replyMessage);
    //     }
    //     else {
    //         ctx.reply(replyMessage, {
    //             // force Telegram client to open the reply feature
    //             reply_markup: { force_reply: true, input_field_placeholder: placeholder },
    //         });            
    //     }
    // }

    if (ctx.session.inputing_date.step > 0 && ctx.session.inputing_date.step < Constants.totalSteps) {
        var replyMessage = Constants.replies[ctx.session.inputing_date.step - 1];
        var placeholder = Constants.placeholders[ctx.session.inputing_date.step - 1];

        switch (ctx.session.inputing_date.step) {
            case 1:
                ctx.session.inputing_date.date = ctx.message.text;
                ctx.session.inputing_date.step = ctx.session.inputing_date.step + 1;
                break;
            case 2:
                ctx.session.inputing_date.time = ctx.message.text;
                ctx.session.inputing_date.step = ctx.session.inputing_date.step + 1;
                break;
            case 3:
                ctx.session.inputing_date.location = ctx.message.text;
                ctx.session.inputing_date.step = ctx.session.inputing_date.step + 1;
                break;
            case 4:
                ctx.session.inputing_date.description = ctx.message.text;
                ctx.session.inputing_date.completed = true;
                //push the new date to dates
                ctx.session.dates.push(ctx.session.inputing_date);
                //reset the inputting date
                ctx.session.inputing_date = {
                    completed: false,
                    step: 0,
                    date: '',
                    time: '',
                    location: '',
                    description: '', 
                };
                //close inputting
                ctx.session.inputting = false;
                break;
        }

        if(placeholder == '') {
            ctx.reply(replyMessage);
        }
        else {
            ctx.reply(replyMessage, {
                // force Telegram client to open the reply feature
                reply_markup: { force_reply: true, input_field_placeholder: placeholder },
            });            
        }
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