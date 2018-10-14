"use strict";
var jsObfuscator = require('javascript-obfuscator');
var fs = require('fs');
var _ = require('lodash');
var recursive = require("recursive-readdir");
var Promise = require('bluebird');
var mkdirp = require('mkdirp');

module.exports = {
    protect: (options)=>{
        let folders = options.folders;
        let filesLocation = options.files;
        let outDir = options.outDir;
        if(outDir == null){
            outDir = './dist';
        }
        if(!folders || folders.length ==0 ){
            obfuscateFiles(filesLocation, options.outDir);
            return;
        }
        
        Promise.map(folders, folder=>{
            return readRecursive(folder);
        })
        .then(result=>{
            let completeFilesLocation = result.join().split(',');
            if(filesLocation && filesLocation.length > 0){
                completeFilesLocation = completeFilesLocation.concat(filesLocation);
            }
            obfuscateFiles(completeFilesLocation, outDir)
        })
        .catch(error=>{
            
        })
        
    }
}

function obfuscateFiles(filesLocation, outDir){
    _.forEach(filesLocation, async fileLoc=>{
        if(!fileLoc.endsWith('.js')){
            return;
        }
        let content = fs.readFileSync(fileLoc, 'utf8');
        let obfuscated = jsObfuscator.obfuscate(content, {
            deadCodeInjection: true,
            stringArray: true,
            stringArrayEncoding: 'base64',
            stringArrayThreshold: 0.75,
            renameGlobals:true
        });
        let directory = `${outDir}/${fileLoc}`;
        directory = directory.split('/');
        directory.splice(directory.length-1);
        directory = directory.join('/');
        await createDirectory(directory);
        fs.writeFileSync(`${outDir}/${fileLoc}`, obfuscated);

    });
    console.log("Process completed");
}

function readRecursive(folder){
    return new Promise((resolve, reject)=>{
        recursive(folder, (err, files)=> {
           if(err){
               return reject(err);
           }
           return resolve(files);
          });
    })
}

function createDirectory(location){
    return new Promise((resolve, reject) => {
        if(fs.exists(location)){
            resolve();
        }
        mkdirp(location, (error, result) => {
            if(!error){
                return resolve(result);
            }
            return reject(error);
        })

    })
    
}