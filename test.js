const EventEmitter = require('events').EventEmitter;
const Command = require('./index');

class FakeBot extends EventEmitter{
	sendText(msg,txt){
		this.emit("text",msg,txt);
	}
	onText(regex,fn){
		this.on("text",(msg, txt)=>{
			let match = txt.match(regex);
			if(match)
				fn(msg,match);
		});
	}
	async getMe(){
		return {username:"testBot"};
	}
}
console.log("Bot username: testBot");
const bot = new FakeBot();

let command1 = new Command(bot,"testCommand1").onReceive(function(msg,args){
	console.log(
`
=================
test1, parser 0, normal command

command object: new Command(bot, "testCommand1")
command: /testCommand1 arg1 arg2 "arg 3"
onReceive result args:
`);
	console.log(args);
});
(async ()=>{
	await command1.initialization;
	bot.sendText({},`/testCommand1 arg1 arg2 "arg 3"`);
})();

let command2 = new Command(bot,{
	name:"testCommand2",
	parser:1
}).onReceive(function(msg,args){
	console.log(
`
=================
test1, parser 1, normal command

command object: 
	new Command(bot,{
		name:"testCommand2",
		parser:1
	})
command: /testCommand2 arg1=value1 arg2  = value2 arg3= "value 3"
onReceive result args:
`);
	console.log(args);
});
(async ()=>{
	await command2.initialization;
	bot.sendText({},`/testCommand2 arg1=value1 arg2  = value2 arg3= "value 3"`);
})();

let command3 = new Command(bot,"testCommand3").onReceive(function(msg,args){
	console.log(
`
=================
test3, parser 0, command with errors

command object: new Command(bot, "testCommand3")
command: /testCommand3 arg1 "ar
onReceive result args:
`);
	console.log(args);
});
(async ()=>{
	await command3.initialization;
	bot.sendText({},`/testCommand3 arg1 "ar`);
})();

let command4 = new Command(bot,{
	name:"testCommand4",
	parser:1
}).onReceive(function(msg,args){
	console.log(
`
=================
test4, parser 1, command with errors

command object: 
	new Command(bot,{
		name:"testCommand4",
		parser:1
	})
command: /testCommand4 arg1= arg2  = value2 arg3= "value 3
onReceive result args:
`);
	console.log(args);
});
(async ()=>{
	await command4.initialization;
	bot.sendText({},`/testCommand4 arg1= arg2  = value2 arg3= "value 3`);
})();

let command5 = new Command(bot,{
	name:"testCommand5",
	parser:0,
	userId:22,
	chatId:33
}).onReceive(function(msg,args){
	console.log(
`
=================
test5, parser 0, normal command, with checking userId and chatId - true result

command object: 
	new Command(bot,{
		name:"testCommand5",
		parser:0,
		userId:22,
		chatId:33
	})
command: /testCommand5 arg = test
receive from chat 33, user 22
onReceive result args:
`);
	console.log(args);
});
(async ()=>{
	await command5.initialization;
	bot.sendText({
		chat:{
			id:33
		},
		from:{
			id:22
		}
	},`/testCommand5 arg test`);
})();


let command6 = new Command(bot,{
	name:"testCommand6",
	parser:0,
	userId:22,
	chatId:33
}).onReceive(function(msg,args){
	console.log(
`
=================
test6, parser 0, normal command, with checking userId and chatId - false result

command object: 
	new Command(bot,{
		name:"testCommand6",
		parser:0,
		userId:22,
		chatId:33
	})
command: /testCommand5 arg = test
receive from chat 31, user 22
onReceive result args:
`);
	console.log(args);
});
(async ()=>{
	await command6.initialization;
	bot.sendText({
		chat:{
			id:31
		},
		from:{
			id:22
		}
	},`/testCommand6 arg test`);

	console.log(
`
=================
test 6 cant show results!
`);
})();