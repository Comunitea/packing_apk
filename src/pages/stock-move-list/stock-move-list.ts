import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ActionSheetController, AlertController } from 'ionic-angular';
import { StockProvider } from '../../providers/stock/stock'
import { Storage } from '@ionic/storage';
import { FormGroup } from '@angular/forms'; 
import { Subscription } from 'rxjs';
import { DragulaService } from 'ng2-dragula';
import { TooltipsModule } from 'ionic-tooltips';

/**
 * Generated class for the StockMoveListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'stock-move-list',
  templateUrl: 'stock-move-list.html',
})
export class StockMoveListPage {
  
  full_stock_moves: any
  ScanReader: FormGroup;
  default_warehouse: any
  move_state_filter: any
  move_status: any
  current_stock_moves: any
  owner_id: any
  users_list: any
  full_users_list: any
  filtered_users_ids: any
  current_pkg_info: any
  current_partner_pkg_list: any
  current_partner_arrival_pkgs_list: any
  current_selected_pkg: any
  current_selected_partner: any
  filtered_pkg_list: any
  filtered_arrival_pkg_list: any
  selected_partner_name: any
  selected_pkg_default_shipping: any
  selected_pkg_selected_shipping: any
  selected_pkg_delivery_carrier_id: any
  selected_pkg_selected_route_id: any
  selected_pkg_current_shipping_type: any
  passed_shipping_type: any
  passed_selected_partner: any
  passed_selected_pkg: any
  current_list_shown: any
  selected_partner_default_shipping_type: any
  full_line_ids: any
  current_shipping_type: any
  selected_line_default_shipping: any
  selected_line_selected_shipping: any
  current_pkg_data: any
  multipleSelectionMain: boolean
  subs = new Subscription();

  constructor(public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController, public dragulaService: DragulaService,
     public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, private storage: Storage,
      private stockInfo: StockProvider, private changeDetectorRef: ChangeDetectorRef) {
        this.move_state_filter = 0
        this.multipleSelectionMain = false;
        this.passed_selected_partner = this.navParams.data.current_selected_partner
        this.passed_selected_pkg = this.navParams.data.current_selected_pkg
        this.passed_shipping_type = this.navParams.data.current_shipping_type
        this.move_status = []
        this.users_list = []
        this.full_users_list = []
        this.filtered_users_ids = []
        this.current_pkg_info = []
        this.current_partner_pkg_list = []
        this.current_selected_pkg = []
        this.filtered_pkg_list = []
        this.full_line_ids = []
        this.current_selected_partner = []
        this.selected_pkg_current_shipping_type = false
        this.selected_partner_name = false
        this.selected_pkg_default_shipping = false
        this.selected_pkg_selected_shipping = false
        this.selected_pkg_delivery_carrier_id = false
        this.selected_pkg_selected_route_id = false
        this.current_list_shown = false
        this.selected_partner_default_shipping_type = false
        this.current_shipping_type = false
        this.current_partner_arrival_pkgs_list = []
        this.filtered_arrival_pkg_list = []
        this.selected_line_default_shipping = []
        this.selected_line_selected_shipping = []
        this.current_pkg_data = []
        this.move_status[0] = {
          'id': 0,
          'code': 'assigned',
          'name': 'Reservado',
          'index': 0
        }
        this.get_owner_id()

        // Dragula //

        this.subs.add(this.dragulaService.dropModel()
          .subscribe(({ el, target, source }) => {
            if (target.id == "pkgs" && source.id == "lines") {
              this.create_new_package(parseInt(el.id))
            } else if (target.id == "pkgs_info" && source.id == "lines") {
              this.add_product_to_package(parseInt(el.id))
            } else if (target.id == "pkgs_info" && source.id == "arrival_pkgs") {
              this.add_package_content_to_package(parseInt(el.id))
            } 
          })
        );

        this.subs.add(this.dragulaService.removeModel()
          .subscribe(({ el, source }) => {
            /* if (source.id == "pkgs") {
              this.showDestroyConfirmation(parseInt(el.id))
            } else */ if (source.id == "pkgs_info") {
              this.remove_product_from_pkg(parseInt(el.id))
            } else if (source.id == "lines" || source.id == "arrival_pkgs") {
              this.reload_with_data(this.current_selected_partner, this.current_selected_pkg);
            }
          })
        );

        dragulaService.destroy("move_lines_container");

        dragulaService.createGroup("move_lines_container", {
          removeOnSpill: false,
          revertOnSpill: true,
          accepts: (el, target, source, sibling) => {
            // Para que no se puedan arrastrar otras líneas al contenedor.
            if(source.id == 'lines' && target.id == 'pkgs'){
              return true;
            } else if (source.id == 'lines' && this.current_selected_pkg && target.id == 'pkgs_info'){
              return true;
            } else if (source.id == 'arrival_pkgs' && this.current_selected_pkg && target.id == 'pkgs_info') {
              return true;
            } 
          }
        });
        
  }

  showDestroyConfirmation(package_id) {
    const confirm = this.alertCtrl.create({
      title: 'Eliminar paquete',
      message: 'Estás a punto de eliminar el paquete seleccionado, ¿deseas continuar?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            this.reload_with_data(this.current_selected_partner, this.current_selected_pkg);
          }
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.remove_pkg(package_id);
          }
        }
      ]
    });
    confirm.present();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad StockMoveListPage');
  }

  get_selected_warehouse(){
    this.storage.get('wh_output_stock_loc_id').then((val) => {
      this.default_warehouse = val
      this.get_users_list_apk()
      /* this.get_users_list() */
    })
  }

  get_owner_id(){
    this.storage.get('USER').then((val) => {
      this.owner_id = val
      this.get_selected_warehouse()
    })
  }

  get_users_list_apk() {
    this.stockInfo.get_users_list_for_apk(this.default_warehouse).then((lines:Array<{}>) => {
      this.users_list = lines
      if(this.passed_selected_partner) {
        this.get_partner_move_lines_apk(this.passed_selected_partner, this.passed_selected_pkg)
        if (this.passed_shipping_type) {
          this.current_shipping_type = this.passed_shipping_type
        }
      }
      this.changeDetectorRef.detectChanges()
      this.full_users_list = lines
      return this.users_list
    })
  }

  filter_users_list(ev: any) {

    this.users_list = this.full_users_list

    let val = ev.target.value;

    if(val && val.trim() != '') {
      this.users_list = this.users_list.filter((user) => {
        return (user[1].toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }

    this.changeDetectorRef.detectChanges()

  }

  get_user_name(partner_id) {
    let selected_partner = this.users_list.filter(x => x['id'] == partner_id)
    this.selected_partner_name = selected_partner[0]['name']
    this.selected_partner_default_shipping_type = selected_partner[0]['shipping_type'] || 'pasaran'
    this.changeDetectorRef.detectChanges()
  }

  get_partner_move_lines_apk(partner_id, current_selected_pkg=false) {
    this.current_selected_partner = partner_id
    this.current_selected_pkg = current_selected_pkg
    this.get_user_name(this.current_selected_partner)
    this.show_shipping_type('all')

    this.stockInfo.get_stock_move_lines_list_apk(partner_id, this.default_warehouse).then((lines:Array<{}>) => {
      this.multipleSelectionMain = false;
      this.full_stock_moves = []
      this.filtered_arrival_pkg_list = []
      this.current_partner_pkg_list = []
      this.current_partner_arrival_pkgs_list = []
      this.selected_pkg_default_shipping = false
      this.selected_pkg_selected_shipping = false
      this.selected_pkg_delivery_carrier_id = false
      this.selected_pkg_selected_route_id = false
      this.selected_pkg_current_shipping_type = false
      this.filtered_pkg_list = []
      
      this.current_partner_pkg_list = lines['result_package_ids']
      this.full_stock_moves = lines['move_lines']
      this.current_partner_arrival_pkgs_list = lines['arrival_package_ids']
    }).catch((mierror) => {
      this.full_stock_moves = []
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror + mierror)
      console.log(mierror)
    })
    this.current_list_shown = 'move_list'
    if(this.current_selected_pkg != false){
      this.open_package(this.current_selected_pkg)
    }
  }

  show_partner_move_lines() {
    this.current_list_shown = 'move_list'
    this.changeDetectorRef.detectChanges()
  }

  show_partner_packages_arrivals() {
    this.current_list_shown = 'package_list'
    this.changeDetectorRef.detectChanges()
  }

  show_shipping_type(shipping_type, front=false) {
    this.current_shipping_type = shipping_type
    if (front==true) {
      this.current_selected_pkg = false
    }
    this.changeDetectorRef.detectChanges()
  }

  moves_filter_by_assigned_pkgs(value) {
    if (value == 0){
      this.current_list_shown = 'filtered_unassigned'
    } else {
      this.current_list_shown = 'filtered_assigned'
    }
    this.changeDetectorRef.detectChanges()
  }

  create_new_package(move_id) {
    this.stockInfo.create_new_package_from_move(move_id, this.current_selected_partner).then((linea:Array<{}>) => {
      console.log(linea)
      this.current_selected_pkg = linea
      this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, this.current_shipping_type)
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner)
      console.log(mierror)
    })
  }

  create_new_package_for_partner(shipping_type=this.current_shipping_type) {
      this.stockInfo.create_new_package('stock.quant.package', this.current_selected_partner, shipping_type).then((linea:Array<{}>) => {
        this.current_selected_pkg = linea
        this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, this.current_shipping_type)
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, false, this.current_shipping_type)
      console.log(mierror)
    })
  }

  add_product_to_package(move_id, reload=true) {
    this.stockInfo.add_package_id_to_line(move_id, this.current_selected_pkg, false).then((resultado:Array<{}>) => {
      if (reload == true) {
        this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, this.current_shipping_type)
      }
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      if (reload == true) {
        this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, this.current_shipping_type)
      }
      console.log(mierror)
    })
  }

  add_package_content_to_package(package_id) {   

    let arrival_package_moves = this.full_stock_moves

    if(package_id) {
      arrival_package_moves = arrival_package_moves.filter(x => x['package_id'][0] == package_id)
    }
    arrival_package_moves.forEach(package_move => {
      this.add_product_to_package(package_move['id'], false)
    });

    this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, this.current_shipping_type)

  }

  open_package(package_id) {
    this.current_selected_pkg = package_id
    this.changeDetectorRef.detectChanges()
    this.stockInfo.get_package_lines(package_id).then((lineas:Array<{}>)=> {
      this.current_pkg_info = lineas['move_lines_info']
      this.current_pkg_data = lineas['package_info']
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, false, this.current_shipping_type)
      console.log(mierror)
    })
    this.stockInfo.get_package_info(package_id).then((lineas:Array<{}>) => {
      let current_shipping_selection = lineas[0]['shipping_type'] || lineas[0]['partner_default_shipping_type']
      if (current_shipping_selection == 'pasaran') {
        this.selected_pkg_current_shipping_type = "Pasarán"
      } else if(current_shipping_selection == 'agency' && lineas[0]['delivery_carrier_id']) {
        this.selected_pkg_current_shipping_type = lineas[0]['delivery_carrier_id'][1] || false
      } else if (current_shipping_selection == 'route' && lineas[0]['selected_route']) {
        this.selected_pkg_current_shipping_type = lineas[0]['selected_route'][1] || false
      }
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, false, this.current_shipping_type)
      console.log(mierror)
    })
    this.changeDetectorRef.detectChanges()
  }

  // Shipping type
  show_shipping_options(package_id) {
    this.stockInfo.get_package_info(package_id).then((lineas:Array<{}>) => {
      this.selected_pkg_default_shipping = lineas[0]['partner_default_shipping_type'] || false
      this.selected_pkg_selected_shipping = lineas[0]['shipping_type'] || false
      this.selected_pkg_delivery_carrier_id = lineas[0]['delivery_carrier_id'] || false
      this.selected_pkg_selected_route_id = lineas[0]['selected_route'] || false

      this.presentShippingSheet(package_id)
      this.changeDetectorRef.detectChanges()
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, false, this.current_shipping_type)
      console.log(mierror)
    })
  }

  show_shipping_options_line(line_id) {
    this.stockInfo.get_move_line_info(line_id).then((linea:Array<{}>)=> {
      this.selected_line_default_shipping = linea[0]['partner_default_shipping_type'] || false
      this.selected_line_selected_shipping = linea[0]['shipping_type']

      if (!linea[0]['result_package_id']) {
        this.presentShippingSheet(line_id, 'line')
        this.changeDetectorRef.detectChanges()
      }
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, false, this.current_shipping_type)
      console.log(mierror)
    })
  }

  presentShippingSheet(package_id, type='pkg') {

    let buttons_list_shipping = []

    let shipping_type = this.create_shipping_type_button(package_id, 'Pasarán', 'pasaran', type)
    buttons_list_shipping.push(shipping_type)
    shipping_type = this.create_shipping_type_button(package_id, 'Agencia', 'agency', type)
    buttons_list_shipping.push(shipping_type)
    shipping_type = this.create_shipping_type_button(package_id, 'Ruta', 'route', type)
    buttons_list_shipping.push(shipping_type)

    const actionSheet = this.actionSheetCtrl.create({
      title: 'Selecciona el método de envío',
      buttons: buttons_list_shipping,
      'cssClass': 'actionSheetContainer'
    });
    this.changeDetectorRef.detectChanges()
    actionSheet.present();
  }

  create_shipping_type_button(package_id, text, role, type) {

    let shipping_type_button = {
      'text': text,
      'role': role,
      handler: () => {
        let valores = {
          'package': package_id,
          'shipping_type': role
        }
        this.set_shipping_type(package_id, valores, role, type)
      },
      'cssClass': 'actionSheetButton'
    }

    if (this.selected_pkg_selected_shipping == role || this.selected_line_selected_shipping == role) {
      shipping_type_button['cssClass'] += ' selected'
      shipping_type_button['text'] = shipping_type_button['text']
    } 
    
    this.changeDetectorRef.detectChanges()
    return shipping_type_button

  }

  set_shipping_type(package_id, valores, role, type) {
    if (type=='pkg') {
      this.stockInfo.set_package_shipping_type(valores).then((resultado:Array<{}>) => {
        if(role == 'pasaran'){
          this.reload_with_data(this.current_selected_partner, package_id, role)
        } else if(role == 'agency') {
          this.reload_with_data(this.current_selected_partner, package_id, role)
          //this.show_delivery_carriers(package_id)
        } else if (role == 'route') {
          // Descomentar show_route para dejar elegir rutas y comentar el reload_with_data. Falta el valor selected_route en stock.quant.package, preguntar a Kiko  si lo metemos.
          this.reload_with_data(this.current_selected_partner, package_id, role)
          //this.show_route_options(package_id)
        }
        this.changeDetectorRef.detectChanges()
      }).catch((mierror) => {
        //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
        this.reload_with_data(this.current_selected_partner, false, this.current_shipping_type)
        console.log(mierror)
      })
    } else if (type=='line') {
      this.stockInfo.set_move_line_info(package_id, valores).then((resultado:Array<{}>) => {
        this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, role)
        this.changeDetectorRef.detectChanges()
      }).catch((mierror) => {
        //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
        this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, role)
        console.log(mierror)
      })
    }
    
  }

  // Routes

  show_route_options(package_id) {
    this.stockInfo.get_routes_for_apk().then((lineas:Array<{}>) => {
      this.presentRoutesSheet(package_id, lineas)
      this.changeDetectorRef.detectChanges()
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, false, this.current_shipping_type)
      console.log(mierror)
    })
  }

  presentRoutesSheet(package_id, routes) {
    
    let buttons_list_routes = []

    routes.forEach(route => {
        let route_button = {
          'text': route['name'],
          'role': route['id'],
          handler: () => {
            let valores = {
              'selected_route': route['id']
            }
            this.set_shipping_route(package_id, valores)
          },
          'cssClass': 'actionSheetButton'
        }
        
        if (this.selected_pkg_selected_route_id && this.selected_pkg_selected_route_id[0] == route['id']) {
          route_button['cssClass'] += ' selected'
          route_button['text'] = '[x]' + route_button['text']
        }
        buttons_list_routes.push(route_button)
        this.changeDetectorRef.detectChanges()
    });

    const actionSheet = this.actionSheetCtrl.create({
      title: 'Selecciona el método de envío',
      buttons: buttons_list_routes,
      'cssClass': 'actionSheetContainer'
    })

    this.changeDetectorRef.detectChanges()
    actionSheet.present();
  }

  set_shipping_route(package_id, valores) {
    this.stockInfo.set_package_info(package_id, valores).then((resultado:Array<{}>) => {
      this.reload_with_data(this.current_selected_partner, package_id)
      this.changeDetectorRef.detectChanges()
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, package_id)
      console.log(mierror)
    })
  }

  // Delivery carriers

  show_delivery_carriers(package_id) {
    let domain = [['active', '=', true], ['company_id', '=', this.default_warehouse]]
    this.stockInfo.get_delivery_carriers(domain).then((lineas:Array<{}>) => {
      this.presentActionSheet(package_id, lineas)
      this.changeDetectorRef.detectChanges()
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, package_id)
      console.log(mierror)
    })
  }

  presentActionSheet(package_id, delivery_carriers) {

    let buttons_list = []

    delivery_carriers.forEach(carrier => {
        let carrier_button = {
          'text': carrier['name'],
          'role': carrier['id'],
          handler: () => {
            let valores = {
              'delivery_carrier_id': carrier['id']
            }
            this.set_delivery_carrier(package_id, valores)
          },
          'cssClass': 'actionSheetButton'
        }
        if (this.selected_pkg_delivery_carrier_id && this.selected_pkg_delivery_carrier_id[0] == carrier['id']) {
          carrier_button['cssClass'] += ' selected'
          carrier_button['text'] = '[x]' + carrier_button['text']
        }
        buttons_list.push(carrier_button)
    });

    const actionSheet = this.actionSheetCtrl.create({
      title: 'Selecciona el método de envío',
      buttons: buttons_list,
      'cssClass': 'actionSheetContainer'
    });
    this.changeDetectorRef.detectChanges()
    actionSheet.present();
  }

  set_delivery_carrier(package_id, valores) {
    this.stockInfo.set_package_info(package_id, valores).then((resultado:Array<{}>) => {
      this.reload_with_data(this.current_selected_partner, package_id)
      this.changeDetectorRef.detectChanges()
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, package_id)
      console.log(mierror)
    })
  }

  // Package

  remove_pkg(pkg_id) {
    this.stockInfo.delete_package(pkg_id).then((resultado:Array<{}>) => {
      this.reload_with_data(this.current_selected_partner, false, this.current_shipping_type)
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, false, this.current_shipping_type)
      console.log(mierror)
    })
  }  

  remove_product_from_pkg(move_id) {
    this.stockInfo.add_package_id_to_line(move_id, null).then((resultado:Array<{}>) => {
      this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, this.current_shipping_type)
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, this.current_shipping_type)
      console.log(mierror)
    })
  }

  // Reload

  reload_with_data(current_selected_partner, current_selected_pkg=false, current_shipping_type=false){
    let val = {'current_selected_partner': current_selected_partner, 'current_selected_pkg': current_selected_pkg, 'current_shipping_type': current_shipping_type}
    this.navCtrl.setRoot(StockMoveListPage, val)    
  }

  // Checkboxes selection

  multipleSelection(event) {
    let checkeableItems = this.full_stock_moves.filter(x => x['isChecked'] == !event.checked && x['result_package_id'] == false)
    checkeableItems.forEach(item => {
      item.isChecked = event.checked;
    });
    this.changeDetectorRef.detectChanges()
  }

  simpleSelection(event, id) {
    let item = this.full_stock_moves.filter(x => x['id'] == id)
    item.isChecked = event.checked;
    this.changeDetectorRef.detectChanges()
  }

  add_multiple_lines_to_package() {
    let selectedItems = this.full_stock_moves.filter(x => x['isChecked'] == true);
    selectedItems.forEach(item => {
      this.add_product_to_package(item.id, false);
    });

    this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, this.current_shipping_type);
    this.changeDetectorRef.detectChanges();
    
  }
}