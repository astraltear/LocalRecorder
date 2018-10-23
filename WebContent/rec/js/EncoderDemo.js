// manually rewritten from CoffeeScript output
// (see dev-coffee branch for original source)

// navigator.getUserMedia shim
navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

// URL shim
window.URL = window.URL || window.webkitURL;

// audio context + .createScriptProcessor shim
var audioContext = new AudioContext;
if (audioContext.createScriptProcessor == null)
  audioContext.createScriptProcessor = audioContext.createJavaScriptNode;

// elements (jQuery objects)
//var $testToneLevel = $('#test-tone-level'),
//var $microphone = $('#microphone'),
//    $microphoneLevel = $('#microphone-level'),
//    $encodingProcess = $('input[name="encoding-process"]'),
//    $bufferSize = $('#buffer-size'),
var $recording = $('#recording'),
    $timeDisplay = $('#time-display'),
    $record = $('#record'),
    $cancel = $('#cancel'),
    $dateTime = $('#date-time'),
    $recordingList = $('#recording-list'),
	$file1 = $('#file1')
	;

// initialize input element states (required for reloading page on Firefox)
// $testToneLevel.attr('disabled', false);
// $testToneLevel[0].valueAsNumber = 0;
//$microphone.attr('disabled', true);
//$microphone[0].checked = true;
//$microphoneLevel.attr('disabled', false);
//$microphoneLevel[0].valueAsNumber = 100;
//$encodingProcess.attr('disabled', false);
//$encodingProcess[0].checked = true;
//$bufferSize.attr('disabled', false);

/*
test tone (440Hz sine with 2Hz on/off beep)
-------------------------------------------
            ampMod    output
osc(sine)-----|>--------|>----->(testTone)
              ^         ^
              |(gain)   |(gain)
              |         |
lfo(square)---+        0.5
*/
/*
var testTone = (function() {
  var osc = audioContext.createOscillator(),
      lfo = audioContext.createOscillator(),
      ampMod = audioContext.createGain(),
      output = audioContext.createGain();
  lfo.type = 'square';
  lfo.frequency.value = 2;
  osc.connect(ampMod);
  lfo.connect(ampMod.gain);
  output.gain.value = 0.5;
  ampMod.connect(output);
  osc.start();
  lfo.start();
  return output;
})();
*/

/*
master diagram
--------------
              testToneLevel
(testTone)----------|>---------+
                               |
                               v
                            (mixer)---+--->(input)--->(processor)
                               ^      |                    |
              microphoneLevel  |      |                    v
(microphone)--------|>---------+      +------------->(destination)
*/
//var testToneLevel = audioContext.createGain(),
var microphone = undefined,     // obtained by user click
//    inputAudio = audioContext.createGain();
//    mixer = audioContext.createGain(),
    input = audioContext.createGain(),
    processor = undefined;      // created on recording
    
//testTone.connect(testToneLevel);
//testToneLevel.gain.value = 0;
//testToneLevel.connect(mixer);
//microphoneLevel.gain.value = 100;
//microphoneLevel.connect(audioContext.destination);
//mixer.connect(input);
//mixer.connect(audioContext.destination);

//$testToneLevel.on('input', function() {
//  var level = $testToneLevel[0].valueAsNumber / 100;
//  testToneLevel.gain.value = level * level;
//});

//$microphoneLevel.on('input', function() {
//  var level = $microphoneLevel[0].valueAsNumber / 100;
//  microphoneLevel.gain.value = level * level;
//});

// obtaining microphone input
//$microphone.click(function() {
  if (microphone == null)
    //navigator.getUserMedia({ audio: true },
    navigator.getUserMedia({
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
                           },
      },
      function(stream) {
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(input);
        //$microphone.attr('disabled', true);
//        $microphoneLevel.removeClass('hidden');
      },
      function(error) {
        //$microphone[0].checked = false;
        window.alert("Could not get audio input.");
      });
//});

// encoding process selector
var encodingProcess = 'separate';       // separate | background | direct

//$encodingProcess.click(function(event) {
//  encodingProcess = $(event.target).attr('mode');
//});

// processor buffer size
var BUFFER_SIZE = [256, 512, 1024, 2048, 4096, 8192, 16384];

var defaultBufSz = (function() {
  processor = audioContext.createScriptProcessor(16384, 2, 2);
  return processor.bufferSize;
})();

var iDefBufSz = BUFFER_SIZE.indexOf(defaultBufSz);

