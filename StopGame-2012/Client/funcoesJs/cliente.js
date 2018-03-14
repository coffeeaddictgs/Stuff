var io = io.connect('http://localhost:8090');
var salaarray;
var tematual = "";
self = this;
io.on('connect',function(socket){
    setAwayTimeout(180000);
	document.onAway = function() {ativo = 0;io.emit('destroysession','inatividade');}
  	window.setInterval(function(){ 
  		io.emit('recebeTime');
  	},40000);
	io.emit('Init');
	io.emit('recebeTime');
	io.emit('chamaInfos');
	io.emit('enviaplvr');
	var quantresp;
	var errx = 0;
	var verif = 0;
	var tamanhodiv = 100;
	var interval;
	var stopado = 0;
	var rank = new Array();
	var respostas = new Array();
	io.on('ses-nome',function(nome){
		$("#nome").val(nome);
		$("#usuario").val(nome);
	});
	io.on('gosala',function(dado){
		ErrorMenu('<span style="font-size:20px;">Entrando na sala: '+dado+' ...</span>',1);
		setTimeout(function(){window.location = "/sala/"},1500);	
	});
	io.on('gosalaim',function(dado){
		window.location = "/sala";
	});
	io.on('gohome',function(data){
		if(data == 'in'){
		window.location = "/?in"
		}else{
		window.location = "/";
		}
	});
	io.on('ativabtnpronto',function(){
		$("#prontobt").css('display','block');
	});
	$("#sairx").click(function(){
		io.emit('destroysession');
	});
	$("#criarnd").click(function(){
		var nomedono,nomesala,limitejogadores,numerorodadas,tempostop,tempoavaliar,tempointervalo;
		var temas = [];
		var letras = [];
		var temasdox = document.getElementById('temas').getElementsByTagName('input');
		var letradox = document.getElementById('letras').getElementsByTagName('input');
		for(var i = 0; i < temasdox.length;i++){
		if(temasdox[i].checked){
			temas.push(temasdox[i].value);
		}
		}
		for(var i = 0; i < letradox.length;i++){
		if(letradox[i].checked){
			letras.push(letradox[i].value);
		}
		}
		nomedono = document.getElementById('nome').value;
		nomesala = document.getElementById('nome_sala').value;
		limitejogadores = document.getElementById('limite_jogadores').value;
		numerorodadas = document.getElementById('numero_rodadas').value;
		tempostop = document.getElementById('tempo_stop').value;
		tempoavaliar = document.getElementById('tempo_avaliar').value;
		tempointervalo = document.getElementById('tempo_intervalo').value;
		if(nomedono.length > 0){
			io.emit('saveName',nomedono);
			if(nomesala.length > 0){
				if(limitejogadores >= 4 && limitejogadores <= 14){
					if(numerorodadas >= 4 && numerorodadas <= 18){
						if(temas.length >= 4){
							if(letras.length >= 10){
								if(tempostop >= 0 && tempostop <= 180){
									if(tempoavaliar >= 10 && tempoavaliar <= 120){
										if(tempointervalo >= 20 && tempointervalo <= 60){
											io.emit('AbrirSala',{'nomedono':nomedono,'nomesala':nomesala,'limitejogadores':limitejogadores,'numerorodadas':numerorodadas,'temas':temas,'letras':letras,'tempostop':tempostop,'tempoavaliar':tempoavaliar,'tempointervalo':tempointervalo});
										}else{ErrorMenu('O tempo para intervalo deve ser entre 20 e 60 segundos!');}
									}else{ErrorMenu('O tempo para avaliar deve ser entre 10 e 120 segundos!');}
								}else{ErrorMenu('O tempo para STOP deve ser entre 0 e 180 segundos!');}
							}else{ErrorMenu('Deve escolher ao menos 10 letras');}
						}else{ErrorMenu('Deve escolher ao menos 4 temas!');}
					}else{ErrorMenu('O n�mero de rodadas deve ser entre 4 e 18');}
				}else{ErrorMenu('O limite de jogadores deve ser entre 4 e 14');}
			}else{ErrorMenu('O nome da sala n�o pode estar em branco!');}
		}else{ErrorMenu('O nome n�o pode estar em branco!');}
	});
	$('#jogarbt').click(function(){
		if($("#usuario").val().length > 0){
			if($("#salaselecionada").val() != 'none' && $("#salaselecionada").val() != "" && $("#salaselecionada").val() != null){
				io.emit('entradasala',{'nome':$("#usuario").val(),'sala':$("#salaselecionada").val()});
			}
		}else{ErrorMenu('Insira um nome para jogar!');}
	});
	io.on('EnviaError',function(msg){
		ErrorMenu(msg);
	});
	io.on('emtsalas',function(receive){
		salaarray = receive;
		$('#salas').html("");
		for(var i = 0;i < receive.length;i++){
			//$("#salas").html($("#salas").html()+'<div class="salas_opcoes" onclick="mostraDetal('+"'"+receive[i].id+"'"+')">'+receive[i].nomesala+'<div style="float:right;">'+receive[i].users.length+'/'+receive[i].limitejogadores+'</div></div>');
			document.getElementById('salas').innerHTML += '<div class="salas_opcoes" onclick="mostraDetal('+"'"+receive[i].id+"'"+')">'+receive[i].nomesala+'<div style="float:right;">'+receive[i].users.length+'/'+receive[i].limitejogadores+'</div></div>';
		}
	});
	io.on('attusersala',function(dado){
		document.getElementById('nomeusers').innerHTML = "";
		for(var i = 0;i < dado.users.length;i++){
			if(dado.users[i].pronto){
			document.getElementById('nomeusers').innerHTML += '<div class="divnomeuserpronto"><div class="quadradonomeuser"></div>'+dado.users[i].nome+'</div>';
			}
			else{
			document.getElementById('nomeusers').innerHTML += '<div class="divnomeuser"><div class="quadradonomeuser"></div>'+dado.users[i].nome+'</div>';
			}
		}
	});
	io.on('recebemsg',function(data){
		document.getElementById('divmsgs').innerHTML += '<div class="divmsgs"><div class="divmsgsnome">'+data.nome+'</div>: '+data.mensagem+'</div>';
		$("#divmsgs").scrollTop($("#divmsgs")[0].scrollHeight);
	});
	io.on('recebemsgsys',function(data){
		document.getElementById('divmsgs').innerHTML += '<div class="divmsgsnomesys">'+data+'</div>';
		$("#divmsgs").scrollTop($("#divmsgs")[0].scrollHeight);
	});
	io.on('contador',function(dado){
		$("#contadoronline").html(dado)
	});
	io.on('enviaInfos',function(dado){
		$("#salanomedono").html(dado.nomedono);
		$("#salarodadas").html(dado.rodada+"/"+dado.numerorodadas);
	});
	io.on('iniciandogame',function(dado){
		var timestampstop = dado.tempostop;
		$("#prontobt").css('display','none');
		$('#titulotempo').html('Tempo para stop');
		if(((timestampstop-(new Date().getTime()))/1000) >= 0){
		$("#tempodiv").css('display','block');
		$("#countertime").html(parseInt((timestampstop-(new Date().getTime()))/1000));
		}
		interval = window.setInterval(function(){
			if(timestampstop > (new Date().getTime())){
				$("#countertime").html(parseInt((timestampstop-(new Date().getTime()))/1000));
			}else{
				$("#tempodiv").css('display','none');
				$("#stopbt").css('display','block');
				clearin();
			}
		},1000);
		for(i in dado.temassl){
			if(i%4 != 0){
				//$("#conteudoiniciado").html(html+'<div class="float"><div class="iniciadoipt">'+dado.temassl[i]+'</div><input name="inptema" id="'+dado.temas[i]+'" type="text" class="inputiniciado"/></div>');
				document.getElementById("conteudoiniciado").innerHTML += '<div class="float"><div class="iniciadoipt">'+dado.temassl[i]+'</div><input name="inptema" id="'+dado.temas[i]+'" type="text" class="inputiniciado"/></div>'
			}else{
				//$("#conteudoiniciado").html(html+'<div class="floatc"><div class="iniciadoipt">'+dado.temassl[i]+'</div><input name="inptema" id="'+dado.temas[i]+'" type="text" class="inputiniciado"/></div>');
				document.getElementById("conteudoiniciado").innerHTML += '<div class="floatc"><div class="iniciadoipt">'+dado.temassl[i]+'</div><input name="inptema" id="'+dado.temas[i]+'" type="text" class="inputiniciado"/></div>'
			}
		}
	});
	io.on('stopado',function(dado){
		stopado = 1;
		self.tematual = dado.temasatual;
		if(!dado.timer){
		hash = new Array();
		for(i in dado.temas){
				hash.push($("#"+dado.temas[i]).val());
		}
		io.emit('enviaplvr',hash);
		quantresp=0;
		}
		document.getElementById("conteudoiniciado").innerHTML = "";
		var timestampinterval = dado.timestampavaliar;
		$('#titulotempo').html('Tempo para avaliar');
		$("#tempodiv").css('display','block');
		$("#stopbt").css('display','none');
		interval = window.setInterval(function(){
			if(timestampinterval > (new Date().getTime())){
				$("#countertime").html(parseInt((timestampinterval-(new Date().getTime()))/1000));
			}else{
				$("#tempodiv").css('display','none');
				$("#avidiv").css('display','none');
				io.emit('enviaPalavra');
				io.emit('temaTempoExpires');
				clearin();
			}
		},1000);
	});
	io.on('plvrdaverificacao',function(dado){
			if(!verif){
			descricaoVerif(1);
			verif = 1;
			}
			var pass = 0;
			for(i in respostas){
				if(respostas[i] == dado.resposta[0]){
					pass = 1;
					break;
				}
			}
			if(!pass){
			if(dado.resposta[1]){
			respostas.push(dado.resposta[0]);
			document.getElementById("conteudoiniciado").innerHTML += '<div class="floatresp"><input id="'+tamanhodiv+'_check_inp" type="text" name="respinp" class="seletorbom" value="'+dado.resposta[0]+'" disabled/> <input name="respinpi" id="'+tamanhodiv+'_check" type="checkbox" onclick="'+"self.checarbox($(this).attr('id'));"+'" checked /></div>';
			}else{
			respostas.push(dado.resposta[0]);
			document.getElementById("conteudoiniciado").innerHTML += '<div class="floatresp"><input id="'+tamanhodiv+'_check_inp" type="text" name="respinp" class="seletormal" value="'+dado.resposta[0]+'" disabled/> <input name="respinpi" id="'+tamanhodiv+'_check" type="checkbox" onclick="'+"self.checarbox($(this).attr('id'));"+'" /></div>';	
			}
			}
			tamanhodiv += 1;
	});
	io.on('envialetra',function(dado){
			$("#letrasel").html(dado.letraatual);
	});
	io.on('processando',function(){
		$("#tempodiv").css('display','none');
		$("#esperaplayer").css('display','none');
		$("#btnconfirma").css('display','none');
		$("#conteudoiniciado").html('<div style="margin:10px 0 0 230px;"><img src="../imagens/ajax-loader.gif"/></div><div style="font-size: 13px;font-weight: bold;margin:5px 0 0 75px;">Processando resultado da rodada, aguarde!</div>');
	});
	io.on('proxTema',function(dado){
		if(stopado){
		self.tematual = dado.tema;
		tamanhodiv = 100;
		verif = 0;
		respostas = new Array();
		$("#conteudoiniciado").html("");
		$("#tempodiv").css('display','block');
		clearin();
		interval = window.setInterval(function(){
			if(dado.tempo > (new Date().getTime())){
				$("#countertime").html(parseInt((dado.tempo-(new Date().getTime()))/1000));
			}else{
				$("#tempodiv").css('display','none');
				$("#avidiv").css('display','none');
				io.emit('temaTempoExpires');
				clearin();
			}
		},1000);
		io.emit('enviaplvr'); 
		}
	});
	io.on('acabaRodada',function(dado){
		stopado = 0;
		ptsr = 1;
		ptsg = 1;
		$("#conteudoiniciado").html("");
		$("#tempodiv").css('display','none');
		$("#esperaplayer").css('display','none');
		$("#btnconfirma").css('display','none');
		document.getElementById("conteudoiniciado").innerHTML += '<div style="float:left;margin:5px 5px 0 130px;"><span style="font-weight:bold;font-size:13px;">Pontos rodada:</span><div id="ptsrx"></div></div>'
		document.getElementById("conteudoiniciado").innerHTML += '<div style="width: 2px;height: 200px;background: #000;float:left;"></div>';
		document.getElementById("conteudoiniciado").innerHTML += '<div style="margin:5px 0 0 5px;"><span style="font-weight:bold;font-size:13px;">Pontos geral:</span><div id="ptsx"></div></div>'
		document.getElementById("conteudoiniciado").innerHTML += '<div style="margin:10px 0 0 0;clear:both;"></div><div style="font-size: 13px;font-weight: bold;margin:5px 0 0 85px;"><div id="tialert" style="float:left;margin:-7px 5px 0 0;font-size:20px;"></div>segundos para o início da próxima rodada!</div>';
		var ArrayPlayers = dado.ptuser;
		var ArrayPlayer2 = dado.ptuser;
		ArrayPlayers.sort((function(index){
		    return function(a, b){
		        return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
		    };
		})(1));
		ArrayPlayers.reverse();
		ArrayPlayer2.sort((function(index){
		    return function(a, b){
		        return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
		    };
		})(2));
		ArrayPlayer2.reverse();
		for(i in ArrayPlayers){
		document.getElementById("ptsrx").innerHTML += '<div style="font-size:12px;">'+ptsr+'º - '+ArrayPlayers[i][2]+' - '+ArrayPlayers[i][1]+'</div> '
		ptsr += 1;
		}
		for(i in ArrayPlayer2){
		document.getElementById("ptsx").innerHTML += '<div style="font-size:12px;">'+ptsg+'º - '+ArrayPlayer2[i][2]+' - '+ArrayPlayer2[i][0]+'</div> '
		ptsg += 1;
		}
		$("#tialert").html(parseInt((dado.timeintervalo-(new Date().getTime()))/1000));
		clearin();
		var initx = 0;
		interval = window.setInterval(function(){
			if(dado.timeintervalo > (new Date().getTime())){
				$("#tialert").html(parseInt((dado.timeintervalo-(new Date().getTime()))/1000));
			}else if(!initx){
				initx = 1;
				$("#conteudoiniciado").html("");
				$("#tempodiv").css('display','none');
				$("#esperaplayer").css('display','none');
				$("#btnconfirma").css('display','none');
				io.emit('IntRodadaTempo');
				clearin();
			}
		},1000);
	});
	$("#prontobt").click(function(){
		$("#prontobt").toggleClass('btnnaopronto');
		io.emit('readyButton');
	});
	$("#stopbt").click(function(){
		var inp = document.getElementsByName('inptema');
		var errox = 0;
		for(var i=0;i<inp.length;i++){
			if(inp[i].value == "" || inp[i].value == null || inp[i].value == undefined){
				errox += 1;
			}
		}
		if(errox == 0){
		io.emit('stopButton');
		}else{
			ErrorMenu('Complete todos os campos para dar STOP!')
		}
	});
	$("#btnconfirma").click(function(){
		var inp = document.getElementsByName('respinp');
		var resps = new Array();
		for(var i=0;i<inp.length;i++){
			if($("#"+inp[i].id.substring(0,(inp[i].id.length - 4))).attr('checked') == true){
				resps[i] = [1,inp[i].value];
			}else{
				resps[i] = [0,inp[i].value];
			}
		}
		descricaoVerif(0);
		io.emit('confirmButton',resps);
		$("#conteudoiniciado").html("");
	});
	document.getElementById('escrevemsg').addEventListener('keypress',function(e){
  		if(e.keyCode==13){
  			if($('#escrevemsg').val() != null && $('#escrevemsg').val() != ''){
  			io.emit('rmensagem',document.getElementById('escrevemsg').value);
  			document.getElementById('escrevemsg').value = "";
  			}
  		};
  	},false);
  	function clearin(){
  		clearInterval(interval);
  	}
});
function mostraDetal(id){
    $('document').ready(function(){
    		   for(var i = 0; i < salaarray.length;i++){
    		   	if(salaarray[i].id == id){
    		   	$("#detnome").html(salaarray[i].nomesala);	
    		   	$("#detdono").html(salaarray[i].nomedono);
    		   	$("#dettemas").html("");
    		   	for(var x=0;x<salaarray[i].temas.length;x++){
    		   		document.getElementById('dettemas').innerHTML += salaarray[i].temas[x];
    		   		if((x+1) != salaarray[i].temas.length){document.getElementById('dettemas').innerHTML += ", "}
    		   	}
    		   	$("#detletras").html("");
    		   	for(var x=0;x<salaarray[i].letras.length;x++){
    		   		document.getElementById('detletras').innerHTML += salaarray[i].letras[x];
    		   		if((x+1) != salaarray[i].letras.length){document.getElementById('detletras').innerHTML += ", "}
    		   	}
    		    $("#detletrassorteadas").html("salaarray[i].letrassort");
    		   	$("#dettempostop").html(salaarray[i].tempostop);
    		   	$("#dettempoavaliar").html(salaarray[i].tempoavaliar);
    		   	$("#dettempointervalo").html(salaarray[i].tempointervalo);
    		   	$("#detlimite").html(salaarray[i].limitejogadores);
    		   	$("#detrodadas").html(salaarray[i].numerorodadas);
    		   	$("#detrodadaatual").html(salaarray[i].rodadaatual);
    		   	$("#detjogadores").html("");
    		   	for(var x=0;x<salaarray[i].users.length;x++){
    		   		document.getElementById('detjogadores').innerHTML += salaarray[i].users[x].nome;
    		   		if((x+1) != salaarray[i].users.length){document.getElementById('detjogadores').innerHTML += ", "}
    		   	}
    		   	$("#salaselecionada").val(id)
    		   	$("#descricao").hide();
               	$("#detalhes_sala").show();
               	$("#nova_sala").hide();
               	$("#regras").hide();
               	break;
    		   	}
    		   }
    });
}
function descricaoVerif(ls){
	if(ls){
	document.getElementById("conteudoiniciado").innerHTML += '<div style="font-size: 13px;margin:4px 0 4px 0;">Verifique a resposta dos outros jogadores para o tema <span style="font-size: 14px;font-weight: bold;">'+self.tematual+'</span> :</div>';
	document.getElementById("conteudoiniciado").innerHTML += '<div style="font-size: 13px;margin:4px 0 4px 0;">Após a verificação clique em <span style="font-weight:bold;">"Confirmar"</span>!</div>';
	$("#esperaplayer").css('display','none');
	$("#btnconfirma").css('display','block');
	}else{
	$("#btnconfirma").css('display','none');
	$("#esperaplayer").css('display','block');
	}
}
function checarbox(id){
	if($("#"+id).attr('checked') == true){
		$("#"+id+"_inp").removeClass('seletormal');
		$("#"+id+"_inp").addClass('seletorbom');
	}else{
		$("#"+id+"_inp").removeClass('seletorbom');
		$("#"+id+"_inp").addClass('seletormal');
	}
	
}
