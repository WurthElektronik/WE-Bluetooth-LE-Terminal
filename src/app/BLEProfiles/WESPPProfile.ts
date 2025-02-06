import { BleCharacteristic, BleClient, BleService } from "@capacitor-community/bluetooth-le";
import { BLEProfileType } from "./BLEProfileType";
import { GeneralBLEProfile } from "./GeneralBLEProfile";

export abstract class WESPPProfile extends GeneralBLEProfile {

    static getType(): BLEProfileType {
        return BLEProfileType.WESPP;
    }

    static getTypeString(): string {
        return BLEProfileType[BLEProfileType.WESPP];
    }

    static getService(): BleService{
        return {
            uuid: "6e400001-c352-11e5-953d-0002a5d5c51b", // WESPP Service UUID
            characteristics: [
                {
                    uuid: "6e400002-c352-11e5-953d-0002a5d5c51b", // WESPP RX characteristic UUID
                    properties: {
                        broadcast: false,
                        read: false,
                        writeWithoutResponse: true,
                        write: true,
                        notify: false,
                        indicate: false,
                        authenticatedSignedWrites: false,
                    },
                    descriptors: []
                },
                {
                    uuid: "6e400003-c352-11e5-953d-0002a5d5c51b", // WESPP TX characteristic UUID
                    properties: {
                        broadcast: false,
                        read: false,
                        writeWithoutResponse: false,
                        write: false,
                        notify: true,
                        indicate: false,
                        authenticatedSignedWrites: false,
                    },
                    descriptors: []
                }
            ]
        }
    }

    static getUnacknowledgedDataRXCharacteristic():BleCharacteristic{
        return this.getService().characteristics[0];
    }

    static getUnacknowledgedDataTXCharacteristic():BleCharacteristic{
        return this.getService().characteristics[1];
    }

    static getAcknowledgedDataRXCharacteristic():BleCharacteristic{
        throw new Error("not implemented.");
    }

    static getAcknowledgedDataTXCharacteristic():BleCharacteristic{
        throw new Error("not implemented.");
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
        throw new Error("not implemented.");
    }

    static async startReceiveDataAcknowledged(deviceId: string, callback: (value: DataView) => void)
    {
        throw new Error("not implemented.");
    }

    static async stopReceiveDataAcknowledged(deviceId: string)
    {
        throw new Error("not implemented.");
    }

}