//$bufferSize[0].valueAsNumber = iDefBufSz;   // initialize with browser default
/*
function updateBufferSizeText() {
  var iBufSz = 2048,  //$bufferSize[0].valueAsNumber,
      text = "" + BUFFER_SIZE[iBufSz];
  if (iBufSz === iDefBufSz)
    text += ' (browser default)';
  //$('#buffer-size-text').html(text);
}
*/
//updateBufferSizeText();         // initialize text

//$bufferSize.on('input', function() { updateBufferSizeText(); });

// save/delete recording


function fileDownload(){
	
	//$("#btn-downlinks_wav")[0].click();
	//$("#btn-downlinks_txt")[0].click();
	

}

function saveRecording(blob) {

   console.log("save fileName:"+ $("#fileName").text() );
   console.log("save userId:"+ $("#userId").val() );
   console.log("save contentsId:"+ $("#contentsId").val() );
   console.log("save contentsVal:"+ $("#contentsVal").val() );
   console.log("save totalContentsCount:"+ $("#totalContentsCount").val() );	
   
  //var saveFileNm = $("#fileName").text()+"_"+ $("#userId").val() +"_"+ $("#contentsId").val() +"_"+ $("#totalContentsCount").val()+"_"+getTimeStamp();
  
  var saveFileNm = $("#fileName").text()+"_"+ $("#userId").val() +"_"+ $("#contentsId").val() +"_"+ $("#totalContentsCount").val();
	
  var textUrl = URL.createObjectURL(new Blob([$("#contentsVal").val()], {type: 'text/plain'}));
	
  var time = new Date(),
      url = URL.createObjectURL(blob),
      html = "<p recording='" + url + "'>" +
             "<audio controls src='" + url + "'></audio><br> " +
             saveFileNm +
             " <a class='btn btn-default' style='display:none' id='btn-downlinks_wav' href='" + url + "' download='"+saveFileNm+"'>" +"Wave Save</a> " +
			 
			 " <a class='btn btn-default' style='display:none' id='btn-downlinks_txt' href='" + textUrl +"' download='"+saveFileNm+"'>" +"Text Save</a> " +
			 
			 " <a class='btn btn-default' id='btn-downlinks' href='javascript:fileDownload();' recording='" +url + "' download='"+saveFileNm+"' >" +"Save</a> " +
			 
             "<button class='btn btn-danger' recording='" +url + "'>Delete</button>" +"</p>";
			 
  $recordingList.prepend($(html));
}


$recordingList.on('click', '#btn-downlinks', function(event) {
	
  $("#btn-downlinks_wav")[0].click();
  $("#btn-downlinks_txt")[0].click();

  var url = $(event.target).attr('recording');
  $("p[recording='" + url + "']").remove();
  URL.revokeObjectURL(url);

  
});


$recordingList.on('click', 'button', function(event) {
  var url = $(event.target).attr('recording');
  $("p[recording='" + url + "']").remove();
  URL.revokeObjectURL(url);
});

// recording process
var worker = new Worker('js/EncoderWorker.js'),
    encoder = undefined;        // used on encodingProcess == direct

worker.onmessage = function(event) { saveRecording(event.data.blob); };

function getBuffers(event) {
  var buffers = [];
  for (var ch = 0; ch < 2; ++ch)
    buffers[ch] = event.inputBuffer.getChannelData(ch);
  return buffers;
}

function startRecordingProcess() {
  //var bufSz = BUFFER_SIZE[$bufferSize[0].valueAsNumber];
  var bufSz = 16384;
  processor = audioContext.createScriptProcessor(bufSz, 2, 2);
  input.connect(processor);
  processor.connect(audioContext.destination);
  if (encodingProcess === 'direct') {
    encoder = new WavAudioEncoder(audioContext.sampleRate, 2);
    //encoder = new WavAudioEncoder(16000, 2);
    processor.onaudioprocess = function(event) {
      encoder.encode(getBuffers(event));
    };
  } else {
    worker.postMessage({
      command: 'start',
      process: encodingProcess,
      sampleRate: audioContext.sampleRate,
      numChannels: 2
    });
    processor.onaudioprocess = function(event) {
      worker.postMessage({ command: 'record', buffers: getBuffers(event) });
    };
  }
}

function stopRecordingProcess(finish) {
  input.disconnect();
  processor.disconnect();
  if (encodingProcess === 'direct')
    if (finish)
      saveRecording(encoder.finish());
    else
      encoder.cancel();
  else
    worker.postMessage({ command: finish ? 'finish' : 'cancel' });
}

// recording buttons interface
var startTime = null    // null indicates recording is stopped

function minSecStr(n) { return (n < 10 ? "0" : "") + n; }

