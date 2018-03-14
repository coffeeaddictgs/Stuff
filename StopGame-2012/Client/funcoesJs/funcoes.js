$('document').ready(function(){
        $("input[name='senha']").change(function() {
          if($("input[name='senha']:checked").val() == "Sim"){
             $("input[name='senha_sala']").show();
          } else {
             $("input[name='senha_sala']").hide();
          }
        });
});

function mostraMenus(menu){
    $('document').ready(function(){
            if(menu == "criar_sala"){
               $("#nome").val($("#usuario").val());
               $("#descricao").hide();
               $("#detalhes_sala").hide();
               $("#nova_sala").show();
               $("#regras").hide();
            } else if(menu == "regras"){
               $("#descricao").hide();
               $("#detalhes_sala").hide();
               $("#nova_sala").hide();
               $("#regras").show();
            } else if(menu == "descsalas"){
               $("#descricao").hide();
               $("#detalhes_sala").show();
               $("#nova_sala").hide();
               $("#regras").hide();
            }
    });
}

function ErrorMenu(msg,exit){
				if(exit){
					$('#msgfechabt').html("");
				}
				$('#msgcontent').html(msg);
				$('#modal').css('display','block');
			   	$('#modal').reveal({ // The item which will be opened with reveal
				  	animation: 'fade',                   // fade, fadeAndPop, none
					animationspeed: 300,                       // how fast animtions are
					closeonbackgroundclick: true,              // if you click background will modal close?
					dismissmodalclass: 'close'    // the class of a button or element that will close an open modal
				});
				$('#bbody').css({'background':'#000','position':'absolute','width':'100%','height':'100%','display':'block'});
			return false;
}
function fechaError(){
		$('#bbody').css({'background':'#000','position':'fixed','width':'0px','height':'0px','display':'none'});
		$('#modal').css('display','none');
}
function randOrd() {
    return (Math.round(Math.random())-0.5);
}
function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle){
        	return true
        	break;
        }
    }
    return false;
}