module.exports = function(app,Chat){
	console.log('[AHCOR]'.inverse.yellow+"-"+"O servidor lobby foi ligado!".inverse);
	var self = this;
	this.salas = [];
	this.stop = [];
	this.count = 0;
	this.abresala = function(){
	console.log('[AHCOR]'.inverse.yellow+"-"+"Sistema para abertura de salas ligado!".inverse);
	var mself = this;
		app.io.route('AbrirSala',function(dados){
			if(dados.session.cookie){	
			if(dados.data.nomedono.length > 0){
			if(dados.data.nomesala.length > 0){
				if(dados.data.limitejogadores >= 4 && dados.data.limitejogadores <= 14){
					if(dados.data.numerorodadas >= 4 && dados.data.numerorodadas <= 18){
						if(dados.data.temas.length >= 4){
							if(dados.data.letras.length >= 10){
								if(dados.data.tempostop >= 0 && dados.data.tempostop <= 180){
									if(dados.data.tempoavaliar >= 10 && dados.data.tempoavaliar <= 120){
										if(dados.data.tempointervalo >= 20 && dados.data.tempointervalo <= 60){
											multierror = 0;
											for(var i = 0;i < self.salas.length;i++){
												if(self.salas[i].nomesala == dados.data.nomesala){
													multierror = 1;
												}
											}
											if(!multierror){
											dados.data.users = []
											dados.data.temassl = [];
											dados.data.stop = 0;
											dados.data.initgame = 0;
											dados.data.tempostop = parseInt(dados.data.tempostop)*1000;
											dados.data.tempointervalostamp = 0;
											//dados.data.tempostop = 1000;
											dados.data.tempointervalo = parseInt(dados.data.tempointervalo)*1000;
											//dados.data.tempointervalo = 1000;
											dados.data.tempoavaliar = parseInt(dados.data.tempoavaliar)*1000;
											dados.data.ponteirotema = 0;
											dados.data.users[dados.data.users.length]={'nome':dados.data.nomedono,'pontos':0,'pontosrodada':0,'socketid':dados.socket.id,'sessionid':dados.session.id,'ip':dados.io.socket.handshake.address.address,'verificando':0,'pronto':0,'desativado':0};
											dados.data.rodada = 0;
											dados.data.letratual = "";
											dados.data.id = dados.socket.id;
											for(i in dados.data.temas){
												dados.data.temassl[i] = dados.data.temas[i];
												dados.data.temas[i] = self.stringx(dados.data.temas[i]);
											}
											self.salas.push(dados.data);
											dados.session.sala = dados.socket.id;
											dados.session.save();
											console.log('Uma nova sala foi criada - Nome: "'+dados.data.nomesala+'" Dono "'+dados.data.nomedono+'"');
											dados.io.emit('emtsalas',self.salas);
											dados.io.broadcast('emtsalas',self.salas);
											dados.io.emit('gosala',self.salaByid(dados.session.sala).nomesala);
											}else{
												dados.io.emit('EnviaError','Uma sala com o mesmo nome já foi criada');
											}
										}}}}}}}}}
						}
	});
	}
	this.iniciaPagina = function(url){
		console.log('[AHCOR]'.inverse.yellow+"-"+"Carregamento de página e redirecionamentos ligados!".inverse);
		app.io.route('Init', function(req) {
		if(req.session.cookie){	
		self.count += 1;
		req.io.emit('contador',self.count);
		req.io.emit('emtsalas',self.salas);
		if(url.parse(req.headers.referer).pathname != '/sala/'){
			if(req.session.sala){
				if(self.salaExists(req.session.sala) && self.verificaNomeEmSala(req.session.sala,req.session.id)){
					req.io.emit('gosalaim',self.salaByid(req.session.sala).nomesala);
				}
			}else{
				if(url.parse(req.headers.referer).query == 'in'){
					req.io.emit('EnviaError','Você foi desconectado por inatividade!')
				}
			}
		}else{
			if(req.session.sala){
				if(self.salaExists(req.session.sala) && self.verificaNomeEmSala(req.session.sala,req.session.id)){
				var sala = self.salaByid(req.session.sala);
				if(sala.initgame && !sala.stop){
					req.io.emit('iniciandogame',{'temassl':sala.temassl,'tempostop':sala.tempostopstamp,'temas':sala.temas});
					req.io.emit('envialetra',{'letraatual':sala.letratual});
				}
				if(sala.initgame && sala.stop){
					req.io.emit('stopado', {'timestampavaliar':sala.tempoavaliarstamp,'temas':sala.temas,'ponteiro':sala.ponteirotema,'timer':1,'temasatual':sala.temassl[sala.ponteirotema]});
					req.io.emit('envialetra',{'letraatual':sala.letratual});
				}
				if(!sala.initgame && !sala.stop){
					req.io.emit('ativabtnpronto');
				}
				for(i in self.salas){
				if(self.salas[i].id == req.session.sala){
				for(y in self.salas[i].users){
				if(self.salas[i].users[y].nome == req.session.nome){
					self.salas[i].users[y].sessionid = req.session.id;
					break;
				}
				}
				}
				}
				req.io.join(req.session.sala);
				app.io.room(req.session.sala).broadcast('attusersala',self.salaByid(req.session.sala));
				}else{
					req.session.sala = 0;
					req.io.emit('gohome');
				}
			}
			else{
				req.io.emit('gohome');
			}
		}
		if(req.session.nome){
			req.io.emit('ses-nome',req.session.nome);
		}
		}
		});
	}
	this.salvaNomeInicial = function(){
		console.log('[AHCOR]'.inverse.yellow+"-"+"Salvando nome de usuários em sessão segura, ligado!".inverse);
		app.io.route('saveName',function(req){
		if(req.session.cookie){	
		req.session.nome = req.data;
		req.session.save();
		}
		});
	}
	this.saidaDaSala = function(){
		console.log('[AHCOR]'.inverse.yellow+"-"+"Desligamento de sala acionado!".inverse);
		app.io.route('destroysession',function(req){
		if(req.session.cookie){	
		if(req.session.sala && self.salaExists(req.session.sala) && self.verificaNomeEmSala(req.session.sala,req.session.id)){
		var rex = self.salaByid(req.session.sala);
		if(rex.users.length == 1){
			for(var i = 0;i < self.salas.length;i++){
				if(self.salas[i].id == rex.id){
					self.salas.splice(i,1);
					req.io.broadcast('emtsalas',self.salas);
					app.io.room(req.session.sala).broadcast('attusersala',self.salaByid(req.session.sala));
					for(var h in self.stop){
						if(self.stop[h][0] == req.session.sala && req.session.id == self.stop[h][1]){
							self.stop.splice(h,1);
						}
					}
					Chat.mensagemServer(req.session.nome+' Saiu da sala',req);
					req.session.sala = 0;
					req.session.save();
					req.io.leave(req.session.id);
					if(req.data == 'inatividade'){
					req.io.emit('gohome','in');
					}else{
					req.io.emit('gohome');
					}
					break;
				}
			}
		}
		if(rex.users.length > 1){
			for(var i = 0;i < self.salas.length;i++){
				if(self.salas[i].id == rex.id){
					for(var y = 0; y < self.salas[i].users.length;y++){
						if(self.salas[i].users[y].nome == req.session.nome){
								self.salas[i].users.splice(y,1);
								if(self.salas[i].nomedono == req.session.nome){
								self.salas[i].nomedono = self.salas[i].users[0].nome;
								Chat.mensagemServer('O novo dono da sala agora é: '+self.salas[i].users[0].nome,req);
								}
								req.io.broadcast('emtsalas',self.salas);
								app.io.room(req.session.sala).broadcast('attusersala',self.salaByid(req.session.sala));
								for(var h in self.stop){
								if(self.stop[h][0] == req.session.sala && req.session.id == self.stop[h][1]){
									self.stop.splice(h,1);
								}
								}
								Chat.mensagemServer(req.session.nome+' Saiu da sala',req);
								req.session.sala = 0;
								req.session.save();
								req.io.leave(req.session.id);
								if(req.data == 'inatividade'){
								req.io.emit('gohome','in');
								}else{
								req.io.emit('gohome');
								}
								break;
						}
					}
				}
			}
		}
		}
		}
		});
	}
	this.entrarSala = function(){
		console.log('[AHCOR]'.inverse.yellow+"-"+"As salas já podem emitir acessos, trafego de usuários na sala ativo!".inverse);
		app.io.route('entradasala',function(dado){
			if(dado.session.cookie && self.salaExists(dado.data.sala)){	
			if(dado.data.nome != ""){
			for(array in self.salas){
				if(self.salas[array].id == dado.data.sala){
					if(dado.session.sala && dado.session.sala != dado.data.sala){
					var center = [];
					for(z in pushdado.temas){
						center[pushdado.temas[z]] = null;
					}
					self.stop.push([dado.session.sala,dado.session.id,center,center]);
					}
					dado.session.sala = dado.data.sala;
					dado.session.nome = dado.data.nome;
					dado.session.save();
					self.salas[array].users[self.salas[array].users.length] = {'nome':dado.data.nome,'pontos':0,'pontosrodada':0,'socketid':dado.socket.id,'sessionid':dado.session.id,'ip':dado.io.socket.handshake.address.address,'verificando':0,'pronto':0,'desativado':0};
					var pushdado = self.salaByid(dado.session.sala);
					Chat.mensagemServer(dado.data.nome+' Entrou na sala!',dado);
					dado.io.broadcast('emtsalas',self.salas);
					dado.io.emit('gosala',pushdado.nomesala);
					break;
				}
			}
			}
			}
		});
	}
	this.disconectar = function(){
		console.log('[AHCOR]'.inverse.yellow+"-"+"Disconnect temporal está ativado no servidor!".inverse);
		app.io.route('disconnect',function(req){
			if(req.session.cookie){	
			req.io.leave(req.session.sala);
			self.count -= 1;
			req.io.broadcast('contador',self.count);
			}
		});
		app.io.route('recebeTime',function(req){
			if(req.session.cookie){	
			if(req.session.sala){
			for(var i=0;i<self.salas.length;i++){
				if(self.salas[i].users != undefined){
				for(var y=0;y<self.salas[i].users.length;y++){
					if(self.salas[i].users[y].nome == req.session.nome){
					var time = new Date().getTime()
					self.salas[i].users[y].timestamp = (time+60000);
					break;
					}
				}
				}
			}
			}
			for(i in self.salas){
				for(y in self.salas[i].users){
					if(self.salas[i].users[y].timestamp < new Date().getTime()){
						if(self.salas[i].users.length == 1){
							for(var h in self.stop){
								if(self.stop[h][0] == self.salas[i].id && self.salas[i].users[y].sessionid == self.stop[h][1]){
									self.stop.splice(h,1);
								}
							}
							self.salas.splice(i,1);
							req.io.broadcast('emtsalas',self.salas);
							req.io.emit('emtsalas',self.salas);
						}else{
							for(var h in self.stop){
								if(self.stop[h][0] == self.salas[i].id && self.salas[i].users[y].sessionid == self.stop[h][1]){
									self.stop.splice(h,1);
								}
							}
							if(self.salas[i].users[y].nome == self.salas[i].nomedono){
							Chat.mensagemServer(self.salas[i].users[y].nome+' Saiu da sala',req);
							self.salas[i].users.splice(y,1);	
							self.salas[i].nomedono = self.salas[i].users[0].nome;
							Chat.mensagemServer('O novo dono da sala agora é: '+self.salas[i].users[0].nome,req);
							}else{
							Chat.mensagemServer(self.salas[i].users[y].nome+' Saiu da sala',req);
							self.salas[i].users.splice(y,1);
							}
							req.io.broadcast('emtsalas',self.salas);
							app.io.room(self.salas[i].id).broadcast('attusersala',self.salaByid(self.salas[i].id));
							req.io.emit('emtsalas',self.salas);
						}
					}
				}
			}
			}
		});
	}
	this.salaByid = function(id){
		for(var i = 0;i < this.salas.length;i++){
			if(this.salas[i].id == id){
				return this.salas[i];
				break;
			}
		}
	}
	this.salaExists = function(id){
		for(i in this.salas){
			if(this.salas[i].id == id){
				return true
				break;
			}
		}
		return false;
	}
	this.dadoUser = function(id,uss){
		for(i in this.salas){
			if(this.salas[i].id == id){
				for(y in this.salas[i].users){
				if(this.salas[i].users[y].sessionid == uss){
					return this.salas[i].users[y];
					break;
				}
				}
			}
		}
	}
	this.verificaNomeEmSala = function(id,idses){
		for(i in this.salas){
			if(this.salas[i].id == id){
			for(y in this.salas[i].users){
				if(this.salas[i].users[y].sessionid == idses){
					return true;
					break;
				}
			}
			}
		}
		return false;
	}
	this.stringx = function(palavra) {
		if(palavra != "" && palavra != undefined && palavra != null){
        var string = palavra.toLowerCase();
        for (var x = 0;x<string.length;x++) {
        string = string.replace(/[âáàã]/,"a");
        string = string.replace(/[éèê]/,"e");
        string = string.replace(/[íìî]/,"i");
        string = string.replace(/[ôõóò]/,"o");
        string = string.replace(/[úùû]/,"u");
        string = string.replace("ç","c");
        string = string.replace(" ","");  
        }
        return string;
        }else{
        return "ERROR - ENTRE EM CONTATO COM A ADMINISTRAÇÃO - ERROR: 9008";
        }
       }
	this.unique = function(a)
	{
   var r = new Array();
   o:for(var i = 0, n = a.length; i < n; i++) {
      for(var x = i + 1 ; x < n; x++)
      {
         if(a[x]!=a[i]) continue o;
      }
      r[r.length] = a[i];
   }
   return r;
	}
	}