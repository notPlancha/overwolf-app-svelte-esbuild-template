import {build} from "esbuild";
import sveltePlugin from "esbuild-svelte"
import sveltePreprocess from "svelte-preprocess";
import fs from "fs";
import {manifest} from "./Manifest";
import {htmlPlugin as exportHtmlPlugin} from "@craftamap/esbuild-plugin-html";
import { html as fromHtmlPlugin }  from '@esbuilder/html'
import {zip} from "zip-a-folder";
//TODO build the sveltes

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
const pages: overwolf.Dictionary<overwolf.extensions.ExtensionWindowData> = manifest.data.windows

for (const [windowName, windowData] of Object.entries(pages)) {
    if (windowData.file.endsWith(".html")){
        const results = await build({
            define: {"DEBUG": DEBUG? "true" : "false"},
            entryPoints: [ENTRY.concat(windowName, windowData.file)],
            outdir: OUTDIR,
            minify: MINIFY,
            assetNames: '[name]', //https://www.npmjs.com/package/@esbuilder/html TODO check if this comes right
            plugins:[fromHtmlPlugin({
                entryNames: "js/[name]" //TODO check if this does what I want
            })]
        })
    }
    else if (windowData.file.endsWith(".svelte")){
        const toHtml = windowData.file.substring(0, windowData.file.length - 7) + ".html"
        const results = await build({
            define: { "DEBUG": DEBUG? "true" : "false", "APP":windowName, "APPNAME":windowData.file },
            entryPoints: ["index.svelte.ts"],
            bundle: true,
            outdir: OUTDIR + "js",
            minify: MINIFY,
            mainFields: ["svelte", "browser", "module", "main"],
            metafile: true,
            plugins: [
                sveltePlugin({
                    preprocess: sveltePreprocess()
                }),
                exportHtmlPlugin({
                    files:[
                        {
                            title: manifest.meta.name + ":" + windowName,
                            scriptLoading: "defer",
                            filename: "..\\" + toHtml, //TODO check if this works
                            entryPoints: ["index.svelte.ts"] //TODO check if this outputs as ts
                        }
                    ]
                }),
            ]
        })
        windowData.file =toHtml //TODO check if properly changes
    }
    else{
        //treate it as a script, which will need a template html
        //So basically the svelte one without the svelte plugins and with this as an entry point
        //TODO
        const fileName = windowData.file.split(".")
        fileName.pop()
        const toHtml = fileName.join(".") + ".html"
        const results = await build({
            define: {"DEBUG": DEBUG? "true" : "false"},
            entryPoints: [ENTRY+windowData.file],
            bundle: true,
            outdir: OUTDIR + "js",
            minify: MINIFY,
            plugins: [
                exportHtmlPlugin({
                    files: [
                        {
                            title: manifest.meta.name + ":" + windowName,
                            scriptLoading: "defer",
                            filename: "../" + toHtml, //TODO check if this works
                            entryPoints: [ENTRY+ windowData.file],
                            //TODO check if the default template is enough for overwolf
                        }
                    ]
                })
            ]
        })
    }
}
//it's better to do this after because we don't want to export and zip multiple times in the loops
toJson(manifest, OUTDIR + "manifest.json")
pack(OUTDIR, PACKDIR.concat(manifest.meta.name, "-", manifest.meta.version, ".opk"))
