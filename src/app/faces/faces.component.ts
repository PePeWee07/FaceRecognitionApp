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
  constructor(private facialRecognitionService: UploadFileService) {}

  //variables banderas para ocultar y mostrar elementos
  fileSelected = false;
  uploading = false;

  //Variables donde guardo la repuesta del consumo de servicios
  mensaje: any[] = [];
  respuesta: any[] = [];
  personasEcontradas: number = 0;

  //metodo para cambiar color de barras segun su similitud
  barColorSimilitud(similitud: number): string {
    if (similitud < 0.5) {
      return 'progress-bar bg-danger';
    } else if (similitud >= 0.5 && similitud < 0.7) {
      return 'progress-bar bg-warning';
    } else if (similitud >= 0.7) {
      return 'progress-bar bg-success';
    }
    return '';
  }

  //metodo para calcualr la similitud para las barras de progreso
  calcularSimilitudStyle(similitud: number): string {
    let porcentaje = (similitud * 100).toFixed(2); // Calcula el porcentaje con dos decimales
    if( parseFloat(porcentaje) == 0 ){
      return `width: 5%`;
    } else {
      return `width: ${porcentaje}%`; // Retorna el valor de estilo
    }
  }

  calcularSimilitudPorcent(similitud: number): string {
    let porcentaje = (similitud * 100).toFixed(2);
    if( parseFloat(porcentaje) == 0) {
      return porcentaje = "0";
    } else {
      return porcentaje; // Retorna el valor
    }
  }

  //variables para mostrar Cartas de espera
  viewRostros: boolean = false;

  //consumo de servico de reconocimiento
  resultado: ServerClass = { apellido: '', nombre: '', similitud: 0 };

  async reconocimiento(encoding: any): Promise<ServerClass> {
    try {
      const res = await this.facialRecognitionService
        .reconocimiento('[' + encoding + ']')
        .toPromise();

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

  //consumo de servicio de guardar persona
  persona: Persona = new Persona();

  async guardarPerson(persona: Persona, ecoding: number[]) {
    console.log('Persona enconding: ', ecoding);

    //se guarda a travez de un modal de sweetalert
    const { value: formValues } = await Swal.fire({
      title: 'Guardar Persona',
      html: `
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
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#d33',
      didOpen: () => {
        (<HTMLInputElement>document.getElementById('swal-encoding')!).value =
          ecoding.join(', ')!;
      },
      preConfirm: () => {
        const savePerson: Persona = {
          encoding:
            '[' +
            (<HTMLInputElement>document.getElementById('swal-encoding')!)
              .value +
            ']',
          nombre: (<HTMLInputElement>document.getElementById('swal-nombre')!)
            .value,
          apellido: (<HTMLInputElement>(
            document.getElementById('swal-apellido')!
          )).value,
        };
        this.facialRecognitionService.guardarPersona(savePerson).subscribe(
          (resp: any) => {
            console.log('Respuesta gaurdar persona: ', resp);

            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
              },
            });
            Toast.fire({
              icon: 'success',
              title: `Se guardo la persona`,
            });
          },
          (err) => {
            console.log('Error: ', err);
            const errorServidor = err.error.mensaje;
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `${errorServidor}`,
            });
          }
        );
      },
    });
  }

  //consumo de servicio de lipieza de servidor
  limpiarServicio() {
    this.facialRecognitionService.cleanServer().subscribe(
      (resp: any) => {
        console.log('Respuesta limpiar servidor: ', resp);
      },
      (err) => {
        console.log('Error al limpiar Servicor: ', err);
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
          title: err.error.mensaje,
        });
      },
      () => {
        //repuestas satisfactoria que se limpia el servidor
        console.log('Se limpio el servidor');
      }
    );
  }

  //Metodo para subir la imagen y proceso de reconocimiento recorte e encoding
  file!: File; //variable para guardar el archivo
  photoSelected!: any; //variable para previzualizar imagen a cargar
  hiddenTxt: boolean = true; //variable para ocultar el texto de la carta para cargar imagen

  onPhotoSelected(event: any): any {
    if (event.target.files && event.target.files[0]) {
      const files: File[] = event.target.files;
      const invalidFiles: File[] = [];

      this.fileSelected = true;
      this.photoSelected = null;
      const file: File = event.target.files[0];
      this.uploading = true;

      // Previsualizar la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoSelected = e.target?.result;
      };
      reader.readAsDataURL(file);

      //Recorremos todo los archivos y obtenemos los invalidos
      for (const file of files) {
        const fileName: string = file.name;
        //Acepto solo archivos con extension .dcm
        if (
          fileName.endsWith('.jpg') ||
          fileName.endsWith('.png') ||
          fileName.endsWith('.jpeg')
        ) {
          ///
        } else {
          // Obtengo los archivos invalidos
          invalidFiles.push(file);
        }
      }

      //metodo para subir archivos
      if (invalidFiles.length === 0) {
        //Metodo para subir archivos
        this.file = <File>event.target.files;

        // hiddens
        this.hiddenTxt = false;

        //consumo del servicio de recorte y generacion de encodings
        this.facialRecognitionService.uploadImage(file).subscribe(
          async (res) => {
            this.respuesta = [];
            this.mensaje = [];
            this.uploading = false;
            this.viewRostros = true;

            //Guardo los resultados en un array
            res.server.forEach((server: Server) => {
              this.respuesta.push(server);
            });
            this.personasEcontradas = this.respuesta.length;
            console.log('Respuesta: ', this.respuesta);

            res.server.forEach(async (server: Server) => {
              try {
                //Si no c pudo sacar el encodings mostrara Erro en los nombres y 0 en la similitus y encodings
                if (server.encodings.length == 1) {
                  console.log(
                    'No se pudo obtener el encoding en alguna imagen'
                  );
                  server.nombre = 'Error';
                  server.apellido = 'Error';
                  server.similitud = 0;
                } else {
                  const resultado = await this.reconocimiento(server.encodings);
                  server.nombre = resultado.nombre;
                  server.apellido = resultado.apellido;
                  server.similitud = resultado.similitud;
                }
              } catch (error) {
                // En caso de no tener registro de la persona, se asignan valores predeterminados.
                server.nombre = 'No';
                server.apellido = 'Registrado';
                server.similitud = 0;
              }
              this.mensaje.push(server);
            });

            this.limpiarServicio();
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
              title: 'La calidad de imagen no es Buena',
            });
          }
        );
      } else {
        const nameInvalids = invalidFiles
          .map((element) => element.name)
          .join(',\n');

        Swal.fire(
          'fORMATO NO VALIDO',
          `Solo acepto formatos .png .jpg .jpeg, pero no : ${nameInvalids}`,
          'warning'
        );
      }
    } else {
      // hiddens
      this.hiddenTxt = true;
      this.photoSelected = null;
    }
  }

  ngOnInit(): void {}
}
