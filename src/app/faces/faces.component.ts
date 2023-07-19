import { Component, OnInit } from '@angular/core';
import { UploadFileService } from '../service/upload-file.service';
import { ServerClass, Server } from '../Interfaces/faces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-faces',
  templateUrl: './faces.component.html',
  styleUrls: ['./faces.component.scss'],
})
export class FacesComponent implements OnInit {
  fileSelected = false;
  uploading = false;

  mensaje: Server[] = [];
  personasEcontradas: number = 0;

  imagePreviewUrl: any;
  viewRostros: boolean = false;

  constructor(private facialRecognitionService: UploadFileService) {}

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
      async (res) => {
        this.mensaje = [];
        this.uploading = false;
        this.viewRostros = true;

          res.server.forEach(async (server: Server) => {
            try {
              const resultado = await this.reconocimiento(server.encoding);
              server.nombre = resultado.nombre;
              server.apellido = resultado.apellido;
              server.similitud = resultado.similitud;
            } catch (error) {
              // En caso de error, se asignan valores predeterminados.
              server.nombre = "No";
              server.apellido = "Registrado";
              server.similitud = 0;
            }
            this.mensaje.push(server);
            this.personasEcontradas = this.mensaje.length;
          });
        console.log("Mensaje: ", this.mensaje);

      },
      (error) => {
        this.uploading = false;
        console.log(error);
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          },
        });

        Toast.fire({
          icon: 'error',
          title: error.error.error,
        });
      }
    );
  }

  resultado: ServerClass = { apellido: "", nombre: "", similitud: 0 };

  async reconocimiento(encoding: any): Promise<ServerClass> {
    try {
      const res = await this.facialRecognitionService.reconocimiento('[' + encoding + ']').toPromise();
      console.log(res);

      const apellido = res.server.apellido;
      const nombre = res.server.nombre;
      const similitud = res.server.similitud;

      const resultado: ServerClass = { apellido, nombre, similitud };
      this.resultado = resultado;

      console.log("Resultado-Nombres", this.resultado);

      return resultado;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  object = {
    "encoding": "",
    "nombre": null,
    "apellido": null
    }

  guardarPerson(ecoding : any) {
    if(this.object.apellido == null){
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
      });

      Toast.fire({
        icon: 'warning',
        title: 'Ingrese un apellido',
      });
    } else if (this.object.nombre == null){
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
      });

      Toast.fire({
        icon: 'warning',
        title: 'Ingrese un nombre',
      });
    } else if (this.object.encoding == null){
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
      });

      Toast.fire({
        icon: 'warning',
        title: 'Encoding no encontrado',
      });
    } else {
      this.object.encoding = "[" + ecoding + "]";
      this.facialRecognitionService.guardarPersona(this.object).subscribe(
        (response) => {
          console.log('Objeto guardado correctamente:', response);
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
          });

          Toast.fire({
            icon: 'success',
            title: 'Objeto guardado correctamente',
          });
        },
        (error) => {
          console.error('Error al guardar el objeto:', error);
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
          });

          Toast.fire({
            icon: 'error',
            title: error,
          });
        }
      );
    }
  }


  copiarTexto() {
    const texto = document.querySelector('.card-body p')!.textContent;
    navigator.clipboard
      .writeText(texto!)
      .then(() => {
        console.log('Texto copiado: ' + texto);
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          },
        });

        Toast.fire({
          icon: 'success',
          title: 'Texto Copiado',
        });
      })
      .catch((error) => {
        console.error('Error al copiar el texto: ' + error);
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          },
        });

        Toast.fire({
          icon: 'error',
          title: 'Errror al copiar',
        });
      });
  }

  ngOnInit(): void {}
}
