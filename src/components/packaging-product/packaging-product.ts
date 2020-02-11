import { Component,ChangeDetectorRef,Input} from '@angular/core';
import { StockProvider } from '../../providers/stock/stock'
/**
 * Generated class for the PackagingProductComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */


export interface Packaging_line {
    id : number
    name: string
    package_id : number
    product_id: number
    product : string
    qty: number}


@Component({
  selector: 'packaging-product',
  templateUrl: 'packaging-product.html'
})

export class PackagingProductComponent {
 
  @Input() packaging_line: Packaging_line
 
  text: string;
 constructor(private stockInfo: StockProvider, private changeDetectorRef: ChangeDetectorRef) {
    console.log('Hello PackagingProductComponent Component');
    this.text = 'Hello World';
  }


  change_qty(qty){
    if (qty == 1 || qty == -1){
      this.packaging_line.qty += qty
      }
    else if (+qty>=0){
      this.packaging_line.qty = qty
      }
    else {
      this.packaging_line.qty = 0
      }
    
      this.stockInfo.set_packaging_lines(this.packaging_line).then((val) => {
        
      }).catch((mierror) => {
        
        //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror + mierror)
        console.log(mierror)
      })
  
      this.changeDetectorRef.detectChanges() 
  }
}
