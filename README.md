# detector_file_server

Routes and server code for serving up detector files---the RData and
CSV files that make up the low level data of the CalVAD data
processing chain.  Used by R code that does the distributed imputation
stuff. Can be run standalone using the included server.js, or added to
the main CalVAD web server (as it is now)