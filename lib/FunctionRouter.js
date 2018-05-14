const requireAll = require('require-all')
const path = require('path')
const { CucumberExpression, ParameterTypeRegistry } = require('cucumber-expressions')

class FunctionRouter {

  constructor(opts = {}) {

    this.directories = opts.directories
    this.funcs = {}

  }

  importDir(dirname) {

    dirname = path.resolve(process.cwd(), dirname)

    return requireAll({ dirname })

  }

  loadFuncs() {

    let funcs = {}

    this.directories.forEach( (dir) => {

      if (dir == '') return

      let funcsInDir = this.importDir(dir)

      let flatten = {}

      Object.keys(funcsInDir).forEach( (key) => {

        Object.keys(funcsInDir[key]).forEach( (funcKey) => {

          flatten[funcKey] = funcsInDir[key][funcKey]

        })

      })

      funcs = Object.assign(funcs, flatten)

    })

    this.funcs = funcs

  }

  run(text) {

    return this.runFunc(text)

  }

  runFunc(text) {

    let func
    let args

    Object.keys(this.funcs).forEach( (key) => {

      if (func) return

      let cucumberExpression = new CucumberExpression(key, new ParameterTypeRegistry)
      let result = cucumberExpression.match(text)

      if (!result) return result

      func = this.funcs[key]
      args = result.map( arg => arg._group._value )

    })

    if (func) return func(...args)

  }

  init() {

    this.loadFuncs()

  }

}

module.exports = FunctionRouter;
