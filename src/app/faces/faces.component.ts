import { Component, OnInit } from '@angular/core';
import { UploadFileService } from '../service/upload-file.service';
import { Faces, Server } from '../Interfaces/faces';
import Swal from "sweetalert2"

@Component({
  selector: 'app-faces',
  templateUrl: './faces.component.html',
  styleUrls: ['./faces.component.scss']
})
export class FacesComponent implements OnInit {

  fileSelected = false;
  uploading = false;
  response: Faces[] = [];
  serverResponse: any;
  imagePreviewUrl: any;
  mensaje: Server[] = [];
  personasEcontradas: number = 0;
  viewRostros: boolean = false;

  constructor(private facialRecognitionService: UploadFileService) { }

  onFileSelected(event: any) {
    this.fileSelected = true;
    this.imagePreviewUrl = null;
    const file: File = event.target.files[0];
    this.uploading = true;

    // Previsualizar la imagen
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreviewUrl = e.target?.result;
    };
    reader.readAsDataURL(file);

    this.facialRecognitionService.uploadImage(file).subscribe(
      res => {
        this.uploading = false;
        this.viewRostros= true

        this.response = res;
        this.serverResponse = res;
        this.personasEcontradas = this.serverResponse.server.length

      },
      error => {
        this.uploading = false;
        console.log(error);
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        })

        Toast.fire({
          icon: 'error',
          title: error
        })
      }
    );
  }

  copiarTexto() {
    const texto = document.querySelector('.card-body p')!.textContent;
    navigator.clipboard.writeText(texto!).then(() => {
      console.log('Texto copiado: ' + texto);
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })

      Toast.fire({
        icon: 'success',
        title: 'Texto Copiado'
      })
    }).catch((error) => {
      console.error('Error al copiar el texto: ' + error);
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })

      Toast.fire({
        icon: 'error',
        title: 'Errror al copiar'
      })
    });
  }



  ngOnInit(): void {
  }

}
