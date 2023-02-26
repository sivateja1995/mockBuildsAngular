import { ImageMimeTypes } from './../../../models/mime-type.model';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BlobFileInfo } from 'src/app/shared/models/blob/blob-file-info.model';
import { FileUtil } from 'src/app/utilities/file-utils';
import { PluploadUtil } from 'src/app/utilities/plupload-utils';
import { Image } from 'src/app/models/image.model';
declare var $: any;
@Component({
  selector: 'app-imageupload',
  templateUrl: './imageupload.component.html',
  styleUrls: ['./imageupload.component.scss'],
})
export class ImageuploadComponent implements OnInit {
  plUploadUtil!: PluploadUtil;
  fileUtil: FileUtil = new FileUtil();
  propertyMedias: any;
  files: BlobFileInfo[] = [];
  divId: string = 'dvPropertyPLUploadMedia';
  @Input() maxFiles: number=10;
  @Output() onMediaChanges: EventEmitter<any> = new EventEmitter();
  @Output() fileUploadCount: EventEmitter<any> = new EventEmitter();
  filesCount: number = 0;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    if (this.divId) {
      this.initializeAlbumImagePlupload();
    }
  }

  /**
   * pl upload related
   */

  private initializeAlbumImagePlupload() {
    var mimeTypes = [ImageMimeTypes];
    this.plUploadUtil = new PluploadUtil(
      this.onFilesAddedCallBack,
      this.onFilesRemoveCallBack,
      this.onQueueChangedCallBack,
      this.files,
      'dvPLAlbumImagesVideos'
    );
    this.plUploadUtil.initializePLUpload(
      $('#dvPLAlbumImagesVideos'),
      mimeTypes,
      this.maxFiles,
      'post'
    );
  }

  onQueueChangedCallBack = (existingFiles:any[]): void => {
    if (existingFiles && existingFiles.length > 0) {
      this.filesCount += existingFiles.length;
    }
  };

  private removeMediafromUserPost(deletedFiles: any[]) {
    for (var idx = 0; idx < deletedFiles.length; idx++) {
      this.filterImages(deletedFiles[idx]?.name);
    }
  }

  private filterImages(fileName:string) {
    this.propertyMedias = this.propertyMedias.filter(
      (w:any) => w.fileInfo?.file?.name !== fileName
    );
  }

  onFilesRemoveCallBack = (deletedFiles:any[]): void => {
    if (Array.isArray(deletedFiles)) {
      this.removeMediafromUserPost(deletedFiles);
    } else {
      this.removeSingleFileFromMedia(deletedFiles);
    }

  };

  get filesAddedCount() {
    if (this.propertyMedias && this.propertyMedias?.length>0) {
      return this.propertyMedias.length;
    }
    return 0;
  }

  private removeSingleFileFromMedia(deletedFile: string) {
    this.propertyMedias = this.propertyMedias?.filter(
      (w:any) => w.fileInfo?.fileName !== deletedFile
    );
  }

  public onFilesAddedCallBack = (files:any[], existingFiles:any[]): void => {
    if (files && files.length > 0) {
      var blobFiles = this.fileUtil.setBlobFilesArray(files);
      this.addFiles(blobFiles, existingFiles);
    }
  };

  private addImageFile(blobFile:any) {
    var image = new Image();
    image.fileInfo = blobFile;
    this.propertyMedias.push(image);
    console.log(this.propertyMedias);
  }

  private addFiles(blobFiles: any, existingFiles:any[]) {
    this.propertyMedias = [];
    for (var idx = 0; idx < blobFiles.length; idx++) {
      if (blobFiles[idx].fileType == 'image') {
        this.addImageFile(blobFiles[idx]);
      }
    }
    if (existingFiles) {
      existingFiles.forEach((w) => {
        if (w.fileType == 'image') {
          var image = new Image();
          image.fileInfo = w;
          this.propertyMedias.push(image);
        }
      });
    }
  }
}
