import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faces',
  templateUrl: './faces.component.html',
  styleUrls: ['./faces.component.scss']
})
export class FacesComponent implements OnInit {

  constructor() { }

  viewUpload: boolean = false;
  photoSelected: String = "";
  hiddenTxt: boolean = false;
  displayButton: boolean = false;

  onPhotoSelected(event: Event){
  }

  loading(){

  }


  // onFileSelectedDicomConvert(event: any): void {
  //   this.selectedFile = event.target.files[0];
  //   if (event.target.files[0]) {
  //     this.getSafeUrl(this.selectedFile);
  //     this.displayButton2 = false;
  //     this.hiddenTxtDicom = false;
  //     this.fileNmae = event.target.files[0].name;
  //   } else {
  //     this.displayButton2 = true;
  //     this.hiddenTxtDicom = true;
  //     this.fileNmae = 'File Name';
  //     return (this.photoSelectedDicom = null);
  //   }
  // }
  ngOnInit(): void {
  }

}
