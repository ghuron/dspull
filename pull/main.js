var req = window.location.search.replace("?","").split('&')

for (var i = 0; i<req.length;i++){
	document.write(req[i]); document.write("<BR>");

	switch (req[i].slice(0,req[i].indexOf("="))){
		case "id": var id = req[i].slice(req[i].indexOf("=")+1);
		break;
		case "site": var site = req[i].slice(req[i].indexOf("=")+1);
		break;
	}
}

var xhr = new XMLHttpRequest();// Синхронный запрос!!!

xhr.open('GET', 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids='+id+'&props=sitelinks&format=json&origin=*', false);
xhr.send();
if (xhr.status != 200) {
	alert( xhr.status + ': ' + xhr.statusText ); 
} else {
	res = JSON.parse(xhr.response); 
	console.log(res.entities[id].sitelinks[site]);
}

var mediawikiTitle = encodeURIComponent(res.entities[id].sitelinks["mediawikiwiki"].title).replace('%3A',':').replace('%20',' ');//Название модуля на MediaWiki
var mediawikiUrl = "https://www.mediawiki.org/w/api.php?format=json&action=query&titles=" + mediawikiTitle + "&prop=revisions&rvprop=content&origin=*" ;//Ссылка на модуль MediaWiki
var siteTitle = encodeURIComponent(res.entities[id].sitelinks[site].title).replace('%3A',':').replace('%20',' ');//Название модуля на искомом Wiki(можно использовать MediaWiki)
var siteUrl = "https://" + site.slice(0,-4) + ".wikipedia.org/w/api.php?format=json&action=query&titles=" + siteTitle + "&prop=revisions&rvprop=content&origin=*" ;//Ссылка на искомый модуль

document.write(mediawikiUrl); document.write("<BR>");
document.write(siteUrl); document.write("<BR>");


xhr.open('GET', mediawikiUrl, false);
xhr.send();
if (xhr.status != 200) {
	alert( xhr.status + ': ' + xhr.statusText ); 
} else {
	mediawikiJson = JSON.parse(xhr.response);
	console.log(mediawikiJson);
}

xhr.open('GET', siteUrl, false);
xhr.send();
if (xhr.status != 200) {
	alert( xhr.status + ': ' + xhr.statusText ); 
} else {
	siteJson = JSON.parse(xhr.response);
	console.log(siteJson);
}

var mediawikiPageId = Object.keys(mediawikiJson.query.pages)[0];
var sitePageId = Object.keys(siteJson.query.pages)[0];
var mediawikiText = siteJson.query.pages[sitePageId].revisions[0]['*'];
var siteText = siteJson.query.pages[sitePageId].revisions[0]['*'];


document.write('<table width="100%" cellspacing="0" cellpadding="5"><tr><td width="50%" >');
document.write('mediawiki<BR>'); 
document.write('<pre>'+mediawikiText+'<\/pre><BR>'); 
document.write('</td><td>');
document.write(site+'<BR>'); 
document.write('<pre>'+siteText+'<\/pre><BR>');
document.write('/td></tr></table>');