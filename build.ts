import {build} from "esbuild";
import sveltePlugin from "esbuild-svelte"
import sveltePreprocess from "svelte-preprocess";
import fs from "fs";
import {manifest} from "./Manifest";
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


const pages: overwolf.Dictionary<overwolf.extensions.ExtensionWindowData> = manifest.data.windows
let entryPoints = new Array<{ windowName: string, entryFile: string }>(0);
for (const [windowName, windowData] of Object.entries(pages)) {
    if (windowData.file.endsWith(".svelte")){
        await build({
            define: { "DEBUG": DEBUG? "true" : "false", "APP":windowName, "APPNAME":ENTRY + windowData.file },
            entryPoints: ["index.svelte.ts"],
            bundle: false,
            outdir: "temp/",
            entryNames: windowName,
        })
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
if (results.errors) {
    console.log("Maybe some errors?")//TODO change later
    results.errors.forEach((v, i) => {
        console.log("error " + i + " from " + v.pluginName)
        console.log(v.text)
    })
}

//else{ TODO have the errors only if its error but I don't know if the if is right or not
//it's better to do this after because we don't want to export and zip multiple times in the loops
    toJson(manifest, OUTDIR + "manifest.json")
    pack(OUTDIR, PACKDIR.concat(manifest.meta.name, "-", manifest.meta.version, ".opk"))
//TODO check if the public has to be transfered too
//}
