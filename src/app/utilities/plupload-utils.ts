
import { BlobFileInfo } from '../shared/models/blob/blob-file-info.model';

export class PluploadUtil {
  addFilesButton!: HTMLLIElement;
  videosTag: Array<HTMLVideoElement>;
  onFileAddedCallBack: Function;
  imagesTag: Array<HTMLImageElement>;
  pdfCustomTag: Array<HTMLEmbedElement>;
  imageFilesCount: number = 0;
  videoFilesCount: number = 0;
  pdfFilesCount: number = 0;
  existingFiles?: BlobFileInfo[] = [];
  onFilesRemovedCallBack: Function;
  onQueueChangedCallBack: Function;
  parentDiv: string;
  btnThumbnailLayout: boolean = true;
  uploadType!: string;
  uploader: any;
  constructor(
    onFileAddedCallBack?: Function,
    onFilesRemovedCallBack?: Function,
    onQueueChangedCallBack?: Function,
    files?: BlobFileInfo[],
    divName?: string,
    btnThumbnailLayout: boolean = true
  ) {
    this.videosTag = [];
    this.imagesTag = [];
    this.pdfCustomTag = [];
    this.existingFiles = files;
    this.onFileAddedCallBack = onFileAddedCallBack as Function;
    this.onFilesRemovedCallBack = onFilesRemovedCallBack as Function;
    this.onQueueChangedCallBack = onQueueChangedCallBack as Function;
    this.parentDiv = divName as string;
    this.btnThumbnailLayout = btnThumbnailLayout;
  }
  public initializePLUpload(
    parentDiv: any,
    mimeTypes: Array<any>,
    fileCount: number,
    uploadType: string
  ) {
    parentDiv.pluploadQueue({
      runtimes: 'html5,flash,silverlight,html4',
      url: '',
      chunk_size: '2mb',
      rename: true,
      dragdrop: true,
      // to stop loading until DOM is ready.
      container: parentDiv.attr('id'),
      filters: {
        max_file_size: '1024mb',
        prevent_duplicates: true,
        mime_types: mimeTypes,
        max_file_count: fileCount,
      },
      // events
      init: {
        PostInit: (uploader: any): void => {
          this.uploader = uploader;
          this.uploadType = uploadType;
          this.createAddFileLiElement_(uploader, this.existingFiles);
          //hiding the existing structure
          var inputTag = <HTMLDivElement>(
            document.getElementsByClassName('moxie-shim')[0]
          );
          if (inputTag) {
            inputTag.style.display = 'none';
            inputTag.style.zIndex = '-99999999';
          }
        },
        QueueChanged: this.onQueueChanged,
        FilesRemoved: this.onFilesRemoved,
        FilesAdded: this.onFilesAdded,
      },
    });
  }

  public resetPlUploadDivContainer() {
    let fileCount = this.uploader?.files?.length + this.existingFiles?.length;
    if (fileCount > 0) {
      let i = 0;
      while (i < fileCount && this.uploader.files[0]) {
        this.uploader.removeFile(this.uploader.files[0]);
        i++;
      }
    }
    // var node = this.uploader.settings.drop_element[0];
    // var lastNode = node?.lastChild;
    // if (node && node.childElementCount > 1) {
    //   for (let i = node.childNodes.length - 1; i >= 0; i--) {
    //     if (lastNode != node.childNodes[i]) {
    //       node.removeChild(node.childNodes[i]);
    //     }
    //   }

    //   lastNode.classList.add("mybtn");
    //   lastNode.classList.remove("upload-files");
    // }
  }
  private onFilesAdded = (uploader: any): void => {
    this.videosTag = [];
    this.imagesTag = [];
    this.pdfCustomTag = [];
    this.imageFilesCount = 0;
    this.videoFilesCount = 0;
    this.pdfFilesCount = 0;
    if (this.btnThumbnailLayout) {
      this.showThumbnailLayout(uploader);
    } else {
      uploader.settings.drop_element[0].classList.add('justify-start');
      this.addFilesButton.classList.remove('mybtn');
      this.addFilesButton.classList.add('upload-files');
      uploader.settings.drop_element[0].appendChild(this.addFilesButton);
    }
    // this.hideThumnailLayout(uploader);
    if (this.existingFiles) {
      this.existingFiles.forEach((element) => {
        this.addExistingMediaTag(element);
        this.appendCustomFileThumbnails(uploader, element.fileName);
      });
    }
    this.removeExtraFiles(uploader);

    for (var idx = 0; idx < uploader.files.length; idx++) {
      if (
        uploader.files[idx].type.includes('video') ||
        uploader.files[idx].type.includes('audio') ||
        (uploader.files[idx].type === '' &&
          this.checkFormat(uploader.files[idx].name)) // masking the hevc,mp3,f4v,ogg & mjpeg files to type video
      ) {
        uploader.files[idx].type = 'video';
        this.videoFilesCount++;
        this.addVideoTag(
          uploader,
          uploader.files[idx].name,
          uploader.files[idx].getNative()
        );
      }
      if (uploader.files[idx].type.includes('image')) {
        this.imageFilesCount++;
        this.addImgTag(
          uploader,
          uploader.files[idx].name,
          uploader.files[idx].getNative()
        );
      }
      if (uploader.files[idx].type.includes('pdf')) {
        this.pdfFilesCount++;
        this.addpdfCustomTag(
          uploader,
          uploader.files[idx].name,
          uploader.files[idx].getNative()
        );
      }
    }
  };

