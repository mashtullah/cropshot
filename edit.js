var init = true;

var url ="";
var currTab=null;
var tOld=null;
var twitterWin=null;
chrome.extension && chrome.extension.onMessage.addListener(function(image) {
  if (init) {
    init = false;
	//
    document.getElementById('base').style.backgroundImage = 'url('+image+')';
    document.getElementById('cropped').style.backgroundImage = 'url('+image+')';
    //document.getElementById('popped').style.backgroundImage = 'url('+image+')';
  } else {
	   if(image.substring(0,4)=="http")url=image;
    // Create an empty canvas element
    var l = parseInt($('#cropped').css('left'), 10);
    var t = parseInt($('#cropped').css('top'), 10);
    var w = parseInt($('#cropped').css('width'), 10);
    var h = parseInt($('#cropped').css('height'), 10);

    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.onload =async function() {
      ctx.drawImage(img, l, t, w, h, 0, 0, w, h);
      $('#final')
        .attr('src', canvas.toDataURL('image/png'))
        .css({
          marginLeft: -0.5 * w + 'px', 
          marginTop: -0.5 * h + 'px'
        });
    const url =document.getElementById('final').src;
		const blobInput = await loadBlob(url);
		 writeToClipboard(blobInput);
      $('body').addClass('final');
    };
    img.src = image;
  }
});


async function loadBlob(fileName) {
  const fetched = await fetch(fileName);
  return await fetched.blob();
}
async function writeToClipboard(imageBlob) {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': imageBlob
      })
    ]);
    chrome.tabs.getCurrent(function(tab) {
      tOld=tab.id;
    });
	composeTweet();
	
  } catch (error) {
    console.error(error);
  }
}


  
function processResult (res){
  console.log('Results Received:'+res);
  setTimeout(function() {closeTab()}, 2000);
}
function closeTab(r){
  chrome.tabs.remove(tOld);
}
async function composeTweet() {
  try {
   
		twitterWin=window.open(`https://twitter.com/compose/tweet?text=`+url);
		$(twitterWin).ready(function()
		{
			setTimeout(function() {
				chrome.tabs.query({active: true}, function(tabs) {
          var tab = tabs[0];
          currTab=tabs[0];
          tab_title = tab.title;
          //console.log(tab.url+'pasted at:'+tab_title);
				  chrome.tabs.executeScript(tab.id, {
					code: 'document.execCommand("paste")'
				  }, processResult);
        });					
				}, 3000);
		});

		
  } catch (error) {
    console.log(error);
  }
}

var port = chrome.extension.connect({
    name: "ClientX"
});
port.postMessage("Request URL");
port.onMessage.addListener(function (msg) {
    url=msg;
	//console.log("URL recieved is  " + msg);
});
  
$(function() {
	
  $('a[href=#save]').click(function() {
    $('#toolbar').hide();
    chrome.extension.sendMessage({ action: 'capture' });
    return false;
  });
  $('a[href=#close]').click(function() {
    chrome.tabs.getCurrent(function(tab) {
      chrome.tabs.remove(tab.id);
    });
    return false;
  });
  $('.image').each(function() {
    var image = $(this);
    image
      .draggable({
        grid: [5,5],
        containment: 'document'
      })
      .resizable({
        grid: [5,5],
        containment: 'document',
        handles: 'n, e, s, w, ne, se, sw, nw'
      })
      .bind('drag', function(event, ui) {
        var left = ui.offset.left;
        var top  = ui.offset.top;
        image.css({
          backgroundPosition: (left * -1) + 'px ' + (top * -1) + 'px'
        });
      })
      .bind('resize', function(event, ui) {
        var l = parseInt($(ui.element).css('left'), 10);
        var t = parseInt($(ui.element).css('top'), 10);
        var w = parseInt($(ui.element).css('width'), 10);
        var h = parseInt($(ui.element).css('height'), 10);
        $(ui.element).css({ backgroundPosition: (l*-1) + 'px ' + (t*-1) + 'px' });
        $('.dimensions', image).text(w + 'x' + h);
      });
  });
  
  
  

  
});

