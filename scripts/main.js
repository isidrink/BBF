
//var serviceURL = "http://www.adapptalo.com/test/services/";
var serviceURL = "http://localhost/test/services/";
function onBodyLoad()
{
       onDeviceReady() ;
      
}

document.addEventListener("deviceready", onDeviceReady, false);
var myArray2 = [];
var mapElem,
cachedLocations = [];

function createArray(cb){
    $.getJSON(serviceURL + 'getbeers.php', function(data) {
        var myArray = [];
        employees = data.items;
        $.each(employees, function(index, employee) {   
            myArray.push(employee);
        });
        cb(myArray);
    });
    //alert (myArray.length);
}


function resetGame()  
{  
    localStorage.clear();  
    $('#cardsList li').remove();
                
    /*var containerDiv = document.getElementById("blocks");  
    containerDiv.innerHTML = "";  
    localStorage.clear();  
    initializeGame();  
    var IDS = '';
    var sel = document.getElementsByTagName('input');
    for (i = 0; i<sel.length; i++) {
      if (sel[i].type = 'checkbox') {
        IDS = sel[i].id
        document.getElementById(IDS).checked = false;

      }
    }*/

}        
function getData(callback) {
     var template =  kendo.template($("#announcement-listview-template").html());
     var dataSource = new kendo.data.DataSource({
         
         transport: {
             read: function(operation) {
                var cashedData = localStorage.getItem("moviesData");

                if(cashedData != null || cashedData != undefined) {
                    //if local data exists load from it
                    operation.success(JSON.parse(cashedData));
                    //alert ("entramos aqui y cargamos localstorage!!");
                } else {
                   // alert ("es la primera instalacion,parseamos del servidor...");
                    $.ajax({ //using jsfiddle's echo service to simulate remote data loading
                        url: serviceURL + 'getbeers.php',
                        dataType: "json",
                       /* data: {
                            json: JSON.stringify(data)
                        },*/
                        success: function(response) {
                            //store response
                            localStorage.setItem("moviesData", JSON.stringify(response));
                            //pass the pass response to the DataSource
                            operation.success(response);
                        }
                    });
                }                 
            }
         },
         
         /*transport: {
             read: {
                 url: serviceURL + 'getbeers.php',
                 dataType: "json" // JSONP (JSON with padding) is required for cross-domain AJAX
             }
         },*/
         schema: {
             data: "items"
         },
         error: function(e) {
             console.log("Error " + e);
         },
         change: function() {
             $("#announcements-listview").html(kendo.render(template, this.view()));
         }
     });
     //dataSource.sort = ({field: "Distance", dir: "asc"});
     dataSource.read();
     $("#announcements-listview").kendoMobileListView({dataSource:dataSource,template: $("#announcement-listview-template").html()});
 }

 function onResult(resultData) {
     console.log("Results " + resultData);
     $("#announcements-listview").kendoMobileListView({dataSource: kendo.data.DataSource.create({data:resultData}),
         template: $("#announcement-listview-template").html()});
 }     
 
// Apache Cordova is ready
function onDeviceReady() {
	// Prevent screen bounce
      $("#addCardView").on("touchend", "#buttonAddNewCardView", function() {
		addNewCard();
	});
    
    getInitialCardsData();
    //getData(onResult);   
    // TODO: get all (where applicable) event handlers into the viewModels (hint: data-bind="click: handler")
   
	$("#cardsView").on("touchend", ".deleteCardButton", function(e) {
    	
		var cardNumberToDelete = $(e.currentTarget).parent().data('cardid');
		var message = "Are you sure that you want to permanently delete card with number ?";
        
		$("#modalViewDeleteCardMessage").text(message);
		$("#deleteMessage").text("Card Id:");
		$("#deleteCardId").text(cardNumberToDelete);
		$("#modalViewDeleteCard").kendoMobileModalView("open");
		e.stopPropagation();
	});
    
	$("#modalViewDeleteCard").on("touchend", '#buttonModalViewDeleteCancel', function() {
		$("#modalViewDeleteCard").kendoMobileModalView("close");
	});
    
	$("#modalViewDeleteCard").on("touchend", '#buttonModalViewDeleteConfirm', function() {
		var cardNumberToDelete = $("#deleteCardId").text();
		deleteCard(cardNumberToDelete);
		$("#modalViewDeleteCard").kendoMobileModalView("close");
	});
    
    $("#cardNumberField").keyup(function(e) {
        activateAddButtonIfCardIsValid(e.target.value);
    });
    
    $("#cardNumberField").on("paste", function(e) {
        activateAddButtonIfCardIsValid(e.target.value);
    });
    
	cardsData.init();
	cardsData.cards.bind("change", writeIntoLocalStorage);
}

function activateAddButtonIfCardIsValid(cardId) {
    var isValid = checkIsValid(cardId);
            
    if(isValid)
    {
        $("#buttonAddNewCardView").removeClass("isCardValid");
    } else {
        $("#buttonAddNewCardView").addClass("isCardValid");
    }
}

function checkIsValid(typedCardId) {
    return validateCardNumber(typedCardId) && !isDublicateNumber(typedCardId);
}

function getPosition(handler) {
	navigator.geolocation.getCurrentPosition(handler, onGeolocationError, { enableHighAccuracy: true });
}

function getLocations(position, handler) {
	$.getJSON("http://www.starbucks.com/api/location.ashx?&features=&lat=" + position.coords.latitude + "&long=" + position.coords.longitude + "&limit=10",
			  function(data) {
				  var locations = [];
				  $.each(data, function() {
					  locations.push(
						  {
						  address: this.WalkInAddressDisplayStrings[0] + ", " + this.WalkInAddressDisplayStrings[1], 
						  latlng: new google.maps.LatLng(this.WalkInAddress.Coordinates.Latitude, this.WalkInAddress.Coordinates.Longitude)
					  });                
				  });
				  handler(locations);
			  }).error(function(error) {
				  alert(error.message);
			  });
}

function getInitialCardsData(){
    //alert("random?");
		
        if(window.localStorage.getItem("cards")===null)
    {
       // alert("first-->"+initialCards);
        var cardData = new initialCardData(),
        initialCards = cardData.getInitialCardsData();
        //alert("second-->"+initialCards);
        localStorage.setItem("cards",initialCards);
    }
}

function storesShow(e) {
	$("#storesNavigate").kendoMobileButtonGroup({
		select: function() {
			if (this.selectedIndex == 0) {
				$("#storeswrap").hide();
				$("#mapwrap").show();
				google.maps.event.trigger(map, "resize");
			}
			else if (this.selectedIndex == 1) {
				$("#mapwrap").hide();
				$("#storeswrap").show();
			}
		},
		index: 0
	});
    
    
	var iteration = function() {
		getPosition(function(position) {
			// Use Google API to get the location data for the current coordinates
			var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            
			var myOptions = {
				zoom: 12,
				center: latlng,
				mapTypeControl: false,
				navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL },
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			mapElem = new google.maps.Map(document.getElementById("map"), myOptions);
			var marker = new google.maps.Marker({
				position: latlng,
				map: mapElem,
				title: "Your Location",
                                zIndex:google.maps.Marker.MAX_ZINDEX
			});
                        
                          var image = new google.maps.MarkerImage("images/icon.png");

                       
                        //for (var i = 0; i < locations.length; i++) {
                          var myLatLng = new google.maps.LatLng(41.376293,2.149218);
                          var marker = new google.maps.Marker({
                              position: myLatLng,
                              map: mapElem,
                              animation: google.maps.Animation.DROP,
                              icon: image,
                              title: "Barceloa Beer Festival",
                              zIndex: google.maps.Marker.MAX_ZINDEX
                          });
                          
                        //}
                        var j = i + 1;
                          marker.setTitle(j.toString());
                          attachSecretMessage(marker, i);
                          /*
			if (cachedLocations.length > 0) {
				setStiresViews(cachedLocations);
			}
			else {
            	
				getLocations(position, function(locations) {
					cachedLocations = locations;
					setStiresViews(locations);
				});
			}*/
		});
	};
	iteration();
}

var announcementData = [
	{ title: "Holiday Drinks Are Here", description: "Enjoy your favorite holiday drinks, like Pumpkin Spice Lattes.", url: "images/holiday.png" },
	{ title: "Register & Get Free Drinks", description: "Register any Jitterz card and start earning rewards like free drinks. Sign-up now.", url: "images/rewards.png" },
	{ title: "Cheers to Another Year", description: "Raise a cup of bold and spicy Jitterz Anniversary Blend.", url: "images/cheers.png" },
    { title: "Hot Drinks Anytime", description: "Find and enjoy our, hot drinks anytime.", url: "images/hot-drink.png" },
	{ title: "Friend and Love", description: "Get more for your friends.Get Love.", url: "images/love-friend.png" },
	{ title: "Wide range of choice", description: "Raise a cup of bold and spicy Jitterz Anniversary Blend.", url: "images/best-coffee.png" }
];

