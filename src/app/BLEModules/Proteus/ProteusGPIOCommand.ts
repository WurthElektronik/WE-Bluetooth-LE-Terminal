export enum ProteusGPIOCommand {
    CMD_GPIO_REMOTE_READCONFIG_REQ = 0x2C,
    CMD_GPIO_REMOTE_READCONFIG_CNF = 0x6C,
    CMD_GPIO_REMOTE_WRITECONFIG_REQ = 0x28,
    CMD_GPIO_REMOTE_WRITECONFIG_CNF = 0x68,
    CMD_GPIO_REMOTE_READ_REQ = 0x2A,
    CMD_GPIO_REMOTE_READ_CNF = 0x6A,
    CMD_GPIO_REMOTE_WRITE_REQ = 0x29,
    CMD_GPIO_REMOTE_WRITE_CNF = 0x69,
    CMD_GPIO_LOCAL_WRITE_IND = 0xA6
}