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
let romupload = id('romfile');
let roma = id('roma');
let submit = id('submit');

function checktype(){
  if(type.value === 'h5g'){
    namee.style.display = '';
    h5gtype.style.display = '';
    roma.style.display = 'none';
    core.style.display = 'none';
    rom.style.display = 'none';
    romupload.style.display = 'none';
    submit.style.display = 'none';
  };
  if(type.value === 'emu'){
    namee.style.display = '';
    core.style.display = '';
    submit.style.display = '';
    romupload.style.display = '';
    roma.style.display = '';
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
    romupload.style.display = 'none';
    roma.style.display = 'none';
    path.style.display = '';
    submit.style.display = '';
  };
  if(h5gtype.value === 'iframe'){
    romupload.style.display = 'none';
    roma.style.display = 'none';
    path.style.display = 'none';
    iframe.style.display = 'none';
    custom.style.display = 'none';
    customprox.style.display = 'none';
    iframe.style.display = '';
    submit.style.display = '';
  };
  if(h5gtype.value === 'custom'){
    romupload.style.display = 'none';
    roma.style.display = 'none';
    path.style.display = 'none';
    iframe.style.display = 'none';
    custom.style.display = 'none';
    custom.style.display = '';
    customprox.style.display = '';
    submit.style.display = '';
  };
}
