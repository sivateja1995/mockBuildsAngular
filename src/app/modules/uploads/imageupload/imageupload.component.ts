import { ImageMimeTypes } from './../../../models/mime-type.model';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FileUtil } from 'src/app/utilities/file-utils';
import { PluploadUtil } from 'src/app/utilities/plupload-utils';
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
  divId: string = 'dvPropertyPLUploadMedia';
  @Output() onMediaChanges: EventEmitter<any> = new EventEmitter();
  @Output() fileUploadCount: EventEmitter<any> = new EventEmitter();
  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    if (this.divId) {
      this.initializImageVideosPlupload();
    }
  }

  /**
   * pl upload related
   */
  private initializImageVideosPlupload() {
    let mimeTypes = [ImageMimeTypes];
    this.plUploadUtil = new PluploadUtil(
      this.onFilesAddedCallBack,
      this.onFilesRemoveCallBack,
      this.onQueueChangedCallBack,
      this.propertyMedias,
      this.divId,
      false
    );
    this.plUploadUtil.initializePLUpload(
      $('#' + this.divId),
      mimeTypes,
      5,
      'comment'
    );
  }
  public onFilesAddedCallBack = (files: any, existingFiles: any): void => {
    if (files && files.length > 0) {
      let blobFiles = this.fileUtil.setBlobFilesArray(files);
      this.addFiles(blobFiles, existingFiles);
      this.fileUploadCount.emit(files.length);
    } else {
      this.fileUploadCount.emit(0);
    }
    this.onMediaChanges.emit(this.propertyMedias);
  };

  onFilesRemoveCallBack = (deletedFiles: any[]): void => {
    if (Array.isArray(deletedFiles)) {
      this.removeMediafromUserComment(deletedFiles);
    } else {
      this.propertyMedias = this.propertyMedias?.filter(
        (m: any) => m.fileName !== deletedFiles
      );
    }
    this.onMediaChanges.emit(this.propertyMedias);
  };
  onQueueChangedCallBack = (existingFiles: any): void => {
    if (existingFiles && existingFiles.length > 0) {
    }
  };

  private removeMediafromUserComment(deletedFiles: any[]) {
    for (let idx = 0; idx < deletedFiles.length; idx++) {
      this.filterMedia(deletedFiles[idx]?.name);
    }
  }

  private filterMedia(fileName: string) {
    this.propertyMedias = this.propertyMedias?.filter(
      (w: { file: { name: string } }) => w?.file?.name !== fileName
    );
  }
  private addFiles(blobFiles: any, existingFiles: any) {
    this.propertyMedias = [];
    for (let idx = 0; idx < blobFiles.length; idx++) {
      this.propertyMedias.push(blobFiles[idx]);
    }
    if (existingFiles) {
      existingFiles.forEach((w: { file: { name: string } }) => {
        this.propertyMedias.push(w);
      });
    }
  }

  reset() {
    this.plUploadUtil.resetPlUploadDivContainer();
  }

  get filesAddedCount() {
    if (this.propertyMedias && this.propertyMedias.length > 0) {
      return this.propertyMedias.length;
    }
    return 0;
  }
}
