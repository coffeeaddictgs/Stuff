module.exports = function(app,Chat,Lobby){
	console.log('[AHCOR]'.inverse.yellow+"-"+"O servidor game foi ligado!".inverse.magenta);
	self = this;
	this.enviaInfosSala	= function(){
		app.io.route('chamaInfos',function(req){
			if(req.session.cookie && req.session.sala){
			req.io.emit('enviaInfos',Lobby.salaByid(req.session.sala));
			}
		});
	}
	this.stopClick		= function(){
		console.log('[AHCOR]'.inverse.yellow+"-"+"Ação stop está funcionando no game server!".inverse.magenta);
		app.io.route('stopButton',function(req){
			if(req.session.cookie && req.session.sala && Lobby.salaExists(req.session.sala)){
			var sala = Lobby.salaByid(req.session.sala);
			if(sala.initgame && sala.tempostopstamp <= (new Date().getTime())){
				sala.stop = 1;
				for(i in Lobby.salas){
					if(Lobby.salas[i].id == req.session.sala){
					for(y in Lobby.salas[i].users){
						Lobby.salas[i].users[y].verificando = 1;
					} //PODE ESTAR DANDO PROBLEMA NA SEGUNDA RODADA POIS O STAMP NAO SALVA NA RAIZ!
					sala.tempoavaliarstamp = timestampavaliar = sala.tempoavaliar+(new Date().getTime())+1000;
					app.io.room(sala.id).broadcast('stopado', {'timestampavaliar':timestampavaliar,'temas':sala.temas,'temasatual':sala.temassl[sala.ponteirotema],'ponteiro':sala.ponteirotema});
					break;
					}
				}
			}
			}
		});
	}
	this.recebePalavras = function(){
		console.log('[AHCOR]'.inverse.yellow+"-"+"Recepção de palavras ativada!".inverse.magenta);
		app.io.route('enviaplvr',function(req){
			if(req.session.cookie && req.session.sala && Lobby.salaExists(req.session.sala)){
				var user = Lobby.dadoUser(req.session.sala,req.session.id);
				var sala = Lobby.salaByid(req.session.sala);
				if(sala.initgame && sala.stop){
				if(user.verificando){
				user.verificando = 0;
				resparra = new Array();
				pontos	 = new Array();
				for(i in sala.temas){
					resparra[resparra.length] = [self.stringxResposta(req.data[i]),self.veracidadePalavra(req.data[i],sala.letratual)];
					pontos[pontos.length] = 0;
				}
				len = Lobby.stop.length;
				Lobby.stop[len] = [sala.id,req.session.id,resparra,pontos];
				app.io.room(sala.id).broadcast('plvrdaverificacao',{'resposta':Lobby.stop[len][2][sala.ponteirotema]});
				}else{
					for(i in Lobby.stop){
						if(Lobby.stop[i][0] == req.session.sala){
							req.io.emit('plvrdaverificacao',{'resposta':Lobby.stop[i][2][sala.ponteirotema]});
						}
					}
				}
				}
			}
		});
	}
	this.confirmaRespostas = function(){
		console.log('[AHCOR]'.inverse.yellow+"-"+"Função para confirmação e correção de respostas ligada!".inverse.magenta);
		app.io.route('confirmButton',function(req){
			if(req.session.cookie && req.session.sala && Lobby.salaExists(req.session.sala)){
			var user = Lobby.dadoUser(req.session.sala,req.session.id);
			var sala = Lobby.salaByid(req.session.sala);
			if(!user.pronto){
			for(i in  req.data){
				for(y in Lobby.stop){
					if(Lobby.stop[y][0] == req.session.sala){
						if(Lobby.stop[y][2][sala.ponteirotema][0] == req.data[i][1]){
							if(req.data[i][0]){
								Lobby.stop[y][3][sala.ponteirotema] += 1;								
							}
						}
					}
				}
			}
			user.pronto = 1;
			var prontos = 0;
			for(j in sala.users){
				if(sala.users[j].pronto){
					prontos+=1;
				}
			}
			if(sala.users.length == prontos){
				self.passaTema(sala,req);
			}
			app.io.room(sala.id).broadcast('attusersala',sala);
			}
			}
		});
	}
	this.passaTema = function(sala,req){
		sala.ponteirotema += 1;
		self.limparProntos(sala.id);
		sala.tempoavaliarstamp = tempo = sala.tempoavaliar+(new Date().getTime())+1000;
		app.io.room(sala.id).broadcast('proxTema',{'tema':sala.temassl[sala.ponteirotema],'tempo':tempo});
		if(sala.temas.length == sala.ponteirotema){
			self.acabaRodada(sala,req);
		}
	}
	this.passaTemaTempo = function(){
		console.log('[AHCOR]'.inverse.yellow+"-"+"Função da passagem de tema por tempo, ativada!".inverse.magenta);
		app.io.route('temaTempoExpires',function(req){
			if(req.session.cookie && req.session.sala && Lobby.salaExists(req.session.sala)){
				var sala = Lobby.salaByid(req.session.sala);
				if(sala.tempoavaliarstamp <= (new Date().getTime()) && sala.stop){
					self.passaTema(sala,req);
				}	
			}
		});
	}
	this.acabaRodada = function(sala,req){
		app.io.room(sala.id).broadcast('processando');
		sala.initgame = 0;
		sala.stop = 0;
		var ptsuser = new Array();
		var arrayrp = new Array();
		sala.rodada += 1;
		sala.ponteirotema = 0;
		var userquant = sala.users.length;
		/*for(y in Lobby.stop){
			if(Lobby.stop[y][0] == req.session.sala){
				arrayrp.push([Lobby.stop[y][2][0]]);
			}
		}*/
		//arrayrp = Lobby.unique(arrayrp);
		for(y in Lobby.stop){
			if(Lobby.stop[y][0] == req.session.sala){
				for(i in Lobby.stop[y][3]){
					if(userquant == 2){
						userquant = 4;
					}
					if(Math.round(userquant/2) <= Lobby.stop[y][3][i]){
						pass = 0;
						user  =Lobby.dadoUser(sala.id,Lobby.stop[y][1]);
						/*for(k in arrayrp){
							if(arrayrp[k] == Lobby.stop[y][2][0]){
								pass = 1;
								break;
							}
						}*/
						if(!pass){	
							user.pontos += 10;
							user.pontosrodada += 10;
							console.log('Dando 10 pontos para '+Lobby.stop[y][1]);
						}/*else{
							user.pontos += 5;
							user.pontosrodada += 5;
							console.log('Dando 5 pontos para '+Lobby.stop[y][1])
						}*/
					}
				}
			}
		}
		apagar = new Array();
		for(var i=0;i<Lobby.stop.length;i++){
			if(Lobby.stop[i][0] == req.session.sala){
				apagar.push(i);
			}
		}
		for(var x=0;x<apagar.length;x++){
			Lobby.stop.splice(apagar[x]-x,1);
		}
		for(x in sala.users){
			ptsuser.push([sala.users[x].pontos,sala.users[x].pontosrodada,sala.users[x].nome]);
			sala.users[x].pontosrodada = 0;
		}
		setTimeout(function(){
			sala.tempointervalostamp = temintervste = sala.tempointervalo+(new Date().getTime());
			app.io.room(sala.id).broadcast('acabaRodada',{'ptuser':ptsuser,'timeintervalo':temintervste});
		},3000);
		
	}
	this.initRodadaPorTempo = function(){
		app.io.route('IntRodadaTempo',function(req){
			if(req.session.cookie && req.session.sala && Lobby.salaExists(req.session.sala) && Lobby.verificaNomeEmSala(req.session.sala,req.session.id) && !Lobby.salaByid(req.session.sala).initgame){
				if(!Lobby.dadoUser(req.session.sala,req.session.id).pronto){
				for(i in Lobby.salas){
				if(Lobby.salas[i].id == req.session.sala){
				for(y in Lobby.salas[i].users){
					if(Lobby.salas[i].users[y].sessionid == req.session.id){
						var user = Lobby.salas[i].users[y];
						var sala = Lobby.salas[i];
						if(sala.users.length > 1){
						Lobby.salas[i].users[y].pronto = 1;
						var prontos = 0;
						for(j in sala.users){
							if(sala.users[j].pronto){
								prontos+=1;
							}
						}
						app.io.room(sala.id).broadcast('attusersala',sala);
						if(sala.users.length == prontos){
							Lobby.salas[i].initgame = 1;
							Lobby.salas[i].tempostopstamp = timestx = Lobby.salas[i].tempostop+(new Date().getTime())+1000;
							app.io.room(req.session.sala).broadcast('iniciandogame',{'temassl':Lobby.salas[i].temassl,'tempostop':timestx,'temas':Lobby.salas[i].temas});	
							self.escolheLetra(req.session.sala);
							self.limparProntos(req.session.sala);				
						}
						}else{
						Chat.mensagemServer('Impossível iniciar a sala com apenas um jogador!',req);
						}
						break;
					}
				}
				}
				}
			}else{
				for(i in Lobby.salas){
				if(Lobby.salas[i].id == req.session.sala){
				for(y in Lobby.salas[i].users){
					if(Lobby.salas[i].users[y].sessionid == req.session.id){
						Lobby.salas[i].users[y].pronto = 0;
						app.io.room(Lobby.salas[i].id).broadcast('attusersala',Lobby.salaByid(Lobby.salas[i].id));
						Chat.mensagemServer(Lobby.salas[i].users[y].nome+' não está pronto!',req);
						break;
					}
				}
				}
				}
			}
			}	
		});
	}
	this.verificaPronto = function(){
		console.log('[AHCOR]'.inverse.yellow+"-"+"Função de verificação de prontos está ligada!".inverse.magenta);
		app.io.route('readyButton',function(req){
			if(req.session.cookie && req.session.sala && Lobby.salaExists(req.session.sala) && Lobby.verificaNomeEmSala(req.session.sala,req.session.id) && !Lobby.salaByid(req.session.sala).initgame){
			if(!Lobby.dadoUser(req.session.sala,req.session.id).pronto){
				for(i in Lobby.salas){
				if(Lobby.salas[i].id == req.session.sala){
				for(y in Lobby.salas[i].users){
					if(Lobby.salas[i].users[y].sessionid == req.session.id){
						var user = Lobby.salas[i].users[y];
						var sala = Lobby.salas[i];
						if(sala.users.length > 1){
						Lobby.salas[i].users[y].pronto = 1;
						app.io.room(sala.id).broadcast('attusersala',sala);
						Chat.mensagemServer(user.nome+' está pronto para jogar!',req);
						var prontos = 0;
						for(j in sala.users){
							if(sala.users[j].pronto){
								prontos+=1;
							}
						}
						if(sala.users.length == prontos){
							Lobby.salas[i].initgame = 1;
							Lobby.salas[i].tempostopstamp = timestx = Lobby.salas[i].tempostop+(new Date().getTime())+1000;
							app.io.room(req.session.sala).broadcast('iniciandogame',{'temassl':Lobby.salas[i].temassl,'tempostop':timestx,'temas':Lobby.salas[i].temas});	
							self.escolheLetra(req.session.sala);
							self.limparProntos(req.session.sala);				
						}
						}else{
						Chat.mensagemServer('Impossível iniciar a sala com apenas um jogador!',req);
						}
						break;
					}
				}
				}
				}
			}else{
				for(i in Lobby.salas){
				if(Lobby.salas[i].id == req.session.sala){
				for(y in Lobby.salas[i].users){
					if(Lobby.salas[i].users[y].sessionid == req.session.id){
						Lobby.salas[i].users[y].pronto = 0;
						app.io.room(Lobby.salas[i].id).broadcast('attusersala',Lobby.salaByid(Lobby.salas[i].id));
						Chat.mensagemServer(Lobby.salas[i].users[y].nome+' não está pronto!',req);
						break;
					}
				}
				}
				}
			}
			}
		})
	}
	this.limparProntos = function(sala){
		for(i in Lobby.salas){
			if(Lobby.salas[i].id == sala){
				for(y in Lobby.salas[i].users){
					Lobby.salas[i].users[y].pronto = 0;
					app.io.room(Lobby.salas[i].id).broadcast('attusersala',Lobby.salas[i]);
				}
				break;
			}
		}
	}
	this.escolheLetra = function(salaid){
		var sala = Lobby.salaByid(salaid);
		var letra = sala.letras[Math.floor(Math.random()*sala.letras.length)];
		sala.letratual = letra;
		app.io.room(salaid).broadcast('envialetra',{'letraatual':letra});
	}
	this.veracidadePalavra = function(palavra,letra){
		if(palavra[0] != letra || palavra == "" || palavra.length < 1){
			return 0;
		}
		else{
			return 1;
		}
	}
	this.stringxResposta = function(palavra) {
		if(palavra != "" && palavra != undefined && palavra != null){
        var string = palavra.toUpperCase();
        for (var x = 0;x<string.length;x++) {
        string = string.replace(/[ÂÁÀÃ]/,"A");
        string = string.replace(/[ÉÈÊ]/,"E");
        string = string.replace(/[ÍÌÎ]/,"I");
        string = string.replace(/[ÔÕÓÒ]/,"O");
        string = string.replace(/[ÚÙÛ]/,"U");
        string = string.replace("Ç","C");
        }
        return string;
        }else{
        return "ERROR - ENTRE EM CONTATO COM A ADMINISTRAÇÃO - ERROR: 9008";
        }
    }
}
