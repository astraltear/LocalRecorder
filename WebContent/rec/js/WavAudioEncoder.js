(function(self) {
  var min = Math.min,
      max = Math.max;

  var setString = function(view, offset, str) {
    var len = str.length;
    for (var i = 0; i < len; ++i)
      view.setUint8(offset + i, str.charCodeAt(i));
  };

  var Encoder = function(sampleRate, numChannels) {
    this.sampleRate = sampleRate;
    this.numChannels = 1;
    this.numSamples = 0;
    this.dataViews = [];
    this.outputSampleRate = 16000;
  };

  Encoder.prototype.encodeStreamWav = function(samples, mono) {
    var buffer = new ArrayBuffer(samples.length * 2);
    var view = new DataView(buffer);
    this.floatTo16BitPCM(view, 0, samples);
    return view;
  };

  Encoder.prototype.floatTo16BitPCM = function(output, offset, input){
    for (var i = 0; i < input.length; i++, offset+=2){
      var s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  };
 
  Encoder.prototype.downSampleBuffer = function(buffer, rate) {
      if (rate == this.sampleRate) {
          return buffer;
      }
      if (rate > this.sampleRate) {
          throw "downsampling rate show be smaller than original sample rate";
      }
      var sampleRateRatio = this.sampleRate / rate;
      var newLength = Math.round(buffer.length / sampleRateRatio);
      var result = new Float32Array(newLength);
      var offsetResult = 0;
      var offsetBuffer = 0;
      while (offsetResult < result.length) {
          var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
          var accum = 0, count = 0;
          for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
              accum += buffer[i];
              count++;
          }
          result[offsetResult] = accum / count;
          offsetResult++;
          offsetBuffer = nextOffsetBuffer;
      }
      return result;
  };

  Encoder.prototype.encode = function(buffer) {
    var len = buffer[0].length,
        nCh = this.numChannels,
        //view = new DataView(new ArrayBuffer(len * nCh * 2)),
        offset = 0;
    var _buf = this.downSampleBuffer(buffer[0], 16000);
    var view = this.encodeStreamWav(_buf, true);
    var _len = _buf.length;
    //console.log(view);
/*
    for (var i = 0; i < len; ++i)
      for (var ch = 0; ch < nCh; ++ch) {
        var x = buffer[ch][i] * 0x7fff;
        view.setInt16(offset, x < 0 ? max(x, -0x8000) : min(x, 0x7fff), true);
        offset += 2;
      }
*/
    this.dataViews.push(view);
    //this.numSamples += len;
    this.numSamples += _len;
  };

  Encoder.prototype.finish = function(mimeType) {
    var dataSize = this.numChannels * this.numSamples * 2 ,
        view = new DataView(new ArrayBuffer(44));
    setString(view, 0, 'RIFF');
    view.setUint32(4, 32 + dataSize, true);
    setString(view, 8, 'WAVE');
    setString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, this.numChannels, true);
    view.setUint32(24, this.outputSampleRate, true);
    view.setUint32(28, this.outputSampleRate * 2, true);
    view.setUint16(32, this.numChannels * 2, true);
    //view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    setString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    this.dataViews.unshift(view);
    var blob = new Blob(this.dataViews, { type: 'audio/wav' });
    this.cleanup();
    return blob;
  };

  Encoder.prototype.cancel = Encoder.prototype.cleanup = function() {
    delete this.dataViews;
  };

  self.WavAudioEncoder = Encoder;
})(self);
