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
