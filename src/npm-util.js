import recursiveReaddir from "recursive-readdir";
import path from "path";
import fs from "fs";

export async function getNpmPackageFiles(packageDir) {
	let npmIgnore=[
		".git",".npmignore",".gitignore",
		"node_modules",
		"package-lock.json","yarn.lock"
	];

	let dotNpmIgnorePath=path.join(packageDir,".npmignore");
	if (fs.existsSync(dotNpmIgnorePath))
		npmIgnore=[
			...npmIgnore,
			...fs.readFileSync(dotNpmIgnorePath,"utf8").split("\n")
		];

	let files=await recursiveReaddir(packageDir,npmIgnore);
	files=files.map(f=>path.relative(packageDir,f));

	//console.log(files);
	return files;
}