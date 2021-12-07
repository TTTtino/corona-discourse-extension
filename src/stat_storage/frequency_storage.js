 // class for storing the collected collocation data
 class FrequencyData {
     constructor() {
         // dictionaries with each "token" as key and the values for that specific token as value
         this.tokens = {}
         this.totalWordCount = 0;
     }
 }


 // Combine two collocation data objects and return the result
 function combineFrequencyData(prevFrequencyData, frequencyData) {

     if (typeof prevFrequencyData === 'undefined' || prevFrequencyData.totalWordCount === 0) {
         var newFrequencyData = new FrequencyData();
     } else {
         newFrequencyData = prevFrequencyData;
     }

     // iterate through each key in the frequency data absolute frequency dictionary

     var totalWords;
     if (prevFrequencyData !== null && prevFrequencyData.totalWordCount > 0) {
         // add the new frequency to the stored absolute frequency
         totalWords = prevFrequencyData.totalWordCount + frequencyData.totalWordCount;
     } else {
         // if the key is new, then simply add the key,value to the dictionary
         totalWords = frequencyData.totalWordCount;
     }

     newFrequencyData.totalWordCount = totalWords;


     for (var key in frequencyData.tokens) {

         var tmpFreq = {}
         // get value (token : {absFreq:1, relFreq: 1, logFreq: 1})
         var value = frequencyData.tokens[key];
         var oldVal = prevFrequencyData.tokens[key];

         // combine absolute frequency 
         var absFreq;
         // if the prevFrequencyData dictionary contained the key
         if (oldVal != null) {
             // add the new frequency to the stored absolute frequency
             absFreq = oldVal.absoluteFrequency + value.absoluteFrequency;
         } else {
             // if the key is new, then simply add the key,value to the dictionary
             absFreq = value.absoluteFrequency;
         }

         var relFreq = calculateRelativeFrequency(totalWords, absFreq);
         var logFreq = calculateLogFrequency(absFreq);


         tmpFreq = {
             absoluteFrequency: absFreq,
             relativeFrequency: relFreq,
             logFrequency: logFreq
         }

         newFrequencyData.tokens[key] = tmpFreq;


     }

     return newFrequencyData;
 }



 function calculateRelativeFrequency(nTokens, freq) {
     var relFreq = freq / nTokens;

     var tmpRelFreq = Math.round(relFreq * 100) / 100;

     if (tmpRelFreq === 0) {
         relFreq = Math.round(relFreq * 1000000) / 1000000;
     } else {
         relFreq = tmpRelFreq;
     }



     return relFreq;
 }

 function calculateLogFrequency(freq) {
     var logFreq = Math.log10(1 + freq);

     logFreq = Math.round(logFreq * 100) / 100;

     return logFreq;
 }