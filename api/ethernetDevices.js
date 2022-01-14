////////////////////////////////////////////////////////////////////
// Ethernet Devices
////////////////////////////////////////////////////////////////////

const EthernetDevices = function(deviceData) {
    this._data = deviceData;
};

Object.defineProperty(EthernetDevices.prototype, "data", {
    get() {
        return this._data;
    }
});

EthernetDevices.update = async function(){
    const deviceData = [];
    try{
        let ethIPDevices = await RWS.CFG.getInstances('EIO', 'ETHERNETIP_DEVICE');
        for(let device of ethIPDevices){
            deviceData.push({device : device.getInstanceName(), signals : []});
        }
        let eioSignals = await RWS.CFG.getInstances('EIO', 'EIO_SIGNAL');
        for(const signal of eioSignals){
            let attr = signal.getAttributes();
            for(let item of deviceData){
                (attr.Device === item.device) && item.signals.push({name:attr.Name,type:attr.SignalType,device:attr.Device,map:attr.DeviceMap});
            }
        }
        // console.log(deviceData);
        return deviceData;
    } catch (e) {
        console.error(e);
        FPComponents.Popup_A.message(`ethDevices --Exception occurs:`, [e.message, `Code: ${e.controllerStatus.code}`, e.controllerStatus.description]);
        return undefined;
    }
};

EthernetDevices.prototype.updateData = async function(){
    this._data = await ethDevices.update();
};

EthernetDevices.create = async function(){
    return new EthernetDevices(await EthernetDevices.update());
};   



// (async function () { 
//     a = await EthernetDevices.create();
//     b = await EthernetDevices.create();
//     // console.log(a.data);
//     // console.log(b.data);

//     a._data[0].device = 'TEST';

//     console.log(a.data[0].device);
//     console.log(b.data[0].device);
// })();

