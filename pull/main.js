var req = window.location.search.replace("?","").split('&')

for (var i = 0; i<req.length;i++){
	switch (req[i].slice(0,req[i].indexOf("="))){
		case "id": var id = req[i].slice(req[i].indexOf("=")+1); break;
		case "site": var site = req[i].slice(req[i].indexOf("=")+1); break;
	}
}


$(document).ready(function () {
	$('#mergely').mergely({license: 'lgpl-separate-notice'});// initialize mergely
	});

$.get('https://www.wikidata.org/w/api.php?', {action:'wbgetentities', ids:id, props:'sitelinks', format:'json', origin:'*'}, function(res) {

	var mediawikiTitle = res.entities[id].sitelinks["mediawikiwiki"].title;//Название модуля на MediaWiki
	var mediawikiUrl = "https://www.mediawiki.org/w/api.php?action=query&titles=" + encodeURIComponent(mediawikiTitle).replace('%3A',':').replace('%20',' ') + "&prop=revisions&rvprop=content|timestamp" ;//Ссылка на модуль MediaWiki
	var mediawikiDocUrl = "https://www.mediawiki.org/w/api.php?action=query&titles=" + encodeURIComponent(mediawikiTitle).replace('%3A',':').replace('%20',' ') + "/doc&prop=revisions&rvprop=content|timestamp" ;//Ссылка на модуль MediaWiki
	var siteTitle = res.entities[id].sitelinks[site].title;//Название модуля на искомом Wiki(можно использовать MediaWiki)
	var siteUrl = "https://" + site.slice(0,-4) + ".wikipedia.org/w/api.php?action=query&titles=" + encodeURIComponent(siteTitle).replace('%3A',':').replace('%20',' ') + "&prop=revisions&rvprop=content|timestamp" ;//Ссылка на искомый модуль

	$.get(mediawikiUrl, {format:'json', origin:'*'}, function(mediawikiJson) {
		$.get(siteUrl, {format:'json', origin:'*'}, function(siteJson) {

			var mediawikiPageId = Object.keys(mediawikiJson.query.pages)[0];
			var mediawikiTimestamp = mediawikiJson.query.pages[mediawikiPageId].revisions[0].timestamp;
			var mediawikiText = mediawikiJson.query.pages[mediawikiPageId].revisions[0]['*'];
			
			var sitePageId = Object.keys(siteJson.query.pages)[0];
			var siteTimestamp = siteJson.query.pages[sitePageId].revisions[0].timestamp;
			var siteText = siteJson.query.pages[sitePageId].revisions[0]['*'];

			document.getElementById('lheader').innerHTML = site + '<br>' + siteTitle + '<br>' + siteTimestamp; 
			document.getElementById('rheader').innerHTML = 'mediawiki<br>' + mediawikiTitle + '<br>' + mediawikiTimestamp;

			$('#mergely').mergely('lhs', siteText);
			$('#mergely').mergely('rhs', mediawikiText);

			$.get(mediawikiDocUrl, {format:'json', origin:'*'}, function(mediawikiDocJson) {

				var mediawikiDocPageId = Object.keys(mediawikiDocJson.query.pages)[0];
				
				if (mediawikiDocPageId!="-1"){
					var mediawikiDocTimestamp = mediawikiDocJson.query.pages[mediawikiDocPageId].revisions[0].timestamp;
					var mediawikiDocText = mediawikiDocJson.query.pages[mediawikiDocPageId].revisions[0]['*'];

					if (mediawikiDocText.indexOf('{{Shared Template Warning|') != -1){
						var saveButton = document.getElementById('saveButton');
						saveButton.addEventListener("click", function(e){

							$.post("https://ru.wikipedia.org/w/api.php", 
								{action :'edit',token : '+\\',text : mediawikiText, title:'Википедия:Песочница', origin:'*'},function(text){console.log(mediawikiText);});						
							})

					} else {alert('Module not shared') }
				} else {alert('Doc does not exist') }
				
			});


		});
	});
});

