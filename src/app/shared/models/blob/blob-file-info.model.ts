export interface IBlobFileInfo {
  blobId?: string;
  fileType?: string;
  fileName?: string;
}
export class BlobFileInfo implements IBlobFileInfo {
  public blobId: string = '';
  public fileType: string = '';
  public fileMimeType: string = '';
  public guid: string = '';
  private plUploadContainerId: string = '';
  private plUploadId: string = '';
  private numOfBlocks: number = 0;
  private blockIds: Array<string> = [];
  public file: File | null = null;
  private sasUrl: string = '';
  private customFileName: string = '';
  private maxBlockSize: number = 0;
  private uploadedBlockIds: Array<string> = [];
  public uploadedBytes: number = 0;
  private uploadFailed: boolean = false;
  private fileContent: Array<Blob> = [];
  private nextItemToUpload: number = 0;
  public isDeleted: boolean = false;
  public isInQueue: boolean = false;
  public isUploaded: boolean = false;
  public fileName!: string;
  public size!: number;
  public thumbUrl?: string;

  //#region Getters
  public getGUID(): string {
    return this.guid;
  }
  public getBlobId(): string {
    return this.blobId;
  }
  public getCustomFileName(): string {
    return this.customFileName;
  }
  public getPLUploadContainerId(): string {
    return this.plUploadContainerId;
  }
  public getPLUploadId(): string {
    return this.plUploadId;
  }
  public getNumOfBlocks(): number {
    return this.numOfBlocks;
  }
  public getMaxBlockSize(): number {
    return this.maxBlockSize;
  }
  public getUploadedBlockIds(): Array<string> {
    return this.uploadedBlockIds;
  }
  public getUploadedBytes(): number {
    return this.uploadedBytes;
  }
  public getUploadFailed(): boolean {
    return this.uploadFailed;
  }
  public getBlockIds(): Array<string> {
    return this.blockIds;
  }
  public getFile(): File {
    return (this.file as File);
  }
  public getSize(): number {
    return (this.file as File).size;
  }
  public getSASUrl(): string {
    return this.sasUrl;
  }
  public getFileContent(): Array<Blob> {
    return this.fileContent;
  }
  public getNextItemToUpload(): number {
    return this.nextItemToUpload;
  }
  //#endregion

  //#region Setters
  public setGUID(value: string): void {
    this.guid = value;
  }
  public setBlobId(value: string): void {
    this.blobId = value;
  }
  public setFileName(value: string): void {
    this.fileName = value;
  }
  public setSize(value: number): void {
    this.size = value;
  }
  public setCustomFileName(value: string): void {
    this.customFileName = value;
  }
  public setPLUploadContainerId(value: string): void {
    this.plUploadContainerId = value;
  }
  public setPLUploadId(value: string): void {
    this.plUploadId = value;
  }
  public setNumOfBlocks(value?: number): void {
    if (value) this.numOfBlocks = value;
    else {
      if ((this.file as File).size % this.maxBlockSize == 0)
        this.numOfBlocks = (this.file as File).size / this.maxBlockSize;
      // need to add math library !
      else this.numOfBlocks = ~~((this.file as File).size / this.maxBlockSize + 1);
    }
  }
  public addBlockId(value: string): void {
    this.blockIds.push(value);
  }
  public setFile(value: File): void {
    this.file = value;
  }
  public setSASUrl(value: string): void {
    this.sasUrl = value;
  }

  public setMaxBlockSize(value: number): void {
    this.maxBlockSize = value;
  }
  public addUploadedBlockId(value: string): void {
    this.uploadedBlockIds.push(value);
  }
  public setUploadedBytes(value: number): void {
    this.uploadedBytes = value;
  }
  public setUploadFailed(value: boolean): void {
    this.uploadFailed = value;
  }
  public addFileContent(value: Blob): void {
    this.fileContent.push(value);
  }
  public setNextItemToUpload(value: number): void {
    this.nextItemToUpload = value;
  }
  //#endregion
}

export interface accepetedFileTypes {
  fileType: 'video' | 'audio' | 'image' | 'application/pdf' | 'unknown';
}
