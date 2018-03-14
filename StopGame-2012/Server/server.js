//Importação de packages e definição de dados
var Colors  = require('colors');
console.log('[AHCOR]'.inverse.yellow+"-"+"Carregando bibliotecas".inverse.yellow);
var express = require('express.io');
var porta	= 8090;
var rLobby  = require('./lobby');
var rChat	= require('./chat');
var rGame 	= require('./game');
var url	    = require('url');
var self	= this;
console.log('[AHCOR]'.inverse.yellow+"-"+"Bibliotecas carregadas!".inverse.yellow);
console.log('[AHCOR]'.inverse.yellow+"-"+"Iniciando ligação de todos os servidores...".inverse.yellow);
//Iniciando server http e socket
app = express().http().io()
app.use(express.cookieParser())
app.use(express.session({secret: 'keyvarsecret'}))
app.use(express.static(__dirname + '/cliente')); 
//Iniciando funcoes primárias
var Chat	= new rChat(app);
var Lobby	= new rLobby(app,Chat);
var Game	= new rGame(app,Chat,Lobby);
//Iniciando funcoes secundárias
Lobby.abresala();
Lobby.iniciaPagina(url);
Lobby.salvaNomeInicial();
Lobby.saidaDaSala();
Lobby.entrarSala();
Lobby.disconectar();
Chat.recebeMensagem();
Game.enviaInfosSala();
Game.verificaPronto();
Game.stopClick();
Game.recebePalavras();
Game.confirmaRespostas()
Game.passaTemaTempo();
Game.initRodadaPorTempo();
app.listen(porta);
