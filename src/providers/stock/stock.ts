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
    'stock.picking.type': {
      'form': ['id', 'name', 'code', 'warehouse_id', 'default_location_src_id', 'default_location_dest_id'],
      'tree': ['id', 'name', 'code', 'warehouse_id', 'default_location_src_id', 'default_location_dest_id']
    },

    'stock.picking':{
      'form':  ['id', 'name', 'state', 'partner_id', 'scheduled_date', 'location_id', 'location_dest_id', 'note', 'picking_type_id', 'move_lines'],
      'tree':  ['id', 'name', 'state', 'scheduled_date', 'picking_type_id']
    },

    'stock.move':{
      'form': ['id', 'name', 'has_tracking', 'state', 'product_id', 'product_uom', 'picking_id', 'location_id', 'location_dest_id', 'product_uom_qty', 'product_qty', 'display_name', 'need_check', 'need_dest_check', 'inventory_id'],
      'tree': ['id', 'origin', 'product_default_code', 'product_id', 'has_tracking', 'product_uom', 'picking_id', 'product_qty', 'product_uom_qty', 'state', 'location_id', 'location_dest_id'],
      'inview': ['product_id', 'product_uom_qty', 'state'],
      'moves': ['move_dest_ids'],
      'partner': ['partner_id']
    },

    'stock.move.line':{
      'form': ['id', 'move_id', 'state', 'product_id', 'picking_id', 'location_id', 'location_dest_id', 'product_uom_qty', 'lot_id', 'package_id', 'product_qty', 'qty_done', 'result_package_id', 'display_name', 'barcode_dest', 'barcode', 'lot_name', 'ordered_qty', 'need_check', 'need_dest_check', 'original_location_short_name', 'final_location_short_name', 'product_short_name', 'product_barcode', 'product_need_check', 'default_code'],
      'tree': ['id', 'origin', 'name', 'result_package_id', 'move_id', 'product_qty', 'state', 'package_id', 'shipping_type', 'partner_default_shipping_type', 'result_package_shipping_type'],
      'done': ['id', 'qty_done'],
      'partner': ['partner_id', 'partner_default_shipping_type']
    },

    'product.product': {
      'form': ['id', 'default_code', 'barcode', 'product_tmpl_id', 'product_tmpl_name', 'tracking'],
      'tree': ['id', 'default_code', 'barcode']
    },

    'stock.location': {
      'form': ['id', 'complete_name', 'barcode', 'need_dest_check', 'name', 'location_id', 'need_check'],
      'tree': ['need_dest_check'],
      'check': ['need_check']
    },

    'stock.quant': {
      'form': ['id', 'product_id', 'location_id', 'lot_id', 'package_id', 'quantity', 'reserved_quantity', 'product_tracking'],
      'tree': ['id', 'product_id', 'location_id', 'quantity', 'reserved_quantity']
    },

    'stock.quant.package': {
      'form': ['id', 'name', 'mono_product', 'lot_id', 'location_id', 'location_barcode', 'product_id', 'product_short_name', 'product_tracking', 'quant_ids'],
      'tree': ['id', 'name', 'move_line_ids', 'shipping_type', 'delivery_carrier_id', 'partner_default_shipping_type', 'selected_route']
    },

    'stock.inventory': {
      'form': ['name', 'date', 'state', 'location_id', 'filter', 'product_id', 'package_id', 'lot_id', 'category_id', 'line_ids', 'move_ids', 'original_location_short_name', 'original_product_short_name'],
      'tree': ['id', 'name', 'date', 'state']
    },

    'stock.inventory.line': {
      'form': ['inventory_id', 'product_name', 'product_barcode', 'product_default_code', 'location_id', 'package_id', 'prod_lot_id', 'theoretical_qty', 'product_qty', 'original_location_short_name'],
      'tree': ['product_name', 'location_id', 'package_id', 'prodlot_name', 'theoretical_qty', 'product_qty', 'original_location_short_name'],
      'write': ['product_qty']
    },

    'stock.warehouse': {
      'form': ['id', 'name', 'company_id']
    },

    'delivery.carrier': {
      'form': ['id', 'name'],
      'tree': ['id', 'name']
    },

    'stock.location.route': {
      'form': ['id', 'name'],
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

  picking_types         

  constructor(private odooCon: OdooProvider, public alertCtrl: AlertController, public storage: Storage)  {
    console.log('Hello StockProvider Provider');
    this.picking_types = this.get_picking_types([])
  }

  // Picking Types

  init_values(){
    this.get_picking_types()
  }

  get_picking_types(domain=[]){
    let picking_type_domain=[[]]
    let self = this
    if (domain){
      picking_type_domain.push(domain)
      }
    let model = 'stock.picking.type'
    let fields = this.STOCK_FIELDS[model]['form']
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((pt_ids) => {
        this.storage.set('PICKING_TYPES', pt_ids).then(() => {
          this.picking_types = pt_ids
          resolve(pt_ids)
        })
      })
      .catch((err) => {
        this.picking_types = false
        reject(false)
        console.log("Error buscando " + model)
    });
    })
    return promise
  }

  get_current_picking_type(id) {
    let self = this
    let model = 'stock.picking.type'
    let fields = this.STOCK_FIELDS[model]['form']
    let domain = [['id', '=', id]]

    let promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((sp_ids) => {
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

  // New package

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
        self.odooCon.update_lines(model, 'write', valores, move_id).then((sp_ids) => {
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
      self.odooCon.search_read(model, domain, fields, 0, 0).then((data) => {
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

  get_partner_empty_packages(partner_id) {
    let self = this
    let model 
    let values = {
      'dest_partner_id': partner_id
    }
     
    model = 'stock.quant.package'
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.execute(model, 'get_partner_empty_packages', values).then((done) => {
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
        self.odooCon.update_lines(model, 'write', valores, package_id).then((sp_ids) => {
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
      self.odooCon.search_read(model, domain, fields, 0, 0).then((sp_ids) => {
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
      self.odooCon.search_read(model, domain, fields, 0, 0).then((sp_ids) => {
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
      self.odooCon.execute(model, 'get_stock_move_lines_list_apk', values).then((done) => {
       resolve(done)
      })
      .catch((err) => {
        reject(false)
        console.log("Error al validar")
    });
    })
    
    return promise
  }

  get_stock_move_lines_list(domain, type='tree') {
    let self = this
    let model = 'stock.move.line'
    let fields = this.STOCK_FIELDS[model][type]
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((sp_ids) => {
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

  get_move_line_info(id) {
    let self = this
    let domain = [['id', '=', id]]

    let model = 'stock.move.line'
    let fields = this.STOCK_FIELDS[model]['tree']
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((data) => {
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
        self.odooCon.update_lines(model, 'write', valores, move_id).then((sp_ids) => {
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

  // Users list

  get_users_list(domain, type='partner'){
    let self = this
    let model = 'stock.move'
    let fields = this.STOCK_FIELDS[model][type]
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((sp_ids) => {
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


  get_users_list_for_apk(location_dest_id) {
    let self = this
    let model 
    let values = {
      'location_dest_id': location_dest_id
    }
     
    model = 'stock.move'
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
      self.odooCon.search_read(model, domain, fields, 0, 0).then((sp_ids) => {
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

  get_routes(domain) {
    let self = this
    let model = 'stock.location.route'
    let type = 'tree'
    let fields = this.STOCK_FIELDS[model][type]
    let promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((sp_ids) => {
       resolve(sp_ids)
      })
      .catch((err) => {
        reject(false)
        console.log("Error buscando " + model)
    });
    })
    return promise
  }
  
}