var beers = [{"B_Id":"1","CERVESERA":"AKTIEN","PROCEDENCIA":"KAUFBEUREN-GERMANY","CERVESA":"ANNO 25","ESTIL_ABV_IBU":"Weissbier","ABV":"5,3%","IBU":"16","DESCRIPCIO":"Cervesa rossa t\u00e8rbola de blat cl\u00e0ssica amb les tipiques notes de clau i fruites.","IMAGEN":"AKB.png","VOTACION":"0","PREU":"0"},{"B_Id":"2","CERVESERA":"AKTIEN","PROCEDENCIA":"KAUFBEUREN-GERMANY","CERVESA":"KELLERBIER 1308","ESTIL_ABV_IBU":"Keller","ABV":"5,0%","IBU":"25","DESCRIPCIO":"Una lager rossa plena de cos amb totes les notes dels cereals i lleugerament amarga.","IMAGEN":"AKB.png","VOTACION":"0","PREU":"0"},{"B_Id":"3","CERVESERA":"AKTIEN","PROCEDENCIA":"KAUFBEUREN- GERMANY","CERVESA":"URBAYRISCH DUNKEL","ESTIL_ABV_IBU":"Dunkel","ABV":"5,0%","IBU":"20","DESCRIPCIO":"Una lager fosca amb sabors de malta torrada amb notes de xocolata i nous.","IMAGEN":"AKB.png","VOTACION":"0","PREU":"0"},{"B_Id":"4","CERVESERA":"ALES AGULLONS","PROCEDENCIA":"MEDIONA- CATALUNYA","CERVESA":"DALMORU","ESTIL_ABV_IBU":"Blat","ABV":"5,0%","IBU":"0","DESCRIPCIO":"Cervesa amb maltes d\u2019ordi i blat al 50%. amb ll\u00fapol de la varietat Northern Brewer en dues quotes","IMAGEN":"agullons.png","VOTACION":"0","PREU":"0"},{"B_Id":"127","CERVESERA":"ALES AGULLONS","PROCEDENCIA":"MEDIONA- CATALUNYA","CERVESA":"PURA PALE","ESTIL_ABV_IBU":"Pale Ale","ABV":"5,0%","IBU":"0","DESCRIPCIO":"Cervesa p\u00e0l.Lida d\u2019una sola malta (Pale) amb ll\u00fapuls de les varietats Cascade i Fuggles.","IMAGEN":"agullons.png","VOTACION":"0","PREU":"0"},{"B_Id":"5","CERVESERA":"ALVINNE","PROCEDENCIA":"WEST VLAANDEREN- BELGIQUE","CERVESA":"MORPHEUS DARK","ESTIL_ABV_IBU":"Strong Belgian Ale","ABV":"10,2%","IBU":"47","DESCRIPCIO":"Morpheus Dark \u00e9s una cervesa complexa, per disfrutar amb tranquilitat. Elaborada amb 7 maltes diferents. Ll\u00fapuls: Magnum, EK Goldings","IMAGEN":"alvinne.png","VOTACION":"0","PREU":"0"},{"B_Id":"6","CERVESERA":"ALVINNE","PROCEDENCIA":"WEST VLAANDEREN- BELGIQUE","CERVESA":"MORPHEUS EXTRA","ESTIL_ABV_IBU":"Belgian Ale","ABV":"7,1%","IBU":"52","DESCRIPCIO":"Rossa, amarga i llupulosa. Morpheus Extra RA \u00e9s f\u00e0cil de beure, per\u00f2 amb una mica de car\u00e0cter. Ll\u00fapuls: Magnum, Chinook, Cascade","IMAGEN":"alvinne.png","VOTACION":"0","PREU":"0"},{"B_Id":"7","CERVESERA":"ALVINNE","PROCEDENCIA":"WEST VLAANDEREN- BELGIQUE","CERVESA":"MORPHEUS WILD UNDRESSED","ESTIL_ABV_IBU":"Flemish Old Brown Ale","ABV":"5,9%","IBU":"16","DESCRIPCIO":"Morpheus Wild \u00e9s la t\u00edpica Old Flemish Brown. \u00c9s el resultat d'una mescla entre la Morpheus Wild envellida dins barriques de fusta i la Morpheus Dark.","IMAGEN":"alvinne.png","VOTACION":"0","PREU":"0"},{"B_Id":"8","CERVESERA":"ANDERSON VALLEY","PROCEDENCIA":"CALIFORNIA- U.S.A.","CERVESA":"IMPERIAL I.P.A.","ESTIL_ABV_IBU":"ImperialL I.P.A.","ABV":"8,7%","IBU":"100","DESCRIPCIO":null,"IMAGEN":"anderson valley.png","VOTACION":"0","PREU":"0"},{"B_Id":"9","CERVESERA":"ART CERVESERS","PROCEDENCIA":"CANOVELLES- VALL\u00c8S ORIENTAL","CERVESA":"TOC D'ESPELTA-BIO","ESTIL_ABV_IBU":"Weizenbier","ABV":"5,1%","IBU":"16","DESCRIPCIO":"Ale arom\u00e0tica i fruitada amb blat espelta no maltat. Fresca, lleugera acidesa i intens sabor a cereal. Ingredients 100% ecol\u00f2gics.","IMAGEN":"arts.png","VOTACION":"0","PREU":"0"},{"B_Id":"10","CERVESERA":"AUSESKEN","PROCEDENCIA":"OLOST (OSONA)- CATALUNYA","CERVESA":"BLANCA","ESTIL_ABV_IBU":"Witbier","ABV":"4,8%","IBU":"20","DESCRIPCIO":"Cervesa artesana elaborada amb malt d\u2019ordi i blat cru d\u2019Osona. Neta i brillant amb una escuma blanca i esponjosa. Aromes a fruites c\u00edtriques i verdes del camp i unes notes a esp\u00e8cies (clau i pebre).","IMAGEN":"ausesken.png","VOTACION":"0","PREU":"0"},{"B_Id":"11","CERVESERA":"BBF 2012","PROCEDENCIA":"BARCELONA- CATALUNYA","CERVESA":"HOPS & HOPES","ESTIL_ABV_IBU":"Amber Ale","ABV":"5,0%","IBU":"79","DESCRIPCIO":"Monovarietal de Columbus, generosament adicionat; base Pale Malt i una miqueta de malta torrada tipus krystal. Elaborada sota supervisi\u00f3 d'un adult.","IMAGEN":"bbf.png","VOTACION":"0","PREU":"0"},{"B_Id":"12","CERVESERA":"BERNATBEER","PROCEDENCIA":"BARCELONA","CERVESA":"HEISENBERG I.P.A.","ESTIL_ABV_IBU":"American I.P.A.","ABV":"7,0%","IBU":"66","DESCRIPCIO":"Cervesa elaborada amb 5 maltes i 4 ll\u00fapols. Nelson sauvin,galaxy,citra i summer.","IMAGEN":"bernatbeer.png","VOTACION":"0","PREU":"0"},{"B_Id":"13","CERVESERA":"BIERBROUWERIJ DE EEM","PROCEDENCIA":"AMERSFOORT- HOLLAND","CERVESA":"XTREEM ROSEBUD","ESTIL_ABV_IBU":"American I.P.A.","ABV":"6,6%","IBU":"55","DESCRIPCIO":"Rosebud \u00e9s una cervesa poderosa a l'estil americ\u00e0. Hem usat ll\u00fapol Centennial. Rosebud t\u00e9 una amargor de 60 EBU i esdev\u00e9 una agradable experi\u00e8ncia pel bon bevedor de cervesa. Tasta-la!!","IMAGEN":"binchoise.png","VOTACION":"0","PREU":"0"},{"B_Id":"14","CERVESERA":"BIERBROUWERIJ DE EEM","PROCEDENCIA":"AMERSFOORT- HOLLAND","CERVESA":"XTREEM WARRIOR","ESTIL_ABV_IBU":"I.P.A.","ABV":"5,7%","IBU":"60","DESCRIPCIO":"Aspecte ros, poca espuma. Llupolosa amb aromes c\u00edtrics, llimona i un xic de coriandre. Bona amargor com a IPA que \u00e9s; suau fins un final molt c\u00edtric.","IMAGEN":"binchoise.png","VOTACION":"0","PREU":"0"},{"B_Id":"15","CERVESERA":"BIRRA 08","PROCEDENCIA":"BARCELONA CIUTAT- CATALUNYA","CERVESA":"08018 CLOT","ESTIL_ABV_IBU":"Pale Ale","ABV":"5,1%","IBU":"35","DESCRIPCIO":"Monovarietal de Fuggles. Aromes de fruites blanques, ra\u00efm, litxis, mel\u00f3. Retrogust persistent. Equilibrada combinaci\u00f3 de maltes i ll\u00fapol.","IMAGEN":"08.png","VOTACION":"0","PREU":"0"},{"B_Id":"16","CERVESERA":"BRASSERIE LA SENNE","PROCEDENCIA":"BRUXELLES (B\u00e8lgica)","CERVESA":"STOUTERIK","ESTIL_ABV_IBU":"Belgian Stout","ABV":"4,5%","IBU":"0","DESCRIPCIO":"Car\u00e0cter irland\u00e8s lleuger, sec, frescament amarg amb notes torrefactes complexes. El seu aroma \u00e9s agradablement perfumat per la pres\u00e8ncia de ll\u00fapul arom\u00e0tic angl\u00e9s particularment apreciat pels experts.","IMAGEN":"brasseriedecasseu.png","VOTACION":"0","PREU":"0"},{"B_Id":"17","CERVESERA":"BRASSERIE LA SENNE","PROCEDENCIA":"BRUXELLES (B\u00e8lgica)","CERVESA":"TARAS BOULBA","ESTIL_ABV_IBU":"Belgian Blonde","ABV":"4,5%","IBU":"0","DESCRIPCIO":"Rossa lleugera, generosament lupulitzada amb els ll\u00fapul arom\u00e0tics m\u00e9s fins, lo que li otorga un car\u00e0cter refrescant i un aroma que recorda als c\u00edtrics.","IMAGEN":"brasseriedecasseu.png","VOTACION":"0","PREU":"0"},{"B_Id":"18","CERVESERA":"BRAUSTELLE","PROCEDENCIA":"K\u00d6LN- DEUTSCHLAND","CERVESA":"EHRENFELDER ALT","ESTIL_ABV_IBU":"Unfiltered Altbier","ABV":"4,8%","IBU":"0","DESCRIPCIO":"Aroma a maltes dolces i notes herbals. En boca es dol\u00e7a, amb un amargor mig. Aquesta cervesa \u00e9s una miqueta m\u00e9s t\u00e8nue que la majoria de les Alt, fins i tot es podria dir que sembla una mescla Alt\/K\u00f6lsch.","IMAGEN":"brautelle.png","VOTACION":"0","PREU":"0"},{"B_Id":"19","CERVESERA":"BRAUSTELLE","PROCEDENCIA":"K\u00d6LN- DEUTSCHLAND","CERVESA":"HELIOS","ESTIL_ABV_IBU":"Unfiltered K\u00f6lsch","ABV":"4,8%","IBU":"0","DESCRIPCIO":"Aroma floral, afable, recorda al p\u00e0 i al fenc. En boca es noten lleugerament els cereals i el p\u00e0, tancant amb una sorprenent nota c\u00edtrica. L'amargor predomina m\u00e9s que a la majoria de les K\u00f6lsch.","IMAGEN":"brautelle.png","VOTACION":"0","PREU":"0"},{"B_Id":"20","CERVESERA":"BRAUSTELLE","PROCEDENCIA":"K\u00d6LN- DEUTSCHLAND","CERVESA":"HELIOS-WEIZEN","ESTIL_ABV_IBU":"German Wheat Ale","ABV":"5,3%","IBU":"0","DESCRIPCIO":"T\u00e9 els aromes t\u00edpics d'una weizen, banana i clau, \u00e9s una cervesa realment suau i et captivar\u00e0 desde el primer glop. Una cervesa espl\u00e8ndida.","IMAGEN":"brautelle.png","VOTACION":"0","PREU":"0"},{"B_Id":"21","CERVESERA":"BRAUSTELLE","PROCEDENCIA":"K\u00d6LN- DEUTSCHLAND","CERVESA":"PINK PANTHER","ESTIL_ABV_IBU":"Ale with hibiscus flowers","ABV":"5,8%","IBU":"0","DESCRIPCIO":"Al servir-la apreciareu un color rosa\/rub\u00ed; \u00e9s molt floral (porta flors d'hibisc) i fruitera amb un petit i suau toc alcoh\u00f2lic.","IMAGEN":"brautelle.png","VOTACION":"0","PREU":"0"},{"B_Id":"22","CERVESERA":"BREWDOG","PROCEDENCIA":"FRASERBURG- ESCOCIA","CERVESA":"DOGMA","ESTIL_ABV_IBU":"Ale","ABV":"8,0%","IBU":"65","DESCRIPCIO":"Innovadora i enigm\u00e0tica Ale, elaborada amb mel, llavors de rosella, guaran\u00e0 i nous de cola.","IMAGEN":"brewdog.png","VOTACION":"0","PREU":"0"},{"B_Id":"23","CERVESERA":"BREWDOG","PROCEDENCIA":"FRASERBURG- ESCOCIA","CERVESA":"PUNK I.P.A.","ESTIL_ABV_IBU":"Milk Stout","ABV":"5,6%","IBU":"45","DESCRIPCIO":"I.P.A. escocesa que es caracteritza per la seva for\u00e7a arom\u00e0tica i amargor.","IMAGEN":"brewdog.png","VOTACION":"0","PREU":"0"},{"B_Id":"24","CERVESERA":"BREWFIST","PROCEDENCIA":"CODOGNO- ITALIA","CERVESA":"24K","ESTIL_ABV_IBU":"Golen Ale","ABV":"4,6%","IBU":"30","DESCRIPCIO":"Cervesa de malt alemanya i ll\u00fapol angl\u00e8s. D\u2019aroma sec a herba i sabor lleugerament amarg. Una cervesa per degustar en qualsevol ocasi\u00f3.","IMAGEN":"brewfist.png","VOTACION":"0","PREU":"0"},{"B_Id":"25","CERVESERA":"BREWFIST","PROCEDENCIA":"CODOGNO- ITALIA","CERVESA":"FEAR","ESTIL_ABV_IBU":"Milk Chocolate Stout","ABV":"5,2%","IBU":"24","DESCRIPCIO":"Dedicat a tots aquells que tenen por de les cerveses negres. Dol\u00e7a, complexa. La lactosa i els grans de cacau li donen aquest toc de suavitat i aroma. Una cervesa deliciosa.","IMAGEN":"brewfist.png","VOTACION":"0","PREU":"0"},{"B_Id":"26","CERVESERA":"BREWFIST","PROCEDENCIA":"CODOGNO- ITALIA","CERVESA":"SPACE MAN","ESTIL_ABV_IBU":"India Pale Ale","ABV":"7,0%","IBU":"70","DESCRIPCIO":"Cervesa rossa feta sota la tradici\u00f3 I.P.A. de la costa Oest. Arom\u00e0tica, amarga i seca. Les seves notes de ll\u00fapol s\u2019accentuen amb les notes fruitals ex\u00f2tiques i c\u00edtriques. Una cervesa per als molt entusiastes.","IMAGEN":"brewfist.png","VOTACION":"0","PREU":"0"},{"B_Id":"27","CERVESERA":"BROUWERIJ DE MOLEN","PROCEDENCIA":"BODEGRAVEN- HOLLAND","CERVESA":"HEL&VERDOEMENIS BORDEAUX","ESTIL_ABV_IBU":"Imperial Stout","ABV":"13,0%","IBU":"0","DESCRIPCIO":"Imperial stout envellida en barricas de roure emprades anteriorment per vi de Bordeaux. Aix\u00f2 li ofereix un car\u00e0cter avinat i a\u00f1ejo .","IMAGEN":"brouwerijdemolen.png","VOTACION":"0","PREU":"0"},{"B_Id":"28","CERVESERA":"BROUWERIJ DE MOLEN","PROCEDENCIA":"BODEGRAVEN- HOLLAND","CERVESA":"HEMEL&AARDE BRUICHLADDICH","ESTIL_ABV_IBU":"Imperial Stout, smoked, oak aged","ABV":"10,0%","IBU":"96","DESCRIPCIO":"Feta amb la malta m\u00e9s turbosa de la destilaria de Bruichladdich i envellida en barriques de whisky de Bruichladdich utilitzades per primer cop al 1972!. El resultat \u00e9s increible: fum, vainilla, caf\u00e8, xocolata, turba i fusta (i \u00e9s molt bebible!). Una c","IMAGEN":"brouwerijdemolen.png","VOTACION":"0","PREU":"0"},{"B_Id":"29","CERVESERA":"BROUWERIJ DE MOLEN","PROCEDENCIA":"BODEGRAVEN- HOLLAND","CERVESA":"MACHTIG&MOOI","ESTIL_ABV_IBU":"Barley Wine","ABV":"17,4%","IBU":"0","DESCRIPCIO":"Barley wine envellida en barriques de roure. Semblant a la Weer & Wind, per\u00f2 amb una difer\u00e8ncia curiosa: s'han utilitzat llevats de cervesa i de champagne alhora. No apta per a principiants.","IMAGEN":"brouwerijdemolen.png","VOTACION":"0","PREU":"0"},{"B_Id":"30","CERVESERA":"BROUWERIJ DE MOLEN","PROCEDENCIA":"BODEGRAVEN- HOLLAND","CERVESA":"WEER&WIND","ESTIL_ABV_IBU":"Barley Wine","ABV":"16,2%","IBU":"51","DESCRIPCIO":"Envellida en barriques de roure durant 10 mesos. Aquesta Barley Wine \u00e9s completa, dol\u00e7a i realment complexa. Tracteu-la com si fos el vostre millor vi.","IMAGEN":"brouwerijdemolen.png","VOTACION":"0","PREU":"0"},{"B_Id":"31","CERVESERA":"CAZEAU","PROCEDENCIA":"TEMPLEUVE- BELGIUM","CERVESA":"BI\u00c8RE DE TORNAY","ESTIL_ABV_IBU":"Belgian Ale","ABV":"7,2%","IBU":"26","DESCRIPCIO":"Una cervesa molt ben equilibrada, amb 2 tipus de maltes i 4 de ll\u00fapuls; les flors de ll\u00fapul utilitzades li ofereixen un toc sec amb un retrogust amargant.","IMAGEN":"calzeau.png","VOTACION":"0","PREU":"0"},{"B_Id":"32","CERVESERA":"CAZEAU","PROCEDENCIA":"TEMPLEUVE- BELGIUM","CERVESA":"TOURNAY NOIRE","ESTIL_ABV_IBU":"Belgian Specialty Ale","ABV":"7,6%","IBU":"28","DESCRIPCIO":"Cervesa negra, elaborada amb maltes especials i ll\u00fapols tradicionals, lo que la fa poderosa, amb una pres\u00e8ncia duradera i forta amargor.","IMAGEN":"calzeau.png","VOTACION":"0","PREU":"0"},{"B_Id":"33","CERVESERA":"CERVESA MARINA","PROCEDENCIA":"BLANES- GIRONA","CERVESA":"SUMMER ALE","ESTIL_ABV_IBU":"American I.P.A.","ABV":"6,0%","IBU":"42","DESCRIPCIO":"Cervesa clara, bona retenci\u00f3 d\u2019escuma, carbonataci\u00f3 moderada. Refrescant, neta, amarga, llupolada, especiada, afruitada. Entrada en boca refrescant, lleugera i final sec. Notes de c\u00edtrics.","IMAGEN":"marina.png","VOTACION":"0","PREU":"0"},{"B_Id":"34","CERVESERA":"CERVESART","PROCEDENCIA":null,"CERVESA":"ALE N.16","ESTIL_ABV_IBU":"Northern English Brown","ABV":"5,7%","IBU":"19","DESCRIPCIO":"Suau gust de nous que es deriva de les maltes utilitzades.","IMAGEN":"Cervesart.png","VOTACION":"0","PREU":"0"},{"B_Id":"35","CERVESERA":"CERVESART","PROCEDENCIA":null,"CERVESA":"CAT PORTER","ESTIL_ABV_IBU":"Smoked Porter","ABV":"7,4%","IBU":"19","DESCRIPCIO":"Color caoba profund. Rica, complerta i de cos robust. Suau, amb Sabors de xocolata i caf\u00e8, per\u00f2 equilibrada per sabors subtils de la malta especial fumada.","IMAGEN":"Cervesart.png","VOTACION":"0","PREU":"0"},{"B_Id":"36","CERVESERA":"CERVESERIA L'ANJUB","PROCEDENCIA":"RIBERA D'EBRE - CATALUNYA","CERVESA":"1907","ESTIL_ABV_IBU":"Pale Ale","ABV":"5,0%","IBU":"33","DESCRIPCIO":"Una mica t\u00e8rbola, de bombolla fina i escuma consistent. El ll\u00fapol d\u00f3na notes florals, albercoc i poma. Lleugerament amarga, sobresurten les notes refrescants del ll\u00fapol (amargues i herbals). Equilibrada, cos mig.","IMAGEN":"lanjub.png","VOTACION":"0","PREU":"0"},{"B_Id":"37","CERVESERA":"CERVESERIA L'ANJUB","PROCEDENCIA":"RIBERA D'EBRE - CATALUNYA","CERVESA":"JULIETT","ESTIL_ABV_IBU":"Extra Stout","ABV":"6,2%","IBU":"92","DESCRIPCIO":"Totalment negra. Escuma consistent i esponjosa amb color marr\u00f3 fosc. Olor del ll\u00fapol i la malta torrefacta. Amargor inicial, despr\u00e9s dol\u00e7 de la malta i acaba amb caf\u00e8 i xocolata. Equilibri entre dol\u00e7 i amarg.","IMAGEN":"lanjub.png","VOTACION":"0","PREU":"0"},{"B_Id":"38","CERVESERA":"CERVESES ALMOG\u00c0VER, S.L.","PROCEDENCIA":"BARCELONA- CATALUNYA","CERVESA":"ALMOG\u00c0VER CL\u00c0SSICA","ESTIL_ABV_IBU":"Ambar Pale Ale","ABV":"4,5%","IBU":"33","DESCRIPCIO":"Refrescant i amb cos, arom\u00e0tica i de sabor intens. Ll\u00fapols Cascade i Saaz. Complexitat arom\u00e0tica amb constants gustos a caramel i regal\u00e8ssia.","IMAGEN":"almogaver.png","VOTACION":"0","PREU":"0"},{"B_Id":"39","CERVESERA":"CERVESES DE LA SEGARRA, S.L.","PROCEDENCIA":"STA. COLOMA DE QUERALT- BAIXA SEGARRA","CERVESA":"SEGARRETA","ESTIL_ABV_IBU":"Belgian Specialty Ale","ABV":"6,9%","IBU":"30","DESCRIPCIO":"Base pale amb alt contingut de malt de blat. 3 quotes de ll\u00fapol. Refrescant i equilibrada.","IMAGEN":"segarreta.png","VOTACION":"0","PREU":"0"},{"B_Id":"40","CERVESERA":"CERVESES FORT","PROCEDENCIA":"BARCELONA- CATALUNYA","CERVESA":"FORT OAT MEAL PORTER","ESTIL_ABV_IBU":"Robust Porter","ABV":"6,5%","IBU":"35","DESCRIPCIO":"Cervesa negra d'alta fermentaci\u00f3. Complexa, amb un cos potent que pesa. Descaradament desequilibrada capa el ll\u00fapol. Molt arom\u00e0tica amb records de poma y herba fresca. Escuma marr\u00f3 i persistent.","IMAGEN":"fort.png","VOTACION":"0","PREU":"0"},{"B_Id":"41","CERVESERA":"CERVESES POPAIRE SCP","PROCEDENCIA":"BLANES- COSTA BRAVA","CERVESA":"TINTA DE POP","ESTIL_ABV_IBU":"Stout","ABV":"5,0%","IBU":"30","DESCRIPCIO":"Cervesa Stout elaborada amb malts d'ordi torrats i caramelitzats, que li aporten el color negre caracter\u00edstic d'aquesta varietat cervesera i unes notes torrefactes de xocolata i regal\u00e8ssia. T\u00e9 una escuma fina i abundant agradable al paladar.","IMAGEN":"pop2.png","VOTACION":"0","PREU":"0"},{"B_Id":"42","CERVESERA":"CERVESES POPAIRE SCP","PROCEDENCIA":"BLANES- COSTA BRAVA","CERVESA":"TRAMUNTANA","ESTIL_ABV_IBU":"Especial Brown Ale","ABV":"9,2%","IBU":"45","DESCRIPCIO":"Cervesa maltosa (set tipus de maltes caramel.litzades), r\u00fastica, profunda i de glop llarg. T\u00e9 un gust de xocolata, brownie i brioix i una aroma de caramel.Una cervesa poc llupolitzada per\u00f2 ben equilibrada amb la proporci\u00f3 de maltes.","IMAGEN":"pop1.png","VOTACION":"0","PREU":"0"},{"B_Id":"43","CERVESERA":"CERVEZA ARTESANA IB\u00d3N","PROCEDENCIA":"BIESCAS- HUESCA- ARAG\u00d3N","CERVESA":"IB\u00d3N - A BIERA D'O PIRINEO","ESTIL_ABV_IBU":"Extra Special\/Strong Bitter","ABV":"5,0%","IBU":"32","DESCRIPCIO":"Elaborada con Maltas Pilsen, Carapils y algo de Malta de Trigo, l\u00fapulos, Magnum, Fuggles, East Kent Goldings y Cascade. Cuerpo ligero-medio, refrescante y de amargor medio, aromas florales y c\u00edtricos predominando la piel de naranja o jazm\u00edn.","IMAGEN":"ibon.png","VOTACION":"0","PREU":"0"},{"B_Id":"44","CERVESERA":"COMPANYIA CERVESERA DEL MONTSENY","PROCEDENCIA":"SANT MIQUEL DE BALENY\u00c0- SEVA- CATALUNYA","CERVESA":"LUPULUS","ESTIL_ABV_IBU":"Iber Ale","ABV":"5,4%","IBU":"29","DESCRIPCIO":"Cervesa Artesana, rossa i d\u2019alta fermentaci\u00f3 adaptada a l\u2019estil del nostre pa\u00eds. Tota l\u2019intensitat del ll\u00fapol en combinaci\u00f3 amb la malta pilsen, per fer passar la set.","IMAGEN":"montseny.png","VOTACION":"0","PREU":"0"},{"B_Id":"45","CERVESERA":"DARK HORSE BREWING CO.","PROCEDENCIA":"MARSHALL- MICHIGAN (USA)","CERVESA":"AMBER ALE","ESTIL_ABV_IBU":"Amber Ale","ABV":"6,0%","IBU":"0","DESCRIPCIO":"Mentre que la malta i ll\u00fapol donen a aquesta cervesa un color rogenc incre\u00efble, cos mitj\u00e0, i una sensaci\u00f3 a la boca suau, \u00e9s el llevat belga que marca la difer\u00e8ncia amb altres amber.","IMAGEN":"darkhorse.png","VOTACION":"0","PREU":"0"},{"B_Id":"46","CERVESERA":"DARK HORSE BREWING CO.","PROCEDENCIA":"MARSHALL- MICHIGAN (USA)","CERVESA":"CROOKED TREE IPA","ESTIL_ABV_IBU":"I.P.A.","ABV":"6,0%","IBU":"50","DESCRIPCIO":"Llupolitzada per dry-hopping que d\u00f3na un gran aroma de pi i c\u00edtrics. Sovint descrit com aranja, els nostres ll\u00fapols donen a aquesta cervesa un alt gust a fruita que acaba en sec, fresc i net.","IMAGEN":"darkhorse.png","VOTACION":"0","PREU":"0"},{"B_Id":"47","CERVESERA":"DOMUS","PROCEDENCIA":"TOLEDO","CERVESA":"AUREA","ESTIL_ABV_IBU":"Indian Pale Ale","ABV":"6,0%","IBU":"0","DESCRIPCIO":"Cerveza muy fresca, clara, con un marcado sabor y aroma a l\u00fapulos arom\u00e1ticos, especialmente las cepas Sincoe y Amarillo.","IMAGEN":"domus.png","VOTACION":"0","PREU":"0"},{"B_Id":"48","CERVESERA":"DUITS & LAURET","PROCEDENCIA":"VLEUTEN- NEDERLAND","CERVESA":"ROOK DUBBLELBOCK","ESTIL_ABV_IBU":"Doppelbock","ABV":"7,5%","IBU":"0","DESCRIPCIO":"Les varietats de malta torrada i fumada utilitzades li donen el seu aroma i color cridaner, mentre que les varietats de ll\u00fapols arom\u00e0tics m\u00e9s subtils tocs de fusta, proporcionen una cervesa plea i profunda. \u00c9s una cervesa ideal per convinar amb molts ","IMAGEN":"duits.png","VOTACION":"0","PREU":"0"},{"B_Id":"49","CERVESERA":"DUITS & LAURET","PROCEDENCIA":"VLEUTEN- NEDERLAND","CERVESA":"WINTER STOUT","ESTIL_ABV_IBU":"Russian Imperial Stout","ABV":"8,5%","IBU":"0","DESCRIPCIO":"Es una evoluci\u00f3 de la Stout de D&L encara m\u00e9s potent. Es tracta d\u2019una cervesa d\u2019alta fermentaci\u00f3, sense filtrar ni pasteuritzar i amb segona fermentaci\u00f3 en bota de fusta. Gust potent i regustos torrefactes.","IMAGEN":"duits.png","VOTACION":"0","PREU":"0"},{"B_Id":"50","CERVESERA":"EMELISSE","PROCEDENCIA":"KAMPERLAND- HOLLAND","CERVESA":"BLACK & TAN JACK DANIELS","ESTIL_ABV_IBU":"Imperial I.P.A.","ABV":"10,0%","IBU":"80","DESCRIPCIO":"Mescla especial de la IRS i la IPA -per tant,dif\u00edcil de descriure- amb notes de whiskey JACK DANIELS.","IMAGEN":"emelisse.png","VOTACION":"0","PREU":"0"},{"B_Id":"51","CERVESERA":"EMELISSE","PROCEDENCIA":"KAMPERLAND- HOLLAND","CERVESA":"BLACK & TAN LAPHROAIG","ESTIL_ABV_IBU":"Imperial I.P.A.","ABV":"10,0%","IBU":"80","DESCRIPCIO":"Entenem per Black & Tan, una mescla de dos cerveses, habitualment una Pale Ale i una Stout o Porter, en aquest cas \u00e9s una mescla especial de la IRS i la IPA -per tant,dif\u00edcil de descriure- amb notes turboses del LAPHROAIG.","IMAGEN":"emelisse.png","VOTACION":"0","PREU":"0"},{"B_Id":"52","CERVESERA":"EMELISSE","PROCEDENCIA":"KAMPERLAND- HOLLAND","CERVESA":"BLACK IPA","ESTIL_ABV_IBU":"Imperial I.P.A. (DARK)","ABV":"8,0%","IBU":"60","DESCRIPCIO":"Versi\u00f3 holandesa de l'estil Americ\u00e0, portant la IPA a nous extrems tant de color com d'amargor i determinaci\u00f3.","IMAGEN":"emelisse.png","VOTACION":"0","PREU":"0"},{"B_Id":"53","CERVESERA":"EMELISSE","PROCEDENCIA":"KAMPERLAND- HOLLAND","CERVESA":"DOUBLE IPA","ESTIL_ABV_IBU":"Imperial IPA","ABV":"9,7%","IBU":"62","DESCRIPCIO":"Estem davant una ale extremadament llupulitzada, amb un equilibri perfecte entre fruites i amargor.","IMAGEN":"emelisse.png","VOTACION":"0","PREU":"0"},{"B_Id":"54","CERVESERA":"EMELISSE","PROCEDENCIA":"KAMPERLAND- HOLLAND","CERVESA":"IRS ARDBEG","ESTIL_ABV_IBU":"Imperial Rusian Stout","ABV":"11,0%","IBU":"75","DESCRIPCIO":"Cervesa forta, amb notes de caf\u00e8 i xocolata, fermentada en barriques de single malt whisky lo que li ofereix un aroma fumat i turb\u00f2s.","IMAGEN":"emelisse.png","VOTACION":"0","PREU":"0"},{"B_Id":"55","CERVESERA":"EMELISSE","PROCEDENCIA":"KAMPERLAND- HOLLAND","CERVESA":"RAUCHBIER","ESTIL_ABV_IBU":"Classic Rauchbier","ABV":"6,2%","IBU":"29","DESCRIPCIO":"Elaborada utilitzant maltes fumades a sobre de fusta de faig, lo que li dona aquest toc fumat caracter\u00edstic, tot i que \u00e9s m\u00e9s lleuger que a la majoria de Rauchbier alemanes.","IMAGEN":"emelisse.png","VOTACION":"0","PREU":"0"},{"B_Id":"56","CERVESERA":"ESPIGA","PROCEDENCIA":"GELIDA- ALT PENED\u00c8S- CATALUNYA","CERVESA":"ESPIGA BRUNA","ESTIL_ABV_IBU":"American Pale Ale","ABV":"4,8%","IBU":"40","DESCRIPCIO":"Cervesa torrada d\u2019alta fermentaci\u00f3 amb aromes i gustos maltosos ben balancejats amb l\u2019amargor dels ll\u00fapols Northern Brewer i aromatitzada amb fuggles.","IMAGEN":"espiga.png","VOTACION":"0","PREU":"0"},{"B_Id":"57","CERVESERA":"FLYING DOG","PROCEDENCIA":"MARYLAND- U.S.A.","CERVESA":"SNAKE DOG","ESTIL_ABV_IBU":"Indian Pale Ale","ABV":"7,1%","IBU":"60","DESCRIPCIO":"Aromes c\u00edtrics (sobresurt l\u2019aranja) gr\u00e0cies als ll\u00fapols i sabors caramel amb notes maltoses. Aquesta IPA acompanya molt b\u00e9 plats picants.","IMAGEN":"flying dog.png","VOTACION":"0","PREU":"0"},{"B_Id":"58","CERVESERA":"FREIGEIST","PROCEDENCIA":"STOLBERG- DEUTSCHLAND","CERVESA":"ABRAXXXAS","ESTIL_ABV_IBU":"Berl. Weisse with smoked malt","ABV":"6,0%","IBU":"0","DESCRIPCIO":"\u00c9s el pas l\u00f2gicament posterior a l'Abraxas. Lleugerament torrada, notes suaus dolces i maltoses. El comen\u00e7ament ens oferir\u00e0 un contexte fumat amb una solidesa agria, a mesura que avancem descubrirem notes c\u00edtriques i finalment un podr\u00e0 trobar un toc","IMAGEN":"freigeist.png","VOTACION":"0","PREU":"0"},{"B_Id":"59","CERVESERA":"FREIGEIST","PROCEDENCIA":"STOLBERG- DEUTSCHLAND","CERVESA":"CAULFIELD MOCHA FLUSH","ESTIL_ABV_IBU":"Imperial Stout on oak","ABV":"10,0%","IBU":"0","DESCRIPCIO":"T\u00e9 un inici crem\u00f2s i suau, incrementant poc a poc cap torrefactes maltosos. L'alcohol es prou present i ens conferir\u00e0 escalfor. Aromes a fusta es barrejen amb caf\u00e8s i xocolata negra.","IMAGEN":"freigeist.png","VOTACION":"0","PREU":"0"},{"B_Id":"60","CERVESERA":"FREIGEIST","PROCEDENCIA":"STOLBERG- DEUTSCHLAND","CERVESA":"HOPPEDITZ","ESTIL_ABV_IBU":"Strong Altbier","ABV":"7,5%","IBU":"0","DESCRIPCIO":null,"IMAGEN":"freigeist.png","VOTACION":"0","PREU":"0"},{"B_Id":"61","CERVESERA":"GISBERGA REINA DE ARAG\u00d3N ","PROCEDENCIA":"BELVER DE CINCA - HUESCA","CERVESA":"GISBERGA TRIGO","ESTIL_ABV_IBU":"Weissbier","ABV":"4,8%","IBU":"28","DESCRIPCIO":"Cerveza artesanal elaborada con malta de trigo, maltas Pale Ale y Lager, L\u00fapulo en flor Hallertauer y Saaz y agua del pirineo aragones.","IMAGEN":"gisberga.png","VOTACION":"0","PREU":"0"},{"B_Id":"62","CERVESERA":"GLOPS - LL\u00daPOLS I LLEVATS S.L","PROCEDENCIA":"L'HOSPITALET DE LLOBREGAT- CATALUNYA","CERVESA":"GLOPS FUMADA","ESTIL_ABV_IBU":"Classic Rauchbier","ABV":"5,1%","IBU":"35","DESCRIPCIO":"Cervesa rossa, aromes a fum, gust fumat, sec, regust fumat.","IMAGEN":"glops.png","VOTACION":"0","PREU":"0"},{"B_Id":"63","CERVESERA":"GLOPS - LL\u00daPOLS I LLEVATS S.L","PROCEDENCIA":"L'HOSPITALET DE LLOBREGAT- CATALUNYA","CERVESA":"GLOPS ROSSA","ESTIL_ABV_IBU":"Bohemian Pilsener","ABV":"5,8%","IBU":"40","DESCRIPCIO":"Cervesa rossa, aromes de malt i ll\u00fapol Saaz, gust sec, herbal i caramel.","IMAGEN":"glops.png","VOTACION":"0","PREU":"0"},{"B_Id":"64","CERVESERA":"GUEUZERIE TILKIN","PROCEDENCIA":"REBECQ-ROGNON- BELGIUM","CERVESA":"TILQUIN GUEUZE DRAUGHT","ESTIL_ABV_IBU":"Lambic","ABV":"4,8%","IBU":"0","DESCRIPCIO":"Cervesa de fermentaci\u00f3 espont\u00e0nea produ\u00efda mitjan\u00e7ant la fermentaci\u00f3 i envelliment a barriques de fusta d'un copatge de cerveses l\u00e0mbiques produ\u00efdes per les cerveseries BOON, LINDEMANS, GIRARDIN i CANTILLON.","IMAGEN":"tilquin.png","VOTACION":"0","PREU":"0"},{"B_Id":"65","CERVESERA":"HAANDBRYGGERIET","PROCEDENCIA":"DRAMMEN- NORWAY","CERVESA":"FYR & FLAMME","ESTIL_ABV_IBU":"India Pale Ale","ABV":"6,2%","IBU":"0","DESCRIPCIO":"T\u00e9 un color complex, del marr\u00f2 al taronja, passant pel daurat, tot bastant fosc. T\u00e9 un aroma poder\u00f2s, molt fort, degut a un massiu dry hopping (llupulitzat en sec). Trobareu caramel, c\u00edtrics (llimona especialment), aromes torrefactes i un reconfo","IMAGEN":"haandbryggeriet.png","VOTACION":"0","PREU":"0"},{"B_Id":"66","CERVESERA":"HEMEL","PROCEDENCIA":"NIJMEGEN- HOLLAND","CERVESA":"HELSE ENGEL","ESTIL_ABV_IBU":"Belgian Triple","ABV":"8,0%","IBU":"0","DESCRIPCIO":"Cervesa de triple fermentaci\u00f3, daurada i lleugerament m\u00e9s dol\u00e7a que les tradicionals triples Belgues.","IMAGEN":"hemel.png","VOTACION":"0","PREU":"0"},{"B_Id":"67","CERVESERA":"HEMEL","PROCEDENCIA":"NIJMEGEN- HOLLAND","CERVESA":"NIEUW LIGT","ESTIL_ABV_IBU":"Belgian Specialty Ale","ABV":"10,0%","IBU":"0","DESCRIPCIO":"Una de les cerveses m\u00e9s fortes de De Hemel's , plena d'aromes, colors i amb molt de cos; un toc dol\u00e7 per\u00f2 equilibrada tot i tenir un fort contingut d'alcohol.","IMAGEN":"hemel.png","VOTACION":"0","PREU":"0"},{"B_Id":"68","CERVESERA":"HEMEL","PROCEDENCIA":"NIJMEGEN- HOLLAND","CERVESA":"NIEUW LIGT GRAND CRU","ESTIL_ABV_IBU":"Belgian Specialty Ale","ABV":"12,0%","IBU":"0","DESCRIPCIO":"Encara m\u00e9s forta que la Nieuw Ligt : plena, fosca i arom\u00e0tica.","IMAGEN":"hemel.png","VOTACION":"0","PREU":"0"},{"B_Id":"69","CERVESERA":"HUMALA BREWING COMPANY","PROCEDENCIA":"SABADELL- CATALUNYA","CERVESA":"COLUMBUS I.P.A.","ESTIL_ABV_IBU":"Imperial I.P.A.","ABV":"7,5%","IBU":"100","DESCRIPCIO":null,"IMAGEN":"humala.png","VOTACION":"0","PREU":"0"},{"B_Id":"70","CERVESERA":"ICUE","PROCEDENCIA":"CARTAGENA- MURCIA","CERVESA":"ICUE MEPA","ESTIL_ABV_IBU":"American Pale Ale","ABV":"5,0%","IBU":"27","DESCRIPCIO":"Cerveza fermentacion alta, sin pasteurizar, de color ambar, de aroma y sabor a l\u00fapulos americanos.","IMAGEN":"icue.png","VOTACION":"0","PREU":"0"},{"B_Id":"71","CERVESERA":"JAVIER ALD\u00c9A","PROCEDENCIA":"EUSKADI","CERVESA":"10 PENSAMIENTOS","ESTIL_ABV_IBU":"Farmhouse Ale","ABV":"6,2%","IBU":"30","DESCRIPCIO":"Saison esot\u00e9rica, \u00e1cida y primaveral con pensamientos, salvia, canela","IMAGEN":"beer.png","VOTACION":"0","PREU":"0"},{"B_Id":"72","CERVESERA":"JAVIER ALD\u00c9A","PROCEDENCIA":"EUSKADI","CERVESA":"BLENDEAD","ESTIL_ABV_IBU":"Especial","ABV":"7,0%","IBU":"40","DESCRIPCIO":"Blend de american pale ale con malta garrapi\u00f1ada, grano de moscatel enano, viura y malvasia. En colaboraci\u00f3n con Humala y Micro-cerveseria.","IMAGEN":"beer.png","VOTACION":"0","PREU":"0"},{"B_Id":"73","CERVESERA":"JOPEN","PROCEDENCIA":"HAARLEM- HOLLAND","CERVESA":"GERSTEBIER","ESTIL_ABV_IBU":"Blonde Ale","ABV":"6,5%","IBU":"30","DESCRIPCIO":"Cervesa d'alta fermentaci\u00f3 estil pilsner: amarga, suau i refrescant. Per beure'n una i una altra i una altra\u2026","IMAGEN":"jopen.png","VOTACION":"0","PREU":"0"},{"B_Id":"74","CERVESERA":"JOPEN","PROCEDENCIA":"HAARLEM- HOLLAND","CERVESA":"JOHANNIETER","ESTIL_ABV_IBU":"Doppelbock","ABV":"9,0%","IBU":"0","DESCRIPCIO":"Cervesa sense filtrar, negra i forta. T\u00e9 molt de car\u00e0cter i no massa dol\u00e7or (per l'estil que \u00e9s), es podria dir que \u00e9s un h\u00edbrid entre una Dubbelbok i una Export Stout.","IMAGEN":"jopen.png","VOTACION":"0","PREU":"0"},{"B_Id":"75","CERVESERA":"KERKOM","PROCEDENCIA":"SINT-TRUIDEN- BELGIQUE","CERVESA":"BINK BLOND","ESTIL_ABV_IBU":"Belgium Ale","ABV":"5,5%","IBU":"30","DESCRIPCIO":"Cervesa rossa belga, fresca i amb un aroma llupul\u00f2s, retrogust amarg i amb m\u00e9s car\u00e0cter que la majoria de cerveses d'aquest estil.","IMAGEN":"kerkom.png","VOTACION":"0","PREU":"0"},{"B_Id":"76","CERVESERA":"KERKOM","PROCEDENCIA":"SINT-TRUIDEN- BELGIQUE","CERVESA":"KERKOMSE TRIPEL","ESTIL_ABV_IBU":"Abbey Triple","ABV":"9,5%","IBU":"50","DESCRIPCIO":"Cervesa de triple fermentaci\u00f3, daurada amb aroma a fruites, gust complexa amb un toc refrescant del ll\u00fapul cap al final.","IMAGEN":"kerkom.png","VOTACION":"0","PREU":"0"},{"B_Id":"77","CERVESERA":"KRUT","PROCEDENCIA":"VALLDOREIX- BARCELONA","CERVESA":"KRUT GOLD","ESTIL_ABV_IBU":"American Ale","ABV":"5,5%","IBU":"45","DESCRIPCIO":"Cervesa daurada especial que combina llevat de xampany amb ll\u00fapol Citra nadiu dels Estats-Units. Una cervesa molt suau i refrescant, elaborada en homenatge a una de les grans regions vit\u00edcoles de Catalunya.","IMAGEN":"KRUT_FRONT_BBF.png","VOTACION":"0","PREU":"0"},{"B_Id":"78","CERVESERA":"LA BINCHOISE","PROCEDENCIA":"BINCHE- B\u00c8LGICA","CERVESA":"ESPECIAL NOEL","ESTIL_ABV_IBU":"X-mas Belgium Ale","ABV":"9,0%","IBU":"0","DESCRIPCIO":"Su aroma es c\u00edtrico con un color tostado, entre cobrizo y naranja oscuro. Equilibrada y refrescante gracias ala presencia de un delicado carb\u00f3nico. Se trata de una cerveza de degustaci\u00f3n por excelencia que tambi\u00e9n se apreciar\u00e1 en el aperitivo, servid","IMAGEN":"binchoise.png","VOTACION":"0","PREU":"0"},{"B_Id":"79","CERVESERA":"LA FONT DEL DIABLE","PROCEDENCIA":"VILANOVA I LA GELTR\u00da- CATALUNYA","CERVESA":"CANDEL STRONG","ESTIL_ABV_IBU":"Amber Ale","ABV":"5,5%","IBU":"50","DESCRIPCIO":"Interpretaci\u00f3 d'una Amber Ale amb aroma intens.","IMAGEN":"lafontdeldiable.png","VOTACION":"0","PREU":"0"},{"B_Id":"80","CERVESERA":"LA VELLA CARAVANA","PROCEDENCIA":"MEN\u00c0RGUENS- LA NOGUERA-LLEIDA","CERVESA":"LO TERR\u00d3S","ESTIL_ABV_IBU":"American Brown Ale","ABV":"4,5%","IBU":"33","DESCRIPCIO":"Cervesa torrada, inicialment la malta xocolata predomina en l\u2019aroma i en el gust, el ll\u00fapol li d\u00f3na equilibri i es prolonga en boca.","IMAGEN":"lavellacaravana.png","VOTACION":"0","PREU":"0"},{"B_Id":"81","CERVESERA":"LEFT HAND BREWERY","PROCEDENCIA":"LONGMONT- COLORADO","CERVESA":"MILK STOUT","ESTIL_ABV_IBU":"Milk Stout","ABV":"6,0%","IBU":"25","DESCRIPCIO":"Negra i deliciosa, aquesta milk stout et canviar\u00e0 la percepci\u00f3 del que una stout pot ser.","IMAGEN":"lefthand.png","VOTACION":"0","PREU":"0"},{"B_Id":"82","CERVESERA":"LES CLANDESTINES DE MONTFERRI","PROCEDENCIA":"ALT CAMP- TARRAGONA","CERVESA":"4 MALTES","ESTIL_ABV_IBU":"Pale Ale","ABV":"5,0%","IBU":"25","DESCRIPCIO":"Cervesa de color ambre ataronjat, amb cos, equilibrada, i que gr\u00e0cies a la combinaci\u00f3 de maltes ( Pale ale, caramalt) i ll\u00fapols (magnum, challenger, stiriangoldings), ens ofereix un aroma a cereal torrat, panses i d\u00e0tils, amb una amargor moderada i pe","IMAGEN":"clandestines.png","VOTACION":"0","PREU":"0"},{"B_Id":"83","CERVESERA":"LUPULUS","PROCEDENCIA":"BOVIGNY- BELGIUM","CERVESA":"LUPULUS BLONDE","ESTIL_ABV_IBU":"Blonde Ale","ABV":"8,5%","IBU":"0","DESCRIPCIO":"Lupulus \u00e9s una cervesa rossa, refermentada en ampolles de xampany i en barril. L\u2019elecci\u00f3 per no filtrar la cervesa, aix\u00ed com per no pasteuritzar-la garanteix el seu sabor i qualitat arom\u00e0tica.","IMAGEN":"lupulus.png","VOTACION":"0","PREU":"0"},{"B_Id":"84","CERVESERA":"MANDRIL BREWING Co.","PROCEDENCIA":"MANRESA","CERVESA":"MANDRIL","ESTIL_ABV_IBU":"Pale Ale","ABV":"5,4%","IBU":"45","DESCRIPCIO":"Elaborada amb maltes Maris Otter Extra Pale i Carafoam. Llupol.litzada amb Styrian Golding i aromatitzada amb Amarillo. Fermentada amb llevats anglesos.","IMAGEN":"mandril.png","VOTACION":"0","PREU":"0"},{"B_Id":"85","CERVESERA":"MARBLE","PROCEDENCIA":"MANCHESTER- UK","CERVESA":"BARLEYWINE","ESTIL_ABV_IBU":"Barley wine","ABV":"10,7%","IBU":"0","DESCRIPCIO":"Cervesa envellida en botes de vi (Barley Wine), us omplir\u00e0 la boca i el nas amb la seva complexitat de maltes, ll\u00fapuls i alcohol.","IMAGEN":"marble.png","VOTACION":"0","PREU":"0"},{"B_Id":"86","CERVESERA":"MARBLE","PROCEDENCIA":"MANCHESTER- UK","CERVESA":"DECADENCE","ESTIL_ABV_IBU":"Imperial Stout","ABV":"8,7%","IBU":"0","DESCRIPCIO":"Elaborada originalment per a commemorar els 10 anys de la cerveseria MARBLE. Aquesta cervesa t\u00e9 aromes a caf\u00e8, xocolata i licor, tot aix\u00f2 barrejat amb notes maltoses i una en\u00e8rgica amargor. Una cervesa perillosament bebible.","IMAGEN":"marble.png","VOTACION":"0","PREU":"0"},{"B_Id":"87","CERVESERA":"MAS MALTA CERVECERA","PROCEDENCIA":"MOI\u00c0- CATALUNYA","CERVESA":"EDBEER ROSSA","ESTIL_ABV_IBU":"Iber Ale","ABV":"5,6%","IBU":"24","DESCRIPCIO":null,"IMAGEN":"beer.png","VOTACION":"0","PREU":"0"},{"B_Id":"88","CERVESERA":"MEANTIME","PROCEDENCIA":"LONDON- ENGLAND","CERVESA":"AMERICAN BROWN ALE","ESTIL_ABV_IBU":"American Brown Ale","ABV":"5,5%","IBU":"37","DESCRIPCIO":"De color castanya amb sabors de malta torrada. Equilibrat amb una aroma notablement afruitada de ll\u00f9pol americ\u00e0 i un amargor mitj\u00e0. Cos mitj\u00e0 per\u00f2 deixa la boca neta.","IMAGEN":"meantime.png","VOTACION":"0","PREU":"0"},{"B_Id":"89","CERVESERA":"MEANTIME","PROCEDENCIA":"LONDON- ENGLAND","CERVESA":"CRANBERRY STOUT","ESTIL_ABV_IBU":"Cranberry Stout","ABV":"4,5%","IBU":"12","DESCRIPCIO":"Aquesta STOUT de nabius agafa la insppiraci\u00f3 de les cerveses \u00e0cides de Blegica. Refrescant i seca al final.","IMAGEN":"meantime.png","VOTACION":"0","PREU":"0"},{"B_Id":"90","CERVESERA":"MEANTIME","PROCEDENCIA":"LONDON- ENGLAND","CERVESA":"YAKIMA RED","ESTIL_ABV_IBU":"Red Ale","ABV":"4,5%","IBU":"45","DESCRIPCIO":"una barreja de 5 varietats de llupol dona aromes i sabors de gruita de passi\u00f3 i citrics a aquesta cervesa.","IMAGEN":"meantime.png","VOTACION":"0","PREU":"0"},{"B_Id":"91","CERVESERA":"MIKKELLER","PROCEDENCIA":"COPENHAGUEN- DENMARK","CERVESA":"BLACK 2011","ESTIL_ABV_IBU":"Imperial Stout Barrel Aged","ABV":"17,5%","IBU":"0","DESCRIPCIO":"Envellides 4 mesos en barriques de Whisky Escoc\u00e8s. Hi trobareu fum, dol\u00e7or de maltes torrefactes, caramel, panses, tabac, bacon fumat, fruites... Us encantar\u00e0!","IMAGEN":"mikkeller.png","VOTACION":"0","PREU":"0"},{"B_Id":"92","CERVESERA":"MIKKELLER","PROCEDENCIA":"COPENHAGUEN- DENMARK","CERVESA":"BLACK HOLE WHITE WHINE","ESTIL_ABV_IBU":"Imperial Stout Barrel Aged","ABV":"13,1%","IBU":"0","DESCRIPCIO":"Un comen\u00e7ament picant, seguit de notes maltoses i avinades, notareu tamb\u00e9 l'alcohol present i una mica de caf\u00e8 amargant acabant amb un final sec. El retrogust \u00e9s fins i tot una miqueta \u00e0cid degut a l'envelliment en barrica. Aix\u00f2 \u00e9s impresionant!","IMAGEN":"mikkeller.png","VOTACION":"0","PREU":"0"},{"B_Id":"93","CERVESERA":"MIKKELLER","PROCEDENCIA":"COPENHAGUEN- DENMARK","CERVESA":"SORACHI ACE SINGLE HOP","ESTIL_ABV_IBU":"I.P.A.","ABV":"6,9%","IBU":"0","DESCRIPCIO":"Carbonataci\u00f3 mitja i deliciosa, color daurat amb aromes a pi, pinya, chiclet i caramel. Per suposat que no falten els aromes d'aquest ll\u00fapol tan caracter\u00edstic i delici\u00f3s!","IMAGEN":"mikkeller.png","VOTACION":"0","PREU":"0"},{"B_Id":"94","CERVESERA":"MONTAIGU","PROCEDENCIA":"BRABANCIA FLAMENCA- BELGICA","CERVESA":"NONDEJU","ESTIL_ABV_IBU":"Tripel Gold","ABV":"10,7%","IBU":"44","DESCRIPCIO":"Belgian Strong Ale, triple de 4 maltes. Equilibrada, bon retogust, la t\u00edpica belga de la regi\u00f3 de Brabancia flamenca.","IMAGEN":"montaigu.png","VOTACION":"0","PREU":"0"},{"B_Id":"95","CERVESERA":"MOON","PROCEDENCIA":"LLI\u00c7A D'AMUNT- VALL\u00c8S ORIENTAL","CERVESA":"MOON THREE THREADS","ESTIL_ABV_IBU":"Porter","ABV":"6,3%","IBU":"30","DESCRIPCIO":"Fabricada amb cinc tipus de malta i dos ll\u00fapols. Molt equilibrada, amb aromes i sabor a caf\u00e8, regal\u00e8ssia i xocolata , amb un petit punt d\u2019amargar degut a les maltes torrades","IMAGEN":"moon.png","VOTACION":"0","PREU":"0"},{"B_Id":"96","CERVESERA":"MOSKA DE GIRONA","PROCEDENCIA":"SARRI\u00c0 DE TER- GIRONA","CERVESA":"MOSKA TORRADA","ESTIL_ABV_IBU":"Brown Ale","ABV":"6,0%","IBU":"24","DESCRIPCIO":"Cervesa d\u2019alta fermentaci\u00f3 a l\u2019estil brit\u00e0nic, amb bon cos i un potent sabor, escuma mitja i aromatitzada amb el tipic llupol angl\u00e9s cascade.","IMAGEN":"moska.png","VOTACION":"0","PREU":"0"},{"B_Id":"97","CERVESERA":"NAPARBIER","PROCEDENCIA":"IRU\u00d1A- PAMPLONA","CERVESA":"AMBER ALE","ESTIL_ABV_IBU":"Amber Ale","ABV":"5,5%","IBU":"45","DESCRIPCIO":"Elaborada con 4 maltas y l\u00fapulos americanos y australianos. Su aspecto es ambar a marr\u00f3n cobrizo y una buena retenci\u00f3n de espuma. Moderado sabor a malta caramelo y un marcado aroma y sabor a l\u00fapulo dejando una agradable sensaci\u00f3n en boca.","IMAGEN":"naparbier.png","VOTACION":"0","PREU":"0"},{"B_Id":"98","CERVESERA":"NAPARBIER","PROCEDENCIA":"IRU\u00d1A- PAMPLONA","CERVESA":"BLACK IPA","ESTIL_ABV_IBU":"Black I.P.A.","ABV":"8,5%","IBU":"85","DESCRIPCIO":"Revolucionaria Black IPA, en la que se consiguen los sabores de los l\u00fapulos de una IPA tradicional pero en este caso vestida de negro.","IMAGEN":"naparbier.png","VOTACION":"0","PREU":"0"},{"B_Id":"99","CERVESERA":"NAPARBIER","PROCEDENCIA":"IRU\u00d1A- PAMPLONA","CERVESA":"EL RAVAL EVIL TWIN","ESTIL_ABV_IBU":"A.P.A.","ABV":"5,5%","IBU":"0","DESCRIPCIO":"Elaborada por Evil Twin en las instalaciones de Naparbier. Es un homenaje a todos nuestros barrios Hipster favoritos del mundo, \u00e9sta al Raval (Barcelona). Los jeans ajustados, converse, cuadros sobredimensionados y ropa vintage. Salud, Hipsters!","IMAGEN":"naparbier.png","VOTACION":"0","PREU":"0"},{"B_Id":"100","CERVESERA":"NOGNE","PROCEDENCIA":"GRIMSTAD- NORWAY","CERVESA":"GOD JUL","ESTIL_ABV_IBU":"Dark Ale","ABV":"8,5%","IBU":"30","DESCRIPCIO":"Una d\u2019alta fermentaci\u00f3 fosca elaborada especialment per Nadal amb un gust Ric i complex de caramel. Forta i una notablement dol\u00e7a, exactament com creiem que hauria de ser.","IMAGEN":"nogne_godjul.png","VOTACION":"0","PREU":"0"},{"B_Id":"101","CERVESERA":"NOGNE","PROCEDENCIA":"GRIMSTAD- NORWAY","CERVESA":"IMPERIAL STOUT","ESTIL_ABV_IBU":"Imperial Stout","ABV":"9,0%","IBU":"75","DESCRIPCIO":"Creiem que li hauria agradat al Tsar beure la seva stout aixi. una d\u2019alta fermentaci\u00f3 fosca i rica generosament dol\u00e7a amb amargor de malta torrada.","IMAGEN":"nogne_stout.png","VOTACION":"0","PREU":"0"},{"B_Id":"102","CERVESERA":"NOGNE","PROCEDENCIA":"GRIMSTAD- NORWAY","CERVESA":"KOLLABORATOR","ESTIL_ABV_IBU":"Doublebock","ABV":"8,5%","IBU":"25","DESCRIPCIO":"Una doublebock rica i plena de cos. Era col.laboraci\u00f3 entre N\u00f8gne \u00d8 i \u00c6gir","IMAGEN":"nogne.png","VOTACION":"0","PREU":"0"},{"B_Id":"103","CERVESERA":"OR I PLATA CERVESERS","PROCEDENCIA":"SABADELL- CATALUNYA","CERVESA":"BITTER","ESTIL_ABV_IBU":"Extra Special Bitter","ABV":"5,8%","IBU":"42","DESCRIPCIO":"Una bitter amb un punt afruitat i floral d\u2019inici i un final lleugerament amargant. Amb llupols americans (Chinnok i Amarillo) i dry hopping de Cascade.","IMAGEN":"oriplata.png","VOTACION":"0","PREU":"0"},{"B_Id":"104","CERVESERA":"REPTILIAN","PROCEDENCIA":"EL VENDRELL- CATALUNYA","CERVESA":"THYMUS","ESTIL_ABV_IBU":"Witbier","ABV":"4,2%","IBU":"23","DESCRIPCIO":"Witbier mediterr\u00e0nia, elaborada amb espelta biol\u00f2gica i aromatitzada amb farigola, a part dels ingredients propis del estil. Suau i refrescant","IMAGEN":"reptilian.png","VOTACION":"0","PREU":"0"},{"B_Id":"105","CERVESERA":"ROGUE","PROCEDENCIA":"OREGON- E.U.A.","CERVESA":"CHATOE OREGASMIC","ESTIL_ABV_IBU":"American Pale Ale","ABV":"5,3%","IBU":"40","DESCRIPCIO":"Color taronja ambr\u00e9, aroma maltosa, sabor afruitat i especiat sobre una base de malta, el sabor dura a la boca.Tots els ingredients son de les granges de ROGUE.","IMAGEN":"rogue.png","VOTACION":"0","PREU":"0"},{"B_Id":"106","CERVESERA":"ROGUE","PROCEDENCIA":"OREGON- E.U.A.","CERVESA":"DRY HOP RED","ESTIL_ABV_IBU":"Amber Ale","ABV":"5,1%","IBU":"44","DESCRIPCIO":"Un color Vermell\u00f2s, sabor de maltes torrades amb notes de ll\u00fapol de picea i resina.","IMAGEN":"rogue.png","VOTACION":"0","PREU":"0"},{"B_Id":"107","CERVESERA":"ROGUE","PROCEDENCIA":"OREGON- E.U.A.","CERVESA":"HONEY ORANGE WHEAT","ESTIL_ABV_IBU":"Wheat Ale","ABV":"5,3%","IBU":"10","DESCRIPCIO":"Aquesta cervesa sense filtrar t\u00e9 sabors de taronja i mel amb un cos lleugerament dol\u00e7.","IMAGEN":"rogue.png","VOTACION":"0","PREU":"0"},{"B_Id":"108","CERVESERA":"SIERRA NEVADA","PROCEDENCIA":"CHICO- CALIFORNIA","CERVESA":"TORPEDO","ESTIL_ABV_IBU":"American I.P.A.","ABV":"7,2%","IBU":"65","DESCRIPCIO":"Una de les millors American I.P.A., descarada i en\u00e8rgica, plena d'aromes herbals deguts als ll\u00fapols americans.","IMAGEN":"sierranevada.png","VOTACION":"0","PREU":"0"},{"B_Id":"109","CERVESERA":"SLAAPMUTSKE","PROCEDENCIA":"GRIMSTAD- NORWAY","CERVESA":"DRY HOP LAGER","ESTIL_ABV_IBU":"Blonde Ale","ABV":"5,3%","IBU":"35","DESCRIPCIO":"La combinaci\u00f3 de llupolitzaci\u00f3 en sec i maduraci\u00f3 'lagering' dona un gust molt refrescant a aquesta cervesa amarga de baixa fermentaci\u00f3. ","IMAGEN":"beer.png","VOTACION":"0","PREU":"0"},{"B_Id":"110","CERVESERA":"SLAAPMUTSKE","PROCEDENCIA":"GRIMSTAD- NORWAY","CERVESA":"HOP COLLECTION","ESTIL_ABV_IBU":"Blonde Ale","ABV":"10,0%","IBU":"35","DESCRIPCIO":"Una rossa d'alta fermentaci\u00f3 plena de sabor i aroma de ll\u00fapol. S'ha fet servir nom\u00e9s de Kent Golding al most i a la llupolitzaci\u00f3 en sec. ","IMAGEN":"beer.png","VOTACION":"0","PREU":"0"},{"B_Id":"111","CERVESERA":"SOC. CERVESERA ARTESENCA S.L. CERBERUS","PROCEDENCIA":"ARTES (BARCELONA) - BAGES","CERVESA":"AURUM","ESTIL_ABV_IBU":"Pale Ale","ABV":"4,7%","IBU":"30","DESCRIPCIO":"Cervesa daurada, amb gust, i ben llupolitzada amb varietats americanes.","IMAGEN":"cerberus.png","VOTACION":"0","PREU":"0"},{"B_Id":"112","CERVESERA":"SPHIGA","PROCEDENCIA":"ALCOI- VAL\u00c8NCIA","CERVESA":"NA VALORA","ESTIL_ABV_IBU":"Pale Ale","ABV":"0%","IBU":"35","DESCRIPCIO":"Cervesa d\u2019alta fermentaci\u00f3 inspirada en les cerveses tradicionals d\u2019estil Pale Ale. De color mel, destaca pel seu marcat car\u00e0cter a ll\u00fapol. La carbonataci\u00f3 \u00e9s el resultat del proc\u00e9s de maduraci\u00f3 en botella.","IMAGEN":"spigha.png","VOTACION":"0","PREU":"0"},{"B_Id":"113","CERVESERA":"ST. GEORGENBR\u00c4U","PROCEDENCIA":"BUTTENHEIM- GERMANY","CERVESA":"KELLERBIER","ESTIL_ABV_IBU":"Kellerbier","ABV":"4,9%","IBU":"35","DESCRIPCIO":"Estilo cl\u00e1sico de Franconia, sin filtrar y con fermentaci\u00f3n en abierto, confiri\u00e9ndole menos gas y m\u00e1s matices. Cobriza, cremosa, maltosa y lupulada.","IMAGEN":"georgenbrau.png","VOTACION":"0","PREU":"0"},{"B_Id":"114","CERVESERA":"ST. GEORGENBR\u00c4U","PROCEDENCIA":"BUTTENHEIM- GERMANY","CERVESA":"PILSENER","ESTIL_ABV_IBU":"German Pils","ABV":"4,9%","IBU":"0","DESCRIPCIO":"Color dorado, aromas herbales y de cereal. Paso ligero y refrescante. Sabor limpio de la malta, y suave amargor y sequedad final de su l\u00fapulo alem\u00e1n.","IMAGEN":"georgenbrau.png","VOTACION":"0","PREU":"0"},{"B_Id":"115","CERVESERA":"ST. GEORGENBR\u00c4U","PROCEDENCIA":"BUTTENHEIM- GERMANY","CERVESA":"WEISSBIER","ESTIL_ABV_IBU":"Weissbier","ABV":"4,6%","IBU":"0","DESCRIPCIO":"Cerveza de trigo, con su cremosa y abundante cabeza blanca. Notas de pl\u00e1tano, levadura y c\u00edtricos. Su delicado dulzor y acidez, la hacen muy refrescante.","IMAGEN":"georgenbrau.png","VOTACION":"0","PREU":"0"},{"B_Id":"116","CERVESERA":"STEVE'S BEER","PROCEDENCIA":"MERSEYSIDE- INGLATERRA","CERVESA":"STEVE'S BEST BITTER","ESTIL_ABV_IBU":"Bitter Ale","ABV":"4,8%","IBU":"40","DESCRIPCIO":"\u00c9s una cervesa complexa, es noten els efectes de tots els ingredients per\u00f2 amb un desequilibri a favor dels ll\u00fapols. Regust persistent i addictiu.","IMAGEN":"steve.png","VOTACION":"0","PREU":"0"},{"B_Id":"117","CERVESERA":"THE EVIL TWIN","PROCEDENCIA":"SOUTH CAROLINA- U.S.A.","CERVESA":"BISCOTTI BREAK","ESTIL_ABV_IBU":"Imperial Porter","ABV":"8,4%","IBU":"0","DESCRIPCIO":"Porter feta amb caf\u00e8, vainilla i ametlles torrades per un \u2018Mare di Birra\u2019 el creuer de la cervesa Roma-Barcelona al juny de 2011. La primera cervesa va ser elaborada a Fano Bryghus, despr\u00e9s a Westbrook Brewing (EUA).","IMAGEN":"eviltwin.png","VOTACION":"0","PREU":"0"},{"B_Id":"118","CERVESERA":"THE EVIL TWIN","PROCEDENCIA":"SOUTH CAROLINA- U.S.A.","CERVESA":"YANG","ESTIL_ABV_IBU":"Imperial I.P.A.","ABV":"9,2%","IBU":"0","DESCRIPCIO":"Aix\u00f2 \u00e9s la meitat d\u2019un Black & Tan (una mescla de dos cerveses, habitualment una Pale Ale i una Stout o Porter). No qualsevol Black & Tan, sino un on l\u2019aroma torrat i el ll\u00fapol es reuneixen per fer un sublim equilibri de Taiji. S'aconsella barrejar","IMAGEN":"eviltwin.png","VOTACION":"0","PREU":"0"},{"B_Id":"119","CERVESERA":"THE EVIL TWIN","PROCEDENCIA":"SOUTH CAROLINA- U.S.A.","CERVESA":"YIN","ESTIL_ABV_IBU":"Imperial Stout","ABV":"9,2%","IBU":"0","DESCRIPCIO":"Aquesta \u00e9s l'altra meitat del Black & Tan, una Imperial Stout profundament maligna. T'aconsellem barrejar-la amb la cervesa anterior, YANG, per aconseguir l'equilibri sublim de Taiji; o disfrutar-la sola en tota la seva maldat.","IMAGEN":"eviltwin.png","VOTACION":"0","PREU":"0"},{"B_Id":"120","CERVESERA":"THORNBRIDGE","PROCEDENCIA":"BAKEWELL- DERBYSHIRE","CERVESA":"JAIPUR","ESTIL_ABV_IBU":"Indian Pale Ale","ABV":"5,7%","IBU":"0","DESCRIPCIO":"I.P.A. c\u00edtrica, la primera impressi\u00f3 \u00e9s suau seguida d'un crescendo de ll\u00fapul accentuat per la mel.","IMAGEN":"thornbridge.png","VOTACION":"0","PREU":"0"},{"B_Id":"121","CERVESERA":"To Ol","PROCEDENCIA":"COPENHAGUEN- DENMARK","CERVESA":"BLACK BALL","ESTIL_ABV_IBU":"Porter","ABV":"8,0%","IBU":"0","DESCRIPCIO":"Es tracta d\u2019una Porter potent, amb sucre Cassonade fosca i un bon munt de ll\u00fapols americans per reequilibrar el perfil malt\u00f3s. Notes de xocolata, caramel i sofre. Black IPA? No, les porters llupolades ja s\u00f3n aqu\u00ed i per quedar-se!","IMAGEN":"tool.png","VOTACION":"0","PREU":"0"},{"B_Id":"122","CERVESERA":"To Ol","PROCEDENCIA":"COPENHAGUEN- DENMARK","CERVESA":"FINAL FRONTIER","ESTIL_ABV_IBU":"Imperial I.P.A.","ABV":"9,0%","IBU":"0","DESCRIPCIO":null,"IMAGEN":"tool.png","VOTACION":"0","PREU":"0"},{"B_Id":"123","CERVESERA":"VALDIEU","PROCEDENCIA":"AUBEL- BELGIUM","CERVESA":"BLONDE","ESTIL_ABV_IBU":"Belgian Ale","ABV":"6,0%","IBU":"0","DESCRIPCIO":"Cervesa de Monastir d\u2019alta fermentaci\u00f3, filtrada en part, per\u00f2 no pasteuritzada. Al principi de gust ensucrat, despr\u00e9s una mica amarg, fet a partir de dues varietats de ll\u00fapol tradicionals. Regust lleugerament amarg. Molt digerible i refrescant.","IMAGEN":"valdieu.png","VOTACION":"0","PREU":"0"},{"B_Id":"124","CERVESERA":"VALDIEU","PROCEDENCIA":"AUBEL- BELGIUM","CERVESA":"TRIPLE","ESTIL_ABV_IBU":"Triple Abad\u00eda","ABV":"9,0%","IBU":"0","DESCRIPCIO":"Pale Ale triple d\u2019abadia, sense filtrar i sense pasteuritzar. Amb cos i sabor progressiu, per\u00f2 no excessiu. Un sabor lleugerament ensucrat. Una perfecta combinaci\u00f3 d\u2019alcohol, amargor i dol\u00e7or.","IMAGEN":"valdieu.png","VOTACION":"0","PREU":"0"},{"B_Id":"125","CERVESERA":"VIVEN BREWERY","PROCEDENCIA":"SIJSELE - BELGIUM","CERVESA":"IMPERIAL I.P.A.","ESTIL_ABV_IBU":"Imperial I.P.A.","ABV":"8,0%","IBU":"0","DESCRIPCIO":"Aquesta recepta origin\u00e0ria de la costa oest d'Am\u00e8rica,combinada amb l'art cerveser Flemish ha donat un excellent resultat, sense dubte. Far\u00e0 que el cor dels amants de la cervesa bategui amb for\u00e7a. \u00c9s amarga amb un bonic equilibri de notes c\u00edtriq","IMAGEN":"viven.png","VOTACION":"0","PREU":"0"},{"B_Id":"126","CERVESERA":"ZULOGAARDEN CERVESERS ARTESANS","PROCEDENCIA":"MOLINS DE REI- CATALUNYA","CERVESA":"VIERNES 13","ESTIL_ABV_IBU":"Doble I.P.A.","ABV":"7,0%","IBU":"100","DESCRIPCIO":"Doncs, no ho sabem encara, est\u00e0 fermentant, en principi ser\u00e0 una doble I.P.A. amb cos, molt llupulitzada i amb tocs de llima, aranja, pinya, fruites madures ... per\u00f2 jo que se.","IMAGEN":"zulogaarden.png","VOTACION":"0","PREU":"0"}];
/*
function announcementListViewTemplatesInit() {
	$("#announcements-listview").kendoMobileListView({
		dataSource: kendo.data.DataSource.create({ data: beers }),
		template: $("#announcement-listview-template").html()
	});
}*/
function announcementListViewTemplatesInit() {
getData(onResult);  

 //createArray(function(myArray2) {});
     
    /*
    var dataSource = new kendo.data.DataSource({
        transport: {
            read: {
                url: serviceURL + 'getbeers.php',
                type: "GET",
                dataType: "json"
            }
        },
        schema: {
            data: function (data) {
                alert(data.d);   //Data Return Successfully
                return data.d;
            }
        },
        error: function (e) {
            alert("Error");
        },
        change: function (e) {
            alert("Change");
              $("#announcements-listview").kendoMobileListView({
                        dataSource: kendo.data.DataSource.create({ data: myArray2 }),
                        template: $("#announcement-listview-template").html()
                });
        },
        requestStart: function (e) {
            alert("Request Start");
        }
    });
    */
}
function onGeolocationError(error) {
	alert(error.message);
}

