import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import formidable from 'formidable';
import path from 'path';

const __dirname = path.resolve();
const app = express();
const router = express.Router();
var urlencodedparser = bodyParser.urlencoded({extended: false})

import h5g from './json/h5g.json' assert {type: 'json'};
import emu from './json/emu.json' assert {type: 'json'};
import sites from './json/sites.json' assert {type: 'json'};
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

router.get('/emu', function(req, res){
  res.sendFile('emu.html', {root: './html/'})
})

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

router.get('/json/h5gjson', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.send(h5g);
})


for(let item of sites){
  router.get('/img/sites/' + item.img.slice(0, -4), function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.download(item.img, {root:'./img/sites/'});
  })
}

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

router.post('/upload/emu', urlencodedparser ,function(req, res){
  let JSON = fs.readFileSync(`./json/emu.json`, 'utf-8');
  let list = JSON.parse(JSON);
    list.push({name: req.body.name, core: req.body.core, rom: req.body.rom, img: req.body.img, description: req.body.description, pop: 0});
  let data = JSON.stringify(list);
  fs.writeFileSync('./json/emu.json', data);
})

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

router.post('/img/h5g/upload', urlencodedparser ,function(req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.filepath;
    var newpath = `./img/h5g/` + files.filetoupload.originalFilename;
    fs.copyFile(oldpath, newpath, function (err) {
      if (err) throw err;
    });
  });
})

router.post('/json/h5g/update/iframe', urlencodedparser, async function(req, res){
  let json = {name:req.body.name, iframe:req.body.iframe, img:req.body.img, pop:0}
  let JSONlist = await fs.readFileSync(`./json/${req.body.type}.json`, 'utf-8');
  let list = JSON.parse(JSONlist);
  list.push(json);
  console.log(list);
})

router.get('/crashbandicootwarped.bin', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.sendFile('crashbandicootwarped.zip', {root:'./emu/'});
})

app.listen(80);