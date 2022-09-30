import {build} from "esbuild";
import sveltePlugin from "esbuild-svelte"
import sveltePreprocess from "svelte-preprocess";
import * as fs from "fs";
import {manifest} from "./Manifest.mjs";
import {type HtmlFileConfiguration, htmlPlugin as exportHtmlPlugin} from "@craftamap/esbuild-plugin-html";
import { html as fromHtmlPlugin }  from '@esbuilder/html'
import {zip} from "zip-a-folder";

const
    DEBUG : boolean = true,
    MINIFY : boolean = false, //TODO chancge this
    OUTDIR : string = "out/",
    ENTRY : string = "src/",
    PACKDIR : string = "dist/"
function toJson(obj: object, path: string){
    let str = JSON.stringify(obj);
    fs.writeFileSync(path, str)
}
function pack(folderPath: string, resultPath: string){
    zip(folderPath, resultPath).then(err => {
        //maybe it needs to delete the file first, original does it
        if (err) console.error(err)
    })
}
function fileToHtml(fileName: string){
    const fileNames = fileName.split(".")
    fileNames.pop()
    return fileNames.join(".") + ".html"
}

function replaceAll(str: string, find: string, replaceStr: string) {
    return str.replace(new RegExp(find, 'g'), replaceStr);
}

async function replaceToFile(fileSource, fileDestiny, defineObj: {[key: string]: string}) {
    let fileContent = fs.readFileSync(fileSource, "utf8", )
    for (let el in defineObj) {
        fileContent = replaceAll(fileContent, el, defineObj[el])
    }
    fs.writeFileSync(fileDestiny, fileContent)
}


const pages: overwolf.Dictionary<overwolf.extensions.ExtensionWindowData> = manifest.data.windows
let entryPoints = new Array<{ windowName: string, entryFile: string }>(0);
for (const [windowName, windowData] of Object.entries(pages)) {
    if (windowData.file.endsWith(".svelte")){
        let subs = {"APPNAME" :ENTRY + windowData.file, "APP":windowName}
        let indexFile = "temp/index." + windowData.file + ".ts"
        await replaceToFile("index.svelte.ts", indexFile, subs)
        entryPoints.push({windowName: windowName, entryFile: "temp/" + windowName + ".js"}) //TODO check if this is right
        windowData.file = fileToHtml(windowData.file);
    }else if (windowData.file.endsWith(".html")){
        entryPoints.push({windowName: windowName, entryFile: ENTRY + windowData.file});
    }else{
        entryPoints.push({windowName: windowName, entryFile: ENTRY + windowData.file});
        windowData.file = fileToHtml(windowData.file);
    }
}
const notHtmlEntryPoints = entryPoints.filter(value => {
    return !value.entryFile.endsWith(".html");
})

const results = await build({
    define: {"DEBUG": DEBUG? "true" : "false"},
    entryPoints: entryPoints.map(e => e.entryFile),
    outdir: OUTDIR,
    minify: MINIFY,
    entryNames: "[ext]/[name]",
    bundle: true,
    mainFields: ["svelte", "browser", "module", "main"],
    metafile: true,
    assetNames: '[name]', //https://www.npmjs.com/package/@esbuilder/html TODO check if this comes right
    plugins: [
        fromHtmlPlugin({
            entryNames: "js/[name]"  //TODO check if this does what I want
        }),
        sveltePlugin({
            preprocess: sveltePreprocess()
        }),
        exportHtmlPlugin({
            files:notHtmlEntryPoints.map((value):HtmlFileConfiguration => {
                return {
                    entryPoints: [value.entryFile],
                    title: manifest.meta.name + ":" + value.windowName,
                    define: {"DEBUG": DEBUG? "true" : "false"},
                    scriptLoading: "defer",
                    filename: "..\\" + value.windowName, //TODO check if this works
                    htmlTemplate: `
                        <!DOCTYPE html>
                        <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                            </head>
                            <body>
                                <div id="app"></div>
                            </body>
                        </html>
                    `
                }
            })
        })
    ]
})
if (results.errors.length > 0) {
    results.errors.forEach((v, i) => {
        console.log("error " + i + " from " + v.pluginName)
        console.log(v.text)
    })
}

else{
//it's better to do this after because we don't want to export and zip multiple times in the loops
    toJson(manifest, OUTDIR + "manifest.json")
    pack(OUTDIR, PACKDIR.concat(manifest.meta.name, "-", manifest.meta.version, ".opk")) //TODO get error
//TODO check if the public has to be transfered too
}
