const EventEmitter = require('events').EventEmitter;
const isString = require('is-string');
const defaultParser = 0;
const defaultCommander = 0;
let finders = [
	{
		findCommand:(botName,cName) => new RegExp(`\\/${cName}(?:@${botName}|)(?:\\s|$)(.*)`),
		splitArgs:(argsStr) => {
			let regex = /"(?<val>[^"]*)"|[\S^]+|(?<errors>"[^"]*)/g,
				m,
				args = [];
				args["=ERRORS"] = [];
			try{
				while ((m = regex.exec(argsStr)) !== null) {
					if ((m.index ^ regex.lastIndex) == 0)
						regex.lastIndex++;

					if(m.groups.errors!==undefined){
						args["=ERRORS"].push(m.groups.errors);
						continue;
					}
					args.push(m.groups.val !== undefined? m.groups.val: m[0]);
				}
			}catch(e){}
			return args;
		}
	},
	{
		findCommand:(botName,cName) => new RegExp(`\\/${cName}(?:@${botName}|)(?:\\s|$)(.*)`),
		splitArgs:(argsStr) => {
			let regex = /(?<nameQ>\S+?)\s*?=\s*?"(?<valQ>[^"]*)"|(?<nameP>\S+?)\s*?=\s*?(?<valP>[^"\s]+)|(?<errors>\S+=|"[^"]+)/g,
				m,
				args = {
					"=ERRORS":[]
				};
			try{
				while ((m = regex.exec(argsStr)) !== null) {
					if ((m.index ^ regex.lastIndex) == 0)
						regex.lastIndex++;
					
					if(m.groups.errors!==undefined){
						args["=ERRORS"].push(m.groups.errors);
						continue;
					}
					
					if(m.groups.nameQ!==undefined)
						args[m.groups.nameQ] = m.groups.valQ;
					else
						args[m.groups.nameP] = m.groups.valP;
				}
			}catch(e){}
			return args;
		}
	}
];

const commanders = [
	function(msg,match){
		this.emit("receive", msg, finders[this._cParser].splitArgs(match[1]));
	},
	function(msg,match){
		if(~this._chatId && msg.chat.id^this._chatId)
			return;
		if(~this._userId && msg.from.id^this._userId)
			return;
		this.emit("receive", msg, finders[this._cParser].splitArgs(match[1]));
	}
];

async function init(th, commander) {
	th._bot.onText(finders[th._cParser].findCommand((await th._bot.getMe()).username, th._cName),
		commanders[commander].bind(th));
}

function normNum(num) {
	return typeof num == 'number' && !isNaN(num) && isFinite(num);
}

class Command extends EventEmitter{
	/**
     * Create new command object.
	 * @class Command
	 * @constructor
     * @param  {Object} bot
	 * instance of TelegramBot
     * @param  {String} commandName
	 * name of command (withou / )
	 * @param  {*} description
	 * description of command
     */
	constructor(bot, command, description){
		super();
		let commander = defaultCommander;
		if(!command)
			throw new Error("command name not found");
		if(!bot)
			throw new Error("bot object nt found");

		if(isString(command)){
			this._cName = command;
			this._cParser = defaultParser;
			this._chatId = -1;
			this._userId = -1;
		}else{
			this._cName = command.name;
			this._cParser = normNum(command.parser) ? command.parser : defaultParser;
			this._chatId = normNum(command.chatId) ? command.chatId : -1;
			this._userId = normNum(command.userId) ? command.userId : -1;
			if(~this._chatId || ~this._userId)
				commander = 1;
		}

		if(description)
			this.description = description;
		
		this._bot = bot;
		init(this, commander);	
	}
	onReceive(fn) {
		return this.on("receive",fn);	
	}
	offReceive(fn){
		return this.off("receive",fn);
	}
	/**
     * add new command parser
	 * @param  {Function} commandFinder
	 * function with 2 args - bot username and command name. 
	 * Should return a regular expression that checks whether the command is typed and separates the string with parameters.
     * @param  {Function} argsParser
	 * function with 1 arg - the parameter string that was separated in commandFinder. Should return array with args.
	 * @return  {Number}
	 * index of addedStyle
     */
	static addParser(commandFinder, argsParser){
		return finders.push({
			findCommand:commandFinder,
			splitArgs:argsParser
		}) - 1;
	}
	static getParser(index){
		return {...finders[index]};
	}
}

module.exports=Command;