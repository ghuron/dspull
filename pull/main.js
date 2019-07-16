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


