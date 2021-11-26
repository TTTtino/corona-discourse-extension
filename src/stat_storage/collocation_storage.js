    // class for storing the collected collocation data
    class CollocationData {
        constructor() {
            // dictionaries with each "token" as key and the values for that specific token as value
            this.pivotFrequencies = {};
            this.targetFrequencies = {};
            this.nGramFrequencies = {};
            this.nGramPivotPositions = {};
            this.nGramSum = 0;
            this.tokenSum = 0;
        }
    }


    // Combine two collocation data objects and return the result
    function combineCollocationData(prevCollocationData, collocationData) {

        var newCollocationData = new CollocationData();
        // iterate through each key in the collocationData pivot dictionary
        for (var key in collocationData.pivotFrequencies) {
            var value = collocationData.pivotFrequencies[key];
            var oldVal = prevCollocationData.pivotFrequencies[key];
            // if the prevCollocationData pivot dictionary contained the key
            if (oldVal != null) {
                // add the new frequency to the stored pivot frequency
                newCollocationData.pivotFrequencies[key] = oldVal + value;
            } else {
                // if the key is new, then simply add the key,value to the dictionary
                newCollocationData.pivotFrequencies[key] = value;
            }
        }

        // iterate through each key in the collocationData target dictionary
        for (var key in collocationData.targetFrequencies) {
            var value = collocationData.targetFrequencies[key];
            var oldVal = prevCollocationData.targetFrequencies[key];
            // if the prevCollocationData target dictionary contained the key
            if (oldVal != null) {
                // add the new frequency to the stored target frequency
                newCollocationData.targetFrequencies[key] = oldVal + value;
            } else {
                // if the key is new, then simply add the key,value to the dictionary
                newCollocationData.targetFrequencies[key] = value;
            }
        }

        // iterate through each key in the collocationData n-gram dictionary
        for (var key in collocationData.nGramFrequencies) {
            var value = collocationData.nGramFrequencies[key];
            var oldVal = prevCollocationData.nGramFrequencies[key];
            // if the prevCollocationData nGram dictionary contained the key
            if (oldVal != null) {
                // add the new frequency to the stored ngram frequency
                newCollocationData.nGramFrequencies[key] = oldVal + value;
            } else {
                // if the key is new, then simply add the key,value to the dictionary
                newCollocationData.nGramFrequencies[key] = value;
            }

        }

        // if the n-gram sum is not null
        if (prevCollocationData.nGramSum != null) {
            newCollocationData.nGramSum = prevCollocationData.nGramSum + collocationData.nGramSum;
        } else {
            newCollocationData.nGramSum = collocationData.nGramSum;
        }

        // if the token sum is not null
        if (prevCollocationData.tokenSum != null) {
            newCollocationData.tokenSum = prevCollocationData.tokenSum + collocationData.tokenSum;
        } else {
            newCollocationData.tokenSum = collocationData.tokenSum;
        }

        return newCollocationData;
    }
