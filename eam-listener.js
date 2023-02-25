// Create a new instance of the Web Audio API AudioContext
const audioContext = new AudioContext();

// Create a new instance of the MediaStreamAudioDestinationNode, which creates a virtual microphone
const destination = audioContext.createMediaStreamDestination();
console.error('Virtual microphone created');

// Connect the destination to the audio context
audioContext.createAnalyser().connect(destination);
console.error('Destination connected');

// Create a new instance of the SpeechRecognition API
let recognition;

if (navigator.userAgent.indexOf('Firefox') !== -1) {
  recognition = SpeechRecognition();
} else if (navigator.userAgent.indexOf('Chrome') !== -1) {
  console.log('chrome')
  recognition = webkitSpeechRecognition();
} else {
  console.log('Unknown browser')
}

// Set the properties of the recognition object
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';
console.error('Recognition properties set');

// Set the audio input to the virtual microphone created by the MediaStreamAudioDestinationNode
recognition.audioInput = destination.stream;

// Set the interimResults option to get partial transcriptions
recognition.interimResults = true;

// Set the maximum duration of a single file in milliseconds
const maxFileDuration = 300000; // 5 minutes

// Set the maximum duration of silence in milliseconds
const maxSilenceDuration = 5000; // 5 seconds

// Set the start time of the current file
let startTime = Date.now();

// Set the current transcript to an empty string
let transcript = '';

// Start the recognition
recognition.start();

// When the recognition receives a result, write the transcript to a file and rotate the file if necessary
recognition.onresult = (event) => {
    const results = event.results;
    for (let i = event.resultIndex; i < results.length; i++) {
        transcript += results[i][0].transcript;
        if (results[i].isFinal) {
            console.log('Final transcript:', transcript);
        } else {
            console.log('Interim transcript:', transcript);
        }
    }

    // Replace the military phonetic alphabet characters with their corresponding alphabetic characters
    const phoneticAlphabet = {
        'alpha': 'A',
        'bravo': 'B',
        'charlie': 'C',
        'delta': 'D',
        'echo': 'E',
        'foxtrot': 'F',
        'golf': 'G',
        'hotel': 'H',
        'india': 'I',
        'juliet': 'J',
        'kilo': 'K',
        'lima': 'L',
        'mike': 'M',
        'november': 'N',
        'oscar': 'O',
        'papa': 'P',
        'quebec': 'Q',
        'romeo': 'R',
        'sierra': 'S',
        'tango': 'T',
        'uniform': 'U',
        'victor': 'V',
        'whiskey': 'W',
        'x-ray': 'X',
        'yankee': 'Y',
        'zulu': 'Z',
    };

    Object.keys(phoneticAlphabet).forEach((key) => {
        transcript = transcript.replace(new RegExp(key, 'ig'), phoneticAlphabet[key]);
    });

    // If there has been a silence of more than maxSilenceDuration, write the transcript to a file and rotate the file
    if (Date.now() - startTime > maxSilenceDuration) {
        console.log('Silence detected, rotating file');
        // Replace any remaining military phonetic alphabet characters
        Object.keys(phoneticAlphabet).forEach((key) => {
            transcript = transcript.replace(new RegExp(key, 'ig'), phoneticAlphabet[key]);
        });
        writeToFile(transcript);
        transcript = '';
        startTime = Date.now();
    }

    // If the current file has reached its maximum duration, write the transcript to a file and rotate the file
    if (Date.now() - startTime > maxFileDuration) {
        console.log('Max file duration reached, rotating file');

        // Replace any remaining military phonetic alphabet characters
        Object.keys(phoneticAlphabet).forEach((key) => {
            transcript = transcript.replace(new RegExp(key, 'ig'), phoneticAlphabet[key]);
        });
        writeToFile(transcript);
        console.error('Ready to download');
        transcript = '';
        startTime = Date.now();
    }
};

// Write the transcript to a file
function writeToFile(transcript) {
    // Create a new Blob with the transcript
    const blob = new Blob([transcript], {type: 'text/plain'});
    // Create a new URL for the Blob
    const url = URL.createObjectURL(blob);
    // Create a new anchor element with the URL
    const a = document.createElement('a');
    a.href = url;
    // Set the download attribute to the current date and time
    const date = new Date();
    const filename = `transcript_${date.toISOString()}.txt`;
    a.download = filename;
    // Click the anchor element to download the file
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Revoke the URL to free up memory
    URL.revokeObjectURL(url);
}

