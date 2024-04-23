import path from "path";
import fs from "fs";
import {urlGetArgs} from "./js-util.js";
import {getNpmPackageFiles} from "./npm-util.js";
import {TarWriter} from "@gera2ld/tarjs";
//import {Blob} from "buffer";

export default class NpmPackageServer {
	constructor(options={}) {
		this.path=options.path;
		this.packageDirs=[];
	}

	addPackageDir(packageDir) {
		let pkgJsonPath=path.join(packageDir,"package.json");
		let pkg=JSON.parse(fs.readFileSync(pkgJsonPath,"utf8"));

		console.log("Adding "+pkg.name+" => "+packageDir);

		this.packageDirs[pkg.name]=packageDir;
	}

	handleRequest=async (request)=>{
		let argv=urlGetArgs(request.url);
        if (this.path) {
            if (argv[0]!=this.path)
                return;

            argv.shift();
        }

		if (argv.length!=1)
			return; // new Response("Not Found",{status: 404});

		let parts=argv[0].split(".");
		if (parts.length!=2 || parts[1]!="tgz")
			return; // new Response("Not Found",{status: 404});

		let packageName=parts[0];
		if (!this.packageDirs[packageName])
			return; // new Response("Not Found",{status: 404});

		let packageDir=this.packageDirs[packageName];
		let files=await getNpmPackageFiles(packageDir);
		let tarWiter=new TarWriter();

		for (let fn of files) {
			let buffer=fs.readFileSync(path.join(packageDir,fn));
			let blob=new Blob([buffer]);
			tarWiter.addFile(path.join("package",fn),blob);
		}

		let tarBlob=await tarWiter.write();
		let stream=tarBlob.stream().pipeThrough(new CompressionStream("gzip"));

		return new Response(stream,{
			headers: {
				"content-type": "application/gzip"
			}
		});
	}
}