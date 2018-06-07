var msaAdminSh = module.exports = Msa.module()

const { exec } = require('child_process')

msaAdminSh.app.getAsPartial('/', { wel:'/admin/msa-admin-sh.html' })

msaAdminSh.app.post('/', (req, res, next) => {
  var cmd = req.body.cmd
  exec(cmd, (err, stdout, stderr) => {
    if(err && !stderr) stderr = JSON.stringify(err)
    res.json({ stdout:stdout, stderr:stderr })
  })
})