function setStiresViews(locations) {
	var pinColor = "66CCFF";

	/*var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
												new google.maps.Size(40, 37),
												new google.maps.Point(0, 0),
												new google.maps.Point(12, 35));*/
    

     var pimImage = new google.maps.MarkerImage("images/cofeeCup-sprite.png",
      new google.maps.Size(49, 49),
      new google.maps.Point(0,202),
      new google.maps.Point(0, 32));
    
    
	var marker,
    currentMarkerIndex = 0;
    function createMarker(index){
        if(index<locations.length)
        marker = new google.maps.Marker({
			map: mapElem,
			animation: google.maps.Animation.DROP,
			position: locations[index].latlng,
			title: locations[index].address.replace(/(&nbsp)/g," "),
			icon: pimImage
		});
        oneMarkerAtTime();
    }
    
	createMarker(0);
    function oneMarkerAtTime()
    {
        google.maps.event.addListener(marker,"animation_changed",function()
        {
           if(marker.getAnimation()==null)
            {
                createMarker(currentMarkerIndex+=1);
            }
        });
    }
	
	$("#stores-listview").kendoMobileListView({
		dataSource: kendo.data.DataSource.create({ data: locations}),
		template: $("#stores-listview-template").html()
	});
}

//Cards informations
// TODO: rename to cardsDataViewModel
var cardsData = kendo.observable({
	init:function() {
		var i;
		this._cardNumbers = {};
        var cards=[];
		if (window.localStorage.getItem("cards") !== null) {
            cards = JSON.parse(window.localStorage.getItem("cards"));
		}
		for (i = 0; i < cards.length; i+=1) {
			this._cardNumbers[cards[i].cardNumber] = i;
		}
                //alert(JSON.stringify(cards));
		cardsData.set("cards", cards);
	},
	cardNumbers: function(value) {
		if (value) {
			this._cardNumbers = value;
		}
		else {
			return this._cardNumbers;
		}
	},
	cards : []
});

