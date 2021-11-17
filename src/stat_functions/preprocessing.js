// tokenize and clean corpus
function getTokenizedCorpus(corpus, storeLocation = false) {

    var tokens = tokenize(corpus, storeLocation);
    // get the stats to collect from chrome local storage
    chrome.storage.local.get("collectionStats", function (result) {
        if (result.collectionStats !== 'undefined') {
            if (result.collectionStats.metaInstructions !== 'undefined') {
                var tokens = cleanCorpus(tokens, metaInfo);
            }
        }

        return tokens;
    });


}

// tokenize a corpus and return the token lists
// returns: {wordTokens: [string], sentenceTokens: [string]}
function tokenize(corpus, storeLocation = false) {
    // return empty tokens if no corpus given
    if (corpus === "undefined") {
        return {
            sentenceTokens: [],
            wordTokens: []
        };
    }
    var wordTokens = [];
    var sentenceTokens = [];
    var wordBuffer = "";
    var sentenceBuffer = "";
    var wordStart = -1;
    var wordEnd = -1;
    // iterate through each character of the corpus
    for (var i = 0; i < corpus.length - 1; i++) {
        var char = corpus[i];
        // if the character is a letter or a number
        if (/[a-zA-Z0-9]+/.test(char)) {
            if (wordStart === -1) {
                wordStart = i;
            }
            // add character to buffer
            //console.log("Adding to buffer" + wordBuffer);
            wordBuffer = wordBuffer.concat(char);
            wordEnd = i;
        }

        // if the character is '-'
        if (char === "-") {
            // if the nextChar is a letter
            var nextChar = corpus[i + 1];
            if (/[a-zA-Z0-9]+/.test(nextChar)) {
                if (wordStart === -1) {
                    wordStart = i;
                }
                // add currentChar to buffer
                wordBuffer = wordBuffer.concat(char);
                wordEnd = i;
            } else {
                // ignore character
                continue;
            }
        }

        // if character is ' ' or newline
        if (/^[\s\n\r]$/.test(char) && wordBuffer !== "") {
            // add word in buffer to wordTokens
            if (storeLocation) {
                wordTokens.push([wordBuffer, wordStart, wordEnd])
            } else {
                wordTokens.push(wordBuffer);
            }
            // reset buffer
            wordBuffer = "";
            wordStart = -1;
            wordEnd = -1;
        }

        // if the character is not a sentence ending character
        if (/^[^!.?\n\r]$/.test(char)) {
            // add the character to a sentence buffer
            sentenceBuffer = sentenceBuffer.concat(char);
        } else {
            // if the character is a sentence ending punctuation
            if (/^[!.?]$/.test(char)) {
                sentenceBuffer = sentenceBuffer.concat(char);
            }
            // if the character is a character that ends a sentence (excluding punctuation)
            if (!/^[\n\s\r]*$/.test(sentenceBuffer)) {
                sentenceTokens.push(sentenceBuffer);
                sentenceBuffer = "";
            }
        }
    }
    // if word buffer is not empty
    if (wordBuffer !== "") {
        // the last character is alpha-numeric
        if (/[a-zA-Z0-9]+/.test(corpus[i])) {
            // add character to wordbuffer
            wordBuffer = wordBuffer.concat(corpus[i]);
            wordEnd = i;
        }
        // add word in buffer to wordTokens
        if (storeLocation) {
            wordTokens.push([wordBuffer, wordStart, wordEnd])
        } else {
            wordTokens.push(wordBuffer);
        }
        // reset buffer
        wordBuffer = "";
        wordStart = -1;
        wordEnd = -1;
    }

    // if the sentence is not empty
    if (sentenceBuffer !== "") {
        // the last character is alpha-numeric or a sentence ending character
        if (/[a-zA-Z0-9?!.\n\r]+/.test(corpus[i])) {
            // add character to sentence buffer
            sentenceBuffer = sentenceBuffer.concat(corpus[i]);
        }
        // add sentence buffer contents to sentence tokens list
        sentenceTokens.push(sentenceBuffer);
    }
    return {
        sentenceTokens: sentenceTokens,
        wordTokens: wordTokens
    };
}



// clean tokens
// includes removing stopwords, apply lemmatisation and make lowercase
function cleanCorpus(tokens) {
    stopwords = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours 	ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"]
    standardizeVocabulary = 'lemmatisation';

    tokens = removeStopwords(tokens, stopwords);

    // apply lemmatisation
    if (standardizeVocabulary === 'lemmatisation') {
        tokens = lemmatise(tokens);
    }

    // make lowercase
    if (casing === 'lowercase') {
        tokens = tokensToLowerCase(tokens);
    }

    return tokens


}

// removes all stopwords from token list
function removeStopwords(tokens, stopwords) {
    tokens = tokens.filter((el) => !stopwords.includes(el));
    return tokens
}

function lemmatise(tokens) {
    var lemmatizer = new Lemmatizer();

    // get POS (Position Of Speech) tag of tokens.
    // this is necessary to get the correct lemmatized token
    var taggedWords = new POSTagger().tag(tokens);

    var lemmaTokens = []

    for (i = 0; i < taggedWords.length; i++) {

        // map the correct lemmatizer tag of tokens
        var posTag = '';

        if (taggedWords[i][1].startsWith('J')) {
            posTag = 'adj';
        } else if (taggedWords[i][1].startsWith('V')) {
            posTag = 'verb';
        } else if (taggedWords[i][1].startsWith('N')) {
            posTag = 'noun';
        } else if (taggedWords[i][1].startsWith('R')) {
            posTag = 'adv';
        }

        try {
            lemmaTokens.push(lemmatizer.only_lemmas(taggedWords[i][0], posTag)[0]);

            if (lemmaTokens[i] === undefined) {
                lemmaTokens[i] = taggedWords[i][0];
            }
        } catch (err) {
            lemmaTokens.push(taggedWords[i][0]);
        }

    }

    return lemmaTokens;
}

function tokensToLowerCase(tokens) {
    for (i = 0; i < tokens.length; i++) {
        tokens[i] = tokens[i].toLowerCase();
    }
    return tokens;
}