  public filesAddedCallback = (uploader:any): void => {
    if (
      this.videosTag.length +
        this.imagesTag.length +
        this.pdfCustomTag.length ==
      this.imageFilesCount + this.videoFilesCount + this.pdfFilesCount
    ) {
      this.appendThumbnails(uploader);
      this.onFileAddedCallBack(uploader.files, this.existingFiles);
    }
  };
  private onQueueChanged = (uploader:any): void => {
    this.getExisitngFiles();
    if (uploader.files.length == 0) {
      if (this.existingFiles && this.existingFiles.length == 0) {
        this.hideThumnailLayout(uploader);
      }
    }
    this.onMaxFilesAdditionHideButton(uploader);
  };

  getExisitngFiles(isRefreshList: boolean = true) {
    let fileList: HTMLElement = document.getElementById(
      this.parentDiv + '_filelist'
    ) as HTMLElement;
    if (fileList) {
      var elements = fileList.getElementsByClassName('plupload_delete');
      let tempFiles: BlobFileInfo[] = [];
      if (elements && elements.length > 0) {
        for (let index = 0; index < elements.length; index++) {
          const element = elements[index];
          let imageTag = element.getElementsByTagName('img');
          if (imageTag && imageTag.length > 0) {
            let fileExist = this.existingFiles?.filter(
              (w) => w.blobId == imageTag[0].src
            );
            if (fileExist && fileExist.length > 0) {
              let file = new BlobFileInfo();
              file.blobId = imageTag[0].src;
              file.fileName = imageTag[0].title;
              file.fileType = 'image';
              tempFiles.push(file);
            }
          }
          let videoTag = element.getElementsByTagName('video');
          if (videoTag && videoTag.length > 0) {
            let fileExist = this.existingFiles?.filter(
              (w) => w.blobId == videoTag[0].src
            );
            if (fileExist && fileExist.length > 0) {
              let file = new BlobFileInfo();
              file.blobId = videoTag[0].src;
              file.fileName = videoTag[0].title;
              file.fileType = 'video';
              tempFiles.push(file);
            }
          }
          let embedTag = element.getElementsByTagName('embed');
          if (embedTag && embedTag.length > 0) {
            let fileExist = this.existingFiles?.filter(
              (w) => w.blobId == embedTag[0].id
            );
            if (fileExist && fileExist.length > 0) {
              let file = new BlobFileInfo();
              file.blobId = embedTag[0].id;
              file.fileName = embedTag[0].title;
              file.fileType = 'pdf';
              tempFiles.push(file);
            }
          }
        }
        this.existingFiles = tempFiles;
      } else {
        if (isRefreshList) {
          this.existingFiles = tempFiles;
        }
      }
    }
    return this.existingFiles;
  }

