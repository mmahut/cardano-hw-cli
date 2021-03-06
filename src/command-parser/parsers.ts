import { HARDENED_THRESHOLD } from '../constants'
import { isBIP32Path, isHwSigningData, isTxBodyData } from '../guards'
import {
  BIP32Path,
  HwSigningData, HwSigningType, TxBodyData,
} from '../types'

const fs = require('fs')

export const parsePath = (
  path: string,
): BIP32Path => {
  const parsedPath = path
    .split('/')
    .map((arg) => (arg.endsWith('H')
      ? parseInt(arg.slice(0, -1), 10) + HARDENED_THRESHOLD
      : parseInt(arg, 10)))
  if (isBIP32Path(parsedPath)) return parsedPath
  throw new Error('Invalid path')
}

export const parseFileTypeMagic = (fileTypeMagic: string, path: string) => {
  if (fileTypeMagic.startsWith('Payment')) {
    return HwSigningType.Payment
  }

  if (fileTypeMagic.startsWith('Stake')) {
    return HwSigningType.Stake
  }
  throw new Error(`Invalid file type of hw-signing-file at ${path}`)
}

export const parseHwSigningFile = (path: string): HwSigningData => {
  const data = JSON.parse(fs.readFileSync(path, 'utf8'))
  data.path = parsePath(data.path)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type: fileTypeMagic, description, ...parsedData } = data

  const result = { type: parseFileTypeMagic(fileTypeMagic, path), ...parsedData }
  if (isHwSigningData(result)) {
    return result
  }
  throw new Error(`Invalid file contents of hw-signing-file at ${path}'`)
}

export const parseTxBodyFile = (path: string): TxBodyData => {
  const data = JSON.parse(fs.readFileSync(path, 'utf8'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type, description, ...parsedData } = data
  if (isTxBodyData(parsedData)) {
    return parsedData
  }
  throw new Error(`Invalid file contents of tx-body-file at ${path}'`)
}
