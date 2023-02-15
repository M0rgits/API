const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const formidable = require('formidable');
const path = require('path');
const seven = require('node-7z');
const { spawn } = require('child_process');
const string = require('string-sanitizer');
const http = require('http')

const app = express();
const router = express.Router();
var urlencodedparser = bodyParser.urlencoded({extended: false})


const h5g = require('./json/h5g.json');
const emu = require('./json/emu.json'); 
const sites = require('./json/sites.json'); 

app.use(router);
app.use(express.static(path.normalize(__dirname + '/html/')));

router.get('/', function(req, res){
  res.send('why are you here?')
  res.end();
})

for(let item of h5g){
  if(item.hasOwnProperty('path')){
    router.get(`/${item.path}`, function(req, res){
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.download(`${item.path.slice(0, -1)}.zip`, {root:'./h5g/'})
    })
  }
  router.get(`/img/h5g/${item.img.slice(0, -4)}`, function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.download(`${item.img}`, {root: './img/h5g'});
  })
};

for(let item of emu){
  if(item.hasOwnProperty('rom')){
    router.get(`/${item.rom}`, function(req, res){
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.sendFile(item.rom, {root:'./emu/'});
    })
  }
  router.get(`/img/emu/${item.img.slice(0, -4)}`, function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.download(`${item.img}`, {root: './img/emu/'});
  })
}

for(let item of sites){
  router.get('/img/sites/' + item.img.slice(0, -4), function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.download(item.img, {root:'./img/sites/'});
  })
}

router.post('/h5gjson', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.send(h5g);
})

router.post('/emujson', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.send(emu);
})

router.post('/sitesjson', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.send(sites);
})

router.post('/gmesel', urlencodedparser, async function(req, res){
  let JSONlist = await fs.readFileSync(`./json/${req.body.type}.json`, 'utf-8');
  let list = JSON.parse(JSONlist);
  let index = list.findIndex(e => e.name === req.body.name)
  if(list[index].hasOwnProperty('pop')){
    list[index].pop = (list[index].pop + 1)
  }
  else{
    list[index].pop = 1
  }
  let data = JSON.stringify(list);
  fs.writeFileSync(`./json/${req.body.type}.json`, data)
  console.log('Updated pop')
});

router.post('/gmerequest', urlencodedparser, function(req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  var type = req.body.type;
  var name = req.body.name;
  console.log('requested ' + type + ' game [' + name + ']')
  if (name === ""){
    console.log('err: empty name');
    return;
  }
  else{
  fs.appendFileSync(`./forms/${type}.txt`, `${name}\n`)
  }
});

router.get('/dev', function(req, res){
  res.sendFile('dev.html', {root: './html/'});
})
router.get('/h5greq', function(req, res){
  res.sendFile('h5g.txt', {root:'./forms/'})
})
router.get('/emureq', function(req, res){
  res.sendFile('emu.txt', {root:'./forms/'})
})
router.get('/otherreq', function(req, res){
  res.sendFile('other.txt', {root:'./forms/'})
})

app.listen(8080);