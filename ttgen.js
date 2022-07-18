var kTon;
var temperedTones;

function fundamentalsToFreq() {
    let tName = document.getElementById('in_grundfrequenzTemperiert').value;
    let tRegister = document.getElementById('in_register').value;
    let noteName = tName + tRegister;
    let freqNoteName = 0;
    
    for (let i = 0; i < temperedTones.length; i++) {
        let noteName2 = temperedTones[i].name;
        if (noteName == noteName2) {
            freqNoteName = temperedTones[i].freq;
        }
    }
    
    let tDeviation = 0;
    let in_deviation = document.getElementById('conv_cents').value;
    let in_koeff = document.getElementById('conv_plusMinus').value;
    let in_isNthPartial = document.getElementById('conv_isPartialNumber').value; 
    
    tDeviation = in_deviation * in_koeff;
    freqNoteName *= (2 ** (tDeviation / 1200));
    
    freqNoteName /= in_isNthPartial;
    
    return freqNoteName;
}

function calcHarmonicSeries() {
    
    clearResults();
    
    let k = document.getElementById('in_kammerton').value;
    let floatK = parseFloat(k);
    if (typeof(floatK) == 'number') {
        kTon = floatK;
    }
    
    let nPartials = 8;
    let n = document.getElementById('in_nPartials').value;
    let intN = parseInt(n);
    if (typeof(intN) == 'number') {
        nPartials = intN;
    }
    
    // create tempered tones array after user might change standard pitch
    temperedTones = getTemperedFreqs();
    
    // let user create fundamental based on equally tempered tones +- deviation
    let fET = fundamentalsToFreq();
    
    let f0 = 0;
    if (fET == 0) {        
        let f = document.getElementById('in_grundfrequenz').value;
        let floatF = parseFloat(f);
        if (typeof(floatF) == 'number') {
            f0 = floatF;
        }
    } else {
        f0 = fET.toFixed(3);
        document.getElementById('in_grundfrequenz').value = f0;
    }
    
    let myPartials = getPartials(nPartials, f0);
    
    let result = document.getElementById('result');
    let table = document.createElement('table');
    table.setAttribute('id', 'result_table');
    result.appendChild(table);
    
    let resultData = document.getElementById('result_table');
    resultData.innerHTML += '<tr><th>Number</th><th>Frequency</th><th>Tone</th></tr>'
    for (let i = 0; i < myPartials.length; i++) {
        resultData.innerHTML += '<tr>' + '<td>' + myPartials[i].number + '</td>' + '<td>' + myPartials[i].freq + '</td>' + '<td>' + myPartials[i].tone + '</td>' + '</tr>'
    }
    resultData.innerHTML += '<br />'
}

function in_grundfrequenzTemperiert_change() {
    document.getElementById('in_grundfrequenz').value = null;
    document.getElementById('conv_pc').value = document.getElementById('in_grundfrequenzTemperiert').value;
    document.getElementById('conv_register').value = document.getElementById('in_register').value;
}

function conv_change() {
    document.getElementById('in_grundfrequenz').value = null;
    document.getElementById('in_grundfrequenzTemperiert').value = document.getElementById('conv_pc').value;
    document.getElementById('in_register').value = document.getElementById('conv_register').value;
}

function clearTemperedInput() {
    document.getElementById('in_register').value = 'na';
    document.getElementById('in_grundfrequenzTemperiert').value = 'na';
    document.getElementById('conv_pc').value = 'na';
    document.getElementById('conv_register').value = 'na';
    document.getElementById('conv_cents').value = 0;
}

function clearResults() {   
    let res = document.getElementById('result_table');
    if (res != null) {
        res.remove();
    }
}

function getCents(freq1, freq2) {
    let x = 1200 * Math.log2(freq1 / freq2);
    return x;
}

function getPartials(nPartials, f0) {
    let partials = []; 
    for (let i = 0; i < (nPartials); i++) {
        let x = (i + 1) * f0;
        let fTemperedToneNeighbour = 0;
        
        let fT1 = 0;
        let fT2 = 0;
        let fT1name = '';
        let fT2name = '';
        let deviation = 0;
        let tone = '';
        for (let j = 0; j < temperedTones.length; j++) {  
            if (j > 0) {
                fT1 = temperedTones[(j - 1)].freq;
            }
            fT2 = temperedTones[j].freq;          
            if ((x >= fT1) && (x < fT2)) {
                fTemperedToneNeighbour = fT1;               
                if (j > 0) {
                    fT1name = temperedTones[(j - 1)].name;
                }
                fT2name = temperedTones[j].name;
                deviation = getCents(x, fT1);
                tone = fT1name + ' plus ' + Math.round(deviation) + ' Cents'
                if (deviation > 50) {
                    deviation = getCents(fT2, x);
                    tone = fT2name + ' minus ' + Math.round(deviation) + ' Cents'
                }
            }          
        }
        
        let x3 = x.toFixed(3);
        
        partial = {
            number: (i + 1),
            freq: x3,
            tone: tone
        }
        partials.push(partial);
        
    }
    return partials;
}

function getPitchClass(j) {
    let pitchClasses = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return pitchClasses[j];
}

function getTemperedFreqs() {
    let temperedFreqs = [];
    let c0 = kTon * (2 ** (3/12)) * 1/32;
    console.log('kammerton', kTon);
    //frequenzen für 20 Oktaven, alle darüber nicht mehr hörbar
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 12; j++) {
            let freq = ((c0 * (2 ** i)) * ((2 ** (j/12))));
            let pc = getPitchClass(j);
            
            
            let octave = i.toString();
            let noteName = pc + octave;
            let temperedTone = {
                name: noteName,
                freq: freq
            }
            temperedFreqs.push(temperedTone);
        }
    }
    return temperedFreqs;   
}

function toggleMode() {
    let btn = document.getElementById('div_toggleMode');
    let divBasicMode = document.getElementById('div_basicMode');
    let divExtendedMode = document.getElementById('div_extendedMode');
    
    if (btn.innerHTML == 'More options') {
        divExtendedMode.style.display = 'block';
        btn.innerHTML = 'Less options';
    } else {
        divExtendedMode.style.display = 'none';
        btn.innerHTML = 'More options';
    }
}

function hideFooter() {
    document.getElementById('siteFooter').style.display = 'none';
}