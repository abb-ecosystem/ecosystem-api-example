'use strict';

var API = API || {};
if (typeof API.constructedFile === 'undefined') {
  (function (f) {
    // VERSION INFO
    f.ECOSYSTEM_FILESYSTEM_LIB_VERSION = '0.1';

    function parseJSON(json) {
      try {
        return JSON.parse(json);
      } catch (error) {
        return undefined;
      }
    }

    /**
     * Extension of RWS not yet available at the omnicore.f SDK
     */
    f.FILESYSTEM = new (function () {
      const fixPath = function (path) {
        return `${path.replace(/^HOME/, '$HOME').replace(/\:$/, '')}/`;
      };

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
