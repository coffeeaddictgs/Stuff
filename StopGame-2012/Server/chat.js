module.exports = function(app){
	console.log('[AHCOR]'.inverse.yellow+"-"+"O servidor do chat foi ligado!".inverse.green);
	this.recebeMensagem		= function(){
		console.log('[AHCOR]'.inverse.yellow+"-"+"Recebimento de mensagens pelo chat ativo!".inverse.green);
		console.log('[AHCOR]'.inverse.yellow+"-"+"Função de mensagens privadas server->client está ativa!".inverse.green);
		app.io.route('rmensagem',function(req){
			if(req.session){	
			if(req.session.nome && req.session.sala && req.data){
				app.io.room(req.session.sala).broadcast('recebemsg',{'nome':req.session.nome,'mensagem':req.data});
			}
			}
		});
	}
	this.mensagemServer		= function(msg,req){
		app.io.room(req.session.sala).broadcast('recebemsgsys',msg);
	}
	this.mensagemEmit		= function(msg,req){
		req.io.emit('recebemsgsys',msg);
	}
}
