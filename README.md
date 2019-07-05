#telegram-command-handler

`npm i telegram-command-handler`

*depends on [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api "node-telegram-bot-api")*
### Features
- parse commands with/without bot nickname (like as /command@myBot a b ).
- adding description to the command.
- add own command parser or choose among the ready
- set the chatid and userid of which the command will be processed

###Usage

------------

**1.**
*create new command object*- 
```js
new Command(currentBotObject, command, description);
currentBotObject - instance of TelegramBot
command - Object or String
description - *
```
```js
if command is Object - gets
{
	name: String command name (without / )
	parser: Number of parser (the list is below). Default = 0
	chatId: Number id of chat. Default = -1 (off)
	userId: Number id of user. Defalut = -1 (off)
}
else gets String command name
```
**List of parsers**:
- Index: 0; Command format: `/command arg1 "arg2 ..."`; Returns `Array [arg1,arg2] with field "=ERRORS" Array []`
- index: 1; Command format: `/command name1=value name2="value ..."`; Returns `Object {name1:value, name2:value, "=ERRORS":[]}`

**warnings**: 
- if you do not specify userId AND! chatId, handler will use more efficient function.
- "=ERRORS" array contains invalid fragments of args string.

------------

**2.**
*add listener on command receiving* - `command.on("receive",function(msg, arguments){...})`
msg - normal message object like as in `.on("message")`
Also listener can be added with `command.onReceive(handler)` and removed with `command.offReceive(handler)`

------------

**3.**
*To add own parser* - use `Command.addParser(commandFinder(botName, commandName){}, argsParser(argsString){})` (this is static method)

------------

**4.**
*To get parser* - use `Command.getParser(index)` (this is static method)

- `commandFInder` - function with 2 String args - bot username and command name.
Should return a regular expression that checks whether the command is typed and separates the string with parameters.
Example of return `commandFInder("myBot","command")` when the current command is `/command@myBot arg1 arg2`: `[anything, " arg1 arg2"]`
As you can see, element number 1 should always contain a string of parameters.

- `argsParser` - function with 1 arg - the parameters string that was separated in commandFinder. Should return array, object etc with args.

###Example
```js
const BotAPI = require('node-telegram-bot-api');
const Command = require('telegram-command-handler');
const bot = new BotAPI(options.token);//add longpolling, webhook etc

//....

const help = new Command(bot, "help",
`*help*
_Description_: get commands description. 
_Usage_: /help [command] 
_Examples_:
|+- to get all commands print /help
|+- to get about gettrack - /help gettrack`)

help.on("receive", function(msg, args){
	if(!args["=ERRORS"].length)
		bot.sendMessage(msg.chat.id, `args: ${args.join(' ')}`);
});
```

###Warnings
- this module uses ES6 futures!