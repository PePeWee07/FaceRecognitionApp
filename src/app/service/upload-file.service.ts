import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {

  constructor(private http: HttpClient) {}

  Url = 'http://127.0.0.1:5000/';

  //Subida de Imagen para el recorte
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(this.Url+'recorteFacial', formData);
  }

  //Subida de vectores para reconocimiento
  reconocimiento(inputEncodingStr : string){
    const requestBody = {
      inputEncodingStr: inputEncodingStr
    };

    return this.http.post<any>(this.Url+'reconocer', requestBody);
  }
}
