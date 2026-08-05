export async function processAudioBlob(blob) {
    // We need 16kHz audio for Whisper
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    const arrayBuffer = await blob.arrayBuffer();
    
    // Decode the audio data to a buffer
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Extract the left channel (mono) as a Float32Array
    return audioBuffer.getChannelData(0);
}
