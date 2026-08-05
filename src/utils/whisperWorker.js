import { pipeline, env } from '@xenova/transformers';

// Configure environment
env.allowLocalModels = false;
env.useBrowserCache = true;

class PipelineSingleton {
    static task = 'automatic-speech-recognition';
    static model = 'Xenova/whisper-tiny.en';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { audioData } = event.data;

    try {
        const transcriber = await PipelineSingleton.getInstance(x => {
            self.postMessage({ status: 'progress', data: x });
        });

        self.postMessage({ status: 'processing' });
        
        // Run transcription
        const output = await transcriber(audioData);
        
        self.postMessage({ status: 'complete', transcript: output.text });
    } catch (error) {
        self.postMessage({ status: 'error', error: error.message });
    }
});
