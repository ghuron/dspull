var usernameLogin = '';

$.get( 'https://tools.wmflabs.org/dspull/username.php', function(res) {//Login check
	usernameLogin = res;
	document.getElementById('login').innerHTML = res;
}).fail(function() {
	document.getElementById('login').innerHTML = "Login";
});

var req = window.location.search.replace("?","").split('&')//Parsing of the address bar
for (let i of req){
	switch (i.slice(0, i.indexOf("="))){
		case "id": var id = i.slice(i.indexOf("=")+1); break;
		case "site": var site = i.slice(i.indexOf("=")+1); break;
	}
}
var siteShort = site.slice(0,-4);//enwiki->en

$(document).ready(function () {
	$('#mergely').mergely({license: 'lgpl-separate-notice'});// initialize mergely
	document.getElementById("saveButton").disabled = true;
});



$.get('https://www.wikidata.org/w/api.php?', {action:'wbgetentities', ids:id, props:'sitelinks', format:'json', origin:'*'}, getWikidataJson);
function getWikidataJson (res) {

	var mediawikiTitle = res.entities[id].sitelinks["mediawikiwiki"].title;//Название модуля на MediaWiki
	var mediawikiUrl = "https://www.mediawiki.org/w/api.php?action=query&titles=" + encodeURIComponent(mediawikiTitle) + "&prop=revisions&rvprop=content|timestamp|user|comment" ;//Ссылка на модуль MediaWiki
	var mediawikiDocUrl = "https://www.mediawiki.org/w/api.php?action=query&titles=" + encodeURIComponent(mediawikiTitle) + "/doc&prop=revisions|info&inprop=protection&rvprop=content|timestamp" ;//Ссылка на документацию MediaWiki
	var siteTitle = res.entities[id].sitelinks[site].title;//Название модуля на искомом Wiki(можно использовать MediaWiki)
	var siteUrl = "https://" + siteShort + ".wikipedia.org/w/api.php?action=query&titles=" + encodeURIComponent(siteTitle) + "&prop=revisions|info&inprop=protection&rvprop=content|timestamp" ;//Ссылка на искомый модуль
	
	$.get(mediawikiUrl, {rvlimit: 50, format:'json', origin:'*'}, getMediawikiJson);
	function getMediawikiJson (mediawikiJson) {
		
		var mediawikiPageId = Object.keys(mediawikiJson.query.pages)[0];
		var mediawikiTimestamp = mediawikiJson.query.pages[mediawikiPageId].revisions[0].timestamp.replace('T',' ').replace('Z',' ');
		var mediawikiText = mediawikiJson.query.pages[mediawikiPageId].revisions[0]['*'];
		var mediawikiTextHistory = [];
		for (let i of mediawikiJson.query.pages[mediawikiPageId].revisions){
			mediawikiTextHistory.push(i['*']);
		};

		$.get(siteUrl, {format:'json', origin:'*'}, getSiteJson);
		function getSiteJson (siteJson) {

			var sitePageId = Object.keys(siteJson.query.pages)[0];
			var siteTimestamp = siteJson.query.pages[sitePageId].revisions[0].timestamp.replace('T',' ').replace('Z',' ');
			var siteText = siteJson.query.pages[sitePageId].revisions[0]['*'];
			var siteProtection = siteJson.query.pages[sitePageId].protection;

			var versionLag = -1;
			for (let i in mediawikiTextHistory){
				if (mediawikiTextHistory[i]==siteText){
					versionLag = i;
					break;
				};
			};

			if (versionLag != -1){ 
				var summaryText = "Copying "+versionLag+" changes by " + mediawikiJson.query.pages[mediawikiPageId].revisions[0].user;
				for (let i = 1; i < versionLag; i++){summaryText += ", " + mediawikiJson.query.pages[mediawikiPageId].revisions[i].user};
					summaryText += " from [[:mw:" + mediawikiTitle + "]]";
			}else{
				var summaryText = "Copying from [[:mw:" + mediawikiTitle + "]]";
			};

			document.title += ': ' + mediawikiTitle;
			document.getElementById('headerModuleName').innerHTML = mediawikiTitle;
			document.getElementById('moduleName').innerHTML = mediawikiTitle;
			document.getElementById('lheader').innerHTML = '<a href="https://' + siteShort + '.wikipedia.org/wiki/' + siteTitle + '" target="_blank">'+ site +'</a>  ' + siteTimestamp; 
			document.getElementById('rheader').innerHTML = '<a href="https://mediawiki.org/wiki/' + mediawikiTitle + '" target="_blank" target="_blank">mediawiki</a>  	' +  mediawikiTimestamp;

			$('#mergely').mergely('lhs', siteText);
			$('#mergely').mergely('rhs', mediawikiText);
			
			var depEq = true;
			var depEqList = {};
			if (mediawikiTitle.includes('Template')){
				var wikidataRequest = 'PREFIX mw: <http://tools.wmflabs.org/mw2sparql/ontology#>\
				select ?base ?baseLabel ?baseTarget {\
				  hint:Query hint:optimizer "None" .\
				  ?source schema:about wd:' + id + '; schema:isPartOf <https://www.mediawiki.org/>\
				  SERVICE <http://tools.wmflabs.org/mw2sparql/sparql> {\
				    ?source mw:includesPage ?parent .\
				  }\
				  ?parent schema:about ?base\
				  OPTIONAL { ?baseTarget schema:about ?base; schema:isPartOf <https://' + siteShort + '.wikipedia.org/> }\
				  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }\
				}';

				var wikidataUrl = 'https://query.wikidata.org/sparql?query=' + encodeURIComponent(wikidataRequest);
				$.get( wikidataUrl, {format:'json', origin:'*'}, getWikidataJson);
				function getWikidataJson(wikidataJson){
					var depBindings = wikidataJson.results.bindings;
					var depSet = bindingsToSet(depBindings);
					var mediawikiDepUrl = 'https://www.mediawiki.org/w/api.php?action=query&titles=' + setToText(depSet) + '&prop=revisions&rvprop=content';
					var siteDepUrl = 'https://' + siteShort + '.wikipedia.org/w/api.php?action=query&titles=' + setToText(depSet) + '&prop=revisions&rvprop=content';
					var mediawikiDepReq = $.get(mediawikiDepUrl, {format:'json', origin:'*'});
					var siteDepReq = $.get(siteDepUrl, {format:'json', origin:'*'});
					
					var depReqDone = $.when(mediawikiDepReq, siteDepReq).then(function (mediawikiDep,siteDep) {
						[depEq,depEqList] = checkDep(mediawikiDep,siteDep);
						$.get(mediawikiDocUrl, {format:'json', origin:'*'}, checkDoc);
					});					
				};

			}else{
				var depSet = parseModule(mediawikiText);
				if (depSet.size != 0){
					var mediawikiDepUrl = 'https://www.mediawiki.org/w/api.php?action=query&titles=' + setToText(depSet) + '&prop=revisions&rvprop=content';
					var siteDepUrl = 'https://' + siteShort + '.wikipedia.org/w/api.php?action=query&titles=' + setToText(depSet) + '&prop=revisions&rvprop=content';
					var mediawikiDepReq = $.get(mediawikiDepUrl, {format:'json', origin:'*'});
					var siteDepReq = $.get(siteDepUrl, {format:'json', origin:'*'});
					
					var depReqDone = $.when(mediawikiDepReq, siteDepReq).then(function (mediawikiDep,siteDep) {
						[depEq,depEqList] = checkDep(mediawikiDep,siteDep);
						$.get(mediawikiDocUrl, {format:'json', origin:'*'}, checkDoc);
					});		
				}else{
					$.get(mediawikiDocUrl, {format:'json', origin:'*'}, checkDoc);
				};
			};
			function checkDoc(mediawikiDocJson) {

				var mediawikiDocPageId = Object.keys(mediawikiDocJson.query.pages)[0];
				var warningText = '';

				if (versionLag==0){
					document.getElementById('saveButton').value = 'Nothing to save';
					warningText += 'Nothing to save';
				} else {
					document.getElementById("saveButton").disabled = false;
					if (versionLag==-1){
						warningText = 'Cant find module in the history';	
					} else if (mediawikiDocPageId=="-1"){
						warningText = 'Doc does not exist';
					} else {
						var mediawikiDocTimestamp = mediawikiDocJson.query.pages[mediawikiDocPageId].revisions[0].timestamp;
						var mediawikiDocText = mediawikiDocJson.query.pages[mediawikiDocPageId].revisions[0]['*'];
						
						if (mediawikiDocText.indexOf('{{Shared Template Warning|') == -1){
							warningText = 'Module not shared';
						} else {
							document.getElementById('buttonheader').innerHTML += '<br>Upgrade '+ versionLag +' versions';
						};					
					};
				};
				if (!depEq){
					document.getElementById('saveButton').value = 'Dependencies error'
					document.getElementById("saveButton").disabled = true;
					warningText += '<br>' + depToText(depEqList);
				};
				
				document.getElementById('moduleIssues').innerHTML = warningText;

				var saveButton = document.getElementById('saveButton');

				saveButton.addEventListener("click", saveText);	
				function saveText(){
					if (usernameLogin == ''){
						alert('Please login');
					}else{
						$.post("https://tools.wmflabs.org/dspull/edit.php",{"site" : siteShort, "title" : siteTitle , "text" : mediawikiText, "summary": summaryText},moduleSaved);	
					}
					function moduleSaved (text){
						console.log(text);
						window.location.reload();
					};		
				};	


			};
		};
	};
};

