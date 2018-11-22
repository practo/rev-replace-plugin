var fs = require('fs');
var path = require('path');

var prettyjson = require('prettyjson');

var Table = require('cli-table2');
var chalk = require('chalk');

var debug = require('debug')('plugin/rev-replace');

var RevReplacePlugin = function (options) {
  this.options = {};
  this.options.manifest = options.manifest;
  this.options.output = options.output;
  this.options.revision_scripts = options.revision_scripts;
};

RevReplacePlugin.prototype.apply = function (compiler) {
  var options = this.options;

  compiler.plugin('done', function (stats) {
    var targetFiles = [];
    var assetsToReplace = {};
    var currentFile;
    var public_path;
    var manifest = fs.readFileSync(options.manifest).toString();
    var rev_scripts = false || options.revision_scripts;

    manifest = JSON.parse(manifest);
    public_path = manifest.publicPath;

    for(asset in manifest.assets) {
      if(asset.search(/css|json/i) > -1) {
        targetFiles.push(manifest.assets[asset]);
      }

      if(rev_scripts && asset.search(/js/i) > -1) {
        targetFiles.push(manifest.assets[asset]);
      }

      if(asset.search(/\.(jpe?g|png|gif|svg|woff2?|ico|ttf|eot|json)$/i) > -1)
        assetsToReplace[asset] = manifest.assets[asset];
    }

    debug('\nFiles to revision:\n'+prettyjson.render(targetFiles));
    debug('\nAssets to revision with:\n'+prettyjson.render(assetsToReplace));

    function replaceAssets(fileName, assetsToReplace) {
      var assetKeys = Object.keys(assetsToReplace).sort(
        function(a, b) {
          return b.length - a.length;
        });

      var i, currentAsset;

      var table = new Table({
        chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
        , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
        , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
        , 'right': '' , 'right-mid': '' , 'middle': ' ' },
        style: { 'padding-left': 0, 'padding-right': 0 }
      });

      table.push([chalk.green('Asset'), '   ', chalk.green('Revisioned asset')])

      currentFile = fs.readFileSync(path.join(options.output, fileName)).toString();
      for(i in assetKeys) {
        currentAsset = assetKeys[i];
        var currentAssetMatches = currentFile.match(new RegExp(currentAsset,'g')) || [];
        var currentAssetReplaceMatches = currentFile.match(new RegExp(public_path + assetsToReplace[currentAsset], 'g')) || [];
        if(currentAssetMatches.length > 0 && currentAssetMatches.length !== currentAssetReplaceMatches.length) {
          table.push([currentAsset, ' => ', public_path + assetsToReplace[currentAsset]]);
          currentFile = currentFile.replace(new RegExp(currentAsset, 'g'), public_path + assetsToReplace[currentAsset]);
        }
      }
      fs.writeFileSync(path.join(options.output, fileName), currentFile, {
        encoding: 'utf8',
        flag: 'w+'
      });

      console.log('\nRevisioning - ' + fileName + '\n\n' +table.toString() + '\n');
    }

    for(i in targetFiles) {
      replaceAssets(targetFiles[i], assetsToReplace);
    }

    return;
  });
};

module.exports = RevReplacePlugin;
