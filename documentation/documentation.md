# Documentation

## Manifest File
https://developer.chrome.com/docs/extensions/mv3/manifest/

## Background Service Worker
The service worker runs separate to the webpage and is a background process.
### worker_wrapper.js
Imports all the scripts that are required to run the actual background process file (main.js).

### main.js
#### Listener: OnTabUpdate
When a tab is updated the background process will call the function. 
* Sets icon's to black and white, to indicate that no calculation has been done on the updated page.
* If the extension is active and the URL is part of the whitelist then it will:
    * Colour the extension icon to indicate stat collection will begin 
    * check for which parser is required (uses the basic_parser by default)
    * Execute all the scripts that are required for that webpage, on the updated tab's webpage

#### function: executeMultipleScripts(fileList, tabId)
Uses the chrome scripting API to execute all scripts listed in fileScripts on the tab with the ID tabId

#### function urlInList(url, urlList)
returns true if any element in urlList (partially or fully) matches the url

-----------------------------------

## Parsers
Note: All parsers must have a getPageContent function that returns a string that contains the relevant corpus for the loaded webpage

### parser_info.json
JSON file defining a list of "parsers" where each element is an object containing:
* hostname: the website/domain name
* parser: the parser to be used on a webpage with the "hostname"

### basic_parser.js
#### function: getPageContent()
returns all the visible text in the loaded document

#### function: isExcluded(elm)
returns true if elm should be excluded from being included as part of the corpus. (excludes elements with invisible text nodes)


#### function: traverse(elm, pageText)
Goes through every element that is a part of elm, and appends the text of those element's which have visible text to pageText.

returns a string containing all visible text that is inside/a part of elm


### article_parser.js
#### function: getPageContent()
returns all the visible text, in every "article" element that is in the loaded document. If there are no articles found, it will iterate through the whole document instead.

#### function: isExcluded(elm)
returns true if elm should be excluded from being included as part of the corpus. (excludes elements with invisible text nodes)


#### function: traverse(elm, pageText)
Goes through every element that is a part of elm, and appends the text of those element's which have visible text to pageText.

returns a string containing all visible text that is inside/a part of elm

--------------------

## Statistic Calculation

### generic.js
#### function: tokenize(corpus, storeLocation=false)
Note: sentenceTokens are not fully implmented
Tokenize any given *corpus* into sentence and word tokens. If storeLocation is true, then the start and end index of each token in the *corpus* will also be stored.

returns an object with attributes:
* sentenceTokens: list of strings, where each element is a sentence in the *corpus*
* wordTokens: if storeLocation is false:
    * list of strings, where each element is a "word" in the *corpus*
    * else, list of [token, startIndex, endIndex]

#### function: generateNgrams(wordTokens, [l,r])
Creates n-grams based on the wordTokens, where *l* and *r* are the span of the n-gram
returns a list of objects with attributes:
* word: the "centre" token of the n-gram
* left: list of *l* tokens to the left of "word"
* right: list of *r* tokens to the right of "word"

#### function: getFrequency(word, wordTokens, regex)
returns an int representing occurence of *word* in *wordTokens*. *word* will be parsed as a regular expression if *regex* is true

#### function: getNgramFrequency(pivot, target, ngrams, regex)
Calculates the frequency of a particular *pivot* and *target* appearing in the same n-gram in an array *ngrams*. *pivot* and *target* will be parsed as a regular expressions if *regex* is true

returns an int representing the number of times the pivot and target appear in the same n-gram in the *ngrams* list

#### function: removePositionsFromTokenList(tokenList)
returns a new token list where the positions are removed from *tokenList*. List of [token, startIndex, endIndex] -> List of token

#### function: getStatsToCollect(callback)
calls the *callback* function with StatCollectionObject containing the parameters that are required to perform statistic calculations from chrome local storage as an argument. If no parameters have been imported/defined, then the *callback* function is called with null as the argument.

### collocation.js

#### function: performCollocation(wordTokens, collocationInfo)
returns a CollocationData object containing the collocation data calulated from *wordTokens*, using the parameters defined in *collocationInfo*. This will only calculate the frequencies of the pivot tokens, target tokens, and frequencies of the pivot-token n-grams, and the total sum of n-grams and tokens in *wordTokens*.

#### function: calculateProbPMI(pivotProbs, targetProbs, nGramProbs, canSelfReference)
returns an object where each attribute is a pivot-target pair, and it's value is the PMI of that pair. This is calculated using the probabilities rather than the frequencies.

#### function: calculateFreqPMI(collocationData, canSelfReference)
returns a CollocationData object, with the additional attributes:
* pivotProbabilities: the probability of each pivot happening given the frequency and tokenSum from *collocationData*
* targetProbabilities: the probability of each target happening given the frequency and tokenSum from 
* nGramProbabilities: the probability of each n-gram occuring given the frequency and nGramSum from *collocationData*
* pmi: a "dictionary"(object where each attribute is a key) where each key is a pivot-target pair, and the value is the PMI 