  getCustomAddedFiles() {
    let tempFiles: BlobFileInfo[] = [];
    let fileList: HTMLElement = document.getElementById(
      this.parentDiv + '_filelist'
    ) as HTMLElement;
    if (fileList) {
      var elements = fileList.getElementsByClassName('plupload_delete');
      if (elements && elements.length > 0) {
        for (let index = 0; index < elements.length; index++) {
          const element = elements[index];
          let imageTag = element.getElementsByTagName('img');
          if (imageTag && imageTag.length > 0) {
            let fileExist = this.existingFiles?.filter(
              (w) => w.blobId == imageTag[0].src
            );
            if (fileExist && fileExist.length > 0) {
              let file = new BlobFileInfo();
              file.blobId = imageTag[0].src;
              file.fileName = imageTag[0].title;
              file.fileType = 'image';
              tempFiles.push(file);
            }
          }
          let videoTag = element.getElementsByTagName('video');
          if (videoTag && videoTag.length > 0) {
            let fileExist = this.existingFiles?.filter(
              (w) => w.blobId == videoTag[0].src
            );
            if (fileExist && fileExist.length > 0) {
              let file = new BlobFileInfo();
              file.blobId = videoTag[0].src;
              file.fileName = videoTag[0].title;
              file.fileType = 'video';
              tempFiles.push(file);
            }
          }
          let embedTag = element.getElementsByTagName('embed');
          if (embedTag && embedTag.length > 0) {
            let fileExist = this.existingFiles?.filter(
              (w) => w.blobId == embedTag[0].id
            );
            if (fileExist && fileExist.length > 0) {
              let file = new BlobFileInfo();
              file.blobId = embedTag[0].id;
              file.fileName = embedTag[0].title;
              file.fileType = 'pdf';
              tempFiles.push(file);
            }
          }
        }
      }
    }
    return tempFiles;
  }

  private onFilesRemoved = (uploader: any, deletedFiles: any): void => {
    this.onFilesRemovedCallBack(deletedFiles, this.existingFiles);
    uploader.settings.drop_element[0].appendChild(this.addFilesButton);
    this.deleteTags(deletedFiles);
    if (this.existingFiles) {
      this.existingFiles.forEach((element) => {
        this.appendThumbnails(uploader, element.fileName);
      });
    }
    this.appendThumbnails(uploader);
  };

  private onMaxFilesAdditionHideButton(uploader: any) {
    this.addFilesButton.style.display = 'inline-flex';
    if (
      uploader.files.length + this.existingFiles?.length >=
      uploader.settings.filters.max_file_count
    ) {
      this.addFilesButton.style.display = 'none';
    }
  }

  private appendThumbnails(uploader: any, fileName?: string) {
    if (fileName) {
      this.appendCustomFileThumbnails(uploader, fileName);
    } else {
      var lItems = uploader.settings.drop_element[0].getElementsByTagName('li');
      for (var idx = 0; idx < lItems.length - 1; idx++) {
        var fileNameDiv =
          lItems[idx].getElementsByClassName('plupload_file_name')[0];
        if (fileNameDiv != undefined) {
          var fName = fileNameDiv.getElementsByTagName('span')[0].innerHTML;
          if (this.videosTag && this.videosTag.length > 0) {
            var videoTag = this.videosTag.find((x) => x.title == fName);
            if (videoTag != undefined) {
              lItems[idx].appendChild(videoTag);
            }
          }
          if (this.imagesTag && this.imagesTag.length > 0) {
            var imagetag = this.imagesTag.find((x) => x.title == fName);
            if (imagetag != undefined) {
              lItems[idx].appendChild(imagetag);
            }
          }
          if (this.pdfCustomTag && this.pdfCustomTag.length > 0) {
            var embedeTag = this.pdfCustomTag.find((x) => x.title == fName);
            if (embedeTag) {
              lItems[idx].appendChild(embedeTag);
            }
          }
        } else {
          if (!this.btnThumbnailLayout) {
            this.addFilesButton.classList.remove('upload-files');
            uploader.settings.drop_element[0].appendChild(this.addFilesButton);
          }
        }
      }
    }
  }

  private appendCustomFileThumbnails(uploader: any, fileName: string) {
    if (fileName) {
      if (this.videosTag && this.videosTag.length > 0) {
        var videoTag = this.videosTag.find((x) => x.title == fileName);
        if (videoTag != undefined) {
          this.addCustomThumbnail(uploader, fileName, videoTag);
        }
      }
      if (this.imagesTag && this.imagesTag.length > 0) {
        var imagetag = this.imagesTag.find((x) => x.title == fileName);
        if (imagetag != undefined) {
          this.addCustomThumbnail(uploader, fileName, imagetag);
        }
      }
      if (this.pdfCustomTag && this.pdfCustomTag.length > 0) {
        var embedeTag = this.pdfCustomTag.find((x) => x.title == fileName);
        if (embedeTag) {
          this.addCustomThumbnail(uploader, fileName, embedeTag);
        }
      }
    }
  }

