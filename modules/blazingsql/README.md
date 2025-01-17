# node-rapids BlazingSQL - GPU accelerated SQL engine

The js bindings for [BlazingSQL](https://github.com/BlazingDB/blazingsql) provides an API that allows for GPU accelerated SQL queries on [cuDF](https://github.com/rapidsai/cudf) DataFrames.

For example, the following snippet creates a DataFrame, then uses BlazingSQL to select and query a DataFrame.

```javascript
var { Series, DataFrame, Int32 } = require("@rapidsai/cudf");
var { BlazingContext } = require("@rapidsai/blazingsql");

var a  = Series.new({type: new Int32(), data: [1, 2, 3]});
var b  = Series.new({type: new Int32(), data: [4, 5, 6]});
var df = new DataFrame({'a': a, 'b': b});

var bc = new BlazingContext();
bc.createTable('test_table', df);

bc.sql('SELECT a FROM test_table'); // [1, 2, 3]
```

For detailed BlazingSQL API, [follow our API Documentation](https://rapidsai.github.io/node/modules/blazingsql_src.html).

### Installation

`npm install @rapidsai/blazingsql`

Run this command to build the module from the mono-repo root

```bash
# To build
npx lerna run build --scope="@rapidsai/blazingsql" --stream

# To rebuild
npx lerna run rebuild --scope="@rapidsai/blazingsql" --stream

# To run unit tests
npx lerna run test --scope="@rapidsai/blazingsql"
```
