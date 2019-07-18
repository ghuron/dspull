var req = window.location.search.replace("?","").split('&')

for (var i = 0; i<req.length;i++){
	switch (req[i].slice(0,req[i].indexOf("="))){
		case "id": var id = req[i].slice(req[i].indexOf("=")+1); break;
		case "site": var site = req[i].slice(req[i].indexOf("=")+1); break;
	}
}

$(document).ready(function () {$('#mergely').mergely();});// initialize mergely

$.get('https://www.wikidata.org/w/api.php?action=wbgetentities&ids='+id+'&props=sitelinks&format=json&origin=*', function(res) {

	var mediawikiTitle = encodeURIComponent(res.entities[id].sitelinks["mediawikiwiki"].title).replace('%3A',':').replace('%20',' ');//Название модуля на MediaWiki
	var mediawikiUrl = "https://www.mediawiki.org/w/api.php?format=json&action=query&titles=" + mediawikiTitle + "&prop=revisions&rvprop=content&origin=*" ;//Ссылка на модуль MediaWiki
	var siteTitle = encodeURIComponent(res.entities[id].sitelinks[site].title).replace('%3A',':').replace('%20',' ');//Название модуля на искомом Wiki(можно использовать MediaWiki)
	var siteUrl = "https://" + site.slice(0,-4) + ".wikipedia.org/w/api.php?format=json&action=query&titles=" + siteTitle + "&prop=revisions&rvprop=content&origin=*" ;//Ссылка на искомый модуль

	$.get(mediawikiUrl, function(mediawikiJson) {
		$.get(siteUrl, function(siteJson) {

			var mediawikiPageId = Object.keys(mediawikiJson.query.pages)[0];
			var sitePageId = Object.keys(siteJson.query.pages)[0];
			var mediawikiText = mediawikiJson.query.pages[mediawikiPageId].revisions[0]['*'];
			var siteText = siteJson.query.pages[sitePageId].revisions[0]['*'];

			document.getElementById('header').innerHTML = '<table width="100%" cellspacing="0" cellpadding="5"><tr><td width="50%" valign="top">mediawiki<br>'+mediawikiUrl+'</td><td valign="top">'+site+'<br>'+siteUrl+'</td></tr></table>';
			
			$('#mergely').mergely('lhs', mediawikiText);
			$('#mergely').mergely('rhs', siteText);

		}).fail(function() { alert("error"); })
	}).fail(function() { alert("error"); })
}).fail(function() { alert("error"); })

