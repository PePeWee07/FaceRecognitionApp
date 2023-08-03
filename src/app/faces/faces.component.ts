import { Component, OnInit } from '@angular/core';
import { UploadFileService } from '../service/upload-file.service';
import { ServerClass, Server, Persona } from '../Interfaces/faces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-faces',
  templateUrl: './faces.component.html',
  styleUrls: ['./faces.component.scss'],
})
export class FacesComponent implements OnInit {
  fileSelected = false;
  uploading = false;

  mensaje: any[] = [];
  respuesta: any[] = [];
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
        this.respuesta = [];
        this.mensaje = [];
        this.uploading = false;
        this.viewRostros = true;

        console.log("Respuesta: ", res);
        res.server.forEach( (server: Server) => {
          this.respuesta.push(server);
        });
        console.log("Respuesta: ", this.respuesta);


          res.server.forEach(async (server: Server) => {
            // console.log("Server: ", server.encodings);
            try {
              if (server.encodings.length  == 1) {
                console.log("No se pudo obtener el encoding en alguna imagen");
                server.nombre = "Error";
                server.apellido =  "Error";
                server.similitud = 0;
              } else {
                const resultado = await this.reconocimiento(server.encodings);
                server.nombre = resultado.nombre;
                server.apellido = resultado.apellido;
                server.similitud = resultado.similitud;
              }
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
          title: "La calidad de imagen no es Buena",
        });
      }
    );
  }

  resultado: ServerClass = { apellido: "", nombre: "", similitud: 0 };

  async reconocimiento(encoding: any): Promise<ServerClass> {
    try {
      const res = await this.facialRecognitionService.reconocimiento('[' + encoding + ']').toPromise();
      // console.log(res);

      const apellido = res.server.apellido;
      const nombre = res.server.nombre;
      const similitud = res.server.similitud;

      const resultado: ServerClass = { apellido, nombre, similitud };
      this.resultado = resultado;

      return resultado;
    } catch (err) {
      this.mensaje = [];
      console.log(err);
      // throw err;
      throw null;
    }
  }

  persona: Persona =  new Persona();

  async guardarPerson(persona : Persona, ecoding: number[]) {

      console.log("Persona enconding: ", ecoding);

      const { value: formValues } = await Swal.fire({
        title: 'Guardar Persona',
        html:
        `
        <!-- Encoding -->
        <label class="form-label">Encoding:</label>
        <input
          type="text"
          class="form-control"
          disabled
          id="swal-encoding"
        />

        <!-- Nombre -->
        <label class="form-label">Nombre:</label>
        <input
          type="text"
          class="form-control"
          placeholder="Ingrese el nombre"
          id="swal-nombre"
        />

        <!-- Apellido -->
        <label class="form-label">Apellido:</label>
        <input
          type="text"
          class="form-control"
          placeholder="Ingrese el apellido"
          id="swal-apellido"
        />

        `,
        focusConfirm: true,
          showCancelButton: true,
          cancelButtonText: "Cancelar",
          cancelButtonColor: "#d33",
          didOpen: () => {
            (<HTMLInputElement>document.getElementById('swal-encoding')!).value = ecoding.join(', ')!;
          },
        preConfirm: () => {
          const savePerson: Persona = {
            encoding: "[" + (<HTMLInputElement>document.getElementById('swal-encoding')!).value + "]",
            nombre: (<HTMLInputElement>document.getElementById('swal-nombre')!).value,
            apellido: (<HTMLInputElement>document.getElementById('swal-apellido')!).value
          };
          this.facialRecognitionService.guardarPersona( savePerson ).subscribe(
              (resp: any) => {
                console.log("Respuesta gaurdar persona: ", resp);

                const Toast = Swal.mixin({
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  timer: 2000,
                  timerProgressBar: true,
                  didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                  }
                })
                Toast.fire({
                  icon: 'success',
                  title: `Se guardo la persona`
                })
              }, (err) => {
                console.log("Error: ",err);
                const errorServidor = err.error.mensaje;
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: `${errorServidor}`,
                })
          })
        }
      })

  }


  /* copiarTexto() {
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
  } */

  ngOnInit(): void {}

}
