import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CarritoDto } from '../modelos/carrito';
import { OrdenDto } from '../modelos/orden';
import { OrdenDetalleDto, OrdenEntregaDto } from '../modelos/ordenEntrega';
import { ProductoDto } from '../modelos/productos';

@Injectable({
  providedIn: 'root'
})
export class TiendaService {

  tiendaUrl = environment.tiendaUrl;

  constructor(private http: HttpClient) { }

  public guardarCarrito(carrito: CarritoDto): Observable<CarritoDto> {
    return this.http.post<CarritoDto>(this.tiendaUrl + 'saveCar', carrito);
  }

  public getCarritoByUsername(usuario: string): Observable<CarritoDto[]> {
    return this.http.get<CarritoDto[]>(this.tiendaUrl + 'getCarByUser/' + usuario);
  }

  public deleteCarritoItem(id: number): Observable<any> {
    return this.http.delete<any>(this.tiendaUrl + 'delete/' + id);
  }

  public deleteCarrito(userName: string): Observable<any> {
    return this.http.delete<any>(this.tiendaUrl + 'deleteAll/' + userName);
  }

  //saveOrden
  public guardarOrden(orden: OrdenDto): Observable<any> {
    return this.http.post<any>(this.tiendaUrl + 'saveOrden', orden);
  }

  public getOrdenesEntrega(): Observable<OrdenEntregaDto[]> {
    return this.http.get<OrdenEntregaDto[]>(this.tiendaUrl + 'ordenes');
  }

  public getOrdenDetalleEntrega(id: string): Observable<OrdenDetalleDto[]> {
    return this.http.get<OrdenDetalleDto[]>(this.tiendaUrl + 'orden/' + id);
  }

  public asignarRepartidorOrden(params: any): Observable<any> {
    return this.http.put<any>(this.tiendaUrl + 'asignar/', params);
  }

  public cerrarOrden(params: any): Observable<any> {
    return this.http.put<any>(this.tiendaUrl + 'cerrarOrden/', params);
  }

  public getOrdenesEntregaAsignadas(usuarioRepartidor: string): Observable<OrdenEntregaDto[]> {
    return this.http.get<OrdenEntregaDto[]>(this.tiendaUrl + 'ordenes/' + usuarioRepartidor);
  }

  public getProductosPromocion(): Observable<ProductoDto[]> {
    return this.http.get<ProductoDto[]>(this.tiendaUrl + 'productosByPromociones');
  }

}
