// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
process.env.ASSET_PATH = '/';

const { exec } = require("child_process");
const { exit } = require("process");
if(process.argv[2]){
  const arg2 = process.argv[2].split('=');
  if(arg2[0] === 'release'){
    exec(`npm version ${arg2[1]}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            exit();
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            exit();
        }
        console.log(`stdout: ${stdout}`);
    });
  }
}

var webpack = require('webpack'),
  config = require('../webpack.config');

delete config.chromeExtensionBoilerplate;

config.mode = 'production';

webpack(config, function (err) {
  if (err) throw err;
});
