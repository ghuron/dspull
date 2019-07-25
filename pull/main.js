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
	
	$.get(mediawikiUrl, {rvlimit: 50, format:'json', origin:'*'}, getMediawikiJson);
	function getMediawikiJson (mediawikiJson) {
		
		var mediawikiPageId = Object.keys(mediawikiJson.query.pages)[0];
		var mediawikiTimestamp = mediawikiJson.query.pages[mediawikiPageId].revisions[0].timestamp;
		var mediawikiText = mediawikiJson.query.pages[mediawikiPageId].revisions[0]['*'];
		var mediawikiTextHistory = [];
		for (var i = 0; i < mediawikiJson.query.pages[mediawikiPageId].revisions.length; i++){
			mediawikiTextHistory.push(mediawikiJson.query.pages[mediawikiPageId].revisions[i]['*']);
		};

		$.get(siteUrl, {format:'json', origin:'*'}, getSiteJson);
		function getSiteJson (siteJson) {


			var sitePageId = Object.keys(siteJson.query.pages)[0];
			var siteTimestamp = siteJson.query.pages[sitePageId].revisions[0].timestamp;
			var siteText = siteJson.query.pages[sitePageId].revisions[0]['*'];

			var versionLag = -1;
			for (var i = 0; i < mediawikiTextHistory.length; i++){
				if (mediawikiTextHistory[i]==siteText){
					versionLag = i;
					break;
				};
			};
			console.log(versionLag);

			document.getElementById('lheader').innerHTML = site + '<br>' + siteTitle + '<br>' + siteTimestamp; 
			document.getElementById('rheader').innerHTML = 'mediawiki<br>' + mediawikiTitle + '<br>' + mediawikiTimestamp;
			if (versionLag>0){
			document.getElementById('buttonheader').innerHTML += '<br>Upgrade '+ versionLag +' versions ahead';
			} else if (versionLag==0){
			document.getElementById('buttonheader').innerHTML += '<br>Modules are the same';	
			} else if (versionLag==-1){
			document.getElementById('buttonheader').innerHTML += '<br>Cant find module in the history';	
			}

			$('#mergely').mergely('lhs', siteText);
			$('#mergely').mergely('rhs', mediawikiText);

			$.get(mediawikiDocUrl, {format:'json', origin:'*'}, checkDoc);
			function checkDoc(mediawikiDocJson) {

				var mediawikiDocPageId = Object.keys(mediawikiDocJson.query.pages)[0];
				var saveButton = document.getElementById('saveButton');
				saveButton.addEventListener("click", saveText);	
				function saveText(){

					if (versionLag == 0){
						alert('Modules are the same');
					} else if (versionLag == -1){
						alert('Cant find module in the history');
					} else if (mediawikiDocPageId=="-1"){
						alert('Doc does not exist');
					} else {
						var mediawikiDocTimestamp = mediawikiDocJson.query.pages[mediawikiDocPageId].revisions[0].timestamp;
						var mediawikiDocText = mediawikiDocJson.query.pages[mediawikiDocPageId].revisions[0]['*'];
						
						if (mediawikiDocText.indexOf('{{Shared Template Warning|') == -1){
							alert('Module not shared') ;
						} else {
							$.post("https://ru.wikipedia.org/w/api.php",{action :'edit',token : '+\\',text : mediawikiText, title:'Википедия:Песочница', origin:'*'},moduleSaved);
						};					
					};

					function moduleSaved (text){
						alert('Module saved');
					};		
				};			
			};
		};
	};
});

