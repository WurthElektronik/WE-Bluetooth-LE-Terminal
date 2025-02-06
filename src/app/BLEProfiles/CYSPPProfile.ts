import { BleCharacteristic, BleClient, BleService } from "@capacitor-community/bluetooth-le";
import { BLEProfileType } from "./BLEProfileType";
import { GeneralBLEProfile } from "./GeneralBLEProfile";

export abstract class CYSPPProfile extends GeneralBLEProfile {

    static getType(): BLEProfileType {
        return BLEProfileType.CYSPP;
    }

    static getTypeString(): string {
        return BLEProfileType[BLEProfileType.CYSPP];
    }

    static getService(): BleService{
        return {
            uuid: "65333333-a115-11e2-9e9a-0800200ca100", // CYSPP Service UUID
            characteristics: [
                {
                    uuid: "65333333-a115-11e2-9e9a-0800200ca101", // CYSPP acknowledged data characteristic UUID
                    properties: {
                        broadcast: false,
                        read: false,
                        writeWithoutResponse: false,
                        write: true,
                        notify: false,
                        indicate: true,
                        authenticatedSignedWrites: false,
                    },
                    descriptors: []
                },
                {
                    uuid: "65333333-a115-11e2-9e9a-0800200ca102", // CYSPP unacknowledged data characteristic UUID
                    properties: {
                        broadcast: false,
                        read: false,
                        writeWithoutResponse: true,
                        write: false,
                        notify: true,
                        indicate: false,
                        authenticatedSignedWrites: false,
                    },
                    descriptors: []
                },
                {
                    uuid: "65333333-a115-11e2-9e9a-0800200ca103", // CYSPP RX flow characteristic UUID
                    properties: {
                        broadcast: false,
                        read: false,
                        writeWithoutResponse: false,
                        write: false,
                        notify: false,
                        indicate: true,
                        authenticatedSignedWrites: false,
                    },
                    descriptors: []
                }
            ]
        }
    }

    static getUnacknowledgedDataRXCharacteristic():BleCharacteristic{
        return this.getService().characteristics[1];
    }

    static getUnacknowledgedDataTXCharacteristic():BleCharacteristic{
        return this.getService().characteristics[1];
    }

    static getAcknowledgedDataRXCharacteristic():BleCharacteristic{
        return this.getService().characteristics[0];
    }

    static getAcknowledgedDataTXCharacteristic():BleCharacteristic{
        return this.getService().characteristics[0];
    }

    static getRXFlowCharacteristic():BleCharacteristic{
        return this.getService().characteristics[2];
    }
    
    static async sendDataUnacknowledged(deviceId: string, packet: DataView)
    {
        await BleClient.writeWithoutResponse(deviceId, this.getService().uuid, this.getUnacknowledgedDataRXCharacteristic().uuid, packet);
    }

    static async startReceiveDataUnacknowledged(deviceId: string, callback: (value: DataView) => void)
    {
        await BleClient.startNotifications(deviceId, this.getService().uuid, this.getUnacknowledgedDataTXCharacteristic().uuid, callback);
    }

    static async stopReceiveDataUnacknowledged(deviceId: string)
    {
        await BleClient.stopNotifications(deviceId, this.getService().uuid, this.getUnacknowledgedDataTXCharacteristic().uuid);
    }

    static async sendDataAcknowledged(deviceId: string, packet: DataView)
    {
        try {
            await BleClient.write(deviceId, this.getService().uuid, this.getAcknowledgedDataRXCharacteristic().uuid, packet);
            
        } catch (error) {
            console.log(error);   
        }
    }

    static async startReceiveDataAcknowledged(deviceId: string, callback: (value: DataView) => void)
    {
        await BleClient.startNotifications(deviceId, this.getService().uuid, this.getAcknowledgedDataTXCharacteristic().uuid, callback);
    }

    static async stopReceiveDataAcknowledged(deviceId: string)
    {
        await BleClient.stopNotifications(deviceId, this.getService().uuid, this.getAcknowledgedDataTXCharacteristic().uuid);
    }

}
