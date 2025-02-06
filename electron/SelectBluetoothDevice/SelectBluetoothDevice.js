var devicesIdList = [];

let container = document.getElementById("container");
let cancelButton = document.getElementById("cancelButton");

window.electronionicbluetooth.onDeviceScanned((devices) => {
    if(devicesIdList.length == 0)
    {
        container.innerHTML = '';
    }
    devices.forEach(device => {
        if(!devicesIdList.includes(device.deviceId)){
            const node = document.createElement("div");
            const textnodeName = document.createElement("p");
            const textnodeId = document.createElement("p");
            const seperator = document.createElement("div");
            textnodeName.innerText = device.deviceName;
            textnodeId.innerText = device.deviceId;
            textnodeName.className = "deviceName";
            textnodeId.className = "deviceId";
            seperator.className = "seperator";
            node.appendChild(textnodeName);
            node.appendChild(textnodeId);
            node.appendChild(seperator);
            node.addEventListener("click", (e) => {window.electronionicbluetooth.DeviceSelected(device.deviceId);});
            container.appendChild(node);
            devicesIdList.push(device.deviceId);
        }
    });
});
window.electronionicbluetooth.clearScan(() => {
    devicesIdList = [];
    container.innerHTML = 'Please make sure bluetooth is enabled';
});

cancelButton.onclick = function() {
    window.close();
}