function writeIntoLocalStorage(e) {
	var dataToWrite = JSON.stringify(cardsData.cards);
	window.localStorage.setItem("cards", dataToWrite);
}

function focusCardNumber() {
    $('#cardNumberField').focus();
}


function addNewCard() {
	var cardNumberValue = $('#cardNumberField').val();
    
	if (checkIsValid(cardNumberValue)) {
		var currentAmount = Math.floor((Math.random() * 100) + 10),
		    bonusPoints = Math.floor(Math.random() * 100),
            currentDate = new Date(),    
            expireDate = currentDate.setFullYear(currentDate.getFullYear() + 2);
        
		var cardToAdd = {
			cardNumber : cardNumberValue,
			amount: currentAmount,
			bonusPoints: bonusPoints,
            expireDate: kendo.toString(expireDate, "yyyy/MM/dd")
		}
        
		var positionAdded = cardsData.cards.push(cardToAdd) - 1;
		cardsData.cardNumbers()[cardNumberValue] = positionAdded;
        
		app.navigate("#cardsView");
	}
}

function validateCardNumber(cardNumberValue) {
	var validateNumberRegex = /^[0-9]{9}$/;
	var isValidCardNumber = validateNumberRegex.test(cardNumberValue);
    
	return isValidCardNumber;
}

