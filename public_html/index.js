checkLogin();
for (let i of window.location.search.replace("?","").split('&')){
	switch (i.slice(0, i.indexOf("="))){
		case "site": var site = i.slice(i.indexOf("=")+1); break;
	};
};

window.onload = function(){  
	if(typeof site !== 'undefined' && /.+?wiki\b/g.test(site)){
		showModules();
	}else{
		showForm();
	};
};

function checkLogin(){
	$.get( 'https://dspull.toolforge.org/username.php', function(res) {
		document.getElementById('login').innerHTML = res;	
	}).fail(function() {
		document.getElementById('login').innerHTML = "Login";	
	});
};

function showModules(){
	var siteShort = site.slice(0,-4);//enwiki->en

	var wikidataRequest = 'PREFIX mw: <http://tools.wmflabs.org/mw2sparql/ontology#>\
	select ?item (SUBSTR(STR(?source), 32) AS ?itemLabel) ?itemTarget ?base (SUBSTR(STR(?parent), 32) AS ?baseLabel) ?baseTarget {\
		hint:Query hint:optimizer "None" .\
		?item wdt:P31 wd:Q63090714.\
		OPTIONAL { ?itemTarget schema:about ?item; schema:isPartOf <https://' + siteShort + '.wikipedia.org/> }\
		?source schema:about ?item; schema:isPartOf <https://www.mediawiki.org/>\
		SERVICE <http://mw2sparql.toolforge.org/sparql> {\
			?source mw:includesPage ?parent\
		}\
		OPTIONAL { ?parent schema:about ?base . ?baseTarget schema:about ?base; schema:isPartOf <https://' + siteShort + '.wikipedia.org/> }\
	} ORDER BY ?itemLabel ?baseLabel';

	var wikidataUrl = 'https://query.wikidata.org/sparql?query=' + encodeURIComponent(wikidataRequest);
	
	$.get( wikidataUrl, {format:'json', origin:'*'}, getWikidataJson);
	function getWikidataJson(wikidataJson){
		var bindings = wikidataJson.results.bindings;
		var tree = tableToTree(wikidataJson.results.bindings);
		
		let mediawikiUrl = "https://www.mediawiki.org/w/api.php?action=query&titles=" + getItemLabelList(tree) + "&prop=revisions&rvprop=content|timestamp|user|comment" ;//Ссылка на модули MediaWiki
		$.get(mediawikiUrl, {format:'json', origin:'*'}, getMediawikiJson);
		function getMediawikiJson (mediawikiJson) {
			for (let i in mediawikiJson.query.pages){
				let itemLabel = mediawikiJson.query.pages[i].title;
				for (let baseLabel of parseModule(mediawikiJson.query.pages[i].revisions[0]['*'])){
					tree[itemLabel].base[baseLabel] = getBase(bindings,itemLabel,baseLabel);
				};
			};

			document.getElementById('list').innerHTML += getListText(tree);

		};		
	};
};

function showForm(){
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

function tableToTree(table){
	var tree = {};
	var itemLabel = '';
	for (let i in table){	

		if (table[i].itemLabel.value != itemLabel){
			var itemLabel = table[i].itemLabel.value.replace(/_/g, ' ');
			if(typeof tree[itemLabel] === 'undefined' || tree[itemLabel] === null){
				tree[itemLabel] = {};
			};
			if(!(typeof table[i].itemTarget === 'undefined' || table[i].itemTarget === null)){
				tree[itemLabel].url = table[i].item.value;
			};
		};

		if(typeof tree[itemLabel].base === 'undefined' || tree[itemLabel].base === null){
			tree[itemLabel].base = {}
		};
		var baseLabel = table[i].baseLabel.value.replace(/_/g, ' ');
		if(!itemLabel.includes('Module:')){ //ignore modules dependence
			if(typeof tree[itemLabel].base[baseLabel] === 'undefined' || tree[itemLabel].base[baseLabel] === null){
				tree[itemLabel].base[baseLabel] = {}
			};
			if(!(typeof table[i].baseTarget === 'undefined' || table[i].baseTarget === null)){
				tree[itemLabel].base[baseLabel].url = table[i].base.value;
			};
		};
		
	};
	return tree;
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

function getItemLabelList(tree){
	let itemLabelList = '';

	for (let i in tree) {
		if (!(typeof tree[i].url === 'undefined' || tree[i].url === null)){
			if (itemLabelList == ''){
				itemLabelList = i;
			}else {
				itemLabelList += '|' + i;
			};
		};
	};
	return itemLabelList;
};

function getBase(bindings, itemLabel, baseLabel){

	for (let i in bindings) {
		if (bindings[i].itemLabel.value.replace(/_/g, ' ')==itemLabel && bindings[i].baseLabel.value.replace(/_/g, ' ')==baseLabel){
			return {'url':bindings[i].base.value};	
		};
	};
	return {};
};

function getListText(tree){
	let itemLabel = '';
	let listText = '';
	for (let i in tree) {//i = itemLabel
		if (listText !== ''){listText+='</ul>'};
		if(typeof tree[i].url === 'undefined'){
			listText += '<li><a>'+ i +'</a></li><ul>';
		}else{
			let moduleItemId = tree[i].url.slice(tree[i].url.lastIndexOf('Q'));
			listText += '<li><a href="pull/?id='+ moduleItemId +'&amp;site='+ site +'">'+ i +'</a></li><ul>';
		};
		
		for (let b in tree[i].base){//b = baseLabel
			if(typeof tree[i].base[b].url === 'undefined'){
				listText += '<li><a>'+ b +'</a></li>';
			}else{
				let moduleBaseId = tree[i].base[b].url.slice(tree[i].base[b].url.lastIndexOf('Q'));
				listText += '<li><a href="pull/?id='+ moduleBaseId +'&amp;site='+ site +'">'+ b +'</a></li>';
			};
		};
	};
	listText += '</ul>';
	return listText;
};
