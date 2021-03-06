import fetch from 'node-fetch';
import fs from 'fs';

import shelljs from 'shelljs';
import os from 'os';
import url_module from 'url';

// const downloads_path = `${os.homedir()}/Downloads`;
const downloads_path = url_module.fileURLToPath(`file://${os.homedir()}/Downloads`); // Correcting the encoding of the path.

export default async function downloadFile(url, file_name, dir_path) {

    var absolute_dir_path = `${downloads_path}/${dir_path.replace(/[&#,+()$~%.'":*?<>]/g, '')}`;
    absolute_dir_path = url_module.fileURLToPath(`file://${absolute_dir_path}`); // Correcting the encoding of the path.
    file_name = file_name.replace(/[&\/\\#,+()$~%'":*?<>]/g, ''); // Filtering out everything except '.', for file extensions.
    var path_to_file = `${absolute_dir_path}/${file_name}`;
    path_to_file = url_module.fileURLToPath(`file://${path_to_file}`);

    shelljs.mkdir('-p', absolute_dir_path); // Create the dir where the file to be downloaded is to be stored.

    const res = await fetch(url);
    const fileStream = fs.createWriteStream(path_to_file);

    await new Promise(async (resolve, reject) => {
        // await increment_progress_val('queued');

        res.body.pipe(fileStream);

        console.log(`\n${path_to_file}\nFILE DOWNLOAD STARTED`);

        res.body.on("error", reject);
        fileStream.on("finish", resolve);

    }).then(async (err) => {
        fileStream.close(); 

        if(err) { console.log(`\n${err} \nONE FILE FAILED!`); }
        else{

            // await increment_progress_val('downloaded');

            console.log(`\n${path_to_file}\nFILE DOWNLOADED`);

            // const progress = await get_progress_json();
            // console.log(`${progress.downloaded} of ${progress.queued} files downloaded. (only close this program, when these values don't change for a long time)`);

        }

    }).catch((err) => { console.log(`\n${err} \nONE FILE FAILED!`); });
}

async function get_progress_json(){
    return new Promise((resolve, reject) => {
        fs.readFile('./progress.json', (err, data) => {
            resolve(JSON.parse(data));
        });
    })
}

async function increment_progress_val(val_type){
    return new Promise((resolve, reject) => {
        if(val_type === "queued"){
            new Promise((resolve, reject) => {
                fs.readFile('./progress.json', (err, data) => {
                    resolve(data);
                })
            }).then((data) => {
                var progress_obj = JSON.parse(data);
                progress_obj.queued = parseInt(progress_obj.queued) + 1;
                fs.writeFile('./progress.json', JSON.stringify(progress_obj), (err) => {
                    if(!err) resolve();
                    else {
                        console.log(err);
                        reject();
                    }
                });
            })
        }
        else if(val_type === "downloaded"){
            new Promise((resolve, reject) => {
                fs.readFile('./progress.json', (err, data) => {
                    resolve(data);
                })
            }).then((data) => {
                var progress_obj = JSON.parse(data);
                progress_obj.downloaded = parseInt(progress_obj.downloaded) + 1;
                fs.writeFile('./progress.json', JSON.stringify(progress_obj), (err) => {
                    if(!err) resolve();
                    else {
                        console.log(err);
                        reject();
                    }
                });
            })
        }
    })
}