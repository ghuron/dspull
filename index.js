var req = window.location.search.replace("?","").split('&')

for (var i = 0; i<req.length;i++){
	switch (req[i].slice(0,req[i].indexOf("="))){
		case "site": var site = req[i].slice(req[i].indexOf("=")+1); break;
	}
}
var wikidataUrl = 'https://query.wikidata.org/sparql?query=SELECT%20%3Fitem%20%3FitemLabel%20%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3AQ63090714.%0A%20%20%5B%5D%20schema%3Aabout%20%3Fitem%3B%20schema%3AisPartOf%20%3Chttps%3A%2F%2F'+ site.slice(0,-4) + '.wikipedia.org%2F%3E.%0A%20%20%5B%5D%20schema%3Aabout%20%3Fitem%3B%20schema%3AisPartOf%20%3Chttps%3A%2F%2Fwww.mediawiki.org%2F%3E%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22ru%22%20%7D%0A%7D%0A'
$.get( wikidataUrl, {format:'json', origin:'*'}, function(res) {

	for (var i = 0; i < res.results.bindings.length; i++) {
		
		var moduleId = res.results.bindings[i].item.value.slice(res.results.bindings[i].item.value.lastIndexOf('Q'))	

		document.getElementById('list').innerHTML += '<li><a href="pull/?id='+moduleId+'&amp;site='+site+'">'+res.results.bindings[i].itemLabel.value+'</a></li>' ;
	}
});