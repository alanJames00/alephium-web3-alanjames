/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/
import { ArrayCodec } from './array-codec'
import { compactInt32Codec, i256Codec, u256Codec } from './compact-int-codec'
import { boolCodec, Codec, EnumCodec, FixedSizeCodec, ObjectCodec } from './codec'
import { Script, scriptCodec } from './script-codec'
import { ByteString, byteStringCodec } from './bytestring-codec'
import { LockupScript, lockupScriptCodec } from './lockup-script-codec'

export type Val =
  | { type: 'Bool'; value: boolean }
  | { type: 'I256'; value: bigint }
  | { type: 'U256'; value: bigint }
  | { type: 'ByteVec'; value: ByteString }
  | { type: 'Address'; value: LockupScript }

const valCodec = new EnumCodec<Val>('val', {
  Bool: boolCodec,
  I256: i256Codec,
  U256: u256Codec,
  ByteVec: byteStringCodec,
  Address: lockupScriptCodec
})
const valsCodec = new ArrayCodec(valCodec)

export type P2PKH = Uint8Array
export interface KeyWithIndex {
  publicKey: P2PKH
  index: number
}
export type P2MPKH = KeyWithIndex[]
export interface P2SH {
  script: Script
  params: Val[]
}
export type SameAsPrevious = 'SameAsPrevious'

export type UnlockScript =
  | { type: 'P2PKH'; value: P2PKH }
  | { type: 'P2MPKH'; value: P2MPKH }
  | { type: 'P2SH'; value: P2SH }
  | { type: 'SameAsPrevious'; value: SameAsPrevious }

const p2pkhCodec = new FixedSizeCodec(33)
const keyWithIndexCodec = new ObjectCodec<KeyWithIndex>({
  publicKey: p2pkhCodec,
  index: compactInt32Codec
})
const p2mpkhCodec: Codec<P2MPKH> = new ArrayCodec(keyWithIndexCodec)
const p2shCodec = new ObjectCodec<P2SH>({
  script: scriptCodec,
  params: valsCodec
})
const sameAsPreviousCodec = new (class extends Codec<SameAsPrevious> {
  encode(): Uint8Array {
    return new Uint8Array([])
  }
  _decode(): SameAsPrevious {
    return 'SameAsPrevious'
  }
})()

export const unlockScriptCodec = new EnumCodec<UnlockScript>('unlock script', {
  P2PKH: p2pkhCodec,
  P2MPKH: p2mpkhCodec,
  P2SH: p2shCodec,
  SameAsPrevious: sameAsPreviousCodec
})
