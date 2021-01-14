// Copyright (c) 2020, NVIDIA CORPORATION.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Int32Buffer, setDefaultAllocator, Uint8Buffer} from '@nvidia/cuda';
import {Bool8, DataFrame, Int32, Series} from '@nvidia/cudf';
import {CudaMemoryResource, DeviceBuffer} from '@nvidia/rmm';

const mr = new CudaMemoryResource();

setDefaultAllocator((byteLength: number) => new DeviceBuffer(byteLength, mr));

test('DataFrame initialization', () => {
  const length = 100;
  const col_0  = new Series({type: new Int32(), data: new Int32Buffer(length)});

  const col_1   = new Series({
    type: new Bool8(),
    data: new Uint8Buffer(length),
    nullMask: new Uint8Buffer(64),
  });
  const table_0 = new DataFrame({"col_0": col_0, "col_1": col_1});
  expect(table_0.numColumns).toBe(2);
  expect(table_0.numRows).toBe(length);
  expect(table_0.names).toStrictEqual(['col_0', 'col_1']);
  expect(table_0.get("col_0").type.id).toBe(col_0.type.id);
  expect(table_0.get("col_1").type.id).toBe(col_1.type.id);
});

test('DataFrame.get', () => {
  const length = 100;
  const col_0  = new Series({type: new Int32(), data: new Int32Buffer(length)});

  const col_1   = new Series({
    type: new Bool8(),
    data: new Uint8Buffer(length),
    nullMask: new Uint8Buffer(64),
  });
  const table_0 = new DataFrame({"col_0": col_0, "col_1": col_1});
  expect(table_0.get("col_0").type.id).toBe(col_0.type.id);
  expect(() => { (<any>table_0).get(2); }).toThrow();
  expect(() => { (<any>table_0).get("junk"); }).toThrow();
});

test('DataFrame.select', () => {
  const length = 100;
  const col_0  = new Series({type: new Int32(), data: new Int32Buffer(length)});

  const col_1 = new Series({
    type: new Bool8(),
    data: new Uint8Buffer(length),
    nullMask: new Uint8Buffer(64),
  });

  const col_2 = new Series({type: new Int32(), data: new Int32Buffer(length)});
  const col_3 = new Series({type: new Int32(), data: new Int32Buffer(length)});

  const table_0 = new DataFrame({"col_0": col_0, "col_1": col_1, "col_2": col_2, "col_3": col_3});

  expect(table_0.numColumns).toBe(4);
  expect(table_0.numRows).toBe(length);
  expect(table_0.names).toStrictEqual(["col_0", "col_1", "col_2", "col_3"]);

  expect(table_0.select(["col_0"])).toStrictEqual(new DataFrame({"col_0": col_0}));
  expect(table_0.select(["col_0", "col_3"]))
    .toStrictEqual(new DataFrame({"col_0": col_0, "col_3": col_3}));
});

test('DataFrame.assign', () => {
  const length = 100;
  const col_0  = new Series({type: new Int32(), data: new Int32Buffer(length)});

  const col_1 = new Series({
    type: new Bool8(),
    data: new Uint8Buffer(length),
    nullMask: new Uint8Buffer(64),
  });

  const col_2 = new Series({type: new Int32(), data: new Int32Buffer(length)});
  const col_3 = new Series({type: new Int32(), data: new Int32Buffer(length)});

  const table_0 = new DataFrame({"col_0": col_0, "col_1": col_1, "col_2": col_2});

  const table_1 = table_0.assign({"col_3": col_3});
  expect(table_1.numColumns).toBe(4);
  expect(table_1.numRows).toBe(length);
  expect(table_1.names).toStrictEqual(["col_0", "col_1", "col_2", "col_3"]);
});

test('DataFrame.drop', () => {
  const length = 100;
  const col_0  = new Series({type: new Int32(), data: new Int32Buffer(length)});

  const col_1 = new Series({
    type: new Bool8(),
    data: new Uint8Buffer(length),
    nullMask: new Uint8Buffer(64),
  });

  const col_2 = new Series({type: new Int32(), data: new Int32Buffer(length)});

  const table_0 = new DataFrame({"col_0": col_0, "col_1": col_1, "col_2": col_2});

  const table_1 = table_0.drop(["col_1"]);
  expect(table_1.numColumns).toBe(2);
  expect(table_1.numRows).toBe(length);
  expect(table_1.names).toStrictEqual(["col_0", "col_2"]);
});