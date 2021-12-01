function performFrequency(wordTokens, freqInfo) {

    var frequencies = {};

    for (var i = 0; i < freqInfo.tokens.length; i++) {
        var token = freqInfo.tokens[i];

        // get absolute frequency
        var absFreq = getFrequency(
            token,
            wordTokens,
            freqInfo.parseAsRegex
        );

        if (absFreq > 0) {

            frequencies[token] = {
                absoluteFrequency: absFreq,
                relativeFrequency: 0,
                logFrequency: 0
            }
        }


    }

    var result =new FrequencyData();
    result.tokens = frequencies;
    result.totalWordCount = wordTokens.length;

    return result;

}
