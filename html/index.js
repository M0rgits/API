function id(id){
  return document.getElementById(id);
}

let type = id('type');
let namee = id('name');
let core = id('core');
let rom = id('rom');
let h5gtype = id('h5gtype');
let path = id('path');
let iframe = id('iframe');
let custom = id('custom');
let customprox = id('customprox');
let submit = id('submit');

function checktype(){
  if(type.value === 'h5g'){
    namee.style.display = '';
    h5gtype.style.display = '';
    core.style.display = 'none';
    rom.style.display = 'none';
    submit.style.display = 'none';
  };
  if(type.value === 'emu'){
    namee.style.display = '';
    core.style.display = '';
    rom.style.display = '';
    submit.style.display = '';
    h5gtype.style.display = 'none';
    path.style.display = 'none';
    iframe.style.display = 'none';
    custom.style.display = 'none';
    customprox.style.display = 'none';
  }
}

function checkh5gtype(){
  if(h5gtype.value === 'path'){
    path.style.display = 'none';
    iframe.style.display = 'none';
    custom.style.display = 'none';
    customprox.style.display = 'none';
    path.style.display = '';
    submit.style.display = '';
  };
  if(h5gtype.value === 'iframe'){
    path.style.display = 'none';
    iframe.style.display = 'none';
    custom.style.display = 'none';
    customprox.style.display = 'none';
    iframe.style.display = '';
    submit.style.display = '';
  };
  if(h5gtype.value === 'custom'){
    path.style.display = 'none';
    iframe.style.display = 'none';
    custom.style.display = 'none';
    custom.style.display = '';
    customprox.style.display = '';
    submit.style.display = '';
  };
}

function postFile() {
  var formdata = new FormData();

  formdata.append('file1', document.getElementById('file1').files[0]);

  var request = new XMLHttpRequest();

  request.upload.addEventListener('progress', function (e) {
      var file1Size = document.getElementById('file1').files[0].size;
      document.getElementById('filesize').innerHTML = file1Size;
      if (e.loaded <= file1Size) {
          var percent = Math.round(e.loaded / file1Size * 100);
          document.getElementById('progress-bar-file1').style.width = percent + '%';
          document.getElementById('progress-bar-file1').innerHTML = percent + '%';
      } 

      if(e.loaded == e.total){
          document.getElementById('progress-bar-file1').style.width = '100%';
          document.getElementById('progress-bar-file1').innerHTML = '100%';
      }
  });   

  request.open('post', '/upload/rom');
  request.timeout = 45000000;
  request.send(formdata);
}