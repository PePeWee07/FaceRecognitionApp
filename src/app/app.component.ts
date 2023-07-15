import { Component } from '@angular/core';
import { UploadFileService } from './service/upload-file.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'FaceRecognitionApp';

  constructor(private facialRecognitionService: UploadFileService) { }

  fileSelected = false;
  uploading = false;
  response: any;

  onFileSelected(event: any) {
    this.response = null;
    this.fileSelected = true;
    const file: File = event.target.files[0];
    this.uploading = true;
    this.facialRecognitionService.uploadImage(file).subscribe(
      response => {
        this.uploading = false;
        this.response = response;
      },
      error => {
        this.uploading = false;
        console.log(error); // Manejar el error
      }
    );
  }
}