  private addCustomThumbnail(uploader: any, fileName: string, mediaTag: any) {
    var liElement = document.createElement('li');
    liElement.id = fileName;
    liElement.classList.add('plupload_delete');
    var divFileAction = document.createElement('div');
    divFileAction.classList.add('plupload_file_action');
    var anchor = document.createElement('a');
    anchor.href = '#';
    var that = this;
    anchor.addEventListener(
      'click',
      function (event) {
        event.preventDefault();

        var liFile = document.getElementById(fileName);
        liFile?.remove();
        that.onFilesRemovedCallBack(fileName);
        return false;
      },
      false
    );
    anchor.setAttribute('style', 'display: block;');
    divFileAction.appendChild(anchor);
    liElement.appendChild(divFileAction);
    liElement.appendChild(mediaTag);
    uploader.settings.drop_element[0].insertBefore(
      liElement,
      uploader.settings.drop_element[0].firstChild
    );
  }
  private deleteTags(deletedFiles: any) {
    for (var idx = 0; idx < deletedFiles.length; idx++) {
      if (this.imagesTag != undefined) {
        this.imagesTag = this.imagesTag.filter(function (element) {
          return element.title !== deletedFiles[idx].name;
        });
      }
      if (this.videosTag != undefined) {
        this.videosTag = this.videosTag.filter(function (element) {
          return element.title !== deletedFiles[idx].name;
        });
      }
      if (this.pdfCustomTag && this.pdfCustomTag.length > 0) {
        this.pdfCustomTag = this.pdfCustomTag.filter(function (element) {
          return element.title !== deletedFiles[idx].name;
        });
      }
    }
  }

  private removeExtraFiles(uploader: any) {
    var maxFileCount = uploader.settings.filters.max_file_count;
    let existingFilesLength = 0;
    if (this.existingFiles) {
      existingFilesLength = this.existingFiles.length;
    }
    if (uploader.files.length + existingFilesLength > maxFileCount) {
      while (uploader.files[maxFileCount - existingFilesLength]) {
        uploader.removeFile(uploader.files[maxFileCount - existingFilesLength]);
      }
    }
  }
  //#region  Pl Upload container customisation
  private createAddFileLiElement(settings: any) {
    var liElement = document.createElement('li');
    liElement.id = settings.container.id + 'browse_button';
    liElement.classList.add('mybtn');
    settings.browse_button[0].classList.add('w-100');
    liElement.appendChild(settings.browse_button[0]);
    settings.drop_element[0].appendChild(liElement);
    this.addFilesButton = <HTMLLIElement>(
      document.getElementById(settings.container.id + 'browse_button')
    );
  }

  private createAddFileLiElement_(
    uploader: any,
    postFiles: BlobFileInfo[] = []
  ) {
    var liElement = document.createElement('li');
    liElement.id = uploader.settings.container.id + 'browse_button';
    liElement.classList.add('mybtn');
    uploader.settings.browse_button[0]?.classList.add('w-100');

    if (this.uploadType === 'comment') {
      liElement.classList.add('hidden'); // this will not effect other modules
      const uploadElement = document.getElementById(
        'upload_icon_' + uploader.settings.container.id
      );
      if (uploadElement) {
        uploadElement?.appendChild(uploader.settings.browse_button[0]);
      }
    } else {
      liElement.appendChild(uploader.settings.browse_button[0]);
    }
    uploader.settings.drop_element[0].appendChild(liElement);
    this.addFilesButton = <HTMLLIElement>(
      document.getElementById(uploader.settings.container.id + 'browse_button')
    );
    if (postFiles && postFiles.length > 0) {
      this.showThumbnailLayout(uploader);
      this.removeExtraFiles(uploader);
      for (let idx = 0; idx < postFiles.length; idx++) {
        const element = postFiles[idx];

        if (element.fileType && element.fileType.includes('video')) {
          this.videoFilesCount++;
          this.addExistingVideoTag(element.fileName, element.blobId);
        }
        if (element.fileType && element.fileType.includes('image')) {
          this.imageFilesCount++;
          this.addExistingImgTag(element.fileName, element.blobId);
        }
        if (element.fileType && element.fileType.includes('pdf')) {
          this.pdfFilesCount++;
          this.addExistingPdfCustomTag(element.fileName, element.blobId);
        }
        this.appendThumbnails(uploader, element.fileName);
      }
    }
  }
  private hideThumnailLayout(uploader: any) {
    uploader.settings.drop_element[0].classList.remove('justify-start');
    this.addFilesButton.classList.add('mybtn');
    // this.addFilesButton
    //   .getElementsByTagName("a")[0]
    //   .classList.remove("pl-list-thumb");
    uploader.settings.drop_element[0].appendChild(this.addFilesButton);
  }

