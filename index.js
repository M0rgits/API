const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const formidable = require('formidable');
const path = require('path');
const http = require('http');


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

router.post('/upload', urlencodedparser, function(req, res){
  req.setTimeout(9999999999);
  var form = new formidable.IncomingForm({uploadDir: '../shared/', maxFileSize: 2048 * 1024 * 1024});
  form.parse(req, function (err, fields, files) {
    if(err) throw err;
    if(files.romupload){
      var oldrompath = files.romupload.filepath;
      var newrompath = '../shared/' + files.romupload.originalFilename;
      fs.rename(oldrompath, newrompath, function(errro){
        if(errro) throw errro;
          const options = {
            hostname: 'http://localhost:8081',
            path: '/',
            method: 'POST'
          };
          var postData = JSON.stringify({path: files.romupload.originalFilename})
        var request = http.request(options)
        request.on('error', (e) => {
          console.error(e);
        });
        request.write(postData);
        request.end();
        })  
      }
    var oldpath = files.upload.filepath;
    var newpath = `./img/${fields.type}/` + files.upload.originalFilename;
    var imgname = files.upload.originalFilename;
    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
    });
    if(fields.type === 'h5g'){
      let jsonpath = './json/h5g.json';
      let json = JSON.parse(fs.readFileSync(jsonpath));
      let name = fields.name
      if(fields.path != ''){
        let path = fields.path
        json.push({name: name, path: path, img: imgname, pop:0});
        let data = JSON.stringify(json);
        fs.writeFileSync(jsonpath, data);
        res.send(name + " added to h5g.json")
        res.end()
      }
      if(fields.iframe != ''){
        let iframe = fields.iframe
        json.push({name: name, iframe: iframe, img: imgname, pop:0});
        let data = JSON.stringify(json);
        fs.writeFileSync(jsonpath, data);
        res.send(name + " added to h5g.json")
      }
      if(fields.custom != ''){
        if(fields.prox != ''){
          let custom = fields.custom;
          let prox = fields.prox;
          json.push({name: name, custom: custom, prox: prox ,img: imgname, pop:0});
          let data = JSON.stringify(json);
          fs.writeFileSync(jsonpath, data);
          res.send(name + " added to h5g.json")
          res.end()
        }
        else{
          let custom = fields.path
          json.push({name: name, custom: custom, img: imgname, pop:0});
          let data = JSON.stringify(json);
          fs.writeFileSync(jsonpath, data);
          console.log(name + " added to h5g.json")
          res.end()
        }
      }
    }
    if(fields.type === 'emu'){
      let jsonpath = './json/emu.json';
      let json = JSON.parse(fs.readFileSync(jsonpath));
      let name = fields.name;
      let core = fields.core;
      let rom = files.romupload.originalFilename;
      json.push({name: name, core: core, rom: rom, img: imgname, pop:0});
      let data = JSON.stringify(json);
      fs.writeFileSync(jsonpath, data);
      res.send(name + " added to emu.json")
      res.end();
      }
    })
  });


router.post('/upload/rom', urlencodedparser, function(req, res){
  var form = new formidable.IncomingForm({maxFileSize: 999 * 1024 * 1024, uploadDir: './emu/'})
  form.parse(req, function (err, fields, files) {
    if (err){
      console.log(err);
    }
    var oldpath = files.upload.filepath;
    var newpath = `/root/api/emu/` + fields.filename.slice(12);
    fs.rename(oldpath, newpath, function (erro) {
      if (erro) throw erro;
    })
  })
  console.log('rom added');
  res.send('rom added');
})

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