(function($, window, document) {

        var totalValue, people, total, totalFloat; //Inicializando as variáveis globais
            //Ao clicar no botão de Calcular, executa essa função
            $("#calc").on("click", function(ev){
                
                ev.preventDefault(); //Previne o submit do form

                totalValue = $("#totalvalue").val(); //Valor total da conta
                totalValue = totalValue.replace(",", "."); // Substitui a virgula por ponto para fazer a operação
                
                people = $("#people").val(); //Total de pessoas

                total = calcTotal(totalValue, people); //Chama a função calcTotal() e depois convert o retorno em string
                totalString = total.toString().replace(".",","); //Substitui o ponto por virgula

                $("#total").val(totalString); //Total na tela

                customValueForm(people);
                $(".show-custom").show();
            });

            $(".show-custom").on("click",function(ev){
                ev.preventDefault();
                var elem = $("#customsplit");
                                                       
                elem.css('display','block');
                
                offset = elem.offset();
                offsetTop = offset.top;
                $(window).scrollTop(offsetTop);
                
                
            });

            //Ao clicar no botão de Recalcular, executa essa função
            $("#recalc").on("click",function(ev){
                    ev.preventDefault(); //Previne o submit do form
                    
                    var totalRecalc = Number(0), 
                        totalRestante = Number(0),
                        totalReal = Number(totalValue),
                        customPeople = Number(0);
                        serviceTax = Number(0);

                    $( "#custom input[type='number']" ).each( function() {
                        var self =  $(this);

                        if ( $(this).prop("disabled") === false ){
                            
                            if ( $("#service").is(":checked") ){
                               
                                valor = Number( $(this).val() );
                                valor = valor + ( valor * 0.1 );
                                self.val(valor);

                            }else{
                                
                                valor = Number($(this).val());

                            }

                            totalRecalc = totalRecalc + valor;  
                            customPeople += 1;

                        }
                         
                    });

                    totalRestante = totalReal - totalRecalc;

                    if ( totalRestante >= 0 ){
                        resto = ( totalRestante / (people - customPeople) );

                        $("#custom input[type='number']").each(function(){
                            if ( $(this).is(":disabled") ){
                                $(this).val(resto.toFixed(2));
                            }

                        });
                    }else{
                        alert ("Os valores da divisão não batem");
                    }
            });


            function calcTotal(totalvalue, people){ //Recebe os dados do form e calcula o valor total por pessoa

                var totalValue = Number(totalvalue),
                    totalPeople = Number(people),
                    total = totalvalue/totalPeople;
                
                total = total.toFixed(2); // Arredonda para duas casas decimais
                
                return total;
            }

            function customValueForm(people){//Gera o formulário de divisão personalizada da conta
                
                var i;

                $("#custom .content").empty();

                for ( i = 0; i < people; i++){ //Cria uma lista de inputs equivalente a cada membro na divisão

                    label = "<label for=\"custom\"" + i + " class=\"text-left col-sm-12 col-xs-12\">Pessoa " + (i+1) +"</label>";
                    check = "<div class=\"col-sm-1 col-xs-2\"><div class=\"checkbox\"><label><input type=\"checkbox\" data-toggle=\"custom" + i + "\"/></label></div></div>";
                    input = "<div class=\"col-sm-11 col-xs-10\"><div class=\"input-group \"><div class=\"input-group-addon\">R$</div><input id=\"custom" + i + "\" type=\"number\" class=\"form-control\" value=\""+ total +"\" disabled/></div></div>"; 
                    row = "<div class=\"form-group\">" + label + check + input + "</div>";
                    $("#custom .content").append( row );
                }
                
                //Habilita e desabilita os campos de input
                $("#custom .content input[type='checkbox']").on("click", function(){
                    var inputId = $(this).data("toggle"),
                        input = $("#"+inputId+"");

                    if (input.is(":disabled")){
                        input.prop('disabled',false);
                    }
                    else{
                        input.prop('disabled',true);
                    }
                });
            }

        $("#openmenu").on("click",function(ev){
            ev.preventDefault();

            var mainMenu =  $("#mainmenu");
            $("#overlay").css('display','block');

            mainMenu.css('display','block');
            mainMenu.css('left', '-'+mainMenu.width()+'px' );
            mainMenu.animate({
                left: '0px'
            },450, 'ease-in');

            $("#overlay, #closemenu").bind("click",function(){
                $("#overlay").css('display','none');
                $("#mainmenu").css('display','none');
            })
        })


    var calculadora = {};

    calculadora = {//Objeto principal do sistema, pai dos demais objetos
            
        debugSection: "",

        set_values: function(){
            this.debugSection = $("#debug");
        },

        debug: function(elem){
            this.debugSection.append(elem);
        },

        init: function(){
            this.set_values();
            this.device.set_values();
        }
    }

    calculadora.device ={//Objeto para gerenciar informações do dispositivo do usuário
            
        screenWidth: "",
        screenHeight: "",
        connectionStatus: "",

        set_values: function(){//método para inicializar as propriedades do objeto
            this.screenWidth = $(document).width();
            this.screenHeight = $(document).height();
            this.connectionStatus = navigator.onLine;

            calculadora.debug("<li>screenWidth: " + this.screenWidth + "</li><li>screenHeight: " + this.screenHeight + "</li><li>connectionStatus: " + this.connectionStatus + "</li>");
        }
    }

    calculadora.mainmenu ={//Objeto para gerenciar o menu principal da aplicação
            
        openMenuLink: "",
        closeMenuLink: "",
        overlay: "",
        mainMenu: "",

        set_values: function(){//método para inicializar as propriedades do objeto
            this.openMenuLink = $("#openmenu");
        }
    }

    calculadora.ads = {

    }

    // Verifica se um novo arquivo de manifesto existe quando a pagina é carregada
    // Se existir um manifesto mais recente o antigo é substituido e a página é atualizada
    // Caso contrário inicia a aplicação "calculadora.init()"
    window.addEventListener('load', function(e) {

        window.applicationCache.addEventListener('updateready', function(e) {
                
            if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                // O browser baixou um novo arquivo de cache
                // Substitui o cache antigo e atualiza a página
                window.applicationCache.swapCache();
                    //if (confirm('Uma nova versão está disponivel. Deseja atualizar?')) {
                        window.location.reload();
                    //}else{
                    //}
            }
            else{
                calculadora.init();
            }

        }, false);

    }, false);

}(window.Zepto, window, document));