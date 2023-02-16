const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const formidable = require('formidable');
const path = require('path');
const seven = require('node-7z');
const { exec, spawn } = require('child_process');
const string = require('string-sanitizer');

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

router.post('/upload', urlencodedparser, async function(req, res){
  let obj = {};
  let form = new formidable.IncomingForm({uploadDir: './tmp/', maxFileSize: 2048 * 1024 * 1024});
  req.setTimeout(99999999);
  form.parse(req, async function(err, fields, files){
    if (err) throw err;
    let type = fields.type;
    let name = fields.name;
    obj.name = name;
    //transfer img to ./img dir
    fs.rename(files.upload.filepath, `./img/${type}/${files.upload.originalFilename}`, function(err){
      if(err) throw err;
      console.log('Moved Img');
    })
    //check if its emu game
    if(type === 'emu'){
      let core = fields.core;
      let img = files.upload.originalFilename;
      obj.img = img;
      obj.core = core
      //check if its psx 7z archive
      if(core === 'mednafen_psx_hw' && JSON.stringify(files.romupload.originalFilename).includes('.7z')){
        let rom = string.sanitize(files.romupload.originalFilename.slice(0, -3)) + '.chd'
        obj.rom = rom
        zipchdhandler(files, obj, type);
        jsonpush(obj, type);
      }
      else{
        let rom = files.romupload.originalFilename;
        obj.rom = rom;
        fs.rename(`${files.romupload.filepath}`, `./emu/${files.romupload.originalFilename}`, function(err){
          if (err) throw err;
          console.log('Moved Rom');
          jsonpush(obj, type);
        })
      }
    }
    if(type === 'h5g'){
      if(fields.path != ''){
        console.log('Type: PATH');
        obj.path = fields.path;
        jsonpush(obj, type);
      }
      else if(fields.iframe != ''){
        console.log('Type: IFRAME');
        obj.iframe = fields.iframe;
        jsonpush(obj, type);
      }
      else if(fields.custom != ''){
        console.log('Type: CUSTOM');
        obj.custom = fields.custom;
        if(fields.prox === 'true'){
          console.log('CUSTOM: PROX set to TRUE');
          obj.prox = fields.prox;
        }
        jsonpush(obj, type);
      }
    }
  })
})

function zipchdhandler(files){
  fs.rename(`${files.romupload.filepath}`, `./tmp/${string.sanitize(files.romupload.originalFilename.slice(0, -3)) + '.7z'}`, function(err){
    if (err) throw err;
    console.log('Renamed Zip');
    let unzip = seven.extractFull(`./tmp/${string.sanitize(files.romupload.originalFilename.slice(0, -3))}.7z`, `./tmp/`, {$progress: true});
    unzip.on('error', (err) => {
      throw err;
    })
    unzip.on('progress', (progress) => {
        console.log(progress.percent);
    })
    unzip.on('end', function(){
      console.log('Unzipped .7z Archive');
      fs.rename(`./tmp/${files.romupload.originalFilename.slice(0, -3)}/${files.romupload.originalFilename.slice(0, -3)}.cue`, `./tmp/${files.romupload.originalFilename.slice(0, -3)}/${string.sanitize(files.romupload.originalFilename.slice(0, -3))}.cue`, function(err){
        if (err) throw err;
        console.log('Renamed .cue')
        //run chdman
        let chdman = exec(`cd ./tmp && chdman createcd -i "${files.romupload.originalFilename.slice(0, -3)}/${string.sanitize(files.romupload.originalFilename.slice(0, -3))}.cue" -o "../emu/${string.sanitize(files.romupload.originalFilename.slice(0, -3))}.chd" && cd ../ && rm -r tmp && mkdir tmp`);
        chdman.stderr.on('data', (data) => {
          console.warn(data);
        })
        chdman.stdout.on('data', (data) => {
          console.log(data);
        })
        chdman.on('end', function(){
          console.log('Made CHD');
        })
      })
    })
  })
}

function jsonpush(obj, type){
  let json = JSON.parse(fs.readFileSync(`./json/${type}.json`));
  json.push(obj);
  let data = JSON.stringify(json);
  fs.writeFile(`./json/${type}.json`, data, (err) => {
    if (err) throw err;
  });
}


app.listen(8080);