function isDublicateNumber(cardNumberValue) {
	var isDublicate = cardsData.cardNumbers().hasOwnProperty(cardNumberValue);
	return isDublicate;
}

function listViewCardsInit() {
   
}

function appendCardFadeEffect($cardFront, $cardBack) {

	$cardFront.click(function(e) {
		$(e.currentTarget).fadeOut(500, "linear", function() {
			$cardBack.fadeIn(500, "linear");
		});

	});
    
	$cardBack.click(function(e) {
		$(e.currentTarget).fadeOut(500, "linear", function() {
			$cardFront.fadeIn(500, "linear");
		});
	});
}

function deleteCard(cardId) {
	var allCardsArray = cardsData.cards;
    
	for (var i = -1, len = allCardsArray.length; ++i < len;) {
		if (allCardsArray[i].cardNumber === cardId) {
			allCardsArray.splice(i, 1);
			delete cardsData.cardNumbers()[cardId];
			break;
		}
	} 
}

function generateBarcodeUrl(cardId) {
    
	var size = "130",
    	urlSizeParameter = "chs=" + size + "x" + size,
    	urlQrParameter = "cht=qr",
    	urlDataParameter = "chl=" + cardId,
    	urlBase = "https://chart.googleapis.com/chart?",
    	imageRequestString = urlBase + urlSizeParameter + "&" + urlQrParameter + "&" + urlDataParameter; 
    
	return imageRequestString;
}

