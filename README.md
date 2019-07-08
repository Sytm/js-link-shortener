# Linkshortener

This is a linkshortener which runs using [Node.js]

## Getting started

To run this webservice for youself you need Node.js installed on your local machine *(and ofcourse git)*.

### Prerequisites

To install and run this project you need the following installed:

- [Node.js]
- The [TypeScript] compiler, can be installed with `npm install -g typescript` (Requires Node.js, so install that first)
- *Optionally [Git], if you want to clone the repository and not download it*

### Installing

Firstly you need to download this repository, either download it as a zip archive and extract it where you want the program to run or use git and clone it into the directory.

Example using git:

Depending on your preference you can now clone this repository either via https or ssh *(for ssh you need a ssh keypair set up on github)*
```
git clone https://github.com/Sytm/js-link-shortener.git
```
or 
```
git clone git@github.com:Sytm/js-link-shortener.git
```
Now install all the needed Node.js dependencies like this (You still need to be in the same directory we just created):
```
npm install
```
and then run this command to compile all the typescript files into plain javascript
```
tsc
```
If you dont want to change any settings in the `settings.json` file, you can just start the service by running
```
npm start
```

### Configuring `settings.json`

As of now, the settings file looks like this:

```json
{
    "randomIdLength": 10,
    "port": 8089,
    "storagePath": "./data/storage.json",
    "sites": [
        {
            "identifier": "create",
            "filePath": "./pages/create.html",
            "checkForUpdates": true
        },
        {
            "identifier": "no_such_link",
            "filePath": "./pages/link_not_found.html",
            "checkForUpdates": false
        },
        {
            "identifier": "no_such_site",
            "filePath": "./pages/site_not_found.html",
            "checkForUpdates": false
        }
    ]
}
```
Explaination of the 4 main properties

| Property       | Default               | Description                                                                                |
|----------------|-----------------------|--------------------------------------------------------------------------------------------|
| port           | 8089                  | The port where the web-service will be accessible                                          |
| randomIdLength | 10                    | This value defines the amount of random characters used for the shortenend links           |
| storagePath    | "./data/storage.json" | A path to the json file where all the link-data should be stored                           |
| sites          | See table below       | Defines where the program should look for the html files to create new links and 404 pages |

Explaination of the sites json object

| Property       | Description                                                                                                                                                                                              |
|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| identifier     | The unique id for each site. Required are "create", "no_such_link" and "no_such_page"                                                                                                                    |
| filePath       | Path to the file where the html document can be found that should be served                                                                                                                              |
| checkForUpdate | If it is set to `true`, then the program will check for changes in the file and reload it so you don't have to restart the entire service. If you are not a developer, i recommend setting it to `false` |

___

[Node.js]:https://nodejs.org/
[Git]:https://git-scm.com/
[TypeScript]:https://www.typescriptlang.org
