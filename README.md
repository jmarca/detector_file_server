# detector_file_server



[![Build Status](https://travis-ci.org/jmarca/detector_file_server.svg?branch=master)](https://travis-ci.org/jmarca/detector_file_server)
[![Maintainability](https://api.codeclimate.com/v1/badges/7161f79c022250227a9d/maintainability)](https://codeclimate.com/github/jmarca/detector_file_server/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/7161f79c022250227a9d/test_coverage)](https://codeclimate.com/github/jmarca/detector_file_server/test_coverage)


Routes and server code for serving up detector files---the RData and
CSV files that make up the low level data of the CalVAD data
processing chain.  Used by R code that does the distributed imputation
stuff. Can be run standalone using the included server.js, or added to
the main CalVAD web server (as it is now)
