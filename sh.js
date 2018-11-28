const msaAdminSh = module.exports = new Msa.Module()

const { exec } = require('child_process')

msaAdminSh.app.get('/', (req, res) => res.sendPage({ wel:'/admin/msa-admin-sh.js' }))

msaAdminSh.app.post('/', (req, res, next) => {
  var cmd = req.body.cmd
  exec(cmd, (err, stdout, stderr) => {
    if(err && !stderr) stderr = JSON.stringify(err)
    res.json({ stdout:stdout, stderr:stderr })
  })
})
