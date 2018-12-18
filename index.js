const msaAdmin = module.exports = new Msa.Module("admin")

const { Perm, unauthHtml, mdw: userMdw } = Msa.require("user")
msaAdmin.app.use(userMdw)

// register ///////////

const AdminPanels = []

class AdminPanel {
	constructor(kwargs){
		for(let k of ["route", "app", "title"])
			if(kwargs[k] === undefined)
				throw `Missing arg "${k}"`
		Object.assign(this, kwargs)
	}
}
const AdminPanelPt = AdminPanel.prototype

AdminPanelPt.perm = new Perm({ group:"admin" })

msaAdmin.register = function(kwargs) {
	const panel = new AdminPanel(kwargs)
	AdminPanels.push(panel)
	const mdw = Msa.express.Router()
	msaAdmin.app.use(panel.route, mdw)
	mdw.use(panel.perm.checkPage())
		.use(panel.app)
}

// register shell
msaAdmin.register({
	route: '/sh',
	app: require('./sh').app,
	title: "Shell",
	help: "Shell panel"
})

// root get
msaAdmin.app.get('/', (req, res, next) => {
	const authPanels = AdminPanels.filter(p => p.perm.check(req.session.user))
	if(authPanels.length === 0)
		res.sendPage(unauthHtml)
	else {
		let html = "<ul>"
		authPanels.forEach(p => {
			const href = Msa.joinUrl(req.baseUrl, p.route)
			html += `<li><a href="${href}">${p.title}</a></li>`
		})
		html += "</ul>"
		res.sendPage(html)
	}
})

// various

const { joinUrl } = Msa
