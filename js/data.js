

var savedTimes = []
var backgroundSelected = 0
var backgrounds = [
  "url('img/background.jpg') no-repeat center center fixed",
  "-webkit-linear-gradient(90deg, #f857a6 10%, #ff5858 90%)",
  "-webkit-linear-gradient(90deg, #00d2ff 10%, #3a7bd5 90%)",
  "-webkit-linear-gradient(90deg, #673AB7 10%, #512DA8 90%)",
  "-webkit-linear-gradient(90deg, #fc00ff 10%, #00dbde 90%)"
  ];

function initData() {
  if(typeof(Storage) == "undefined") {
    // Sorry! No Web Storage support..
    printError('Sorry! No Web Storage support..');
  }
  if (typeof JSON === "undefined") {
    printError('JSON not supported')
  }

  if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
  	printError('Sorry, no html5 support in this browser')
  }

  document.getElementById('importFile').addEventListener("change", function(evt) {
  	importTimes(evt)
  });

  savedTimes = restoreFromStorage();
  if (savedTimes == null) savedTimes = [];
  backgroundSelected = restoreBackground();
  if (backgroundSelected == null || isNaN(backgroundSelected)) backgroundSelected = 0;
  changeBackground(backgrounds[backgroundSelected])
  updateTimes()
  scrollDown()
}


function nextBackground() {
  var newbg = backgrounds[ backgroundSelected >= backgrounds.length-1 ? backgroundSelected=0 : ++backgroundSelected ]
  changeBackground(newbg)
  saveBackground();
}

function changeBackground(bg) {
  $('body').css({
    "background": bg,
    "background-size": "cover"
  });
}

function saveTime() {
  var currentTime = document.getElementById("chronotime").innerHTML
  if (savedTimes == null) savedTimes = [];
  savedTimes.push(currentTime)
  scrollDown()
}

function updateTimes() {
  var best = getBestTime();
  var table = '';
  for (i in savedTimes) {
    if (i == best) {
        table += '<tr style="color:#44ff77"><td>'+(parseInt(i)+1)+'</td><td>'+savedTimes[i]+'</td><td onclick="deleteTime('+i+')">X</td></tr>';
    } else {
        table += '<tr><td>'+(parseInt(i)+1)+'</td><td>'+savedTimes[i]+'</td><td onclick="deleteTime('+i+')">X</td></tr>';
    }
  }
  document.getElementById('savedTimes').innerHTML = table
  saveToStorage()

  if (savedTimes.length == 0) {
    document.getElementById('best-solve').innerHTML = "Best: -"
    document.getElementById('average-all').innerHTML = "Average All: -"
    document.getElementById('average-5').innerHTML = "Average 5: -"
  }
  else {
    // display scores
    document.getElementById('best-solve').innerHTML = "Best: "+ savedTimes[best]
    document.getElementById('average-all').innerHTML = "Average All: " + getAverage(savedTimes.length)
    if (savedTimes.length>4) document.getElementById('average-5').innerHTML = "Average 5: " + getAverage(5);
    else document.getElementById('average-5').innerHTML = "Average 5: -"
  }

}

function deleteTime(index) {
  savedTimes.splice(parseInt(index), 1);
  updateTimes();
}

function saveToStorage() {
  localStorage["savedTimes"] = JSON.stringify(savedTimes)
}

function restoreFromStorage() {
  // return ( localStorage.getItem('savedTimes') == 'undefined' ? [] : JSON.parse(localStorage.getItem("savedTimes")) )
  if (localStorage.getItem("savedTimes") == 'undefined') return [];
  else return JSON.parse(localStorage.getItem("savedTimes"));
}

function saveBackground() {
  localStorage['bgIndex'] = (""+backgroundSelected)
}

function restoreBackground() {
  return ( (localStorage.getItem('bgIndex') == 'undefined' || isNaN(localStorage.getItem('bgIndex'))) ? 0 : parseInt(localStorage.getItem('bgIndex')) )
}

