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
    * Button directing to page where collected stats can be viewed
    * Disable the extension from running the program
* Options
    * Whitelist for sites
    * View collected data
    * Export collected data
    * Import test script for required statistics
    * Reset Collected Data

## Milestones
| Milestone                 | Description                | Approx. Date         | Additional Comments      |Status? |
|---------------------------|----------------------------|----------------------|--------------------------|-----------|
| Reads webpage content     | Extension is able to read content that the user browses that they have consented to be tracked.                                                                        | 1 Week, 26/06/2021   | Includes every valid text element. Exceptions for custom text tags that cannot be extracted normally. Allows for blacklist/ whitelist of certain webpage | ✓ |
| Analyse Read Content      | Extension is able to analyse the content that was read in.                                                                                                             | 2 weeks, 09/08/2021  | Framework that allows for addition of more stats easily. Fast enough that it does not affect users browsing experience                                   | In Progress... |
| Stores Statistics         | Extension is able to store the calculated statistics in a sensible format                                                                                              | 0.5 week, 11/08/2021 | Must be able to reference data at any point in time. Makes use of chrome storage API. Format should allow exporting into other formats.                  | ✘  |
| Imports Test Scripts      | Allows for importing/inputting “instructions” from the researcher. Could simply be two lists of words to compare for collocation etc.                                  | 1 week, 18/08/2021   |                                                                                                                                                        | ✘  |
| Exports Stored Statistics | Allows users to export the stored statistics to a readable format                                                                                                      | 0.5 week, 23/08/2021 | Could be a txt, csv or json file.                                                                                                                        | ✘  |
| Extension Popup           | Clicking on the extension shows a popup which allows the user to read the statistics that have been collected so far and also temporarily disable the extension        | 1 week, 30/08/2021   | Just a mock up, not going to be good looking                                                                                                             | ✘  |
| Options Page              | Allows the user to add blacklist/whitelist, export the data that has been collected so far, add instructions from the researcher, and also reset the stored statistics | 1 week, 06/09/2021   | Just a mock up, not going to be good looking                                                                                                             | ✘  |
| Create Desired UI         | Neaten the UI so that the page is organised and readable. Applies to both the Extension Popup and Options Page                                                         | 1 week, 13/09/2021  |    | ✘  |