function bindingsToSet(bindings){
	let set = new Set();
	for (let i of bindings){
		if (typeof i.baseTarget !== 'undefined'){
			set.add(i.baseLabel.value);
		};
	};
	return set;
};

function parseModule(text){
	let result = Array.from(text.matchAll(/require\('(.+?)'\)/g));
	let moduleSet = new Set();
	for (let i of result){
		if (!i[1].includes('libraryUtil')){
			moduleSet.add(i[1])
		};
	};
	return moduleSet;
};

function setToText(set){
	var text = '';
	for (let i of set){
		if (text!=''){text += '|'};
		text += encodeURIComponent(i);
	};
	return text;
};

function depToText(dep){
	var text = '';
	var unequalDep = 0;
	for (let i in dep){
		if (!dep[i]){unequalDep++;
			if (text != ''){text+=', '};
			text += i;
		};
	};
	if (unequalDep == 1){
		text = 'You have ' + unequalDep + ' unequal dependency: ' + text;
	}else if(unequalDep > 1){
		text = 'You have ' + unequalDep + ' unequal dependencies: ' + text;
	}
	return text;
};

function checkDep(mediawikiDep,siteDep){
	var dep = true;
	var depList = {};
	var mediawikiDep = mediawikiDep[0].query.pages;
	var siteDep = siteDep[0].query.pages;
	for (let i in siteDep){
		siteDep[i].title = siteDep[i].title.slice(siteDep[i].title.lastIndexOf(':'));
		if (siteDep[i].ns == 10){
			siteDep[i].title = 'Template' + siteDep[i].title;
		}else{
			siteDep[i].title = 'Module' + siteDep[i].title;
		};
	};
	for (let i in mediawikiDep){
		for (let j in siteDep){
			if(mediawikiDep[i].title == siteDep[j].title){
				let mediawikiDepText = mediawikiDep[i].revisions[0]['*'];
				let siteDepText = siteDep[j].revisions[0]['*'];
				if (mediawikiDepText != siteDepText){dep = false};
				depList[mediawikiDep[i].title] = (mediawikiDepText == siteDepText);
			};
		};
	};
	return [dep,depList];
};
