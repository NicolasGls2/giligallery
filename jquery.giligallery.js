(function($)
{
    $.fn.giligallery=function(options)
    {
        var defauts =
        {
            'count' : false,
            'popup' : false,
            'fullscreen' : true,
            'height': '580px'
        }
        
        var parametres = $.extend(defauts, options);
        
        return this.each(function()
        {
            var element = $(this);
            var numeroImage = 1;
            if(parametres.fullscreen) {
                var hauteur = jQuery(window).height();
                var largeur = jQuery(window).width();
            }
            else {
                var hauteurFixe = parametres.height;
                var largeur = jQuery(window).width();
            }
            
            /*******************************************************************\
             * définir la taille de l'image selon le viewport et son conteneur  *
             * renvoie le nombre d'image                                        *
            \*******************************************************************/
            function redimensionnementImage(conteneur) { 
                
                if(parametres.fullscreen)
                {
                    $(conteneur).find('img').css('height', hauteur);
                    images = new Array();
                    tailleTotalConteneur = 0;
                    var j = 0;
                    $(conteneur).find('img').each(function(){
                        images[j] = $(this).width();
                        tailleTotalConteneur += $(this).width();
                        j++;
                    })
                    return j;
                }
                else
                {
                    $(conteneur).css('height', hauteurFixe);
                    $(conteneur).find('img').css('height', hauteurFixe);
                    images = new Array();
                    tailleTotalConteneur = 0;
                    var j = 0;
                    $(conteneur).find('img').each(function(){
                        images[j] = $(this).width();
                        tailleTotalConteneur += $(this).width();
                        j++;
                    })
                    return j
                }

            }
            
            
            /*******************************************************************\
             *  déplacement de l'image en cour                                  *
            \*******************************************************************/
            function deplacementImage(next, conteneur) {

                var currentImg = $(conteneur).find('.on')
                var x1 = parseInt($(conteneur).css('left'));
                var x2 = currentImg.width() / 2;
              
                if (true === next) { var imgWidth = currentImg.next().width(); }
                else { var imgWidth = currentImg.prev().width(); }
              
                if (null === imgWidth) { return false; }
                var x3 = imgWidth / 2;
            
                if (true === next) {
                    currentImg.removeClass('on').next().addClass('on');
                    var xx = x1 - x2 - x3;
                    numeroImage++;
                } else {
                    currentImg.removeClass('on').prev().addClass('on');
                    var xx = x1 + x2 + x3;
                    numeroImage--;
                }
                    
                $(conteneur).animate({left : xx + 'px'}, 1000, function (x, t, b, c, d) {
                    if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
                    return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
                });
                
                $('#imageEnCour').text(numeroImage);
                
                //Indique la fin de l'exécution des tâches
                setTimeout(function(){ $(conteneur).removeClass('processing') }, 1100);
            
            }


            /*******************************************************************\
             *  raccourci clavier                                               *
            \*******************************************************************/
            function addKeyNavigation() {
                $(document).bind('keydown', checkKey);
            }
            
            function checkKey(e) {
                switch (e.keyCode) 
                {
                    case 37: // left
                        if($(conteneur).hasClass('processing')) return;
                        $(element).addClass('processing');
                        deplacementImage(false, conteneur);
                        e.preventDefault();
                        break;
                    case 39: // right
                        if($(conteneur).hasClass('processing')) return;
                          
                        $(element).addClass('processing');
                        deplacementImage(true, conteneur);
                        e.preventDefault();
                        break;
                    case 27: // esc
                        $('#popup, #bg').fadeOut(1000);
                }    
            }
            
            /*******************************************************************\
             *  raccourci clavier                                               *
            \*******************************************************************/
            
            
            /*******************************************************************\
             *  initialisation de la galerie,                                   *
             *  on redimensionne les images et calcule leur nombre              *
             *  on ajoute un div qui contiendra les bouton prev et next         *
             *  on passe à la suivante seulement si la classe proccessing       *
             *  ne'est pas active                                               *
            \*******************************************************************/
            function initialiser(conteneur) {
                
                $(conteneur).find('img:first, li:first').addClass('on');
                // redimensionne les images et retourne le nombre de ceux-ci
                var nombreImage = redimensionnementImage(conteneur);
                // initialisation  des éléments
                $(conteneur).addClass('giligallery');
                $('<div id="giligalleryoptions"></div>').insertAfter(conteneur);
                $('<a href="#" class="prev" title="Image précédente"><</a>').appendTo($("#giligalleryoptions"));
                $('<a href="#" class="next" title="Image suivante">></a>').insertAfter('.prev')
                if(parametres.count) $('<div id="giligallerynumber"><span id="imageEnCour">'+numeroImage+'</span>/'+nombreImage+'</div>').insertAfter('.next');
            
                // mise en place de la navigation 
                $(".prev, .next").click(function(e) {
                    //Sort de la fonction si l'élément possède déjà la classe processing
                    if($(conteneur).hasClass('processing')) return;
                    //Indique le début de l'exécution des tâches en ajoutant la classe processing à l'élément
                    $(conteneur).addClass('processing'); 
                
                    if($(this).attr('class') == 'prev')
                    {
                        deplacementImage(false, conteneur);
                    }
                    else {
                        deplacementImage(true, conteneur);
                    }
                        
                    e.preventDefault();
                })
                
                /* centrer l'image et les mettre à la hauteur du viewport */
                var positionImage = largeur / 2 - $(conteneur).find('.on').width() / 2;
                $(conteneur).animate({left: positionImage + 'px'}, 1000);
                
                setTimeout(function(){
                    $(conteneur).css('opacity', '1');
                    $('.loader').fadeOut('slow');
                },500)
            }
            
            
            /*******************************************************************\
             * - on affiche le loader                                           *
             * - on vérifie si on est en mode popup                             *
             * - si oui on récupère les images en ajax                          *
             * - et on initialise la galerie dans un popup                      *
            \*******************************************************************/
            $('<div class="loader"></div>').insertAfter(element);
            
            if(!parametres.popup) initialiser(element);
            else
            {
                $('<div id="popup"></div>').insertAfter(element);
                
                $(element).find('a').click(function(e){
                    $('.loader').fadeIn();
                    $(element).find('a').each(function(){
                        var ressourceLien = $('<img />').attr('src', $(this).attr('href'));
                        var img = $('<img />').attr('src', $(this).attr('href'))
                        .load(function() {
                            if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
                                alert('Problème de chargement');
                            } else {
                                $("#popup").append(img);
                            }
                        });
                    })
                   
                    $('body').append('<div id="bg"></div>');
                    $("#popup").css({
                         display: 'block'
                         })
                     var popup = $('#popup');
                     
                    if(!parametres.fullscreen) {
                        $("#popup").css({
                             top: '10%'
                             })
                    }
                    
                    setTimeout(function(){
                       initialiser(popup);
                    },500)
                    e.preventDefault();
                })
            }
            
            $('.loader').fadeOut('slow');
            $(window).resize(function(){
                var hauteur = jQuery(window).height();
                $(element).find('img').css('height', hauteur);
            });
            
            addKeyNavigation();
       });
    };
})(jQuery);

