export class SpeechService {
    constructor() {
        this.recognition = null;
    }
    
    speak(text) {
        return new Promise((resolve) => {
            if (!('speechSynthesis' in window)) {
                resolve();
                return;
            }
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();
            window.speechSynthesis.speak(utterance);
        });
    }
    
    listen(continuous = false) {
        return new Promise((resolve, reject) => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                reject(new Error("Speech Recognition not supported. Use Chrome or Edge."));
                return;
            }
            
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = continuous;
            this.recognition.interimResults = true; 
            this.recognition.lang = 'en-US';
            
            let finalTranscript = '';
            
            this.recognition.onresult = (event) => {
                let tempTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        tempTranscript += event.results[i][0].transcript + ' ';
                    }
                }
                finalTranscript += tempTranscript;
                
                if (!continuous && event.results[0].isFinal) {
                    this.recognition.stop();
                }
            };
            
            this.recognition.onerror = (event) => {
                resolve(finalTranscript.trim());
            };
            
            this.recognition.onend = () => {
                resolve(finalTranscript.trim());
            };
            
            this.recognition.start();
        });
    }
    
    stop() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }
}
