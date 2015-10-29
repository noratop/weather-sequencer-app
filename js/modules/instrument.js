var Tone = require("tone");
var rainFX = require("./fx/rain");
var humidityFX = require("./fx/humidity");
var visibilityFX = require("./fx/visibility");
var cloudFX = require("./fx/cloud");
var stormFX = require("./fx/storm");
var temperatureFX = require("./fx/temperature");
var windFx = require("./fx/wind");
var g = require("./current-env");


function Instrument(sampleSet) {
    this.trackSet = sampleSet;
    this.toneSynth = new Tone.PolySynth(1, Tone.Sampler, sampleSet, {"envelope" : {"release" : 0.2}});
    this.toneSynth.toMaster();
    this.fxOn = false;
    this.wind = new windFx();
    Tone.Buffer.onload = function(){
        console.log("buffer loaded");
        g.setBuffer(true);
    }
}


Instrument.prototype = {
    connectFX: function(weather) {
        //windFx
        this.wind.setFx(weather);

        //disconnect any existing effect
        this.toneSynth.disconnect();
        
        //change the bpm of Transport
        this.BPM = temperatureFX(weather);
        
        //all other fx are regular ones to chain between the instrument and the Master
        this.toneSynth.chain(
            rainFX(weather),
            humidityFX(weather),
            visibilityFX(weather),
            cloudFX(weather),
            stormFX(weather),
            Tone.Master
        );
        
        this.fxOn = true;
    },
    getTrackSetArray: function() {
        var set = this.trackSet;
        var setArray = [];
        for (var key in set){
            setArray.push(key);
        }
        return setArray;
    },
    disconnectFX: function(){
        this.toneSynth.disconnect();
        this.wind.noise.stop();
    },
    directToMaster: function() {
        this.toneSynth.toMaster();
    }
    // setNewSynth: function(sampleSet) {
    //     this.trackSet = sampleSet;
    //     this.toneSynth = new Tone.PolySynth(1, Tone.Sampler, sampleSet, {"envelope" : {"release" : 0.2}});
    // }
}

module.exports = Instrument;