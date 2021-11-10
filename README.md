# tg-couple-planning-bot

This bot uses [GrammY](https://grammy.dev/).

## Installation

1. Install the npm package
```
npm install
```

2. copy `.env.example` file and rename the copied file as `.env`

3. add your bot token to BOT_TOKEN in .env

## Starting the bot

1. Host the file 
```
node bot.js
```

2. Start your bot in Telegram

## Commands

```/start```: Start the bot with a welcome message.

```/new_date```: Start a step-by-step input for the date.

```/reset_date```: Clean up the current date (only if all the information is completed in the current date).

```/view_date```: View the current date.