// TODO: get this into the view model
// of the view it initializes
function singleCardShow(arguments) {
    var cardId = arguments.view.params.cardNumber;
    singleCardViewModel.setValues.call(singleCardViewModel, cardId);
	
    var $cardFront = $("#cardFront"),
	    $cardBack = $("#cardBack");
	
    appendCardFadeEffect($cardFront, $cardBack);
}

var singleCardViewModel = new kendo.observable({
    setValues: function(cardId) {
        var that = this,
            cardPosition = cardsData.cardNumbers()[cardId],
            currentCard = cardsData.cards[cardPosition];
        if(currentCard.bonusPoints<50)
         {
            $("#cardFront").removeClass("gold").addClass("silver");
            $("#cardBack").removeClass("gold").addClass("silver");
        } else {
            $("#cardFront").removeClass("silver").addClass("gold");
            $("#cardBack").removeClass("silver").addClass("gold");
        }
        that.set("barcodeUrl", generateBarcodeUrl(cardId));
		that.set("cardId","#" + cardId);
		that.set("cardAmount", kendo.toString(currentCard.amount, "c"));
		that.set("barcodeURL", currentCard.bonusPoints);
		that.set("currentDate", kendo.toString(new Date(), "yyyy/MM/dd hh:mm tt"));
    },
    
    barcodeUrl : "",
	cardId : "",
	cardAmount : "",
	bonusPoints : "",
	currentDate : ""
});

