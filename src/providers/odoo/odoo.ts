import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

/*
  Generated class for the OdooProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
declare let OdooApi: any;

@Injectable()
export class OdooProvider {

    context;
    uid;

    constructor(public storage: Storage) {
      this.context = {'lang': 'es_ES'}
      this.uid = 0
    }

    login(user, password){
        let self = this
        let promise = new Promise( (resolve, reject) => {
            self.storage.get('CONEXION').then((con_data) => {
                let odoo = new OdooApi(con_data.url, con_data.db);
                // this.navCtrl.setRoot(HomePage, {borrar: true, login: null});
                if (con_data == null) {
                    let err = {'title': 'Error!', 'msg': 'No hay datos para establecer la conexión'}
                    reject(err);
                } else {
                    
                    odoo.login(con_data.username, con_data.password).then((uid) => {
                      con_data['uid'] = uid
                      this.storage.set('CONEXION', con_data).then(() => {
                        self.uid = uid
                        resolve(uid)
                      })
                    
                    })
                    .catch( (mierror) => {
                      let err = {'title': 'Error!', 'msg': 'No se pudo conectar con Odoo'}
                      reject(err);
                    });
                }
            });
        });
        return promise
    }

    search_read (model, domain, fields, offset = 0, limit = 0, order = ''){
        let promise = new Promise( (resolve, reject) => {
            this.storage.get('CONEXION').then((con_data) => {
                if (con_data == null) {
                    let err = {'title': 'Error!', 'msg': 'No hay datos para establecer la conexión'}
                    reject(err);
                } else {
                    let odoo = new OdooApi(con_data.url, con_data.db, con_data);
                    odoo.search_read(model, domain, fields, offset, limit, order).then((res) => {
                        resolve(res);
                    })
                    .catch( () => {
                        let err = {'title': 'Error!', 'msg': 'Fallo al llamar al hacer search_read'}
                        reject(err);
                    });
                }
            });
        });
        return promise
    }

    execute(model, method, values) {
        console.log(values)
        let self = this
        let promise = new Promise( (resolve, reject) => {
            self.storage.get('CONEXION').then((con_data) => {
                let odoo = new OdooApi(con_data.url, con_data.db);
                odoo.context = self.context
                if (con_data == null) {
                    let err = {'title': 'Error!', 'msg': 'No hay datos para establecer la conexión'}
                    reject(err);
                }
            		else {
                    odoo.login(con_data.username, con_data.password).then((uid) => {
                            odoo.call(model, method, values).then((res) => {
                                resolve(res);
                            })
                            .catch( (error) => {
                                console.log(error)
                                let err = {'title': 'Error!', 'msg': 'Fallo al llamar al método ' + method + ' del modelo app.regustry'}
                                reject(err);
                            });
                    })
                    .catch( () => {
                        let err = {'title': 'Error!', 'msg': 'No se pudo conectar con Odoo'}
                        reject(err);
                    });
                }
            });
        });
        return promise
    }

    update_lines(model, method, values, domain) {
        let self = this
        let promise = new Promise( (resolve, reject) => {
            self.storage.get('CONEXION').then((con_data) => {
                let odoo = new OdooApi(con_data.url, con_data.db);
                odoo.context = self.context
                if (con_data == null) {
                    let err = {'title': 'Error!', 'msg': 'No hay datos para establecer la conexión'}
                    reject(err);
                }
            		else {
                    odoo.login(con_data.username, con_data.password).then((uid) => {
                            odoo.write(model, domain, values).then((res) => {
                                resolve(res);
                            })
                            .catch( () => {
                                let err = {'title': 'Error!', 'msg': 'Fallo al llamar al método ' + method + ' del modelo app.registry'}
                                reject(err);
                            });
                    })
                    .catch( () => {
                        let err = {'title': 'Error!', 'msg': 'No se pudo conectar con Odoo'}
                        reject(err);
                    });
                }
            });
        });
        return promise
    }

    quants_pda_check(model, method, values) {
        let self = this
        let promise = new Promise( (resolve, reject) => {
            self.storage.get('CONEXION').then((con_data) => {
                let odoo = new OdooApi(con_data.url, con_data.db);
                odoo.context = self.context
                if (con_data == null) {
                    let err = {'title': 'Error!', 'msg': 'No hay datos para establecer la conexión'}
                    reject(err);
                }
            		else {
                    odoo.login(con_data.username, con_data.password).then((uid) => {
                            odoo.call(model, method, values).then((res) => {
                                resolve(res);
                            })
                            .catch( (error) => {
                                console.log(error)
                                let err = {'title': 'Error!', 'msg': 'Fallo al llamar al método ' + method + 'del modelo app.regustry'}
                                reject(err);
                            });
                    })
                    .catch( () => {
                        let err = {'title': 'Error!', 'msg': 'No se pudo conectar con Odoo'}
                        reject(err);
                    });
                }
            });
        });
        return promise
    }

    new_package(model, values) {
        let self = this
        let promise = new Promise( (resolve, reject) => {
            self.storage.get('CONEXION').then((con_data) => {
                let odoo = new OdooApi(con_data.url, con_data.db);
                odoo.context = self.context
                if (con_data == null) {
                    let err = {'title': 'Error!', 'msg': 'No hay datos para establecer la conexión'}
                    reject(err);
                }
            		else {
                    odoo.login(con_data.username, con_data.password).then((uid) => {
                            odoo.create(model, values).then((res) => {
                                resolve(res);
                            })
                            .catch( (error) => {
                                console.log(error)
                                let err = {'title': 'Error!', 'msg': 'Fallo al llamar al método'}
                                reject(err);
                            });
                    })
                    .catch( () => {
                        let err = {'title': 'Error!', 'msg': 'No se pudo conectar con Odoo'}
                        reject(err);
                    });
                }
            });
        });
        return promise
    }
}
