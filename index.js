const msaAdmin = module.exports = Msa.module("admin")

const msaUser = Msa.require("user")
msaAdmin.app.use(msaUser.mdw)

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

AdminPanelPt.perm = { group:"admin" }

msaAdmin.register = function(kwargs) {
	const panel = new AdminPanel(kwargs)
	AdminPanels.push(panel)
	const mdw = Msa.express.Router()
	msaAdmin.app.use(panel.route, mdw)
	mdw.use(msaUser.checkUserPage(panel.perm))
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
	const authPanels = AdminPanels.filter(p => msaUser.checkUser(req.session.user, p.perm))
	if(authPanels.length === 0)
		res.sendPage(msaUser.unauthHtml)
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

const joinUrl = Msa.joinUrl