  private showThumbnailLayout(uploader: any) {
    uploader.settings.drop_element[0].classList.add('justify-start');
    this.addFilesButton.classList.remove('mybtn');
    if (this.addFilesButton?.getElementsByTagName('a')?.length > 0) {
      this.addFilesButton
        ?.getElementsByTagName('a')[0]
        .classList.add('pl-list-thumb');
    }
    uploader.settings.drop_element[0].appendChild(this.addFilesButton);
  }

  //#endregion
  //#region  Video  Add Plupload
  public addVideoTag(uploader:any, fileName: string, fileContent?: any) {
    const reader = new FileReader();
    const video = this.createVideoTag(fileName);
    reader.onloadend = (e: any) => {
      video.setAttribute('src', (reader.result as ArrayBuffer).toString());
      video.setAttribute('poster', this.createPoster(video));
      this.videosTag.push(video);
      this.filesAddedCallback(uploader);
    };
    reader.readAsDataURL(fileContent);
  }
  /**
   *
   * @param $video will revisit soon :KD
   * @returns
   */
  private createPoster($video: any) {
    $video.currentTime = 5;
    var canvas = document.createElement('canvas');
    canvas.width = 350;
    canvas.height = 200;
    (canvas
      .getContext('2d') as CanvasRenderingContext2D )
      .drawImage($video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  }
  private createVideoTag(fileName: string) {
    const videoTag = document.createElement('video');
    videoTag.setAttribute('width', '90%');
    videoTag.title = fileName;
    return videoTag;
  }
  //#endregion
  //#region  Image Add Plupload
  addImgTag(uploader: any, fileName: string, fileContent?: any) {
    const reader = new FileReader();
    const imgTag = this.createImageTag(fileName);
    reader.onloadend = (e: any) => {
      imgTag.setAttribute('src', (reader.result as ArrayBuffer).toString());
      this.imagesTag.push(imgTag);
      this.filesAddedCallback(uploader);
    };
    reader.readAsDataURL(fileContent);
  }
  addExistingVideoTag(fileName: string, sourceUrl?: string) {
    const video = this.createVideoTag(fileName);
    video.setAttribute('src', sourceUrl as string);
    video.setAttribute('poster', this.createPoster(video));
    this.videosTag.push(video);
    this.videoFilesCount += 1;
  }
  addExistingImgTag(fileName: string, sourceUrl?: string) {
    const imgTag = this.createImageTag(fileName);
    imgTag.setAttribute('src', sourceUrl as string);
    this.imagesTag.push(imgTag);
    this.imageFilesCount += 1;
  }
  addExistingMediaTag(file: BlobFileInfo) {
    if (file.fileType == 'image') {
      this.addExistingImgTag(file.fileName, file.blobId);
    } else if (file.fileType == 'video') {
      this.addExistingVideoTag(file.fileName, file.blobId);
    } else if (file.fileType == 'pdf') {
      this.addExistingPdfCustomTag(file.fileName, file.blobId);
    }
  }

  private createImageTag(fileName: string) {
    const imgTag = document.createElement('img');
    imgTag.setAttribute('width', '95%');
    imgTag.setAttribute('height', '100%');
    imgTag.title = fileName;
    return imgTag;
  }
  //#endregion

  /**
   *
   * @param fileName
   * @returns
   */
  private createEmbedTag(fileName: string) {
    const embedTag = document.createElement('embed');
    embedTag.setAttribute('width', '95%');
    embedTag.setAttribute('height', '100%');
    embedTag.title = fileName;
    return embedTag;
  }
  /**
   *
   * @param uploader
   * @param fileName
   * @param fileContent
   */
  addpdfCustomTag(uploader: any, fileName: string, fileContent?: any) {
    const reader = new FileReader();
    const embedTag = this.createEmbedTag(fileName);
    reader.onloadend = (e: any) => {
      embedTag.setAttribute('src', 'assets/images/pdf-icon.png');
      this.pdfCustomTag.push(embedTag);
      this.filesAddedCallback(uploader);
    };
    reader.readAsDataURL(fileContent);
  }

  addExistingPdfCustomTag(fileName: string, id: string) {
    const embedTag = this.createEmbedTag(fileName);
    embedTag.setAttribute('src', 'assets/images/pdf-icon.png');
    embedTag.setAttribute('id', id);
    this.pdfCustomTag.push(embedTag);
    this.pdfFilesCount += 1;
  }

  // function for checking of the video format
  checkFormat(filename:string) {
    if (
      filename.includes('.hevc') ||
      filename.includes('.f4v') ||
      filename.includes('.mjpeg') ||
      filename.includes('.ogg') ||
      filename.includes('.mp3')
    ) {
      return true;
    } else {
      return false;
    }
  }
}
