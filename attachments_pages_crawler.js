import fs from 'fs';
import downloadFile from './downloadFile.js';

import os from 'os';
// const downloads_path = `${os.homedir()}/Downloads`;

export default function crawl_attachments($, browser, address) {
    // if(address) {
    //     fs.mkdir(`${address}/${$(".liItem .item h3 span:not(.hideme)").text()}`, { recursive: true }, (err) => { });
    //     address = `${address}/${$(".liItem .item h3 span:not(.hideme)").text()}`;
    // };

    $(".liItem").each(async (i, liitem_elem) => {
        // if(!address) { // Make directories only when address is not specified.
        //     fs.mkdir(`${downloads_path}/DOWNLOADED_FILES/${$('#crumb_1 .courseName').text()}`, { recursive: true }, (err) => { });
        //     fs.mkdir(`${downloads_path}/DOWNLOADED_FILES/${$('#crumb_1 .courseName').text()}/${$('#pageTitleText span').text()}`, { recursive: true }, (err) => { });
        //     fs.mkdir(`${downloads_path}/DOWNLOADED_FILES/${$('#crumb_1 .courseName').text()}/${$('#pageTitleText span').text()}/${$(".item h3 span:not(.hideme)", liitem_elem).text()}`, { recursive: true }, (err) => { });    
        // }
        const default_path = `DOWNLOADED_FILES/${$('#crumb_1 .courseName').text()}/${$('#pageTitleText span').text()}/${$(".item h3 span:not(.hideme)", liitem_elem).text()}`;

        $(".attachments li a", liitem_elem).each(async (j, attachment_elem) => {
            if(!$(attachment_elem).attr('href').includes('#')) {

                new setTimeout(() => {

                    browser.newPage().then(async (page) => {

                        page.on('request', async (req) => {
                            if(req.url().includes('content.blackboardcdn.com')){
                                page.close();

                                try {
                                    var path = "";
                                    if(address){
                                        // NEW ADDRESS - .liItem .item h3 span span
                                        // OLD ADDRESS - .liItem .item h3 span:not(.hideme)
                                        // fs.mkdir(`${address}/${$(".item h3 span:nth-child(2)", liitem_elem).text()}`, { recursive: true }, (err) => { });
                                        path = `${address}${$(".item h3 span:nth-child(2)", liitem_elem).text()}`;
                                    }
                                    else{ path = default_path; }

                                    if(!fs.existsSync(`${path}/${$(attachment_elem).text()}`)) {
                                        downloadFile(req.url(), $(attachment_elem).text(), path);
                                    }
                                } catch(err) {
                                    console.log(err);
                                };
                            }
                        });

                        // The .then block is needed because the program closes the tab, which causes the browser_disconnected error, which needs to handled here
                        await page.goto(`https://uonline.newcastle.edu.au${$(attachment_elem).attr('href')}`, { timeout: 100000 }).then(() => {}, () => {});
                    });
                }, 5000*(j+1));
            };
        });

        // Special download pages, "If this item does not open automatically you can"
        // if($('h3', liitem_elem).text().includes('If this item does not open automatically you can')){
        //     console.log("HERE!!!!!!!");

        //     $('h3 a', liitem_elem).each(async (j, elem) => {
        //         new setTimeout(() => {

        //             browser.newPage().then(async (page) => {

        //                 page.on('request', async (req) => {
        //                     if(req.url().includes('content.blackboardcdn.com')){
        //                         page.close();

        //                         try {
        //                             const dir_path = `${downloads_path}/DOWNLOADED_FILES/${$('#crumb_1 .courseName').text()}/${$('#pageTitleText span').text()}/`;
        //                             const file_path = `${dir_path}/${$('#pageTitleText span').text()}`;

        //                             if(!fs.existsSync(file_path)) {
        //                                 downloadFile(req.url(), file_path, dir_path);
        //                             }
        //                         } catch(err) {
        //                             console.log(err)
        //                         };
        //                     }
        //                 });

        //                 await page.goto(`https://uonline.newcastle.edu.au${$(elem).attr('href')}`).then(() => {}, () => {});
        //             });
        //         }, 5000*(j+1));
        //     });
        // }
    });
}