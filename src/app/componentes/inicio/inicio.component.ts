import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CarritoDto } from 'src/app/modelos/carrito';
import { LoginUsuario } from 'src/app/modelos/login-usuario';
import { NuevoUsuario } from 'src/app/modelos/nuevo-usuario';
import { AuthService } from 'src/app/services/auth.service';
import { TiendaService } from 'src/app/services/tienda.service';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {

  displayLogin: boolean = false;
  displayRegister: boolean = false;
  displayStore: boolean = false;

  loginUsuario?: LoginUsuario;

  usernameText?: string;
  passwordText?: string;

  isLogged: boolean = false;
  usuarioLogeado?: string;
  isAdmin: boolean = false;
  isDelivery: boolean = false;

  txtNombre: string = '';
  txtApellido: string = '';
  nuevoUsuario: NuevoUsuario = {};

  addCarrito: CarritoDto[];

  totalCarrito: number = 0;
  userCar: string;

  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private tiendaService: TiendaService
  ) { }

  ngOnInit(): void {
    this.isLogged = this.tokenService.isLogger();
    if (this.isLogged) {
      if (this.tokenService.getUserName() != "user") {
        this.usuarioLogeado = this.tokenService.getUserName() as string;
        this.userCar = this.tokenService.getUserNameByToken();
        console.log(this.usuarioLogeado);
      }
      this.isAdmin = this.tokenService.isAdmin();
      this.isDelivery = this.tokenService.isDelivery();
    }
  }

  onLogin() {
    if (this.usernameText === undefined || this.passwordText === undefined || this.usernameText === "" || this.passwordText === "") {
      this.messageService.add({ key: 'myKey1', severity: 'info', summary: 'Información', detail: 'Debe ingresar las credenciales.' });
    } else {
      this.loginUsuario = new LoginUsuario(this.usernameText as string, this.passwordText as string);

      this.authService.login(this.loginUsuario).subscribe(
        data => {
          if (data.token as string === 'NO_VALIDO') {
            this.messageService.add({ key: 'myKey1', severity: 'error', summary: 'Error', detail: 'Su usuario no se encuentra activo.' });
          } else {
            this.tokenService.setToken(data.token as string);
            this.isLogged = true;
            this.displayLogin = false;
            this.usuarioLogeado = this.tokenService.getUserName() as string;
            window.location.replace('/');
          }
        },
        err => {
          this.messageService.add({ key: 'myKey1', severity: 'error', summary: 'Error', detail: 'Usuario y/o contraseña incorrecta.' });
        }
      );
    }
  }

  registrar() {
    this.nuevoUsuario.nombre = this.txtNombre + ' ' + this.txtApellido;
    this.nuevoUsuario.roles = ['user'];
    this.nuevoUsuario.estado = 'ACTIVO';

    if (this.nuevoUsuario.nombre === '' || this.nuevoUsuario.nombre === undefined ||
      this.nuevoUsuario.direccion === '' || this.nuevoUsuario.direccion === undefined ||
      this.nuevoUsuario.email === '' || this.nuevoUsuario.email === undefined ||
      this.nuevoUsuario.nombreUsuario === '' || this.nuevoUsuario.nombreUsuario === undefined ||
      this.nuevoUsuario.password === '' || this.nuevoUsuario.password === undefined) {
      this.messageService.add({ key: 'myKey2', severity: 'info', summary: 'Información', detail: 'Por favor, ingrese todo sus datos para el registro.' });
      return;
    }
    this.authService.nuevo(this.nuevoUsuario).subscribe(
      data => {
        console.log('ENTRA POR DATA ' + data)
      },
      err => {
        if (err.status === 400)
          console.log(err.error);
        else {
          this.messageService.add({ key: 'myKey2', severity: 'success', summary: 'Success', detail: 'Usuario registrado con éxito, por favor inicie sesión con sus credenciales.' });
          this.nuevoUsuario = {};
          this.txtNombre = '';
          this.txtApellido = '';
        }

      }
    );
  }

  abrirCarrito() {
    this.displayStore = true;
    this.llenarCarrito();
  }

  llenarCarrito() {
    this.totalCarrito = 0;
    if (this.tokenService.isLogger()) {
      this.tiendaService.getCarritoByUsername(this.tokenService.getUserNameByToken()).subscribe(data => {
        this.addCarrito = data;
        for (const d of (this.addCarrito as any)) {
          let precio = d.precio as number;
          this.totalCarrito += precio;
        }
        this.totalCarrito = +this.totalCarrito.toPrecision(4);
      });
    }
  }

  upCantidad(carrito: CarritoDto) {
    for (const d of (this.addCarrito as any)) {
      if (d.id === carrito.id) {
        d.cantidad++;
        let precio = d.precio as number;
        this.totalCarrito += precio;
      }
    }
    this.totalCarrito = +this.totalCarrito.toPrecision(4);
  }

  downCantidad(carrito: CarritoDto) {
    for (const d of (this.addCarrito as any)) {
      if (d.id === carrito.id)
        if (d.cantidad > 1) {
          d.cantidad--;
          let precio = d.precio as number;
          this.totalCarrito -= precio;
        }
    }
    this.totalCarrito = +this.totalCarrito.toPrecision(4);
  }

  eliminarItem(carrito: CarritoDto | undefined) {
    let iditem = carrito?.id;
    this.tiendaService.deleteCarritoItem(iditem as number).subscribe(data => {
      this.llenarCarrito();
    });
  }

  limpiarCarrito() {
    if (this.userCar === undefined || this.userCar === '') {
      this.messageService.add({ key: 'myKey3', severity: 'info', summary: 'Información', detail: 'No se ha encontrado un usuario registrado en la tienda, inice sesión.' });
      return;
    }
    if (this.totalCarrito === 0) {
      this.messageService.add({ key: 'myKey3', severity: 'info', summary: 'Información', detail: 'No existen productos agregados al carrito.' });
      return;
    }
    this.tiendaService.deleteCarrito(this.userCar).subscribe(data => {
      console.log(data)
      this.addCarrito = [];
      this.totalCarrito = 0;
      window.location.replace('/tienda');
    })
  }

  actualizarCarrito() {
    if (this.userCar === undefined || this.userCar === '') {
      this.messageService.add({ key: 'myKey3', severity: 'info', summary: 'Información', detail: 'No se ha encontrado un usuario registrado en la tienda, inice sesión.' });
      return;
    }
    if (this.totalCarrito === 0) {
      this.messageService.add({ key: 'myKey3', severity: 'info', summary: 'Información', detail: 'No existen productos agregados al carrito.' });
      return;
    }
    this.addCarrito.map(x => {
      this.tiendaService.guardarCarrito(x).subscribe(data => {
        console.log(x);
      });
    });
    //this.router.navigate(['tienda/pagar']);
    window.location.replace('tienda/pagar')
  }

  logOut() {
    this.tokenService.logOut();
  }


}

