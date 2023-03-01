'use strict';

// @ts-ignore
var API = API || {};
if (typeof API.constructedFile === 'undefined') {
  (function (f) {
    f.FILESYSTEM = new (function () {
      const fixPath = function (path) {
        return `${path.replace(/^HOME/, '$HOME').replace(/\:$/, '')}/`;
      };

      /**
       * Get the content of a file a a string
       * @alias getDirectoryContents
       * @memberof API.FILESYSTEM
       * @param  {string} path Path to the file, including file name
       */
      this.getDirectoryContents = async function (path = '$HOME') {
        try {
          var directory = await RWS.FileSystem.getDirectory(path);
          var contents = await directory.getContents();

          let names = { directories: [], files: [] };
          for (let item of contents.directories) {
            names.directories.push(item.name);
          }

          for (let item of contents.files) {
            names.files.push(item.name);
          }
          return names;
        } catch (e) {
          return API.rejectWithStatus(`Failed to get content of ${path} directory`, e);
        }
      };

      /**
       * Get the content of a file a a string
       * @alias getFileContents
       * @memberof API.FILESYSTEM
       * @param  {string} path Path to the file, including file name
       * @param  {string} file Name of the file
       */
      this.getFileContents = async function (path, file) {
        console.log(path);
        let location = `${path.replace(/\:$/, '').replace(/^HOME/, '$HOME')}/${file}`;
        console.log(location);

        try {
          let f = await RWS.FileSystem.getFile(location);
          return await f.getContents();
        } catch (e) {
          return API.rejectWithStatus(`Failed to get content of ${location}.`);
        }
      };
    })();

    f.constructedFile = true;
  })(API);
}
