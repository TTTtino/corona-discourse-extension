# Collocation Tracking Chrome Extension
Tracks websites that the user visits and stores statistics on it. Allowing them to export the data so that it can be sent to a researcher.

## Functional Description
* Detect the webpage that is currently being browsed
* Read visible content of webpage accurately
* Use read content and generate (collocation) stats
* Store (collocation) stats/ save as file
* Allow user to export the data that was collected

## User Interface
* Popup
    * View stats collected so far
    * Disable the extension from running the program
* Options
    * Whitelist/ blacklist for sites
    * Export collected data
    * Import test script for required statistics

## Milestones
* Create extension that can read content of webpages accurately
    * Includes every valid text element
    * Does not miss out important elements
    * Exceptions for custom text tags that cannot be extracted normally
* Take read content and perform analysis on it
    * Framework that allows for more stats to be easily added later on
    * Must be able to do it fast enough so that it won't negatively impact the user experience



