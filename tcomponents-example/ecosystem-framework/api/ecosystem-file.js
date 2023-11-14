import API from './ecosystem-base.js';

export const factoryApiFile = function (f) {
  /**
   * @alias API.FILESYSTEM
   * @namespace
   */
  f.FILESYSTEM = new (function () {
    const fixPath = function (path) {
      return `${path.replace(/^HOME/, '$HOME').replace(/\:$/, '')}/`;
    };

    const _getFile = async function (path) {
      return await RWS.FileSystem.getFile(path);
    };

    const _getDirectory = async function (path) {
      return await RWS.FileSystem.getDirectory(path);
    };

    /**
     * Get the content of a file a a string
     * @alias getDirectoryContents
     * @memberof API.FILESYSTEM
     * @param  {string} path Path to the file, including file name
     */
    this.getDirectoryContents = async function (path = '$HOME') {
      try {
        var directory = await _getDirectory(path);
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
     * Get the content of a file as a string
     * @alias getFile
     * @memberof API.FILESYSTEM
     * @param  {string} path Path to the file, including file name
     * @param  {string} file Name of the file
     */
    this.getFile = async function (path, file) {
      let url = `${path.replace(/\:$/, '').replace(/^HOME/, '$HOME')}/${file}`;
      try {
        let f = await RWS.FileSystem.getFile(url);
        return await f.getContents();
      } catch (e) {
        return API.rejectWithStatus(`Failed to get content of ${url}.`);
      }
    };

    /**
     * Get a list of files objects including name and content
     * @alias getFiles
     * @memberof API.FILESYSTEM
     * @param  {string} path Path to the file, including file name
     * @param  {string} file Name of the file
     * @returns {Promise<object[]>} - Array of file objects [ {name, content}]
     */
    this.getFiles = async function (path) {
      const directory = await _getDirectory(path);
      const directoryContent = await directory.getContents();

      const data = [];
      for (let i = 0; i < directoryContent.files.length; i++) {
        const name = directoryContent.files[i].name;
        const file = await _get(`${path}/${name}`);
        const fileContent = await file.getContents();
        data.push({ name, content: JSON.parse(fileContent) });
      }
      return data;
    };

    this.updateFile = async function (directoryPath, fileName, data) {
      const file = await _getFile(`${directoryPath}/${fileName}`);
      const setContentStatus = await file.setContents(data);
      if (setContentStatus) {
        return await file.save(true);
      }
      return API.rejectWithStatus('Error while updating file content');
    };

    this.createDirectory = async function (directoryPath) {
      let dir = directoryPath.replace(/\:$/, '').replace(/^HOME/, '$HOME');
      try {
        return await RWS.FileSystem.createDirectory(dir);
      } catch (e) {
        if (e && e.httpStatus && e.httpStatus.code == 409) {
          // the directory is already created
        } else {
          console.error(e);
          return API.rejectWithStatus(`Creating ${directoryPath} directory failed`, e);
        }
      }
    };

    this.createNewFile = async function (directoryPath, fileName, data, overwrite = false) {
      try {
        const directory = await _getDirectory(directoryPath);
        const newFile = await directory.createFileObject(fileName);
        const fileExists = await newFile.fileExists();

        if (fileExists) {
          if (overwrite) await this.updateFile(directoryPath, fileName, data);
          else throw new Error(`Create new file failed since file already exists and overwrite equals false.`);
        } else {
          const setContentStatus = await newFile.setContents(data);
          if (setContentStatus) {
            return await newFile.save(false);
          }
        }
      } catch (e) {
        return API.rejectWithStatus(`Creating ${directoryPath}/${fileName} file failed`, e);
      }
    };

    this.fileExists = async function (directoryPath, fileName) {
      try {
        const directory = await _getDirectory(directoryPath);
        const newFile = await directory.createFileObject(fileName);
        return await newFile.fileExists();
      } catch (e) {
        return false;
      }
    };

    this.deleteFile = async function (directoryPath, fileName) {
      const file = await _getFile(`${directoryPath}/${fileName}`);
      return await file.delete();
    };

    this.copy = async function (source, destination, overwrite = false) {
      const srcFile = RWS.FileSystem.createFileObject(source);
      const destFile = RWS.FileSystem.createFileObject(destination);
      if ((await destFile.fileExists()) && !overwrite) {
        return API.rejectWithStatus(`Copy file failed since destination file already exists and overwrite equals false.`);
      }
      return await srcFile.copy(destination, overwrite, false);
    };
  })();

  f.constructedFile = true;
};

if (typeof API.constructedFile === 'undefined') {
  factoryApiFile(API);
}

export default API;
