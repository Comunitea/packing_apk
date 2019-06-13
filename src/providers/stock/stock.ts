import { Injectable } from '@angular/core';
import { OdooProvider } from '../odoo/odoo';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

/*
  Generated class for the StockProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StockProvider {

  STOCK_FIELDS = {

    'stock.move.line':{
      'tree': ['id', 'origin', 'name', 'result_package_id', 'move_id', 'product_qty', 'state', 'package_id', 'shipping_type', , 'result_package_shipping_type'],
    },

    'stock.quant.package': {
      'tree': ['id', 'name', 'move_line_ids', 'shipping_type', 'delivery_carrier_id']
    },

    'stock.warehouse': {
      'form': ['id', 'name', 'company_id']
    },

    'delivery.carrier': {
      'tree': ['id', 'name']
    }
  }                            

  STOCK_STATES = {
    'draf': 'Borrador',
    'waiting': 'Esperando',
    'confirmed': 'En espera',
    'assigned': 'Reservado',
    'partially_available': 'Parcialmente',
    'done': 'Hecho',
    'cancel': 'Cancelado'
  }

  STATE_ICONS = {
    'cancel':'trash', 
    'error': 'alert', 
    'done': 'checkmark-circle', 
    'waiting': 'clock', 
    'confirmed': 'checkmark',
    'partially_available': 'checkmark',
    'assigned': 'done-all', 
    'draft': 'close-circle'
  }

  constructor(private odooCon: OdooProvider, public alertCtrl: AlertController, public storage: Storage)  {
    console.log('Hello StockProvider Provider');    
  }

  // Package manager

  update_object(model="stock.move.line", action:any=false, move_line_ids=[], package_id=false, result_package_id=false, partner_id=false) {
    let self = this
    let values = {
      'move_line_ids': move_line_ids,
      'package_id': package_id,
      'result_package_id': result_package_id,
      'action': action,
      'partner_id': partner_id
    }

    let promise = new Promise( (resolve, reject) => {
      self.odooCon.execute(model, 'update_object_from_apk', values).then((done) => {
        console.log(done)
       resolve(done)
      })
      .catch((err) => {
        console.log(err)
        reject(false)
        console.log("Error al validar")
    });
    })
    
    return promise
  }

  create_new_package(model, partner_id, shipping_type){
    let self = this
    let pckg_model = model
    let pckg_values = {
      'dest_partner_id': partner_id,
      'shipping_type': shipping_type
    }
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.new_package(pckg_model, pckg_values).then((lineas:Array<{}>) => {
        resolve(lineas)
      })
      .catch((err) => {
        reject(false)
        console.log("Error")
      })
    })

    return promise
    
  }

  create_new_package_from_move(move_id, partner_id) {
    let self = this
    let model 
    let values = {
      'move_line_id': move_id,
      'dest_partner_id': partner_id,
    }
     
    model = 'stock.quant.package'
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.execute(model, 'create_new_package_from_move', values).then((done) => {
       resolve(done)
      })
      .catch((err) => {
        reject(false)
        console.log("Error al validar")
    });
    })
    
    return promise
  }

  add_package_id_to_line(move_id, result_package_id, shipping_type=false){
          
    let self = this
    let model = 'stock.move.line'
    let valores = {
      'result_package_id': result_package_id
    }
    
    if(shipping_type != false) {
      valores['shipping_type'] = shipping_type
    }     
    
    let promise = new Promise( (resolve, reject) => {
        self.odooCon.update_lines(model, 'write', valores, move_id).then((sp_ids:any) => {
          for (let sm_id in sp_ids){sp_ids[sm_id]['model'] = model}
          resolve(sp_ids)
        })
        .catch((err) => {
          reject(false)
          console.log("Error al validar")
      });
      });
    return promise
  }

  get_package_info(id) {
    let self = this
    let domain = [['id', '=', id]]

    let model = 'stock.quant.package'
    let fields = this.STOCK_FIELDS[model]['tree']
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((data:any) => {
        for (let sm_id in data){data[sm_id]['model'] = model}
          resolve(data)
      })
      .catch((err) => {
        reject(err)
    });
    })
    return promise
  }

  get_package_lines(package_id) {
    let self = this
    let model 
    let values = {
      'package': package_id
    }
     
    model = 'stock.quant.package'
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.execute(model, 'get_lines_info_apk', values).then((done) => {
       resolve(done)
      })
      .catch((err) => {
        reject(false)
        console.log("Error al validar")
    });
    })
    
    return promise
  }

  delete_package(package_id) {
    let self = this
    let model 
    let values = {
      'package': package_id
    }
     
    model = 'stock.quant.package'
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.execute(model, 'delete_package_from_apk', values).then((done) => {
       resolve(done)
      })
      .catch((err) => {
        reject(false)
        console.log("Error al validar")
    });
    })
    
    return promise
  }

  set_package_info(package_id, valores){
      
    let self = this
    let model = 'stock.quant.package'
    
    let promise = new Promise( (resolve, reject) => {
        self.odooCon.update_lines(model, 'write', valores, package_id).then((sp_ids:any) => {
          for (let sm_id in sp_ids){sp_ids[sm_id]['model'] = model}
          resolve(sp_ids)
        })
        .catch((err) => {
          reject(false)
          console.log("Error al validar")
      });
      });
    return promise
  }

  set_package_shipping_type(values) {
    let self = this
    let model 
     
    model = 'stock.quant.package'
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.execute(model, 'change_shipping_type', values).then((done) => {
       resolve(done)
      })
      .catch((err) => {
        reject(false)
        console.log("Error al validar")
      });
    })
    
    return promise
  }

  

  // Home warehouse selection

  get_available_warehouse_info(company_ids, type='form'){
   
    let self = this
    let model = 'stock.warehouse'
    let domain = [['company_id', 'in', company_ids]]
    let fields = this.STOCK_FIELDS[model][type]
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((sp_ids:any) => {
       for (let sm_id in sp_ids){sp_ids[sm_id]['model'] = model}
       resolve(sp_ids)
      })
      .catch((err) => {
        reject(false)
        console.log("Error buscando " + model)
    });
    })
    return promise
  }

   // Move lines

   get_stock_move_list(domain, type='tree') {
    let self = this
    let model = 'stock.move'
    let fields = this.STOCK_FIELDS[model][type]
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((sp_ids:any) => {
       for (let sm_id in sp_ids){sp_ids[sm_id]['model'] = model}
       resolve(sp_ids)
      })
      .catch((err) => {
        console.log(err)
        reject(false)
        console.log("Error buscando " + model)
    });
    })
    return promise
  }

  get_stock_move_lines_list_apk(partner_id, location_dest_id) {
    let self = this
    let model 
    let values = {
      'location_dest_id': location_dest_id,
      'partner_id': partner_id
    }
     
    model = 'stock.move.line'
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.execute(model, 'get_apk_info_full', values).then((done) => {
       resolve(done)
      })
      .catch((err) => {
        reject(false)
        console.log("Error al validar")
    });
    })
    
    return promise
  }

  get_move_line_info(id) {
    let self = this
    let domain = [['id', '=', id]]

    let model = 'stock.move.line'
    let fields = this.STOCK_FIELDS[model]['tree']
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((data:any) => {
        for (let sm_id in data){data[sm_id]['model'] = model}
          resolve(data)
      })
      .catch((err) => {
        reject(err)
    });
    })
    return promise
  }

  set_move_line_info(move_id, valores){
          
    let self = this
    let model = 'stock.move.line'
    
    let promise = new Promise( (resolve, reject) => {
        self.odooCon.update_lines(model, 'write', valores, move_id).then((sp_ids:any) => {
          for (let sm_id in sp_ids){sp_ids[sm_id]['model'] = model}
          resolve(sp_ids)
        })
        .catch((err) => {
          reject(false)
          console.log("Error al validar")
      });
      });
    return promise
  }

  set_move_line_shipping_type(values) {
    let self = this
    let model 
     
    model = 'stock.move.line'
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.execute(model, 'change_shipping_type', values).then((done) => {
       resolve(done)
      })
      .catch((err) => {
        reject(false)
        console.log("Error al validar")
      });
    })
    
    return promise
  }

  // Users list

  get_users_list_for_apk(location_dest_id) {
    let self = this
    let model 
    let values = {
      'location_dest_id': location_dest_id
    }
     
    model = 'stock.move.line'
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.execute(model, 'get_users_list_for_apk', values).then((done) => {
       resolve(done)
      })
      .catch((err) => {
        reject(false)
        console.log("Error al validar")
    });
    })
    
    return promise
  }

  get_users_list_for_apk_from_search_box(name) {
    let self = this
    let model 
    let values = {
      'name': name
    }
     
    model = 'stock.move.line'
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.execute(model, 'get_users_list_for_apk_from_search_box', values).then((done) => {
       resolve(done)
      })
      .catch((err) => {
        reject(false)
        console.log("Error al validar")
    });
    })
    
    return promise
  }

  // Alerts

  presentAlert(titulo, texto) {
    const alert = this.alertCtrl.create({
        title: titulo,
        subTitle: texto,
        buttons: ['Ok'],
    });
    alert.present();
  }

  errorAlert(model, move_id, data) {
    let subtitulo = 'No se ha podido guardar en el id ' + move_id + ' del modelo ' + model + ' el valor: ' + data
    const alertError = this.alertCtrl.create({
      title: 'Error',
      subTitle: subtitulo,
      buttons: ['OK']
    });
    alertError.present();
  }

  // Delivery carriers

  get_delivery_carriers(domain) {
    let self = this
    let model = 'delivery.carrier'
    let type = 'tree'
    let fields = this.STOCK_FIELDS[model][type]
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((sp_ids:any) => {
       resolve(sp_ids)
      })
      .catch((err) => {
        reject(false)
        console.log("Error buscando " + model)
    });
    })
    return promise
  }

  // Routes

  get_routes_for_apk() {
    let self = this
    let model 
    let values = {}
     
    model = 'delivery.route.path'
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.execute(model, 'get_routes_for_apk', values).then((done) => {
       resolve(done)
      })
      .catch((err) => {
        reject(false)
        console.log("Error al validar")
    });
    })
    
    return promise
  }
  
}
