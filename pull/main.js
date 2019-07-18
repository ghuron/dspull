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
var xhr = new XMLHttpRequest();

// Синхронный запрос!!!
xhr.open('GET', 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids='+id+'&props=sitelinks&format=json&origin=*', false);

xhr.send();
if (xhr.status != 200) {
  alert( xhr.status + ': ' + xhr.statusText ); 
} else {
  res = JSON.parse(xhr.response); 
  console.log(res.entities[id].sitelinks[site]);
}


xhr.open('GET', 'https://ru.wikipedia.org/w/index.php?wbgetentities=%D0%9C%D0%BE%D0%B4%D1%83%D0%BB%D1%8C:TableTools&origin=*', false);

xhr.send();
if (xhr.status != 200) {
  alert( xhr.status + ': ' + xhr.statusText ); 
} else {
  console.log(xhr.response);
}


