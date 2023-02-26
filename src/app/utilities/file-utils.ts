import { BlobFileInfo } from '../shared/models/blob/blob-file-info.model';
export class FileUtil {
  public setBlobFileInfoProperties(
    fileInfo: BlobFileInfo  ) {
    if (!fileInfo) {
      return;
    }
    fileInfo?.setFile(fileInfo?.getFile());


    fileInfo.setFile(fileInfo.getFile());
    fileInfo.setPLUploadId(fileInfo.getPLUploadId());
    fileInfo.setMaxBlockSize(1024 * 1024);
    fileInfo.setNumOfBlocks();
    fileInfo.setUploadedBytes(0);
    fileInfo.setPLUploadContainerId(fileInfo.getPLUploadContainerId());
    fileInfo.setFileName(fileInfo.getFile().name);
    fileInfo.setSize(fileInfo.getFile().size);
  }

  public setBlobFilesArray(files:any): BlobFileInfo[] {
    const blobFilesArray = new Array<BlobFileInfo>();
    for (let idx: number = 0; idx < files.length; idx++) {
      const blobFile: BlobFileInfo = new BlobFileInfo();
      blobFile.setFile(files[idx].getNative());
      this.setBlobFileType(files[idx], blobFile);
      blobFilesArray.push(blobFile);
    }
    return blobFilesArray;
  }

  private setBlobFileType(file: any, blobFile: BlobFileInfo) {
    if (file.type.includes('video')) {
      blobFile.fileType = 'video';
    } else if (file.type.includes('image')) {
      blobFile.fileType = 'image';
    } else if (file.type.includes('pdf')) {
      blobFile.fileType = 'pdf';
    }
  }

  public downloadFile(url: string, accessToken: string): void {
    var form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('action', url);
    form.setAttribute('target', '_blank');
    var input = document.createElement('input');
    input.setAttribute('id', '_t');
    input.setAttribute('name', '_t');
    form.appendChild(input);
    document.body.appendChild(form);
    (document.getElementById('_t') as HTMLInputElement).value = accessToken;
    form.submit();
    form.remove();
  }

  public bytesToSize(bytes: number, decimals: number = 2): string {
    if (bytes === 0 || bytes === 1) return bytes + ' Byte';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  public setEncryptedFileName(fileToUpload: BlobFileInfo) {
    var encryptedFileName: string = '';
    try {
      encryptedFileName = btoa(fileToUpload.getFile().name);
    } catch (exp) {
      try {
        encryptedFileName = btoa(
          encodeURIComponent(fileToUpload.getFile().name)
        );
      } catch (exp) {
        encryptedFileName = fileToUpload.getFile().name.replace(/\W/g, '');
        encryptedFileName = btoa(encryptedFileName);
      }
    }
    return encryptedFileName;
  }


  public getExtension(name: string): string {
    var idx: number = name.lastIndexOf('.');
    if (idx != -1) return name.substring(name.lastIndexOf('.'), name.length);
    else return '';
  }
  //#endregion
}