function processDeleteCard() {
    var cardIdString = singleCardViewModel.cardId,
        cardIdLength = singleCardViewModel.cardId.length,
        cardId = cardIdString.substring(1, cardIdLength);
    deleteCard(cardId);
    app.navigate('#cardsView');
}

/*------------------- Rewards ----------------------*/

var rewardCards = {
	gold : {
		imageURLFront:"http://www.arbolcrafts.co.uk/images/gold%20card%20blanks.jpg",
		imageURLBack:"http://www.arbolcrafts.co.uk/images/gold%20card%20blanks.jpg",
		rewards:[
			{reward:"Free coffee every day"},
			{reward:"Free refill"},
			{reward:"Free cookies with every drink"}
		]
	},
	silver:{
		imageURLFront:"http://originalgiftsforwoman.com/wp-content/uploads/2012/02/prepaid-gift-cards.s600x600-300x190.jpg",
		imageURLBack:"http://originalgiftsforwoman.com/wp-content/uploads/2012/02/prepaid-gift-cards.s600x600-300x190.jpg",
		rewards:[
			{reward:"Free refill"},
			{reward:"Free cookies with every drink"}
		]
	}
};

function rewardsViewInit() {
    
}

var rewardsViewModel = new kendo.observable({
		setBonusPoints: function(e){
            var that = this,
            bonusPointsReceived=e.view.params.bonusPoints,
            bonusCardBarcodeSeq = e.view.params.cardNumber+"bonus",
            currentCard = null,
            barcode =generateBarcodeUrl(bonusCardBarcodeSeq) ;
            that.set("cardNumber","#"+e.view.params.cardNumber);
            that.set("bonusPoints","Bonus:"+bonusPointsReceived);
            if(bonusPointsReceived<50)
             {
                currentCard = rewardCards["silver"];
                $("#rewardCardFront").removeClass("gold").addClass("silver");
                $("#rewardCardBack").removeClass("gold").addClass("silver");
            } else {
                currentCard = rewardCards["gold"];
                $("#rewardCardFront").removeClass("silver").addClass("gold");
                $("#rewardCardBack").removeClass("silver").addClass("gold");
            }
            that.set("rewards",currentCard.rewards);
            that.set("imageUrlFront",'url('+currentCard.imageURLFront+ ')');
            that.set("imageUrlBack",'url('+currentCard.imageURLBack + ')');
            that.set("barcodeURL",barcode);
            that.set("currentDate",kendo.toString(new Date(), "yyyy/MM/dd hh:mm tt" ))
		},
		imageUrlFront: "",
		imageUrlBack: "",
		rewards: [],
		bonusPoints:0,
        barcodeURL:"",
        currentDate:"",
        cardNumber:""
	});

function rewardCardShow() {
	rewardsViewModel.setBonusPoints.apply(rewardsViewModel, arguments);
	var $rewardCardFront = $("#rewardCardFront"),
	    $rewardCardBack = $("#rewardCardBack");
    
	appendCardFadeEffect($rewardCardFront, $rewardCardBack);
}
