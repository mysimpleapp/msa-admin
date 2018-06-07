var msaAdmin = module.exports = Msa.module("admin")

msaAdmin.app.use('/sh', require('./sh.js').app)
