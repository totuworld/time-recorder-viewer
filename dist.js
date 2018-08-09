const shelljs =  require("shelljs");
const fs = require("fs");
const luxon = require("luxon");

// AWS에서 충돌이 나지 않도록 Version label을 하나 올려준다.
const packageLib = JSON.parse(fs.readFileSync("./package.json").toString());
const postFix = `${luxon.DateTime.local().toFormat("yyyyLLddHHmm")}-${packageLib.version}`;

shelljs.exec("npm shrinkwrap --production");
shelljs.rm("-rf", "./dist");
shelljs.mkdir("-p", "./dist");
shelljs.cp("./package.json", "./dist/package.json");
shelljs.mv("./npm-shrinkwrap.json", "./dist/npm-shrinkwrap.json");
shelljs.cp("-R", "./build/", "./dist/build");
shelljs.cp("-R", "./.ebextensions/", "./dist/.ebextensions");
shelljs.cp('./.npmrc', './dist/.npmrc');
shelljs.cp('./Dockerfile', './dist/Dockerfile');
shelljs.cd("./dist");
shelljs.exec(`zip -r tr-${postFix}.zip .`);
shelljs.exec("ls -al *.zip");
