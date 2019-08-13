$.get( 'https://tools.wmflabs.org/dspull/username.php', function(res) {
	document.getElementById('login').innerHTML = res;	
}).fail(function() {
	document.getElementById('login').innerHTML = "Login";	
});


var req = window.location.search.replace("?","").split('&')

for (let i of req){
	switch (i.slice(0, i.indexOf("="))){
		case "site": var site = i.slice(i.indexOf("=")+1); break;
	};
};
window.onload = function(){  
	listText = "";

	if(!!site) {
		var siteShort = site.slice(0,-4);//enwiki->en
		var wikidataRequest = 'PREFIX mw: <http://tools.wmflabs.org/mw2sparql/ontology#>\
		select ?item (SUBSTR(STR(?source), 32) AS ?itemLabel) ?itemTarget ?base (SUBSTR(STR(?parent), 32) AS ?baseLabel) ?baseTarget {\
			hint:Query hint:optimizer "None" .\
			?item wdt:P31 wd:Q63090714.\
			OPTIONAL { ?itemTarget schema:about ?item; schema:isPartOf <https://' + siteShort + '.wikipedia.org/> }\
			?source schema:about ?item; schema:isPartOf <https://www.mediawiki.org/>\
			SERVICE <http://tools.wmflabs.org/mw2sparql/sparql> {\
				?source mw:includesPage ?parent\
			}\
			OPTIONAL { ?parent schema:about ?base . ?baseTarget schema:about ?base; schema:isPartOf <https://' + siteShort + '.wikipedia.org/> }\
		} ORDER BY ?itemLabel ?baseLabel';

		var wikidataUrl = 'https://query.wikidata.org/sparql?query=' + encodeURIComponent(wikidataRequest);
		console.log(wikidataUrl);
		$.get( wikidataUrl, {format:'json', origin:'*'}, function(res) {
			var itemLabel = '';
			for (let i = 0; i < res.results.bindings.length; i++) {
				
				var moduleItemId = res.results.bindings[i].item.value.slice(res.results.bindings[i].item.value.lastIndexOf('Q'));					
				var baseLabel = res.results.bindings[i].baseLabel.value;
				if (res.results.bindings[i].itemLabel.value != itemLabel){
					if (i != 0 ){listText += '</ul>'};
					itemLabel = res.results.bindings[i].itemLabel.value;
					if (!!res.results.bindings[i].itemTarget){
						listText += '<li><a href="pull/?id='+moduleItemId+'&amp;site='+site+'">'+ itemLabel +'</a></li><ul>';	
					}else{
						listText += '<li><a>'+ itemLabel +'</a></li><ul>';	
					}
				}

				if (itemLabel != baseLabel){
					if (!!res.results.bindings[i].baseTarget){
						var moduleBaseId = res.results.bindings[i].base.value.slice(res.results.bindings[i].base.value.lastIndexOf('Q'));	
						listText += '<li><a href="pull/?id='+moduleBaseId+'&amp;site='+site+'">'+ baseLabel +'</a></li>' ;	
					}else{
						listText += '<li><a>'+ baseLabel +'</a></li>' ;	
					}
				}

			}
			listText += '</ul>';
			document.getElementById('list').innerHTML += listText;	
		});    
	}else{

		document.getElementById('list').innerHTML += '<p>Enter wiki: <input id = "inputWiki" placeholder="e.g. enwiki" value ="ruwiki"><input type="submit" id = "openButton" value="Open"/></p>';
		$('#inputWiki').keyup(function(){
			var keycode = (event.keyCode ? event.keyCode : event.which);
			if(keycode == '13' && /[a-z]{1,10}(wiki)/.test($(this).val())){
				document.location.href = "?site=" + $(this).val();
			}
		});
		$( "#openButton" ).click(function(){ 
			if(/[a-z]{1,10}(wiki)/.test($('#inputWiki').val())){
	    		document.location.href = "?site=" +$('#inputWiki').val();
	    	};
		});

		};
	};

