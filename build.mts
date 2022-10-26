import {build} from "esbuild";
import sveltePlugin from "esbuild-svelte"
import sveltePreprocess from "svelte-preprocess";
import * as fs from "fs";
import {manifest} from "./Manifest.mjs";
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
        let indexFile = "temp/" + windowData.file + ".ts"
        await replaceToFile("index.svelte.ts", indexFile, subs)
        entryPoints.push({windowName: windowName, entryFile: indexFile}) //TODO check if this is right
        windowData.file = fileToHtml(windowData.file);
    }else if (windowData.file.endsWith(".html")){
        entryPoints.push({windowName: windowName, entryFile: ENTRY + windowData.file});
    }else{
        entryPoints.push({windowName: windowName, entryFile: ENTRY + windowData.file});
        windowData.file = fileToHtml(windowData.file);
    }
}

const results = await build({
    define: {"DEBUG": DEBUG? "true" : "false"},
    entryPoints: entryPoints.map(e => e.entryFile),
    outdir: OUTDIR,
    minify: MINIFY,
    entryNames: "[ext]/[name]",
    bundle: true,
    mainFields: ["svelte", "browser", "module", "main"],
    metafile: DEBUG,
    assetNames: '[name]', //https://www.npmjs.com/package/@esbuilder/html TODO check if this comes right
    plugins: [
        fromHtmlPlugin({
            entryNames: "js/[name]"  //TODO check if this does what I want
        }),
        sveltePlugin({
            preprocess: sveltePreprocess()
        }),
    ]
})

if (results.errors.length > 0) {
    results.errors.forEach((v, i) => {
        console.log("error " + i + " from " + v.pluginName)
        console.log(v.text)
    })
} else{
    for (const [path, outputInfo] of Object.entries(results.metafile.outputs)) {
        if (outputInfo.entryPoint && !outputInfo.entryPoint.endsWith(".html")) {
            // create html and insert js into it
            const htmlToInsert = `
                        <!DOCTYPE html>
                        <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <script src="${path.replace(OUTDIR, '')}"></script>
                            </head>
                            <body>
                                <div id="app"></div>
                            </body>
                        </html>
                    `.replace(/\s+/g, ' ').trim()
            //create file and insert into OUTDIR
            const htmlFile = fileToHtml(outputInfo.entryPoint.split("/").pop())
            fs.writeFileSync(OUTDIR + htmlFile, htmlToInsert, {flag: "w"})
        }
    }
    toJson(manifest, OUTDIR + "manifest.json")
    pack(OUTDIR, PACKDIR.concat(manifest.meta.name, "-", manifest.meta.version, ".opk")) //TODO get error
//TODO check if the public has to be transfered too
}

if (DEBUG) {
    toJson(results.metafile, "meta.json")
}