### concordance.js

#### function: performConcordance(wordTokens, concordanceInfo)
returns a list of objects representing concordanceLines with the attributes:
* left: list of tokens to the left of the word
* right: list of tokens to the right of the word
* wordToken: the "center" pivot token

Note: if the tokens also contained their indexes, the attributes would contain [token, startIndex, endIndex] instead of just the token

#### function: DEPRECATED_performConcordance(wordTokens, concordanceInfo)
Older form of concordance where the concordance would also take into consideration collocation between pivots and targets, and also take in an additional int pair representing the context outside of the span, through concordanceInfo

returns a list of objects representing concordanceLines with the attributes:
* left: list of tokens to the left of the word with length [leftSpan + leftContext]
* right: list of tokens to the right of the word with length [rightSpan + rightContext]
* wordToken: the "center" pivot token

#### function: stringifyConcordanceLine(concordLine, corpus)
Turns a concordance line into a string. If *corpus* is passed in then it uses the token index to also include the punctuations and other context of the concordance line. If *corpus* is false, the tokens are simply used

returns an object with attributes:
* left: a string representing the context left of the word
* right: a string representing the context right of the word
* word: the "center" word

#### function: stringifyTokenArray(array, corpus)
Converts a token array into a single string. If corpus is given then it uses the token indexes to slice the corpus to give context, whereas if corpus is false then the *array* is simply joined using " "

returns the *array* as a string

#### function: DEPRECATED_generateContext(index, span, wordTokens)
Used in the deprecated function to generate the context from an *index* using *wordTokens* and *span*.

returns a list of tokens [*span*] tokens from *index*. if *span* is negative context is generated to the left, if it's positive then to the right.

#### function: tokenInList(token, targetList, regex)
returns true if *token* matches any element in the *targetList*. if *regex* is true, then *targetList* elements are parsed as a regular expression and tested against *token*

-------------------------------------------

## Collected Statistics Storage

### collocation_storage.js

#### Class: CollocationData
Used to store data that has been collected whilst the program is running

**Attributes**
* pivotFrequencies: Dictionary where the key is each pivot, and the value is the occurences of the key
* targetFrequencies: Dictionary where the key is each target, and the value is the occurences of the key
* nGramFrequencies: Dictionary where the key is each [pivot target], and the value is the occurences of the key
* nGramSum: The total number of n-grams found
* tokenSum: The total number of tokens found

#### combineCollocationData(prevCollocationData, collocationData)
Combines newly calculated collocation data with the stored collocation data

returns a new CollocationData object with the combined values of *prevCollocationData* and *collocationData*

### concordance_storage.js

#### Class: ConcordanceData
Used to store concordanceLines that have been collected

**Attributes**
* concordanceLines: Array of concordance line objects with attributes left, right and wordToken

#### function: concordanceLineEquivalent(lineA, lineB)(prevConcordData, calcConcordanceLines)
returns true if two concordance lines are exactly the same (left, right and word are the same)

#### function: combineConcordanceData(prevConcordData, calcConcordanceLines)
Combines newly calculated concordance data with the stored concordance data 

returns a new ConcordanceData object with the combined values of *prevConcordData* and *calcConcordanceLines*

#### function: removeConcordanceDuplicates(concordanceData) DEPRECATED
removes duplicate concordance lines from a ConcordanceData object

returns a new ConcordanceData object but with any duplicate's removed

-------------------------------------------

## Statistic Collection Parameters Storage

### StatCollectionInfo.js

Stores Classes used to store stat collection parameters, usually extracted from a research JSON file

#### Class: StatCollectionInfo
Stores information regarding stats that are to be collected. 

**Attributes**

* researchName: The name that is given to the research script file given. Defaults to "Default Input Parameters" and must be overidden after instantiation
* collocation: Should store a Collocation Object detailing parameters for collocation related stat collection. Defaults to null and must be overidden after instatiation
* concordance: Should store a Concordance Object detailing parameters for concordance related stat collection. Defaults to null and must be overidden after instatiation

#### Class: Collocation
Stores parameters that are required for collocation to run

**Attributes**

* pivotTokens: List of strings. These are the strings looked for when performing collocation.
* targetTokens: List of strings. These are the strings looked for collocation around each pivot token.
* self-reference: boolean. Used to decide if collocation must be checked for if a pivot and target are the same
* parseAsRegex: boolean. Determines whether the pivotTokens and targetTokens are parsed as regular expressions
* span: [int, int]. How far to the left and right of a found pivot token a target must be looked for.

#### Class: Concordance
Stores parameters that are required for concordance to run

**Attributes**

* pivotTokens: List of strings. These are the strings looked for when performing concordance.
* parseAsRegex: boolean. Determines whether the pivotTokens are parsed as regular expressions
* span: [int, int]. How many tokens to the left and right of a found pivot token must be stored.