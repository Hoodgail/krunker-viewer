const utils = {}
utils.cors = true
utils.corsUrl = "https://cors-anywhere.herokuapp.com/"
utils.urls = ["https://assets.krunker.io/","models/","textures/","weapons/weapon_","weapons/skins/weapon_"]

utils.url = function(type,id){
	var url = ""
	switch(type){
		case"model":
			url = utils.urls[0]+utils.urls[1]+utils.urls[3]+id+".obj"
		break;
		
    case"model2":
			url = utils.urls[0]+utils.urls[1]+id+".obj"
		break;
		
		case"texture":
			url = utils.urls[0]+utils.urls[2]+utils.urls[4]+id+".png"
		break;

		case"texture2":
			url = utils.urls[0]+utils.urls[2]+utils.urls[3]+id+".png"
		break;
		
		case"texture3":
			url = utils.urls[0]+utils.urls[2]+id+".png"
		break;
	}
	if(utils.cors){
		return utils.corsUrl+(url)
	}else{
		return url
	}
}

utils.model = function(id){
	if(utils.cors){
		return fetch(utils.corsUrl+btoa(utils.urls[0]+utils.urls[1]+utils.urls[3]+id+".obj"))
		.then(r=>r.text())
	}else{
		return fetch((utils.urls[0]+utils.urls[1]+utils.urls[3]+id+".obj"))
		.then(r=>r.text())
	}
}
utils.texture = function(id){
	if(utils.cors){
		return fetch(utils.corsUrl+btoa(utils.urls[0]+utils.urls[2]+utils.urls[3]+id+".png"))
		.then(r=>r.text())
	}else{
		return fetch((utils.urls[0]+utils.urls[2]+utils.urls[3]+id+".png"))
		.then(r=>r.text())
	}
}
