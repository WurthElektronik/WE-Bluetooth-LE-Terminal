const devicesIdList = new Map();

let container = document.getElementById("container") as HTMLElement;
let cancelButton = document.getElementById("cancelButton") as HTMLElement;

window.electronionicbluetooth.onDeviceScanned((devices) => {
	if (devicesIdList.size == 0) {
		container.innerHTML = "";
		container.className = "";
	}
	devices.forEach((device) => {
		if (!devicesIdList.has(device.deviceId)) {
			const listItem = document.createElement("li");
			listItem.className = "device-entry";

			const name = document.createElement("div");
			name.id = "device-name";
			name.className = "device-name";
			name.innerText = device.deviceName || "Unknown Device";

			const id = document.createElement("div");
			id.id = "device-id";
			id.className = "device-id";
			id.innerText = device.deviceId;

			listItem.appendChild(name);
			listItem.appendChild(id);

			listItem.addEventListener("click", () => {
				window.electronionicbluetooth.DeviceSelected(device.deviceId);
			});

			container.appendChild(listItem);
			devicesIdList.set(device.deviceId, listItem);
		} else {
			const listItem = devicesIdList.get(device.deviceId);
			const deviceName = listItem.querySelector("#device-name");

			if (deviceName.innerText == device.deviceName) {
				return;
			}

			listItem.querySelector("#device-name").innerText = device.deviceName;
			container.replaceChild(devicesIdList.get(device.deviceId), listItem);
		}
	});
});
window.electronionicbluetooth.clearScan(() => {
	devicesIdList.clear();
	container.className = "container-warning";
	container.innerHTML =
		'<li class="text-warning">Please make sure Bluetooth is enabled.</li>';
});

cancelButton.onclick = function () {
	window.close();
};
