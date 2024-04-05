#!/usr/bin/env node

import http from "http";
import {createNodeRequestListener} from "serve-fetch";
import NpmPackageServer from "./NpmPackageServer.js";

let npmPackageServer=new NpmPackageServer({path: "npm"});
npmPackageServer.addPackageDir("/home/micke/Repo/isoq");

let server=http.createServer(createNodeRequestListener(npmPackageServer.handleRequest));
let port=3001;

server.listen(port,(e)=>{
	if (e) {
		console.log(e)
		process.exit();
	}

	console.log(`Listening to port ${port}...`);
});
