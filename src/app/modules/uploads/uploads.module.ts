import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageuploadComponent } from './imageupload/imageupload.component';
import { Routes, RouterModule } from '@angular/router';



const routes: Routes = [
  {
    path: '',
    component:ImageuploadComponent
  }
]



@NgModule({
  declarations: [
    ImageuploadComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ]
})
export class UploadsModule { }
