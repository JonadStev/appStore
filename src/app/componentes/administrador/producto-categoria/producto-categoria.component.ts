import { Component, ElementRef, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Categoria, ProductoDto } from 'src/app/modelos/productos';
import { CategoriaData, CategoriaDto, ProductoCategoriaService } from 'src/app/services/producto-categoria.service';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-producto-categoria',
  templateUrl: './producto-categoria.component.html',
  styleUrls: ['./producto-categoria.component.scss']
})

export class ProductoCategoriaComponent implements OnInit {

  categoriaDTO: CategoriaDto = {};
  productoDTO: ProductoDto = {};

  categorias: any = [];
  productos: any = [];
  totalRecords: number;
  formData = new FormData();

  nombreProducto = new FormControl('');
  //selectedCategoria = new FormControl('');
  selectedCategoria?: string;
  precioProducto = new FormControl('');
  stockProducto = new FormControl();
  selectedIdProducto: string;
  selectedSrcImage: string;

  estados: any[] = [{ id: 1, nombreEstado: 'ACTIVO' }, { id: 2, nombreEstado: 'INACTIVO' }];

  @ViewChild('myInputFile')
  myInputFile: ElementRef;


  retrievedImage: any;
  base64Data: any;
  retrieveResonse: any;

  constructor(public productoCategoriaService: ProductoCategoriaService) { }

  ngOnInit(): void {

    this.llenarTablaCategorias();
    this.llenarTablaProductos();

  }

  llenarTablaCategorias() {
    this.productoCategoriaService.getCategorias().subscribe(data => {
      this.categorias = [];
      for (const d of (data as any)) {
        this.categorias.push({
          id: d.id,
          nombreCategoria: d.nombreCategoria
        });
      }
    });
    this.totalRecords = this.categorias.length;
  }

  llenarTablaProductos() {
    this.productoCategoriaService.getProductos().subscribe(data => {
      //console.log(data);
      this.productos = [];
      for (const d of (data as any)) {
        this.productos.push({
          id: d.id,
          nombre: d.nombre,
          precio: d.precio,
          stock: d.stock,
          srcImage: d.srcImage,
          estado: d.estado,
          categoria: d.categoria
        });
      }
    });
  }

  guardarCategoria() {
    this.productoCategoriaService.guardarCategoria(this.categoriaDTO).subscribe(
      data => {
        alert("Categoria guardada con exito!")
        this.categoriaDTO = {};
        this.llenarTablaCategorias();
      },
      err => {
        alert("No se ha guardado la categoria");
      }
    );
  }

  guardarProducto() {
    for (const cat of this.categorias) {
      if (cat.id === this.selectedCategoria)
        this.productoDTO.categoria = cat;
    }

    let productoUpload = {
      id: (this.selectedIdProducto !== '' || this.selectedIdProducto !== undefined) ? this.selectedIdProducto : '',
      nombre: this.nombreProducto.value,
      precio: this.precioProducto.value,
      stock: this.stockProducto.value,
      //srcImage: (this.selectedSrcImage !== '' || this.selectedSrcImage !== undefined) ? this.selectedSrcImage : '',
      srcImage: '',
      estado: 'ACTIVO',
      categoria: {
        id: this.productoDTO.categoria?.id,
        nombreCategoria: this.productoDTO.categoria?.nombreCategoria
      }
    }

    //Añadimos a nuestro objeto formData nuestro objeto convertido a String
    this.formData.append("producto", JSON.stringify(productoUpload));

    this.productoCategoriaService.guardarProducto(this.formData).subscribe(
      data => {
        alert("Producto guardado con exito!");
        this.limpiarFormularioProducto();
        this.llenarTablaProductos();
      },
      err => {
        alert("No se ha guardado el producto");
      }
    );
  }

  limpiarFormularioProducto() {
    this.productoDTO = {};
    this.formData = new FormData();
    this.nombreProducto.reset();
    this.precioProducto.reset();
    this.stockProducto.reset();
    this.myInputFile.nativeElement.value = '';
    this.retrievedImage = null;
    this.selectedCategoria = '';
  }

  onFileSelected(event: any) {
    this.formData.delete("fichero");
    const file: File = event.target.files[0];
    console.log(file);
    const fr = new FileReader();
    fr.onload = (evento: any) => {
      this.retrievedImage = evento.target.result;
    }
    this.formData.append("fichero", file);
    fr.readAsDataURL(file);

  }

  getProductoImage(id: string) {
    //Make a call to Sprinf Boot to get the Image Bytes.
    this.productoCategoriaService.getProducto(id)
      .subscribe(
        res => {
          this.retrieveResonse = res;
          this.base64Data = this.retrieveResonse.picByte;
          this.retrievedImage = 'data:image/jpg;base64,' + this.base64Data;
        }
      );
  }

  onRowSelect(event: any) {
    this.categoriaDTO = event.data;
  }

  onRowUnselect(event: any) {
    this.limpiarFormularioProducto();
  }

  onRowSelectProduct(event: any) {
    this.formData.delete("fichero");
    this.selectedIdProducto = event.data.id;
    //this.selectedSrcImage = event.data.srcImage;
    this.nombreProducto.setValue(event.data.nombre);
    this.precioProducto.setValue(event.data.precio);
    this.stockProducto.setValue(event.data.stock);
    this.getProductoImage(event.data.id)
    this.selectedCategoria = event.data.categoria.id;

    var blob = new Blob([this.base64Data], { type: 'image/jpg' });
    const file: File = new File([blob], 'imageFileName.jpg');
    this.formData.append("fichero", file);

  }




}
