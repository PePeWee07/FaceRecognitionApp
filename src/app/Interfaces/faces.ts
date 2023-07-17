export interface Faces {
  server: Server[];
}

export interface Server {
  encoding: number[];
  imagen:   string;
}


export interface ServerResponse {
  Server: ServerClass;
}

export interface ServerClass {
  apellido:  string;
  nombre:    string;
  similitud: number;
}