function updateDateTime() {
  //$dateTime.html((new Date).toString());
  if (startTime != null) {
    var sec = Math.floor((Date.now() - startTime) / 1000);
    $timeDisplay.html(minSecStr(sec / 60 | 0) + ":" + minSecStr(sec % 60));
  }
}

window.setInterval(updateDateTime, 200);

function disableControlsOnRecord(disabled) {
//  if (microphone == null)
//    $microphone.attr('disabled', disabled);
  //$bufferSize.attr('disabled', disabled);
  //$encodingProcess.attr('disabled', disabled);
}

function startRecording() {
  startTime = Date.now();
  $recording.removeClass('hidden');
  $record.html('STOP');
  $cancel.removeClass('hidden');
  disableControlsOnRecord(true);
  startRecordingProcess();
}

function stopRecording(finish) {
  startTime = null;
  $timeDisplay.html('00:00');
  $recording.addClass('hidden');
  $record.html('RECORD');
  $cancel.addClass('hidden');
  disableControlsOnRecord(false);
  stopRecordingProcess(finish);
}

$record.click(function() {
	 
  if( $("#recording-list p").length > 0 ){
		console.log($("#recording-list p").attr('recording'));	
		URL.revokeObjectURL($("#recording-list p").attr('recording'));
		
  }
		 
	 $("#recording-list p").empty();
	
  var radioSelected = $(":input:radio[name=contentListId]:checked").val();
  
  
  if ( typeof radioSelected == "undefined" ){
	alert("단어를 선택하세요");
	return;
  } else {
	$("#contentsId").val(radioSelected);
	$("#contentsVal").val( $('input[type=radio][name=contentListId]:checked').attr('id') );
	
  }
	
	
  if($("#userId").val().length <= 0) {
    alert("insert user Id");
    return;
  }
  
  
  
  if (startTime != null)
    stopRecording(true);
  else
    startRecording();
});

$cancel.click(function() { stopRecording(false); });


$file1.change(function() {
	
	$("#contentsList").hide();
	$("#contentsList").empty();
	
	
	if($file1[0].files.length > 0){
		var fileList = $file1[0].files ;
		
		if(fileList){
			$("#fileName").text( $file1.val().substring( $file1.val().lastIndexOf("\\")+1 ).replace( '.txt', '' ) );
			
			//console.log("===>"+  $file1.val().substring( $file1.val().lastIndexOf("\\")+1 ).replace( '.txt', '' )  );
			
			var reader = new FileReader();
			reader.readAsText(fileList[0]);
			
			reader.onload = function () {
				contentsToArray(reader.result)
			}
		} 	
	}
});

function contentsToArray(contents){
	
	var tempArray = contents.split('\n');
	
	var filterArray = new Array();

	
	var idx=0;
	for(var i = 0; i < tempArray.length; i++) { 
		console.log(">>>>>"+tempArray[i].trim()+"<<<<<");
		
		if(tempArray[i].trim() !=""){
			filterArray[idx] =  tempArray[i].trim();
			idx++;
		}
	}
	
	
	var totalContentStr="전체: ("+filterArray.length+")";
	$("#totalContentsCountStr").text(totalContentStr);
	$("#totalContentsCount").val(filterArray.length);
	
	
	$("#contentsList").append(  makeRadio('title','radioId',filterArray) );
	$("#contentsList").show();
	
}
	

function makeRadio(title, id, contentsArray ){
    var str = "";
    
   // var fset = '<fieldset data-role="controlgroup" id="rdioId"><legend>contentsList</legend>';
   var fset = '<fieldset data-role="controlgroup" id="rdioId">';
    
	var cnt=1;
	for(var i = 0; i < contentsArray.length; i++) { 
	
			str += '<input type="radio" name="contentListId" id="cid_' + cnt +  '" value="' + cnt + '">';	
			str += '<label for="cid_' + cnt +  '">' + cnt +". " + contentsArray[i].trim() + '</label><br>';
			cnt++;
		
	}
	
	//var totalContentStr="전체: ("+(cnt-1)+")";
	//$("#totalContentsCountStr").text(totalContentStr);
	//$("#totalContentsCount").val((cnt-1));
	
 
    return fset+str+'</fieldset>';
};

function getTimeStamp() {
  var d = new Date();

  var s =
    leadingZeros(d.getFullYear(), 4) + '-' +
    leadingZeros(d.getMonth() + 1, 2) + '-' +
    leadingZeros(d.getDate(), 2) + '_' +

    leadingZeros(d.getHours(), 2) + '-' +
    leadingZeros(d.getMinutes(), 2) + '-' +
    leadingZeros(d.getSeconds(), 2);

  return s;
}



function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}