function scrollUp() {
  var scroll = document.getElementById('scroll-child')
  scroll.scrollTop = 0;
}

function scrollDown() {
  var scroll = document.getElementById('scroll-child')
  scroll.scrollTop = scroll.scrollHeight;
}

// index of the best time in the array
function getBestTime() {
  var best = 0; // index 0
  var i = 1;
  for (i=1; i<savedTimes.length; i++) {
    var old = getIntFromTimeString(savedTimes[best])
    var cur = getIntFromTimeString(savedTimes[i])

    if (cur < old) best = i;
  }

  return best;
}

// get average of last 'size' solves -> if size==average.length, then it returns all solves average
function getAverage(size) {
  var i=0, average=0, min=0, sec=0, dec=0;
  for (i=savedTimes.length-size; i<savedTimes.length; i++) {
    min = parseInt(savedTimes[i].charAt(0)+savedTimes[i].charAt(1))
    sec = parseInt(savedTimes[i].charAt(3)+savedTimes[i].charAt(4))
    dec = parseInt(savedTimes[i].charAt(6)+savedTimes[i].charAt(7))
    // average in decimals
    average += ( (min*60*100) + (sec*100) + dec)
  }
  average /= size
  average = average.toFixed(0);

  return getAverageStringFromDec(average)
}

function getAverageStringFromDec(dec) {

  var decString = ""+dec;
  var l = decString.length;
  var decimals = decString.charAt(l-2) + decString.charAt(l-1) // last two digits

  if (dec < 100) {
    return "00:00:"+dec
  } // else

  if (dec < 6000) {
    var seconds = (dec < 1000 ? "0" + decString.charAt(0) : decString.charAt(0)+decString.charAt(1))
    return "00:" + seconds + ":" + decimals
  } // else

  var minutes = Math.floor(dec / 6000);
  var seconds = ((dec % 6000) / 100).toFixed(0);

  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds + ":" + decimals;
}

function getIntFromTimeString(time) {

  var r = time.replace(/:/g, ''); // removes ':'

  return parseInt(r);
}

function exportTimesToCsv() {
  if (savedTimes.length==0) {
  	printError('No solves yet')
  	return;
  }
  var csvContent = "data:text/csv;charset=utf-8,";
  var i = 0;

  csvContent += "All solves;Average All"+(savedTimes.length>4 ? ";Average 5\n" : "\n")
  csvContent += savedTimes[i]+";"+getAverage(savedTimes.length)+(savedTimes.length>4 ? ";"+getAverage(5)+"\n" : "\n")
  for (i=1; i<savedTimes.length;i++) {
    csvContent += savedTimes.length ? savedTimes[i] + "\n" : savedTimes[i];
  }

  var encodedUri = encodeURI(csvContent);
  window.open(encodedUri);
}

function exportTimesToTxt() {
  if (savedTimes.length==0) {
  	printError('No solves yet')
  	return;
  }
  var csvContent = "data:text/txt;charset=utf-8,";
  var i = 0;

  csvContent += "All solves\tAverage All"+(savedTimes.length>4 ? "\tAverage 5\n" : "\n")
  csvContent += savedTimes[i]+"\t"+getAverage(savedTimes.length)+(savedTimes.length>4 ? "\t\t"+getAverage(5)+"\n" : "\n")
  for (i=1; i<savedTimes.length;i++) {
    csvContent += savedTimes.length ? savedTimes[i] + "\n" : savedTimes[i];
  }

  var encodedUri = encodeURI(csvContent);
  window.open(encodedUri);
}

function importTimes(evt) {
	var files = evt.target.files; // FileList object
	var file = files[0] // file to import
	var reader = new FileReader();
	var text = ""

	alert("This feature will be available soon :)")

	// reader.onload = function(e) {
 //  		text = event.target.result;
 //    	var data = JSON.parse(text)
 //    	console.log(data)
	// }
	// reader.readAsText(file);
}
